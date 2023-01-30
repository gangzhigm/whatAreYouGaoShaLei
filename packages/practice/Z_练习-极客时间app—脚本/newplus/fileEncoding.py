import os
import chardet

class fileEncoding:
    # 修改文件编码模式
    def file_encoding_to_utf8(path,coding):
        # gb2312
        encoding = coding
        if coding == 'GB2312':
            encoding = 'GBK'
        with open(path,'r',encoding=encoding) as f:
            text=f.read()
            pass
        pass
        with open(path,'w',encoding='utf-8') as f:
            f_save_text = text.replace('False','"false"').replace('True','"true"').replace('None','"none"').replace('"',"###'").replace("'",'"').replace('###"',"'")
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
        for i in fileEncoding.find_all_file(path): 
            with open(i,'rb') as f:
                source_encoding = chardet.detect(f.read())
                if source_encoding['encoding'] != 'utf-8':
                    fileEncoding.file_encoding_to_utf8(path=i,coding=source_encoding['encoding'])
                    pass
                pass
            pass
        pass