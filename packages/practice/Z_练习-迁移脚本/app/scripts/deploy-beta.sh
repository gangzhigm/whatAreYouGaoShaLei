#!/usr/bin/env bash
#！/bin/bash
set -e

# DMT FED群组开始发版通知
git_name="<`git config user.name`>" || git_name='<someone>';
curl 'https://oapi.dingtalk.com/robot/send?access_token=b62f2a8b8a23086f8afac0edd2ad8d538fb2a231e14d70a4ecc34e6b82f00b28' \
 -H 'Content-Type: application/json' \
 -d "{\"msgtype\": \"text\",\"text\": {\"content\":\"FED attention please!\n ${git_name} is deploying for beta\"}}"

error_text='
███████╗██████╗ ██████╗  ██████╗ ██████╗ 
██╔════╝██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
█████╗  ██████╔╝██████╔╝██║   ██║██████╔╝
██╔══╝  ██╔══██╗██╔══██╗██║   ██║██╔══██╗
███████╗██║  ██║██║  ██║╚██████╔╝██║  ██║
╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝'

success_text='
███████╗██╗   ██╗ ██████╗ ██████╗███████╗███████╗███████╗
██╔════╝██║   ██║██╔════╝██╔════╝██╔════╝██╔════╝██╔════╝
███████╗██║   ██║██║     ██║     █████╗  ███████╗███████╗
╚════██║██║   ██║██║     ██║     ██╔══╝  ╚════██║╚════██║
███████║╚██████╔╝╚██████╗╚██████╗███████╗███████║███████║
╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝╚══════╝╚══════╝╚══════╝'

echo -e "\033[44;37m 1. BUILD FOR BETA \033[0m"
yarn run beta || {
  echo -e "\033[33m Dependencies error, installing... \033[0m";
  yarn install || { echo -e "\033[31m ${error_text} \033[0m"; exit 1; };
  yarn run beta || { echo -e "\033[31m ${error_text} \033[0m"; exit 1; };
}

echo -e "\033[44;37m 2. UPLOADING FILES TO SERVER \033[0m"
scp -r ./dist/* devops@47.102.202.59:/data/front/app/ || { echo -e "\033[31m ${error_text} \033[0m"; exit 1; }

echo -e "\033[44;37m Beta deployed \033[0m"
echo -e "\033[32m ${success_text} \033[0m"

# 仅macos系统下调用ding-bot脚本发送通知
if [ `uname` == 'Darwin' ]
then
  source ./scripts/dingtalk-bot.sh
fi