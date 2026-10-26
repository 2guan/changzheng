#!/bin/zsh
cd -- "$(dirname -- "$0")"
if ! command -v npm >/dev/null 2>&1; then
  echo '请先安装 Node.js 22.18 或更新版本，再运行此文件。'
  read -r '?按回车关闭'
  exit 1
fi
if [ ! -d node_modules ]; then
  echo '首次运行，请先在此目录执行 npm install。'
  read -r '?按回车关闭'
  exit 1
fi
if curl --fail --silent --max-time 2 http://127.0.0.1:5173/ | /usr/bin/grep -q '<title>重走长征路'; then
  echo '网站已在本地运行：http://127.0.0.1:5173/'
  open 'http://127.0.0.1:5173/'
  exit 0
fi
npm run dev -- --open
