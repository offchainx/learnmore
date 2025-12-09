#!/bin/bash
# Stories完整性验证脚本

echo "📝 验证Stories完整性..."
echo "================================================"

BACKLOG_DIR="docs/stories/backlog"
TOTAL=0
COMPLETE=0
MISSING=()

# 检查必需的章节
REQUIRED_SECTIONS=(
    "## 1. Objectives"
    "## 2. Tech Plan"
    "## 3. Verification"
    "## 4. Deliverables"
    "## 5. Definition of Done"
    "## 6. Rollback Plan"
    "## 7. Post-Completion Actions"
    "## 8. Notes & Learnings"
)

cd "$BACKLOG_DIR" || exit 1

for file in story-*.md; do
    TOTAL=$((TOTAL + 1))
    echo ""
    echo "检查: $file"

    MISSING_SECTIONS=()

    for section in "${REQUIRED_SECTIONS[@]}"; do
        if ! grep -q "$section" "$file"; then
            MISSING_SECTIONS+=("$section")
        fi
    done

    # 检查关键元数据
    if ! grep -q "预估时间:" "$file"; then
        MISSING_SECTIONS+=("预估时间")
    fi

    if ! grep -q "Story Points:" "$file"; then
        MISSING_SECTIONS+=("Story Points")
    fi

    if ! grep -q "前置依赖:" "$file"; then
        MISSING_SECTIONS+=("前置依赖")
    fi

    if [ ${#MISSING_SECTIONS[@]} -eq 0 ]; then
        echo "  ✅ 完整"
        COMPLETE=$((COMPLETE + 1))
    else
        echo "  ❌ 缺少: ${MISSING_SECTIONS[*]}"
        MISSING+=("$file")
    fi
done

echo ""
echo "================================================"
echo "📊 验证结果"
echo "================================================"
echo "总Story数: $TOTAL"
echo "完整Story: $COMPLETE"
echo "缺失Story: $((TOTAL - COMPLETE))"
echo ""

if [ ${#MISSING[@]} -gt 0 ]; then
    echo "❌ 以下Story需要修复:"
    for story in "${MISSING[@]}"; do
        echo "  - $story"
    done
    exit 1
else
    echo "✅ 所有Story验证通过!"
    echo ""
    echo "接下来可以:"
    echo "1. 阅读 docs/stories/QUICK_START.md 了解如何开始"
    echo "2. 阅读 docs/stories/README.md 查看依赖关系图"
    echo "3. 选择一个Story开始开发!"
    exit 0
fi
