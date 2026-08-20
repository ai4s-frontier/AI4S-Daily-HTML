#!/usr/bin/env bash
# 从主项目 news-data/ 同步最新日报/周报 md 到 public/reports/,并重建索引。
# 用法: bash scripts/sync-reports.sh [news-data 目录]
set -euo pipefail

DATA_DIR="${1:-../news-data}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/reports"

cp "$DATA_DIR"/push-*.md "$DEST"/
node "$(dirname "$0")/generate-index.mjs"
echo "已同步 $DATA_DIR → $DEST"
