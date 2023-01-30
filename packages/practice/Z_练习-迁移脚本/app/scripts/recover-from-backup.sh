#!/usr/bin/env bash
#！/bin/bash
cur_time=`date +%Y%m%d_%H_%M_%S`
echo --------------------------------------------
echo - 1. empty the app folder on springboard        -
# read backup
ssh devops@47.102.144.142 "
cd /data/front/production;
rm -rf ./app/*
"
echo --------------------------------------------
echo - 2. recovering backup on springboard        -
ssh devops@47.102.144.142 "
cd /data/front/production/backup;
ls -t | head -1| xargs -I {} tar -zxvf {} -C ../
"

echo --------------------------------------------
echo - 3. uploading files from springboard      -
ssh devops@47.102.144.142 "
scp -r /data/front/production/app/* devops@192.168.5.146:/data/front/app/
scp -r /data/front/production/app/* devops@192.168.2.99:/data/front/app/
"

echo --------------------------------------------
echo - ${backup} recoverd on springboard        -
echo --------------------------------------------
