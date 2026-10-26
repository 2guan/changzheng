import { badges, earnedBadgeIds } from "./achievements.ts";
import { sanitizeProgress, type Progress } from "./storage.ts";

export function certificateRecord(raw: Progress) {
  const progress = sanitizeProgress(raw);
  const earned = new Set([...progress.badges, ...earnedBadgeIds(progress)]);
  return {
    badges: badges.filter((b) => earned.has(b.id)),
    metrics: [
      {
        value: progress.visited.length,
        total: 22,
        label: "史料阅读",
        unit: "站",
      },
      {
        value: progress.stories.length,
        total: 20,
        label: "故事阅读",
        unit: "篇",
      },
      {
        value: progress.tasks.filter((x) => !x.startsWith("station-")).length,
        total: 9,
        label: "情境体验",
        unit: "项",
      },
      {
        value: progress.answers.filter((x) => x !== null).length,
        total: 15,
        label: "征途问答",
        unit: "题",
      },
    ],
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("纪念图片加载失败，请稍后重试。"));
    img.src = src;
  });
}

export async function createCertificate(
  name: string,
  progress: Progress,
  date = new Date(),
) {
  const record = certificateRecord(progress);
  const displayName =
    Array.from(name.trim()).slice(0, 20).join("") || "长征路上的同行者";
  const [landscape, ...medals] = await Promise.all([
    loadImage("/assets/hero.webp"),
    ...record.badges.map((b) => loadImage(`/assets/badges/${b.id}.svg`)),
  ]);
  await Promise.all([
    document.fonts.load(
      "40px ChangzhengBody",
      displayName + "循着先辈的足迹在阅读中回望在思考中前行",
    ),
    document.fonts.load(
      "100px ChangzhengTitle",
      "重走长征路学习纪念" + record.badges.map((b) => b.name).join(""),
    ),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = 1800;
  canvas.height = 1560;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("当前浏览器无法生成纪念图片。");
  const W = canvas.width,
    H = canvas.height;
  const paper = c.createLinearGradient(0, 0, W, H);
  paper.addColorStop(0, "#faf2df");
  paper.addColorStop(0.5, "#f3e6c9");
  paper.addColorStop(1, "#eaddbd");
  c.fillStyle = paper;
  c.fillRect(0, 0, W, H);
  // Fade the artwork itself, preserving the paper gradient without a hard seam.
  const mountain = document.createElement("canvas");
  mountain.width = W;
  mountain.height = 560;
  const layer = mountain.getContext("2d")!;
  layer.drawImage(
    landscape,
    0,
    landscape.height * 0.35,
    landscape.width,
    landscape.height * 0.65,
    0,
    0,
    W,
    560,
  );
  layer.globalCompositeOperation = "destination-in";
  const fade = layer.createLinearGradient(0, 0, 0, 560);
  fade.addColorStop(0, "#0000");
  fade.addColorStop(1, "#000");
  layer.fillStyle = fade;
  layer.fillRect(0, 0, W, 560);
  c.save();
  c.globalAlpha = 0.15;
  c.drawImage(mountain, 0, 1000);
  c.restore();
  c.strokeStyle = "#9b794b";
  c.lineWidth = 2;
  c.strokeRect(42, 42, W - 84, H - 84);
  c.strokeStyle = "#b99b65";
  c.lineWidth = 1;
  c.strokeRect(54, 54, W - 108, H - 108);
  // Small corner rules instead of an imitation official seal.
  for (const [x, y, sx, sy] of [
    [68, 68, 1, 1],
    [W - 68, 68, -1, 1],
    [68, H - 68, 1, -1],
    [W - 68, H - 68, -1, -1],
  ]) {
    c.strokeStyle = "#943d2d";
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(x, y + sy * 38);
    c.lineTo(x, y);
    c.lineTo(x + sx * 38, y);
    c.stroke();
  }
  const text = (
    s: string,
    x: number,
    y: number,
    size: number,
    color = "#4f4435",
    title = false,
  ) => {
    c.fillStyle = color;
    c.font = `${size}px ${title ? "ChangzhengTitle" : "ChangzhengBody"}, serif`;
    c.fillText(s, x, y);
  };
  const rule = (y: number) => {
    c.strokeStyle = "#ab8b565e";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(154, y);
    c.lineTo(1646, y);
    c.stroke();
  };
  c.textAlign = "center";
  text("交付事业部 · 纪念长征胜利90周年", 900, 127, 24, "#796440");
  text("重走长征路", 900, 265, 112, "#8f3328", true);
  text("学 习 纪 念", 900, 327, 27, "#84683e");
  rule(367);
  let nameSize = 49;
  c.font = `${nameSize}px ChangzhengBody, serif`;
  while (c.measureText(displayName).width > 1360 && nameSize > 27) {
    nameSize--;
    c.font = `${nameSize}px ChangzhengBody, serif`;
  }
  text(displayName, 900, 449, nameSize, "#3d352b");
  text("循着先辈的足迹，在阅读中回望，在思考中前行。", 900, 509, 29);
  text(
    "将山河间的故事、心中的感悟与沿途的收获，珍藏于这一页。",
    900,
    555,
    27,
    "#78664d",
  );
  record.metrics.forEach((m, i) => {
    const x = 340 + i * 373;
    text(String(m.value).padStart(2, "0"), x, 665, 53, "#8f3328", true);
    text(`${m.label} · ${m.unit}`, x, 708, 23, "#78664d");
    if (i < 3) {
      c.strokeStyle = "#b69a6c66";
      c.beginPath();
      c.moveTo(x + 187, 620);
      c.lineTo(x + 187, 713);
      c.stroke();
    }
  });
  rule(755);
  text("沿途荣光", 900, 821, 36, "#6d492d", true);
  text(`已获得 ${record.badges.length} 枚学习纪念章`, 900, 860, 22, "#85704f");
  if (record.badges.length) {
    const rows = Math.ceil(record.badges.length / 4);
    record.badges.forEach((b, i) => {
      const row = Math.floor(i / 4),
        col = i % 4,
        count = Math.min(4, record.badges.length - row * 4);
      const x = 900 + (col - (count - 1) / 2) * 340;
      const y = (rows === 1 ? 990 : 900) + row * 218;
      c.save();
      c.shadowColor = "#52371e25";
      c.shadowBlur = 12;
      c.shadowOffsetY = 6;
      c.drawImage(medals[i], x - 68, y, 136, 153);
      c.restore();
      text(b.name, x, y + 185, 25, "#654529", true);
    });
  } else {
    text("这一路，刚刚启程。", 900, 1050, 38, "#8a6c46", true);
    text(
      "每一次认真阅读与思考，都将成为值得珍藏的印记。",
      900,
      1110,
      27,
      "#78664d",
    );
  }
  rule(1347);
  text("山河为证，初心如炬。", 900, 1400, 32, "#8f3328", true);
  c.textAlign = "left";
  text("重走长征路 · 个人学习留念", 154, 1465, 21, "#78664d");
  c.textAlign = "right";
  text(
    new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date),
    1646,
    1465,
    21,
    "#78664d",
  );
  c.textAlign = "center";
  text("依据个人学习记录生成 · 非官方认证", 900, 1488, 16, "#8a785c");
  return canvas.toDataURL("image/png");
}
