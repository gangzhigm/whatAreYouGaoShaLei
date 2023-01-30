import os
import json
from pamars import pamars
from fileEncoding import fileEncoding

def get_all_product():
    with open(os.path.join(pamars.path_dir_name,'product_id_list'+'.json'),'r') as f:
        d = json.loads(f.read())["data"]["list"]
        for i in d:
            yield i["column_sku"]
            pass
        pass
    pass

def get_isvip_product():
    with open(os.path.join(pamars.path_dir_name,'product_id_list'+'.json'),'r') as f:
        d = json.loads(f.read())["data"]["list"]
        for i in d:
            if i["in_pvip"] == 1:
                c = i["column_sku"]
                yield c
                pass
            pass
        pass
    pass

def get_notvip_product():
    with open(os.path.join(pamars.path_dir_name,'product_id_list'+'.json'),'r') as f:
        d = json.loads(f.read())["data"]["list"]
        for i in d:
            if i["in_pvip"] == 0:
                c = i["column_sku"]
                yield c
                pass
            pass
        pass
    pass

class produceListClean:
    def save_product_all_id_list():
        save_str = []
        for i in get_all_product():
            save_str.append(i)
        with open(os.path.join(pamars.path_dir_name,'all_product_id_list_clean'+'.json'),'w') as f:
            f.write(str(save_str))
            pass
        pass
        fileEncoding.clean_files_encoding_utf8(path=os.path.join(pamars.path_dir_name))
    
    def save_product_isvip_id_list():
        save_str = []
        for i in get_isvip_product():
            save_str.append(i)
        with open(os.path.join(pamars.path_dir_name,'isvip_product_id_list_clean'+'.json'),'w') as f:
            f.write(str(save_str))
            pass
        pass
        fileEncoding.clean_files_encoding_utf8(path=os.path.join(pamars.path_dir_name))

    def save_product_notvip_id_list():
        save_str = []
        for i in get_notvip_product():
            save_str.append(i)
        with open(os.path.join(pamars.path_dir_name,'notvip_product_id_list_clean'+'.json'),'w') as f:
            f.write(str(save_str))
            pass
        pass
        fileEncoding.clean_files_encoding_utf8(path=os.path.join(pamars.path_dir_name))