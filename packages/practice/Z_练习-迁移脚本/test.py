# from git.repo import Repo
# import os
# scriptlocal_path = os.path.dirname(__file__)
# newlocal_path = os.path.join(os.path.dirname(__file__),'appnew')
# oldlocal_path = os.path.join(os.path.dirname(__file__),'app')
# repo = Repo(oldlocal_path)
# # branches = repo.remote().refs
# # repo.remote().fetch()
# # print('~~~~~~~~~~')
# # for item in branches:
# #     print(item.remote_head)


# # Optimize-dev
# # develop
# # develop-test
# # feat-10942
# # feat-EU
# # feat-企业微信部门列表
# # feature-join-eqxiu
# # funnel
# # hwc-config
# # master
# # master-hwc
# # master-interactionLive-config
# # perf-vite

# # before = repo.git.branch()
# # print(before)
# # repo.git.checkout('master')
# # after = repo.git.branch()
# # print(after)
# # # repo.git.reset('--hard', '854ead2e82dc73b634cbd5afcf1414f5b30e94a8')

 
# commit_log = repo.git.log('--pretty={"commit":"%h","author":"%an","summary":"%s","date":"%cd"}', max_count=50,
#                           date='format:%Y-%m-%d %H:%M')
# log_list = commit_log.split("\n")
# real_log_list = [eval(item) for item in log_list]
# print(real_log_list)
# branchlocal_path = os.path.join(scriptlocal_path,'test.json')
# with open(branchlocal_path,"a") as file:
#     file.write("".join(real_log_list));



# Get Git Branch Commit Log To File
# import os;
# import time;
# import pyautogui;
# from git.repo import Repo;

# scriptlocal_path = os.path.dirname(__file__);
# oldlocal_path = os.path.join(os.path.dirname(__file__),'app');
# newlocal_path = os.path.join(os.path.dirname(__file__),'appnew');

# repo = Repo(oldlocal_path);

# print(repo.git.branch());

# pyautogui.moveTo(100,100,.25);
# pyautogui.click();

# for branch in ['Optimize-dev','develop','develop-test','feat-10942','feat-EU','feat-企业微信部门列表','feature-join-eqxiu','funnel','hwc-config','master','master-hwc','master-interactionLive-config','perf-vite']:
#     repo.git.checkout(branch);
#     print(repo.git.branch())
#     time.sleep(4)
    
#     repo.remote().fetch()
#     time.sleep(4)

#     log = "git log --oneline --since=2022-6-1 > " + "commit_list_" + branch + ".txt";
#     for letter in log:     # 第一个实例
#         print(letter)
#         pyautogui.press(letter);
#     pyautogui.press('enter');
#     time.sleep(2)


#     print('end:' + branch);
#     time.sleep(2)

# print('all finnsh');


#Clean All Commit to JSON
# import os;
# import time;
# import json;
# import pyautogui;

# scriptlocal_path = os.path.dirname(__file__);
# for branch in ['Optimize-dev','develop','develop-test','feat-10942','feat-EU','feat-企业微信部门列表','feature-join-eqxiu','funnel','hwc-config','master','master-hwc','master-interactionLive-config','perf-vite']:
#     jsontext = {'commits':[]}
#     filelocal_path = os.path.join(scriptlocal_path,"commit_list_" + branch + ".txt");
#     with open(filelocal_path,'r',encoding='UTF-8') as data:
#         for line in data:
#             print(line[0:9])
#             print(line[10:])
#             jsontext['commits'].append({
#                 "key": line[0:9],
#                 "value": line[10:]
#             })
#         jsondata = json.dumps(jsontext,indent=4,separators=(',', ': '),ensure_ascii=False)
#         json_file_obj = open("commit_list_" + branch + ".json", 'w',encoding="utf8")
#         json_file_obj.write(jsondata)
#         json_file_obj.close()



import os;
import shutil;

scriptlocal_path = os.path.dirname(__file__);
oldlocal_path = os.path.join(os.path.dirname(__file__),'app');
oldlocal_patha = os.path.join(os.path.dirname(__file__),'app/indexa.html');
newlocal_path = os.path.join(os.path.dirname(__file__),'appnew');
# if not os.path.exists(newlocal_path):
# 	os.mkdir(newlocal_path)
# shutil.copyfile(oldlocal_path, oldlocal_patha)
# print("over");
import os
for filename in os.listdir(newlocal_path):
    if filename == ".git":
        continue;
    remove_newlocal_path = os.path.join(newlocal_path,filename);
    shutil.rmtree(remove_newlocal_path);



# for parent, dirnames, filenames in os.walk(newlocal_path):
#      # Case1: traversal the directories
#      for dirname in dirnames:
#         # print("Parent folder:", parent)
#         print("Dirname:", dirname)
#      # Case2: traversal the files
#      for filename in filenames:
#         #  print("Parent folder:", parent)
#          print("Filename:", filename)