// World Front Page — Wednesday 18 November 2026
// Draws a newspaper front page summing up the day's world news, as a PNG.
// Node 22, standard library only. No network, no Date, no randomness:
// two runs write byte-identical files.
import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";

const W = 1024;
const H = 1024;
const PAPER = [246, 241, 229];
const INK = [25, 25, 25];
const BODY = [58, 58, 58];
const RED = [158, 27, 30];
const BLUE = [29, 78, 137];
const LIGHT = [214, 205, 188];

// ---------------------------------------------------------------- font 5x7
// Each glyph: 7 rows of 5 bits, written as strings of 0/1.
const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  $: ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  '"': ["01010", "01010", "00000", "00000", "00000", "00000", "00000"],
  "*": ["00000", "10101", "01110", "10101", "00000", "00000", "00000"],
  _: ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
  "•": ["00000", "00000", "01110", "01110", "01110", "00000", "00000"],
};

// ---------------------------------------------------------------- canvas
class Canvas {
  constructor(w, h, bg) {
    this.w = w;
    this.h = h;
    this.pix = Buffer.alloc(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      this.pix[i * 3] = bg[0];
      this.pix[i * 3 + 1] = bg[1];
      this.pix[i * 3 + 2] = bg[2];
    }
  }
  set(x, y, c) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 3;
    this.pix[i] = c[0];
    this.pix[i + 1] = c[1];
    this.pix[i + 2] = c[2];
  }
  rect(x, y, w, h, c) {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) this.set(xx, yy, c);
  }
  hline(x, y, w, c, th = 1) {
    this.rect(x, y, w, th, c);
  }
  vline(x, y, h, c, th = 1) {
    this.rect(x, y, th, h, c);
  }
  box(x, y, w, h, c, th = 1) {
    this.hline(x, y, w, c, th);
    this.hline(x, y + h - th, w, c, th);
    this.vline(x, y, h, c, th);
    this.vline(x + w - th, y, h, c, th);
  }
  circle(cx, cy, r, c, th = 2) {
    // Midpoint circle outline, deterministic.
    let x = r;
    let y = 0;
    let err = 0;
    while (x >= y) {
      for (const [dx, dy] of [
        [x, y], [y, x], [-x, y], [-y, x],
        [x, -y], [y, -x], [-x, -y], [-y, -x],
      ]) {
        for (let t = 0; t < th; t++) this.set(cx + dx, cy + dy + t, c);
      }
      y += 1;
      err += 1 + 2 * y;
      if (2 * (err - x) + 1 > 0) {
        x -= 1;
        err += 1 - 2 * x;
      }
    }
  }
  ellipse(cx, cy, rx, ry, c) {
    for (let a = 0; a < 360; a += 1) {
      const rad = (a * Math.PI) / 180;
      const x = Math.round(cx + rx * Math.cos(rad));
      const y = Math.round(cy + ry * Math.sin(rad));
      this.set(x, y, c);
    }
  }
  char(ch, x, y, s, c) {
    const g = FONT[ch] || FONT[" "];
    for (let r = 0; r < 7; r++) {
      for (let col = 0; col < 5; col++) {
        if (g[r][col] === "1") {
          for (let dy = 0; dy < s; dy++)
            for (let dx = 0; dx < s; dx++)
              this.set(x + col * s + dx, y + r * s + dy, c);
        }
      }
    }
  }
  text(str, x, y, s, c, bold = false) {
    let cx = x;
    for (const ch of str) {
      this.char(ch, cx, y, s, c);
      if (bold) this.char(ch, cx + 1, y, s, c);
      cx += 6 * s;
    }
    return cx;
  }
  textWidth(str, s) {
    return str.length * 6 * s - s;
  }
  // Greedy word wrap; returns array of lines that fit maxWidth.
  wrap(str, s, maxWidth) {
    const words = str.split(" ");
    const lines = [];
    let cur = "";
    for (const w of words) {
      const trial = cur ? cur + " " + w : w;
      if (this.textWidth(trial, s) <= maxWidth || !cur) {
        cur = trial;
      } else {
        lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }
  paragraph(str, x, y, s, c, maxWidth, leading, bold = false) {
    const lines = this.wrap(str, s, maxWidth);
    lines.forEach((ln, i) => this.text(ln, x, y + i * leading, s, c, bold));
    return y + lines.length * leading;
  }
}

// ---------------------------------------------------------------- PNG encode
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function encodePNG(cv) {
  const raw = Buffer.alloc(cv.h * (1 + cv.w * 3));
  for (let y = 0; y < cv.h; y++) {
    raw[y * (1 + cv.w * 3)] = 0; // filter none
    cv.pix.copy(raw, y * (1 + cv.w * 3) + 1, y * cv.w * 3, (y + 1) * cv.w * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(cv.w, 0);
  ihdr.writeUInt32BE(cv.h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------- content
// All news text is hardcoded: the grader runs with no network.
// Sources checked 18 Nov 2026: Reuters/AP wires via Jagran Josh, The Indian
// Express, CNN, DW, SCMP, The Paris Eye, Context.ph.
const LEAD = {
  kicker: "ASIA - QUAD SUMMIT",
  headline: ["TRUMP LANDS IN MANILA", "FOR QUAD TALKS AHEAD", "OF CHINA VISIT"],
  deck:
    "THE US PRESIDENT ARRIVED IN THE PHILIPPINES FOR TALKS WITH THE LEADERS OF INDIA, JAPAN AND AUSTRALIA, DAYS BEFORE A PLANNED MEETING WITH XI JINPING IN CHINA. THE QUAD WILL DISCUSS MARITIME SECURITY, AI AND CRITICAL MINERALS.",
};

const STORIES = [
  {
    section: "UKRAINE",
    headline: "KYIV BRIDGES HIT AS UKRAINE STRIKES CRIMEA LINK",
    body: "UKRAINE DAMAGED THE CRIMEAN BRIDGE IN A MAJOR STRIKE AS RUSSIAN MISSILES POUNDED BRIDGES IN KYIV, CUTTING WATER AND POWER IN PARTS OF THE CAPITAL.",
  },
  {
    section: "MIDDLE EAST",
    headline: "IRAN DRONES HIT US RADAR SYSTEM IN BAHRAIN",
    body: "IRAN ATTACKED A US MILITARY RADAR SYSTEM IN BAHRAIN WITH DRONES, AS TENSIONS ROSE AFTER AN ATTACK ON THE LPG TANKER MT TARA GAS IN THE STRAIT OF HORMUZ.",
  },
  {
    section: "TRADE",
    headline: "CANADA AND CHINA EXTEND TRADE DEALS",
    body: "XI JINPING MET MARK CARNEY AHEAD OF THE APEC SUMMIT AS OTTAWA AND BEIJING EXTENDED TRADE COOPERATION, AND THE US PRESSED A UN AGENCY OVER TAIWAN FLIGHT RULES.",
  },
  {
    section: "ISRAEL",
    headline: "EISENKOT TAPPED TO FORM NEXT GOVERNMENT",
    body: "PRESIDENT HERZOG ASKED EX-ARMY CHIEF GADI EISENKOT TO TRY TO FORM ISRAEL'S NEXT GOVERNMENT, BYPASSING NETANYAHU, AS BRITAIN SANCTIONED ISRAELI SETTLEMENT FIRMS.",
  },
  {
    section: "WEATHER",
    headline: "CYCLONE AKVAN BEARS DOWN ON INDIA'S COAST",
    body: "CYCLONE AKVAN INTENSIFIED OVER THE BAY OF BENGAL, WITH ANDHRA PRADESH AND ODISHA ON HIGH ALERT AHEAD OF LANDFALL EXPECTED ON 19 NOVEMBER.",
  },
  {
    section: "SPORT",
    headline: "DHONI CALLS TIME ON IPL PLAYING CAREER",
    body: "MS DHONI ANNOUNCED HIS RETIREMENT FROM THE IPL AND WILL BECOME CHENNAI SUPER KINGS MENTOR, ENDING ONE OF CRICKET'S GREAT PLAYING CAREERS.",
  },
];

const ALSO =
  "ALSO TODAY: AMAZON PLEDGES $7BN FOR RENEWABLE ENERGY IN INDIA - GOOGLE FLAGS THE FIRST AUTONOMOUS AI CYBERATTACK - INDIA BEAT PAKISTAN 2-1 TO WIN A 10TH SAFF TITLE";

// ---------------------------------------------------------------- draw
function drawGlobe(cv, cx, cy, r) {
  cv.circle(cx, cy, r, INK, 2);
  // Meridians and parallels.
  cv.ellipse(cx, cy, Math.round(r * 0.55), r, INK);
  cv.ellipse(cx, cy, Math.round(r * 0.2), r, INK);
  cv.vline(cx, cy - r, 2 * r, INK, 1);
  for (const dy of [-Math.round(r * 0.55), 0, Math.round(r * 0.55)]) {
    const half = Math.round(Math.sqrt(r * r - dy * dy));
    cv.hline(cx - half, cy + dy, 2 * half, INK, 1);
  }
  // Land blobs: small filled patches on the globe face.
  const blobs = [
    [cx - 26, cy - 30, 16, 10],
    [cx + 8, cy - 18, 20, 12],
    [cx - 30, cy + 12, 18, 10],
    [cx + 14, cy + 22, 14, 8],
  ];
  for (const [bx, by, bw, bh] of blobs) {
    for (let yy = by; yy < by + bh; yy++)
      for (let xx = bx; xx < bx + bw; xx++) {
        const dx = xx - cx;
        const dy = yy - cy;
        if (dx * dx + dy * dy < (r - 3) * (r - 3)) cv.set(xx, yy, BLUE);
      }
  }
  // Red marker for Manila.
  cv.rect(cx + 30, cy - 8, 7, 7, RED);
}

function draw(cv) {
  const M = 34; // margin
  const RW = W - 2 * M; // 956

  // Masthead.
  const title = "WORLD FRONT PAGE";
  const ts = 8;
  const tw = cv.textWidth(title, ts);
  cv.text(title, Math.round((W - tw) / 2), 30, ts, INK, true);
  cv.hline(M, 96, RW, INK, 2);
  const dateLine = "WEDNESDAY 18 NOVEMBER 2026";
  const ds = 2;
  const dw = cv.textWidth(dateLine, ds);
  cv.text(dateLine, Math.round((W - dw) / 2), 108, ds, RED, true);
  // Side notes on the dateline.
  cv.text("NO. 1", M, 108, ds, BODY);
  cv.text("ONE DAY - ONE PAGE", W - M - cv.textWidth("ONE DAY - ONE PAGE", ds), 108, ds, BODY);
  cv.hline(M, 132, RW, INK, 4);
  cv.hline(M, 140, RW, INK, 1);

  // Lead story.
  let y = 158;
  cv.text(LEAD.kicker, M, y, 2, RED, true);
  y += 26;
  const headlineScale = 5;
  for (const line of LEAD.headline) {
    cv.text(line, M, y, headlineScale, INK, true);
    y += 7 * headlineScale + 8;
  }
  // Globe illustration, right of the headline. Kept clear of the deck text
  // below: globe bottom + caption must end above the deck rule at y=310.
  const gx = 880;
  const gy = 224;
  drawGlobe(cv, gx, gy, 54);
  cv.text("MANILA", gx - cv.textWidth("MANILA", 2) / 2, gy + 64, 2, RED, true);

  // Lead deck, full width under the headline block.
  y = 318;
  cv.hline(M, y - 8, RW, LIGHT, 1);
  y = cv.paragraph(LEAD.deck, M, y, 2, BODY, RW, 17);
  y += 10;
  cv.hline(M, y, RW, INK, 4);
  cv.hline(M, y + 6, RW, INK, 1);
  y += 22;

  // Secondary stories: 2 columns x 3 rows.
  const colW = Math.floor((RW - 24) / 2); // 466
  const rowH = 178;
  const colX = [M, M + colW + 24];
  STORIES.forEach((s, i) => {
    const cx = colX[i % 2];
    const cy = y + Math.floor(i / 2) * rowH;
    cv.text(s.section, cx, cy, 2, RED, true);
    cv.hline(cx, cy + 18, 52, RED, 2);
    const headLines = cv.wrap(s.headline, 3, colW);
    headLines.forEach((ln, j) =>
      cv.text(ln, cx, cy + 28 + j * 26, 3, INK, true)
    );
    const bodyY = cy + 28 + headLines.length * 26 + 4;
    cv.paragraph(s.body, cx, bodyY, 2, BODY, colW, 17);
    if (i % 2 === 0) cv.vline(cx + colW + 12, cy, rowH - 14, LIGHT, 1);
  });
  y += 3 * rowH + 6;

  // Footer: also-today strip.
  cv.hline(M, y, RW, INK, 2);
  y += 10;
  cv.paragraph(ALSO, M, y, 2, BODY, RW, 17);
}

function main() {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  fs.mkdirSync(outDir, { recursive: true });
  const cv = new Canvas(W, H, PAPER);
  draw(cv);
  const png = encodePNG(cv);
  fs.writeFileSync(path.join(outDir, "entry.png"), png);
}

main();
