// 宝玉の塔：ドット絵（16×16）
// 1文字が1ドット。PALETTE の色で塗り、「.」は透明。
// 画像はページを開いたときに canvas で作り、CSS 変数（--spr-○○）として使う。
(function (root) {
  const PALETTE = {
    k: '#1b1233', K: 'rgba(0,0,0,0.35)', w: '#ffffff',
    // 主人公
    h: '#e8b04f', H: '#b07a2a', n: '#6b3a1f', s: '#ffd9b0', S: '#e3a77c',
    r: '#e8384f', R: '#9e1f3a', y: '#ffd84d', p: '#4b3f9e', b: '#7a4a24',
    // 石のブロック
    t: '#f2d49a', T: '#c99a52', u: '#8a6230',
    // 壁
    m: '#a898dc', M: '#7565b4', d: '#4e408c', D: '#2c2262',
    // 床
    f: '#3d3172', F: '#352a66', g: '#4a3d86', G: '#2a2156',
    // 水
    a: '#2f8ce0', A: '#1f63bf', c: '#a6dcff', C: '#5aaaf0',
    // 宝玉
    z: '#c8fffb', Z: '#29d3c8', v: '#7a3bd0',
    // 見張りの石像
    B: '#ff9aa8',
    o: '#dcd8f0', O: '#aaa4ca', q: '#7d779e', Q: '#4a4468', e: '#ffffff', x: '#e0163a',
    // 扉
    Y: '#b8860b', l: '#ffd34d', L: '#fff3c4', P: '#ff6fc8', I: '#14092a',
    // 泡
    i: 'rgba(170,230,255,0.38)', j: 'rgba(255,150,225,0.32)'
  };

  // ===== 主人公 =====
  const HERO_DOWN = [
    '................',
    '.....kkkkkk.....',
    '....khhhhhhk....',
    '...khhhhhhhHk...',
    '...knnnnnnnnk...',
    '.kkhhhhhhhhhhkk.',
    'khhhhhhhhhhhhhHk',
    '.kkkssssssssskk.',
    '...kskssssksk...',
    '...kBssssssBk...',
    '....kSssssSk....',
    '...kyyyyyyyyk...',
    '..krryyyyyyrrk..',
    '..ksrrrrrrrrsk..',
    '...kppk..kppk...',
    '...kbbk..kbbk...'
  ];
  const HERO_DOWN_B = HERO_DOWN.slice(0, 14).concat([
    '...kppk.kppk....',
    '..kbbk...kbbk...'
  ]);

  const HERO_UP = HERO_DOWN.slice(0, 7).concat([
    '.kkknnnnnnnnnkk.',
    '...knnnnnnnnk...',
    '...knnnnnnnnk...',
    '....knnnnnnk....',
    '...kyyyyyyyyk...',
    '..krrrrrrrrrrk..',
    '..ksrrrrrrrrsk..',
    '...kppk..kppk...',
    '...kbbk..kbbk...'
  ]);
  const HERO_UP_B = HERO_UP.slice(0, 14).concat(HERO_DOWN_B.slice(14));

  const HERO_RIGHT = [
    '................',
    '......kkkkk.....',
    '.....khhhhhk....',
    '....khhhhhhHk...',
    '....knnnnnnnk...',
    '..kkhhhhhhhhhkk.',
    '.khhhhhhhhhhhhHk',
    '..kkknssssssskk.',
    '....knssssskskk.',
    '....knssssBsssk.',
    '.....kSsssssk...',
    '....kyyyyyyyk...',
    '...krrrrryyrk...',
    '...krrsrrrrrk...',
    '....kppkppk.....',
    '....kbbkbbbk....'
  ];
  const HERO_RIGHT_B = HERO_RIGHT.slice(0, 14).concat([
    '...kppk.kppk....',
    '..kbbk...kbbbk..'
  ]);

  // ===== 石のブロック =====
  const BLOCK = [
    'kkkkkkkkkkkkkkkk',
    'kttttttttttttttk',
    'ktTTTTTTTTTTTTuk',
    'ktTTTTTuuTTTTTuk',
    'ktTTTTuttuTTTTuk',
    'ktTTTuTTTTuTTTuk',
    'ktTTuTTTTTTuTTuk',
    'ktTuTTTttTTTuTuk',
    'ktTuTTTttTTTuTuk',
    'ktTTuTTTTTTuTTuk',
    'ktTTTuTTTTuTTTuk',
    'ktTTTTuttuTTTTuk',
    'ktTTTTTuuTTTTTuk',
    'ktTTTTTTTTTTTTuk',
    'kuuuuuuuuuuuuuuk',
    'kkkkkkkkkkkkkkkk'
  ];

  // ===== 壁（レンガ） =====
  const BRICK_A = 'mMMMMMMdmMMMMMMd';
  const BRICK_B = 'MMMdmMMMMMMMdmMM';
  const MORTAR = 'DDDDDDDDDDDDDDDD';
  const WALL = [
    'mmmmmmmmmmmmmmmm', BRICK_A, BRICK_A, MORTAR,
    BRICK_B, BRICK_B, BRICK_B, MORTAR,
    BRICK_A, BRICK_A, BRICK_A, MORTAR,
    BRICK_B, BRICK_B, BRICK_B, 'dddddddddddddddd'
  ];

  // ===== 床 =====
  const FLOOR = [
    'gggggggggggggggG',
    'gfffffffffffffFG',
    'gfffffffffffffFG',
    'gfffffffffffffFG',
    'gffffffffffgffFG',
    'gfffffffffffffFG',
    'gfffffffffffffFG',
    'gfffffffffffffFG',
    'gfffffffffffffFG',
    'gfffffffffffffFG',
    'gffgffffffffffFG',
    'gfffffffffffffFG',
    'gfffffffffffffFG',
    'gfffffffffffffFG',
    'gFFFFFFFFFFFFFFG',
    'GGGGGGGGGGGGGGGG'
  ];
  const FLOOR_B = FLOOR.map((row, y) => {
    if (y === 6) return 'gffffffGGfffffFG';
    if (y === 7) return 'gfffffffGffffFFG';
    if (y === 8) return 'gfffffffGGffffFG';
    if (y === 4 || y === 10) return 'gfffffffffffffFG';
    return row;
  });

  // ===== 水（2コマ） =====
  const WATER = [
    'AAAAAAAAAAAAAAAA',
    'aaaaaaaaaaaaaaaa',
    'aaccaaaaaaaaaaaa',
    'acaacaaaaaaaCaaa',
    'aaaaaaaaaaaCaCaa',
    'aaaaaaaaaaaaaaaa',
    'aaaaaaaacccaaaaa',
    'aaaaaaacaaacaaaa',
    'aaaaaaaaaaaaaaaa',
    'aCaaaaaaaaaaaaaa',
    'CaCaaaaaaaaaacca',
    'aaaaaaaaaaaacaac',
    'aaaaaCCaaaaaaaaa',
    'aaaaCaaCaaaaaaaa',
    'aaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaa'
  ];
  const shiftRow = (row, n) => row.slice(-n) + row.slice(0, -n);
  const WATER_B = WATER.map((row, y) => (y === 0 ? row : shiftRow(row, 3)));

  // ===== 宝玉（4コマ：きらめきの位置を変える） =====
  const GEM = [
    '................',
    '................',
    '....kkkkkkkk....',
    '...kwzzzZZZZvk..',
    '..kwzzzzZZZZvvk.',
    '.kzzzzzZZZZZvvvk',
    '..kzzzZZZZZvvk..',
    '...kzzZZZZvvk...',
    '....kzZZZZvk....',
    '.....kZZZvk.....',
    '......kZvk......',
    '.......kk.......',
    '................',
    '................',
    '.....KKKKKK.....',
    '................'
  ];
  function sparkle(rows, x, y) {
    const out = rows.map(r => r.split(''));
    [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const yy = y + dy;
      const xx = x + dx;
      if (out[yy] && out[yy][xx] !== undefined) out[yy][xx] = 'w';
    });
    return out.map(r => r.join(''));
  }
  const GEM_FRAMES = [GEM, sparkle(GEM, 5, 4), GEM, sparkle(GEM, 12, 6)];

  // ===== 見張りの石像（向きで瞳の位置が変わる、2コマ目はまばたき） =====
  // 角の生えた石の守り神。大きな一つ目で見張る
  const WATCHER_BASE = [
    '..kk........kk..',
    '..kOk......kOk..',
    '..kOOkkkkkkOOk..',
    '..koooooooooOk..',
    '.kooooooooooOOk.',
    '.kokkkkkkkkkkOk.',
    '.kokeeeeeeeekOk.',
    '.kokeeeeeeeekOk.',
    '.kokeeeeeeeekOk.',
    '.kokeeeeeeeekOk.',
    '.kookkkkkkkkoOk.',
    '.kooqoooooqooOk.',
    '.kooookkkkooOOk.',
    'kOOOOOOOOOOOOOqk',
    'kqqqqqqqqqqqqqQk',
    'kkkkkkkkkkkkkkkk'
  ];
  const PUPIL = { up: [7, 6], down: [7, 8], left: [4, 7], right: [10, 7] };
  function watcherFrame(dir, blink) {
    const out = WATCHER_BASE.map(r => r.split(''));
    if (blink) {
      // まぶたが閉じる
      for (let y = 6; y <= 9; y++) for (let x = 4; x <= 11; x++) out[y][x] = y === 9 ? 'k' : 'O';
    } else {
      const [px, py] = PUPIL[dir];
      for (let y = py; y < py + 2; y++) for (let x = px; x < px + 2; x++) out[y][x] = 'x';
    }
    return out.map(r => r.join(''));
  }

  // ===== 扉 =====
  const DOOR_SEALED = [
    '................',
    '.....kkkkkk.....',
    '....kYllllYk....',
    '...kYlIIIIlYk...',
    '..kYlIIIIIIlYk..',
    '..klIIIIIIIIlk..',
    '..klIIIIIIIIlk..',
    '..klIIIPPIIIlk..',
    '..klIIPwPPIIlk..',
    '..klIIIPPIIIlk..',
    '..klIIIIIIIIlk..',
    '..klIIIIIIIIlk..',
    '..klIIIIIIIIlk..',
    '..klIIIIIIIIlk..',
    '..kYllllllllYk..',
    '..kkkkkkkkkkkk..'
  ];
  const DOOR_OPEN = DOOR_SEALED.map((row, y) => {
    if (y < 3 || y > 13) return row;
    return row.replace(/[IPw]+/, m => {
      const n = m.length;
      const side = Math.max(1, Math.floor(n / 4));
      return 'l'.repeat(side) + 'L'.repeat(n - side * 2) + 'l'.repeat(side);
    });
  });
  const DOOR_OPEN_B = DOOR_OPEN.map(row => row.replace(/L/g, 'w'));

  // ===== 泡（計算で丸を描く） =====
  function circle(size, r, { highlight = true } = {}) {
    const rows = [];
    const c = (size - 1) / 2;
    for (let y = 0; y < size; y++) {
      let row = '';
      for (let x = 0; x < size; x++) {
        const d = Math.hypot(x - c, y - c);
        if (d > r) row += '.';
        else if (d > r - 1) row += 'w';
        else row += (x + y > size) ? 'j' : 'i';
      }
      rows.push(row);
    }
    if (highlight) {
      const out = rows.map(r => r.split(''));
      const hx = Math.round(c - r * 0.45);
      const hy = Math.round(c - r * 0.45);
      [[0, 0], [1, 0], [0, 1]].forEach(([dx, dy]) => { out[hy + dy][hx + dx] = 'w'; });
      return out.map(r => r.join(''));
    }
    return rows;
  }

  // ===== 鍵のマーク（8種類） =====
  const STAR = [
    '................',
    '.......kk.......',
    '......kyyk......',
    '......kwyk......',
    '.....kyyyyk.....',
    '.kkkkyyyyyykkkk.',
    '.kyyyyyyyyyyyyk.',
    '..kyyyyyyyyyyk..',
    '...kyyyyyyyyk...',
    '....kyyyyyyk....',
    '....kyyyyyyk....',
    '...kyyykkyyyk...',
    '...kyyk..kyyk...',
    '..kyyk....kyyk..',
    '..kkk......kkk..',
    '................'
  ];

  // 塗る場所を関数で決め、まわりに輪郭線を付ける
  function shape(fill) {
    const grid = [];
    for (let y = 0; y < 16; y++) {
      const row = [];
      for (let x = 0; x < 16; x++) row.push(fill(x, y) || '.');
      grid.push(row);
    }
    const out = grid.map(r => r.slice());
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      if (grid[y][x] !== '.') continue;
      const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => grid[y + dy] && grid[y + dy][x + dx] && grid[y + dy][x + dx] !== '.');
      if (near) out[y][x] = 'k';
    }
    return out.map(r => r.join(''));
  }

  const MOON = shape((x, y) => {
    const inBig = Math.hypot(x - 7.5, y - 7.5) <= 6;
    const inCut = Math.hypot(x - 10.5, y - 5) <= 5.2;
    if (!inBig || inCut) return null;
    return x + y < 11 ? 'L' : 'l';
  });

  const SUN = shape((x, y) => {
    const d = Math.hypot(x - 7.5, y - 7.5);
    if (d <= 3.6) return d < 1.6 ? 'L' : 'l';
    const ang = (Math.atan2(y - 7.5, x - 7.5) * 180 / Math.PI + 360) % 45;
    if (d >= 5 && d <= 6.6 && (ang < 9 || ang > 36)) return 'Y';
    return null;
  });

  // 鍵に使うマーク（並び順は変えない：保存した鍵の意味が変わってしまうため）
  const MARKS = [
    { id: 'gem', name: '宝玉', rows: GEM },
    { id: 'star', name: '星', rows: STAR },
    { id: 'moon', name: '月', rows: MOON },
    { id: 'sun', name: '太陽', rows: SUN },
    { id: 'bubble', name: '泡', rows: circle(16, 7.5) },
    { id: 'statue', name: '石像', rows: watcherFrame('down') },
    { id: 'block', name: '石', rows: BLOCK },
    { id: 'door', name: '扉', rows: DOOR_SEALED }
  ];

  // ===== 描画 =====
  function toCanvas(frames) {
    const h = frames[0].length;
    const w = frames[0][0].length;
    const canvas = document.createElement('canvas');
    canvas.width = w * frames.length;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    frames.forEach((rows, f) => {
      rows.forEach((row, y) => {
        [...row].forEach((ch, x) => {
          if (ch === '.') return;
          const color = PALETTE[ch];
          if (!color) throw new Error(`色が決まっていない文字「${ch}」`);
          ctx.fillStyle = color;
          ctx.fillRect(f * w + x, y, 1, 1);
        });
      });
    });
    return canvas.toDataURL();
  }

  const SPRITES = {
    'hero-down': [HERO_DOWN, HERO_DOWN_B],
    'hero-up': [HERO_UP, HERO_UP_B],
    'hero-right': [HERO_RIGHT, HERO_RIGHT_B],
    block: [BLOCK],
    wall: [WALL],
    floor: [FLOOR],
    'floor-b': [FLOOR_B],
    water: [WATER, WATER_B],
    gem: GEM_FRAMES,
    'watcher-up': [watcherFrame('up'), watcherFrame('up', true)],
    'watcher-down': [watcherFrame('down'), watcherFrame('down', true)],
    'watcher-left': [watcherFrame('left'), watcherFrame('left', true)],
    'watcher-right': [watcherFrame('right'), watcherFrame('right', true)],
    'door-sealed': [DOOR_SEALED],
    'door-open': [DOOR_OPEN, DOOR_OPEN_B],
    bubble: [circle(16, 7.5)],
    shot: [circle(16, 4.5)]
  };
  MARKS.forEach(m => { SPRITES[`mark-${m.id}`] = [m.rows]; });

  // ページの CSS 変数に登録する（--spr-hero-down など）
  function install(target = document.documentElement) {
    Object.entries(SPRITES).forEach(([name, frames]) => {
      target.style.setProperty(`--spr-${name}`, `url(${toCanvas(frames)})`);
    });
  }

  root.GemSprites = { SPRITES, PALETTE, MARKS: MARKS.map(({ id, name }) => ({ id, name })), install, toCanvas };
})(window);
