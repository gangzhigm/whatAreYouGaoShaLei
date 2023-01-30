#!/usr/bin/env bash
#！/bin/bash
set -e

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

cur_time=`date +%Y%m%d_%H_%M_%S`
echo --------------------------------------------
echo -e "\033[44;37m 1. BUILD FOR RELEASE \033[0m"
yarn install || { echo -e "\033[31m ${error_text} \033[0m"; exit 1; };
yarn run release || { echo -e "\033[31m ${error_text} \033[0m"; exit 1; };

echo --------------------------------------------
echo -e "\033[44;37m 2. create a backup on springboard \033[0m"
ssh devops@47.102.144.142 "
cd /data/front/production;
tar -zcvf ./backup/app_${cur_time}.tar.gz ./app/
rm -rf ./app/static/
rm ./app/index.html
"

echo --------------------------------------------
echo -e "\033[44;37m 3. uploading files to springboard \033[0m"
scp -r ./dist/* devops@47.102.144.142:/data/front/production/app/


echo --------------------------------------------
echo -e "\033[44;37m 4. uploading files from springboard \033[0m"
ssh devops@47.102.144.142 "
scp -r /data/front/production/app/* devops@192.168.5.146:/data/front/app/
scp -r /data/front/production/app/* devops@192.168.2.99:/data/front/app/
"

echo --------------------------------------------
echo -e "\033[44;37m Production build uploaded to springboard \033[0m"
echo -e "\033[32m ${success_text} \033[0m"
echo --------------------------------------------
