// 宝玉の塔：ゲームのルール（画面に依存しない）
// ブラウザでは window.GemTower、Node では require で使う（ステージの自動検証用）
(function (root) {
  const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
  const WATCHER_CHARS = { '^': 'up', 'v': 'down', '<': 'left', '>': 'right' };
  // 泡に閉じ込めていられるターン数
  const BUBBLE_TURNS = 5;

  // ステージの地図を状態に変換する
  //   . 床  # 壁  ~ 水  = 氷の床  P 主人公  G 宝玉  B 石のブロック  E 封印の扉
  //   ^ v < > 見張りの石像（向いている方向を見張る）
  function parse(stage) {
    const rows = stage.map;
    const H = rows.length;
    const W = rows[0].length;
    const tiles = [];
    const gems = [];
    const blocks = [];
    const watchers = [];
    let player = null;
    let exit = -1;

    rows.forEach((row, r) => {
      if (row.length !== W) throw new Error(`${r + 1}行目の長さが違います`);
      [...row].forEach((ch, c) => {
        const i = r * W + c;
        tiles[i] = '.';
        if (ch === '#') tiles[i] = '#';
        else if (ch === '~') tiles[i] = '~';
        else if (ch === '=') tiles[i] = '=';
        else if (ch === 'E') { tiles[i] = 'E'; exit = i; }
        else if (ch === 'P') player = { pos: i, dir: 'down' };
        else if (ch === 'G') gems.push(i);
        else if (ch === 'B') blocks.push({ id: `b${blocks.length}`, pos: i });
        else if (WATCHER_CHARS[ch]) watchers.push({ id: `w${watchers.length}`, pos: i, dir: WATCHER_CHARS[ch], bubble: 0 });
        else if (ch !== '.') throw new Error(`知らない記号「${ch}」があります`);
      });
    });
    if (!player) throw new Error('主人公（P）がいません');
    if (exit < 0) throw new Error('扉（E）がありません');

    return {
      W, H, tiles, gems, blocks, watchers, player, exit,
      shots: stage.shots || 0,
      moves: 0,
      open: gems.length === 0,
      status: 'play'
    };
  }

  function clone(s) {
    return {
      ...s,
      tiles: s.tiles.slice(),
      gems: s.gems.slice(),
      blocks: s.blocks.map(b => ({ ...b })),
      watchers: s.watchers.map(w => ({ ...w })),
      player: { ...s.player }
    };
  }

  // i から dir に1マス進んだ位置（盤の外なら -1）
  function next(s, i, dir) {
    const [dr, dc] = DIRS[dir];
    const r = Math.floor(i / s.W) + dr;
    const c = (i % s.W) + dc;
    if (r < 0 || r >= s.H || c < 0 || c >= s.W) return -1;
    return r * s.W + c;
  }

  // そのマスに何があるか
  function occupant(s, i) {
    if (i < 0) return 'wall';
    const t = s.tiles[i];
    if (t === '#') return 'wall';
    if (t === '~') return 'water';
    if (t === 'E') return 'exit';
    if (s.blocks.some(b => b.pos === i)) return 'block';
    const w = s.watchers.find(w => w.pos === i);
    if (w) return w.bubble > 0 ? 'bubble' : 'watcher';
    if (s.gems.includes(i)) return 'gem';
    return 'floor';
  }

  // 見張りの視線が届くマス（壁・ブロック・泡・扉・ほかの見張りでさえぎられる）
  function sight(s, w) {
    const cells = [];
    // noSight はステージ検証用（視線がないと楽になるか比べるため）
    if (w.bubble > 0 || s.noSight) return cells;
    let cur = next(s, w.pos, w.dir);
    while (cur >= 0) {
      const occ = occupant(s, cur);
      if (occ !== 'floor' && occ !== 'gem' && occ !== 'water') break;
      cells.push(cur);
      cur = next(s, cur, w.dir);
    }
    return cells;
  }

  function collectGem(s, at, events) {
    s.gems = s.gems.filter(g => g !== at);
    events.push({ type: 'gem', at });
    if (s.gems.length === 0) {
      s.open = true;
      events.push({ type: 'open', at: s.exit });
    }
  }

  function sinkBlock(s, block, at, from, events) {
    s.blocks = s.blocks.filter(b => b !== block);
    s.tiles[at] = '.';
    events.push({ type: 'sink', id: block.id, from, to: at });
  }

  // 1手進める。action = { type: 'move' | 'shoot', dir }
  // 戻り値: { state, acted（手数を使ったか）, events（画面の演出用） }
  function step(state, action) {
    if (state.status !== 'play') return { state, acted: false, events: [] };
    const s = clone(state);
    const events = [];
    const dir = action.dir;
    s.player.dir = dir;
    let hitId = null;

    if (action.type === 'move') {
      const to = next(s, s.player.pos, dir);
      const occ = occupant(s, to);

      if (occ === 'wall' || occ === 'water' || occ === 'watcher' || (occ === 'exit' && !s.open)) {
        // 進めないときは向きだけ変える（手数は使わない）
        return { state: s, acted: false, events: [{ type: 'bump', to }] };
      }

      if (occ === 'block' || occ === 'bubble') {
        const beyond = next(s, to, dir);
        const occB = occupant(s, beyond);
        const isBlock = occ === 'block';
        const obj = isBlock ? s.blocks.find(b => b.pos === to) : s.watchers.find(w => w.pos === to);
        if (occB === 'floor') {
          obj.pos = beyond;
          // 氷の上では、何かにぶつかるまで滑っていく
          let sank = false;
          while (s.tiles[obj.pos] === '=') {
            const nx = next(s, obj.pos, dir);
            const o = occupant(s, nx);
            if (o === 'floor') obj.pos = nx;
            else if (o === 'water' && isBlock) { sinkBlock(s, obj, nx, to, events); sank = true; break; }
            else break;
          }
          if (!sank) events.push({ type: 'push', id: obj.id, from: to, to: obj.pos });
        } else if (occB === 'water' && isBlock) {
          // ブロックを水に落とすと橋になる
          sinkBlock(s, obj, beyond, to, events);
        } else {
          return { state: s, acted: false, events: [{ type: 'bump', to }] };
        }
      }

      const from = s.player.pos;
      s.player.pos = to;
      if (occ === 'gem') collectGem(s, to, events);

      // 主人公も氷の上では滑る（宝玉は通りがけに拾う）
      let enteredExit = occ === 'exit';
      while (!enteredExit && s.tiles[s.player.pos] === '=') {
        const nx = next(s, s.player.pos, dir);
        const o = occupant(s, nx);
        if (o === 'floor' || o === 'gem') {
          s.player.pos = nx;
          if (o === 'gem') collectGem(s, nx, events);
        } else if (o === 'exit' && s.open) {
          s.player.pos = nx;
          enteredExit = true;
        } else {
          break;
        }
      }

      events.unshift({ type: 'move', from, to: s.player.pos });
      if (enteredExit) {
        s.moves++;
        s.status = 'clear';
        events.push({ type: 'clear' });
        return { state: s, acted: true, events };
      }
    } else if (action.type === 'shoot') {
      if (s.shots <= 0) return { state: s, acted: false, events: [{ type: 'noShot' }] };
      s.shots--;
      const path = [];
      let cur = next(s, s.player.pos, dir);
      let hit = null;
      while (cur >= 0) {
        const occ = occupant(s, cur);
        if (occ === 'watcher' || occ === 'bubble') {
          hit = s.watchers.find(w => w.pos === cur);
          break;
        }
        if (occ !== 'floor' && occ !== 'gem' && occ !== 'water') break;
        path.push(cur);
        cur = next(s, cur, dir);
      }
      if (hit) {
        hit.bubble = BUBBLE_TURNS;
        hitId = hit.id;
      }
      events.push({ type: 'shot', path, end: cur, hitId });
    }

    s.moves++;

    // 泡の残りターンを減らす（今撃った泡はそのまま）
    s.watchers.forEach(w => {
      if (w.bubble > 0 && w.id !== hitId) {
        w.bubble--;
        if (w.bubble === 0) events.push({ type: 'pop', id: w.id, at: w.pos });
      }
    });

    // 見張りに見つかったか
    for (const w of s.watchers) {
      const cells = sight(s, w);
      if (cells.includes(s.player.pos)) {
        s.status = 'caught';
        events.push({ type: 'caught', id: w.id, cells });
        break;
      }
    }

    return { state: s, acted: true, events };
  }

  // 最短手数を幅優先探索で求める（ステージの検証用）
  function solve(stage, limit = 2000000) {
    const start = parse(stage);
    const key = s => [
      s.player.pos,
      s.blocks.map(b => b.pos).sort((a, b) => a - b).join(','),
      s.gems.join(','),
      s.tiles.map((t, i) => (t === '~' ? i : '')).join(''),
      s.watchers.map(w => `${w.pos}:${w.bubble}`).join(','),
      s.shots
    ].join('|');
    const actions = [];
    for (const dir of Object.keys(DIRS)) {
      actions.push({ type: 'move', dir });
      actions.push({ type: 'shoot', dir });
    }
    const seen = new Set([key(start)]);
    let frontier = [{ s: start, path: [] }];
    while (frontier.length) {
      const nextFrontier = [];
      for (const { s, path } of frontier) {
        for (const a of actions) {
          const { state, acted } = step(s, a);
          if (!acted || state.status === 'caught') continue;
          const p = path.concat(a);
          if (state.status === 'clear') return { moves: p.length, path: p, explored: seen.size };
          const k = key(state);
          if (seen.has(k)) continue;
          seen.add(k);
          if (seen.size > limit) return { moves: null, explored: seen.size, aborted: true };
          nextFrontier.push({ s: state, path: p });
        }
      }
      frontier = nextFrontier;
    }
    return { moves: null, explored: seen.size };
  }

  const api = { DIRS, BUBBLE_TURNS, parse, clone, next, occupant, sight, step, solve };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GemTower = api;
})(typeof window !== 'undefined' ? window : this);
