import { createCanvas, loadImage } from "@napi-rs/canvas";
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const WIDTH = 1080;
const HEIGHT = 1920;
const OUTPUT_DIR = "output";
const WATERMARK = "@nhatminhmarcom";

const configFile = process.argv[2] || "config.json";
const renderDate = getRenderDateArg() || getTodayInBangkok();
const projectDir = process.cwd();
const configPath = path.resolve(projectDir, configFile);
const slides = JSON.parse(await readFile(configPath, "utf8"));
const outputDir = path.resolve(projectDir, OUTPUT_DIR, renderDate);

await mkdir(outputDir, { recursive: true });

for (const [index, slide] of slides.entries()) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  await drawBackground(ctx, slide, index);
  drawReadableOverlay(ctx);
  drawLines(ctx, slide.lines || []);
  drawWatermark(ctx);

  const filename = `slide_${String(index + 1).padStart(2, "0")}.png`;
  const outputPath = path.join(outputDir, filename);
  await writeFile(outputPath, await canvas.encode("png"));
  console.log(`Created ${path.relative(projectDir, outputPath)}`);
}

console.log(`Done -> ${path.relative(projectDir, outputDir)}`);

function getRenderDateArg() {
  const args = process.argv.slice(2);
  const index = args.indexOf("--date");
  if (index === -1) return "";
  const value = String(args[index + 1] || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  return value;
}

function getTodayInBangkok() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

async function drawBackground(ctx, slide, index) {
  const imagePath = slide.imagePath ? path.resolve(projectDir, slide.imagePath) : "";

  if (imagePath && existsSync(imagePath)) {
    const buffer = await sharp(imagePath)
      .rotate()
      .resize(WIDTH, HEIGHT, { fit: "cover", position: "center" })
      .png()
      .toBuffer();
    const image = await loadImage(buffer);
    ctx.drawImage(image, 0, 0, WIDTH, HEIGHT);
    return;
  }

  const fallbackPalettes = [
    ["#0b4ea2", "#0f9f9a"],
    ["#102033", "#e15b4f"],
    ["#238a57", "#d89b18"],
    ["#4f46e5", "#0f9f9a"],
    ["#111827", "#d89b18"],
    ["#0b4ea2", "#e15b4f"]
  ];
  const [from, to] = fallbackPalettes[index % fallbackPalettes.length];
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, from);
  gradient.addColorStop(1, to);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(930, 290, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.arc(120, 1660, 330, 0, Math.PI * 2);
  ctx.fill();
}

function drawReadableOverlay(ctx) {
  const top = ctx.createLinearGradient(0, 0, 0, 720);
  top.addColorStop(0, "rgba(0,0,0,0.45)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, WIDTH, 720);

  const middle = ctx.createLinearGradient(0, 560, 0, 1220);
  middle.addColorStop(0, "rgba(0,0,0,0.05)");
  middle.addColorStop(0.45, "rgba(0,0,0,0.48)");
  middle.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = middle;
  ctx.fillRect(0, 520, WIDTH, 760);

  const bottom = ctx.createLinearGradient(0, 1220, 0, HEIGHT);
  bottom.addColorStop(0, "rgba(0,0,0,0)");
  bottom.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, 1220, WIDTH, HEIGHT - 1220);
}

function drawLines(ctx, lines) {
  let nextSafeY = 0;

  for (const line of lines) {
    const size = Number(line.size || 64);
    const weight = line.weight === "bold" ? "bold" : "normal";
    const maxWidth = Number(line.maxWidth || 940);
    const x = Number(line.x || WIDTH / 2);
    const y = Math.max(Number(line.y || HEIGHT / 2), nextSafeY);
    const align = line.align || "center";
    const color = line.color || "#ffffff";

    ctx.save();
    ctx.font = `${weight} ${size}px Arial`;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = Math.max(10, Math.round(size * 0.18));
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = color;

    const wrapped = wrapText(ctx, String(line.text || ""), maxWidth);
    wrapped.forEach((text, row) => {
      const lineY = y + row * Math.round(size * 1.18);
      ctx.fillText(text, x, lineY);
    });

    nextSafeY = y + (wrapped.length - 1) * Math.round(size * 1.18) + Math.round(size * 0.7);
    ctx.restore();
  }
}

function drawWatermark(ctx) {
  ctx.save();
  ctx.font = "italic 42px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = "rgba(0,0,0,0.48)";
  ctx.lineWidth = 7;
  ctx.strokeText(WATERMARK, WIDTH / 2, HEIGHT - 180);
  ctx.fillText(WATERMARK, WIDTH / 2, HEIGHT - 180);
  ctx.restore();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
