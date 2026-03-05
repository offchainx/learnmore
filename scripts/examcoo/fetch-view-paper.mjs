#!/usr/bin/env node
/**
 * Examcoo view 页面抓取脚本（MVP）
 *
 * 用法示例：
 * node scripts/examcoo/fetch-view-paper.mjs \
 *   --url "https://www.examcoo.com/editor/do/view/id/2430396" \
 *   --limit 10 \
 *   --delayMs 1800 \
 *   --out "tmp/examcoo/paper_2430396_first10.json"
 */

import fs from "node:fs";
import path from "node:path";

const DEFAULT_DELAY_MS = 1800;
const DEFAULT_LIMIT = 10;

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtml(input = "") {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\r/g, "")
    .trim();
}

function normalizeStem(stem = "") {
  const imgReplaced = stem.replace(
    /<img[^>]*?_djrealurl=["']([^"']+)["'][^>]*>/gi,
    (_m, relUrl) => `[题图](https://img.examcoo.com${relUrl})`
  );
  const plain = decodeHtml(imgReplaced).replace(/<[^>]+>/g, "");
  return plain.replace(/\n{3,}/g, "\n\n").trim();
}

function decodeBitmaskToLetters(maskValue, optionCount) {
  const n = Number(maskValue);
  if (!Number.isFinite(n) || n <= 0) return "";
  const letters = [];
  for (let i = 0; i < optionCount; i++) {
    if ((n & (1 << i)) !== 0) {
      letters.push(String.fromCharCode(65 + i));
    }
  }
  return letters.join(",");
}

function parseOptions(rawOptions) {
  if (!rawOptions) return [];
  try {
    const parsed = typeof rawOptions === "string" ? JSON.parse(rawOptions) : rawOptions;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((opt, index) => ({
      label: String.fromCharCode(65 + index),
      text: decodeHtml(opt?.o ?? ""),
    }));
  } catch {
    return [];
  }
}

function parseFillBlankAnswers(rawAnswer) {
  try {
    const parsed = typeof rawAnswer === "string" ? JSON.parse(rawAnswer) : rawAnswer;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((blank) => {
      const raw = String(blank?.a ?? "");
      return raw
        .split("|||")
        .map((x) => decodeHtml(x))
        .filter(Boolean);
    });
  } catch {
    return [];
  }
}

function extractPidToken(html) {
  const pidMatch = html.match(/var\s+pid\s*=\s*"(\d+)"/);
  const tokenMatch = html.match(/var\s+vp4tokenpid\s*=\s*"([^"]+)"/);
  if (!pidMatch || !tokenMatch) {
    throw new Error("无法从 view 页面提取 pid/tokenpid");
  }
  return { pid: pidMatch[1], tokenpid: tokenMatch[1] };
}

function extractExplanation(commentHtml) {
  const match = commentHtml.match(
    /试题解析：<\/div><div>([\s\S]*?)<\/div><div class="marginTop8 bold">纠错或评论：/
  );
  if (!match) return null;
  const cleaned = decodeHtml(match[1]).replace(/<[^>]+>/g, "").trim();
  return cleaned || null;
}

function mapQuestionType(id) {
  if (!id || !id.includes("_")) return "UNKNOWN";
  const prefix = id.split("_")[0];
  const map = {
    s1: "SINGLE_CHOICE",
    s2: "MULTIPLE_CHOICE",
    s3: "TRUE_FALSE",
    s4: "FILL_BLANK",
    s5: "ESSAY",
  };
  return map[prefix] || prefix.toUpperCase();
}

class CookieJar {
  constructor() {
    this.store = new Map();
  }

  ingestFromResponse(res) {
    const values =
      (typeof res.headers.getSetCookie === "function" && res.headers.getSetCookie()) || [];
    for (const line of values) {
      const firstPart = line.split(";")[0];
      const [name, ...rest] = firstPart.split("=");
      if (!name || rest.length === 0) continue;
      this.store.set(name.trim(), rest.join("=").trim());
    }
  }

  asHeader() {
    return Array.from(this.store.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
}

async function httpGet(url, jar, referer) {
  const headers = {
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    accept: "*/*",
  };
  if (jar.asHeader()) headers.cookie = jar.asHeader();
  if (referer) headers.referer = referer;

  const res = await fetch(url, { method: "GET", headers });
  jar.ingestFromResponse(res);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.text();
}

async function httpPostForm(url, form, jar, referer) {
  const headers = {
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "x-requested-with": "XMLHttpRequest",
    accept: "*/*",
  };
  if (jar.asHeader()) headers.cookie = jar.asHeader();
  if (referer) headers.referer = referer;

  const body = new URLSearchParams(form).toString();
  const res = await fetch(url, { method: "POST", headers, body });
  jar.ingestFromResponse(res);
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.text();
}

async function main() {
  const args = parseArgs(process.argv);
  const url = args.url;
  const limit = Number(args.limit || DEFAULT_LIMIT);
  const delayMs = Number(args.delayMs || DEFAULT_DELAY_MS);
  const outPath = args.out;

  if (!url) {
    throw new Error("缺少参数 --url");
  }

  const jar = new CookieJar();
  const viewHtml = await httpGet(url, jar);
  const { pid, tokenpid } = extractPidToken(viewHtml);

  const paperApi = `https://www.examcoo.com/editor/rpc/getpapercontent/pid/${pid}/tokenpid/${tokenpid}/fromAction/view`;
  const paperRaw = await httpGet(paperApi, jar, url);
  const paperData = JSON.parse(paperRaw);

  const questions = paperData
    .filter((item) => typeof item.id === "string" && /^s\d+_/.test(item.id))
    .slice(0, Math.max(1, limit));

  const output = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const options = parseOptions(q.b);
    const questionType = mapQuestionType(q.id);
    const sid = q.id;
    const numericId = sid.split("_")[1];

    let answer;
    if (questionType === "SINGLE_CHOICE" || questionType === "MULTIPLE_CHOICE") {
      answer = decodeBitmaskToLetters(q.c, options.length);
    } else if (questionType === "TRUE_FALSE") {
      const judge = decodeBitmaskToLetters(q.c, 2);
      answer = judge === "A" ? "对" : judge === "B" ? "错" : judge;
    } else if (questionType === "FILL_BLANK") {
      answer = parseFillBlankAnswers(q.c);
    } else if (questionType === "ESSAY") {
      answer = decodeHtml(String(q.c ?? ""));
    } else {
      answer = decodeHtml(String(q.c ?? ""));
    }

    let explanation = null;
    try {
      const commentHtml = await httpPostForm(
        "https://www.examcoo.com/editor/comment/index",
        {
          id: numericId,
          sdtId: sid,
          pid,
          p: "1",
          l: "0",
          msgid: "0",
          cmid: "0",
          tid: "0",
          verifydtid: "0",
          tokenpid,
        },
        jar,
        url
      );
      explanation = extractExplanation(commentHtml);
    } catch (err) {
      explanation = null;
      console.warn(`[WARN] 解析抓取失败 ${sid}: ${err.message}`);
    }

    output.push({
      no: i + 1,
      paperId: pid,
      tokenpid,
      questionId: sid,
      type: questionType,
      question: normalizeStem(String(q.a ?? "")),
      options,
      correctAnswer: answer,
      explanation,
    });

    if (i < questions.length - 1) {
      const jitter = Math.floor(Math.random() * 400);
      await sleep(delayMs + jitter);
    }
  }

  const finalOutputPath =
    outPath ||
    path.join("tmp", "examcoo", `paper_${pid}_first${questions.length}_${Date.now()}.json`);

  fs.mkdirSync(path.dirname(finalOutputPath), { recursive: true });
  fs.writeFileSync(finalOutputPath, JSON.stringify(output, null, 2), "utf8");

  console.log(
    JSON.stringify(
      {
        success: true,
        paperId: pid,
        total: output.length,
        output: finalOutputPath,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(`[ERROR] ${err.message}`);
  process.exit(1);
});

