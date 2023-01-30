import os
import requests
from fileEncoding import fileEncoding

class worm:
    # get 并且储存的方法
    def requests_get_and_save(path_dir_name,url,name,headers=''):
        rsp = requests.get(url=url,headers=headers)
        data = rsp.text
        os.makedirs(path_dir_name, exist_ok=True)
        with open(os.path.join(path_dir_name,name+'.json'),'w') as f:
            f.write(str(data))
            pass
        pass
        fileEncoding.clean_files_encoding_utf8(path=os.path.join(path_dir_name))

    # post 并且储存的方法
    def requests_post_and_save(path_dir_name,url,name,data={},headers={}):
        rsp = requests.post(url=url, headers=headers, json=data)
        data = rsp.json()
        os.makedirs(path_dir_name, exist_ok=True)
        with open(os.path.join(path_dir_name,name+'.json'),'w') as f:
            f.write(str(data))
            pass
        pass
        fileEncoding.clean_files_encoding_utf8(path=os.path.join(path_dir_name))