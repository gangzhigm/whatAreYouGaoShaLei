import os
from pamars import pamars
from fileEncoding import fileEncoding


def produceJsonClean(path):
    with open(path,'r',encoding='utf-8') as f:
        for index, item in enumerate(eval(f.read())["data"]['list']):
            pamars = {
                'index': index,
                'audio_time_arr': item.get('audio_time_arr', 2),
                'audio_time': item.get('audio_time', 3),
                'audio_title': item.get('audio_title', 4),
                'article_sharetitle': item.get('article_sharetitle', 5),
                'id': item.get('id', 6),
            }
            yield pamars
            pass
        pass
    pass

class produceDescClean:
    def produceDescClean(path):
        with open(path,'r',encoding='utf-8') as f:
            for i in eval(f.read()):
                list_desc =  []
                for j in produceJsonClean(os.path.join(pamars.path_dir_name,'product_articles_' + str(i) +'.json')):
                    list_desc.append(j)
                    pass
                pass
                with open(os.path.join(pamars.path_dir_name,'product_articles_' + str(i) +'_clean'+'.json'),'w') as f:
                    f.write(str(list_desc))
                    pass
                pass
            pass
            fileEncoding.clean_files_encoding_utf8(path=os.path.join(pamars.path_dir_name))
            pass
        pass