#!/usr/bin/env node
/**
 * 将抓取后的 examcoo JSON 导入数据库（小批量）
 *
 * 示例：
 * node scripts/examcoo/import-fetched-json.mjs \
 *   --input tmp/examcoo/paper_2430396_first10_with_explanations.json \
 *   --viewUrl https://www.examcoo.com/editor/do/view/id/2430396 \
 *   --subjectName Mathematics \
 *   --limit 10
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { PrismaClient, ContentStatus, ProcessingStatus, QuestionType } from "@prisma/client";

dotenv.config({ path: ".env.local" });

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

function normalizeAnswer(answer, type) {
  if (type === "MULTIPLE_CHOICE") {
    if (Array.isArray(answer)) return answer;
    if (typeof answer === "string") {
      return answer
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }
  }
  return answer;
}

function toPrismaQuestionType(type) {
  const mapping = {
    SINGLE_CHOICE: QuestionType.SINGLE_CHOICE,
    MULTIPLE_CHOICE: QuestionType.MULTIPLE_CHOICE,
    TRUE_FALSE: QuestionType.TRUE_FALSE,
    FILL_BLANK: QuestionType.FILL_BLANK,
    ESSAY: QuestionType.ESSAY,
  };
  return mapping[type] || QuestionType.SINGLE_CHOICE;
}

function makeOptionsObject(options = []) {
  if (!Array.isArray(options) || options.length === 0) return undefined;
  const obj = {};
  for (const opt of options) {
    if (!opt?.label) continue;
    obj[opt.label] = opt.text ?? "";
  }
  return Object.keys(obj).length > 0 ? obj : undefined;
}

function generateContentHash(content, type, answer) {
  const normalized = [content.trim().toLowerCase(), type, JSON.stringify(answer)].join("|");
  return crypto.createHash("md5").update(normalized).digest("hex");
}

async function main() {
  const args = parseArgs(process.argv);
  const input = args.input;
  const viewUrl = args.viewUrl;
  const subjectName = args.subjectName || "Mathematics";
  const limit = Number(args.limit || "10");

  if (!input) throw new Error("缺少 --input");
  if (!viewUrl) throw new Error("缺少 --viewUrl");

  const prisma = new PrismaClient();

  try {
    const raw = JSON.parse(fs.readFileSync(input, "utf8"));
    const rows = raw.slice(0, Math.max(1, limit));
    if (rows.length === 0) throw new Error("输入题目为空");

    const subject = await prisma.subject.findFirst({
      where: { name: { contains: subjectName, mode: "insensitive" } },
      select: { id: true, name: true },
    });
    if (!subject) throw new Error(`未找到科目: ${subjectName}`);

    const uploader =
      (await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true },
      })) ||
      (await prisma.user.findFirst({
        orderBy: { createdAt: "asc" },
        select: { id: true },
      }));
    if (!uploader) throw new Error("找不到可用用户（source_files.uploaded_by 必填）");

    const chapterTitle = "Examcoo Imported Pending Review";
    let chapter = await prisma.chapter.findFirst({
      where: { subjectId: subject.id, title: chapterTitle },
      select: { id: true },
    });
    if (!chapter) {
      const maxOrder = await prisma.chapter.aggregate({
        where: { subjectId: subject.id },
        _max: { order: true },
      });
      chapter = await prisma.chapter.create({
        data: {
          subjectId: subject.id,
          title: chapterTitle,
          order: (maxOrder._max.order ?? 0) + 1,
        },
        select: { id: true },
      });
    }

    const paperId = String(rows[0].paperId || "unknown");
    const paperTitle = `Examcoo Paper ${paperId}`;
    const sourceTag = `examcoo:view:${paperId}`;

    let sourceFile = await prisma.sourceFile.findFirst({
      where: {
        fileUrl: viewUrl,
        filename: `examcoo-view-${paperId}.json`,
      },
      select: { id: true },
    });
    if (!sourceFile) {
      const fileSize = fs.statSync(path.resolve(input)).size;
      sourceFile = await prisma.sourceFile.create({
        data: {
          filename: `examcoo-view-${paperId}.json`,
          fileUrl: viewUrl,
          fileType: "html",
          fileSize,
          uploadedBy: uploader.id,
          status: ProcessingStatus.COMPLETED,
          ocrStatus: ProcessingStatus.SKIPPED,
          ocrRawText: null,
          processedAt: new Date(),
        },
        select: { id: true },
      });
    }

    let questionGroup = await prisma.questionGroup.findFirst({
      where: {
        subjectId: subject.id,
        source: sourceTag,
      },
      select: { id: true },
    });
    if (!questionGroup) {
      questionGroup = await prisma.questionGroup.create({
        data: {
          content: paperTitle,
          subjectId: subject.id,
          source: sourceTag,
          sourcePaper: paperTitle,
          sourceYear: new Date().getFullYear(),
          status: ContentStatus.REVIEW_PENDING,
          createdBy: uploader.id,
          sourceFiles: { connect: { id: sourceFile.id } },
        },
        select: { id: true },
      });
    } else {
      await prisma.questionGroup.update({
        where: { id: questionGroup.id },
        data: {
          sourceFiles: { connect: { id: sourceFile.id } },
        },
      });
    }

    let created = 0;
    let skippedDuplicate = 0;
    const details = [];

    for (const row of rows) {
      const type = toPrismaQuestionType(row.type);
      const answer = normalizeAnswer(row.correctAnswer, row.type);
      const content = String(row.question || "").trim();
      const contentHash = generateContentHash(content, type, answer);

      const existing = await prisma.question.findUnique({
        where: { contentHash },
        select: { id: true },
      });

      if (existing) {
        skippedDuplicate += 1;
        details.push({ questionId: row.questionId, status: "duplicate", dbId: existing.id });
        continue;
      }

      const question = await prisma.question.create({
        data: {
          chapterId: chapter.id,
          groupId: questionGroup.id,
          type,
          difficulty: 3,
          content,
          options: makeOptionsObject(row.options),
          answer,
          explanation: row.explanation || null,
          status: ContentStatus.REVIEW_PENDING,
          contentHash,
          sourceFiles: { connect: { id: sourceFile.id } },
          createdBy: uploader.id,
        },
        select: { id: true },
      });

      created += 1;
      details.push({ questionId: row.questionId, status: "created", dbId: question.id });
    }

    console.log(
      JSON.stringify(
        {
          success: true,
          inputCount: rows.length,
          created,
          skippedDuplicate,
          subject: subject.name,
          chapterId: chapter.id,
          questionGroupId: questionGroup.id,
          sourceFileId: sourceFile.id,
          details,
        },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(`[ERROR] ${err.message}`);
  process.exit(1);
});

