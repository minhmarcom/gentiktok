import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const projectDir = process.cwd();

const startDate = getArgValue("--start") || getTodayInBangkok();
const days = Number(getArgValue("--days") || "7");

if (!Number.isFinite(days) || days < 1 || days > 31) {
  throw new Error(`Invalid --days: ${days}`);
}

const seriesIdea = "TỪ ZERO ĐẾN RA VIDEO MỖI NGÀY: MÌNH DÙNG AI NHƯ THẾ NÀO";
const seriesTitle = "7 NGÀY VIBE CODE (CHO NGƯỜI NO-CODE)";

const dayPlans = buildDayPlans(days);

await mkdir(path.resolve(projectDir, "daily-output"), { recursive: true });

for (let i = 0; i < dayPlans.length; i++) {
  const date = addDays(startDate, i);
  const plan = dayPlans[i];

  const configPath = path.resolve(projectDir, "daily-output", `${date}.config.json`);
  const briefPath = path.resolve(projectDir, "daily-output", `${date}.md`);
  const slides = buildSlidesForDay(i + 1, plan);

  await writeFile(configPath, JSON.stringify(slides, null, 2) + "\n", "utf8");
  await upsertBrief(briefPath, date, {
    seriesTitle,
    seriesIdea,
    dayTitle: plan.dayTitle,
    slideLines: slides.map((s) => s.lines || []),
    caption: plan.caption,
    hashtags: plan.hashtags,
    postingNote: plan.postingNote
  });

  const result = spawnSync(process.execPath, ["generate-slides.mjs", configPath, "--date", date], {
    cwd: projectDir,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error(`generate-slides failed for ${date} (exit ${result.status})`);
  }
}

console.log(`Week done from ${startDate} (${dayPlans.length} days).`);

function buildSlidesForDay(dayNumber, plan) {
  return [
    slide("Intro", `DAY ${String(dayNumber).padStart(2, "0")} VIBE CODE`, plan.intro),
    slide("Step 01", "STEP 01 CHỌN 1 BÀI TOÁN", plan.step1),
    slide("Step 02", "STEP 02 NHỜ AI VẼ FLOW", plan.step2),
    slide("Step 03", "STEP 03 LÀM BẢN NHÁP", plan.step3),
    slide("Step 04", "STEP 04 TEST NHANH", plan.step4),
    slide("CTA", "STEP 05 ĐĂNG & ITERATE", plan.cta)
  ];
}

function slide(role, headline, subtitle) {
  return {
    role,
    imagePath: "./pinterest_images/skincare/background.jpg",
    lines: [
      { text: headline, size: 82, weight: "bold", x: 130, y: 880, align: "left", maxWidth: 860 },
      { text: subtitle, size: 44, weight: "normal", x: 130, y: 970, align: "left", maxWidth: 760 }
    ]
  };
}

function buildDayPlans(daysCount) {
  const base = [
    {
      dayTitle: "Mindset + scope",
      intro: "No-code vẫn làm được: AI viết nháp, bạn quyết định mục tiêu.",
      step1: "Chọn 1 mini app 1 màn hình (timer, checklist, note).",
      step2: "Dán mục tiêu vào AI và hỏi: “flow 5 bước cho người mới”.",
      step3: "Xin AI 1 phiên bản đơn giản nhất (MVP) trước.",
      step4: "Test 3 case: đúng • sai • rỗng. Ghi lại lỗi.",
      cta: "Đăng tiến độ 1 phút: bạn làm được gì hôm nay?",
      caption:
        "Day 1/7: Vibe code không cần biết code. Bạn chỉ cần biết mình muốn gì, còn AI sẽ giúp ra bản nháp để bạn chỉnh.",
      hashtags: "#AI #nocode #vibecode #productivity #contentcreator #nhatminhmarcom",
      postingNote: "- Quay 3 đoạn: mục tiêu → flow → kết quả MVP.\n- Ghim comment: “muốn mình share prompt không?”"
    },
    {
      dayTitle: "Flow rõ ràng",
      intro: "Bí idea? Dùng AI để ra 10 hướng, chọn 1 hướng dễ quay nhất.",
      step1: "Viết 1 câu: “app này giúp ai làm gì trong 10 giây?”.",
      step2: "Hỏi AI: “chia thành 3 màn hình + nút bấm cần có”.",
      step3: "Nhờ AI viết checklist tasks theo thứ tự làm.",
      step4: "Chạy thử 1 vòng người dùng: vào → làm → xong.",
      cta: "Chốt 1 flow, không thêm tính năng hôm nay.",
      caption:
        "Day 2/7: 80% là flow. Khi flow rõ, làm no-code nhanh hơn rất nhiều.",
      hashtags: "#AI #nocode #workflow #vibecode #buildinpublic #nhatminhmarcom",
      postingNote: "- Show flow trên giấy/Notion.\n- CTA: “comment FLOW để lấy template”"
    },
    {
      dayTitle: "Bản nháp UI",
      intro: "AI giúp bạn chọn layout nhanh, đỡ bị kẹt ở “không biết bắt đầu”.",
      step1: "Chọn 1 template UI (list, card, form).",
      step2: "Hỏi AI: “layout 3 phần: header • body • action”.",
      step3: "Copy text UI từ AI rồi sửa theo giọng bạn.",
      step4: "Kiểm tra: chữ to, ít chữ, nhìn phát hiểu.",
      cta: "Xong UI nháp là thắng. Mai mới polish.",
      caption:
        "Day 3/7: Làm UI nháp trước. Đẹp tính sau, chạy được mới quan trọng.",
      hashtags: "#AI #nocode #ux #ui #vibecode #buildfast #nhatminhmarcom",
      postingNote: "- Chụp màn hình before/after.\n- Nhắc: “ít chữ, rõ hành động”"
    },
    {
      dayTitle: "Polish 1 style",
      intro: "Chọn 1 style duy nhất để nhìn chuyên nghiệp ngay.",
      step1: "Chọn 1 palette 2 màu + 1 font (giữ cố định).",
      step2: "Hỏi AI: “3 style option (minimal, bold, soft)”.",
      step3: "Áp 1 style cho toàn bộ nút + tiêu đề.",
      step4: "Kiểm tra tương phản: chữ trắng phải đọc rõ.",
      cta: "Chụp 1 màn hình “final look” và đăng.",
      caption:
        "Day 4/7: Đừng mix 5 kiểu. 1 style nhất quán = nhìn pro.",
      hashtags: "#AI #nocode #design #branding #vibecode #creator #nhatminhmarcom",
      postingNote: "- Quay màn hình thay màu/nút.\n- Ghim: “bạn thích style nào?”"
    },
    {
      dayTitle: "Data tối giản",
      intro: "No-code mạnh nhất ở data đơn giản: form → lưu → hiển thị.",
      step1: "Chọn 3 field quan trọng nhất (đừng quá 5).",
      step2: "Hỏi AI: “field name + validation dễ hiểu”.",
      step3: "Tạo form + lưu vào sheet/DB (tuỳ tool).",
      step4: "Test nhập sai: bỏ trống, quá dài, ký tự lạ.",
      cta: "Nếu lưu được data, app đã “sống”.",
      caption:
        "Day 5/7: Làm data tối giản. Ít field nhưng chạy mượt.",
      hashtags: "#AI #nocode #database #automation #vibecode #mvp #nhatminhmarcom",
      postingNote: "- Show 3 field + kết quả lưu.\n- CTA: “muốn template field không?”"
    },
    {
      dayTitle: "Debug & refine",
      intro: "AI giỏi nhất là gỡ rối nhanh nếu bạn đưa đúng ngữ cảnh.",
      step1: "Copy lỗi/ảnh màn hình + mô tả bạn muốn gì.",
      step2: "Hỏi AI: “nguyên nhân • cách sửa • cách test lại”.",
      step3: "Fix 1 lỗi/lần. Không sửa 5 thứ cùng lúc.",
      step4: "Ghi log: lỗi gì → fix gì → học gì.",
      cta: "Đăng 1 bài: “mình fix được lỗi này như nào”.",
      caption:
        "Day 6/7: Debug = kỹ năng. Đưa context tốt thì AI trả lời rất nhanh.",
      hashtags: "#AI #nocode #debug #problemsolving #vibecode #learnfast #nhatminhmarcom",
      postingNote: "- Đọc to câu hỏi AI bạn dùng.\n- Kết: “mai ship!”"
    },
    {
      dayTitle: "Ship & share",
      intro: "Ship trước, hoàn hảo tính sau. Bản đầu tiên chỉ cần hoạt động.",
      step1: "Checklist 5 thứ: UI ok • data ok • lỗi ít • flow rõ • CTA.",
      step2: "Hỏi AI: “caption 3 option + 10 hashtag đúng niche”.",
      step3: "Viết FAQ 3 câu: dùng gì, cho ai, bắt đầu thế nào.",
      step4: "Đo 3 chỉ số: view, watch time, comment.",
      cta: "Từ mai lặp lại: idea → build → post → learn.",
      caption:
        "Day 7/7: Ship! Làm xong 1 vòng là bạn hơn 90% người chỉ nghĩ.",
      hashtags: "#AI #nocode #ship #buildinpublic #vibecode #tiktokcreator #nhatminhmarcom",
      postingNote: "- Ghim link/CTA.\n- Hỏi: “muốn mình share prompt pack không?”"
    }
  ];

  return base.slice(0, Math.min(daysCount, base.length));
}

async function upsertBrief(filePath, date, brief) {
  const header = `# Daily TikTok — ${date}\n`;
  const body = [
    `## Series`,
    `- ${brief.seriesTitle}`,
    ``,
    `## Idea`,
    `- ${brief.seriesIdea}`,
    ``,
    `## Day Focus`,
    `- ${brief.dayTitle}`,
    ``,
    `## Slide Text (6 slides)`,
    ...brief.slideLines.map((lines, index) => {
      const headline = String(lines?.[0]?.text || "").trim();
      const subtitle = String(lines?.[1]?.text || "").trim();
      return `${index + 1}) **${headline}**  \n   ${subtitle}`;
    }),
    ``,
    `## Caption`,
    brief.caption,
    ``,
    `## Hashtags`,
    brief.hashtags,
    ``,
    `## Posting Note`,
    brief.postingNote
  ].join("\n");

  if (!existsSync(filePath)) {
    await writeFile(filePath, header + "\n" + body + "\n", "utf8");
    return;
  }

  const existing = await readFile(filePath, "utf8");
  const separator = existing.trimEnd().length ? "\n\n---\n\n" : "";
  await writeFile(filePath, existing.trimEnd() + separator + header + "\n" + body + "\n", "utf8");
}

function getArgValue(name) {
  const args = process.argv.slice(2);
  const index = args.indexOf(name);
  if (index === -1) return "";
  return String(args[index + 1] || "").trim();
}

function addDays(yyyyMmDd, daysToAdd) {
  const [y, m, d] = yyyyMmDd.split("-").map((v) => Number(v));
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + daysToAdd);
  const out = new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(dt);
  return out;
}

function getTodayInBangkok() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

