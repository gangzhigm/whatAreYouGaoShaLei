#!/usr/bin/env bash
#!/bin/bash
set -e

# 自动填写发版日志+钉钉机器人群通知

# 当前时间 YYYY-MM-dd HH:mm:ss
cur_time=`date '+%F %T'`;
# 当前【git最近提交时间 】YYYY-MM-dd HH:mm:ss +0800
cr_time=`git show --pretty=format:"%ci" | head -1`;
# 从远程日志获取上次运行脚本时的 【git最近提交时间】 若获取失败不添加日志&&不发送钉钉通知
last_time=$(ssh devops@47.102.202.59 "sed -n '9p' /data/front/app/deploy_record.log")\
  || { echo -e "\033[33m*successfully deployed without sending dingtalk message or adding new record to remote log file. \033[0m"; exit 1; }

# 获取 上次运行脚本时git最近提交时间至今所有提交记录
git_log=`git log --pretty=format:' ✔️ %s <%an>' --no-merges --after="${last_time}"`;
string_git_log="$git_log"
# 写入beta服日志文件
ssh devops@47.102.202.59 "
  cd /data/front/app;
  sed -i '9i"${git_log}"\n' ./deploy_record.log;
  sed -i '9i"${cr_time: 0: 20}"' ./deploy_record.log;
" || { echo -e "\033[33m*successfully deployed without adding any new record to remote log file. \033[0m"; exit 1; }

curl 'https://oapi.dingtalk.com/robot/send?access_token=9c518a439a4fa2991a5fb63439a7892349822bfaebcbb3e66229ed6cf88c1340' \
 -H 'Content-Type: application/json' \
 -d "{\"msgtype\": \"text\",\"text\": {\"content\":\"FED beta changes ${cur_time}\n ${string_git_log}\"}}"