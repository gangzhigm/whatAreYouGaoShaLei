import chardet
import os
import requests

                                                                                                                                                        
# 修改文件编码模式
def file_encoding_to_utf8(path,coding):
    with open(path,'r',encoding=coding) as f:
        text=f.read()
        pass
    pass
    with open(path,'w',encoding='utf-8') as f:
        f_save_text = text.replace('"',"###'").replace("'",'"').replace('###"',"'").replace('False','"false"').replace('True','"true"').replace('None','"none"')
        f.write(f_save_text)
        pass
    pass


# 查找文档内文件
def find_all_file(path: str) -> str:
    for root, dirs, files in os.walk(path):
        for f in files:
            fullname = os.path.join(root, f)
            yield fullname
        pass
    pass


def clean_files_encoding_utf8(path):
    for i in find_all_file(path): 
        with open(i,'rb') as f:
            source_encoding = chardet.detect(f.read())
            if source_encoding['encoding'] != 'utf-8':
                file_encoding_to_utf8(path=i,coding=source_encoding['encoding'])
                pass
            pass
        pass
    pass

class aa:
    # get 并且储存的方法
    def requests_get_and_save(path_dir_name,url,name,headers=''):
        rsp = requests.get(url=url,headers=headers)
        data = rsp.text
        os.makedirs(path_dir_name, exist_ok=True)
        with open(os.path.join(path_dir_name,name+'.json'),'w') as f:
            f.write(str(data))
            pass
        pass
        clean_files_encoding_utf8(path=os.path.join(path_dir_name))

    # post 并且储存的方法
    def requests_post_and_save(path_dir_name,url,name,data={},headers={}):
        print('~~~~~~~~~~~~~~~~~~~')
        print(path_dir_name)
        print(url)
        print(name)
        print(data)
        print(headers)
        # rsp = requests.post(url=url, headers=headers, json=data)
        # data = rsp.json()
        # os.makedirs(path_dir_name, exist_ok=True)
        # with open(os.path.join(path_dir_name,name+'.json'),'w') as f:
        #     f.write(str(data))
        #     pass
        # pass
        # clean_files_encoding_utf8(path=os.path.join(path_dir_name))