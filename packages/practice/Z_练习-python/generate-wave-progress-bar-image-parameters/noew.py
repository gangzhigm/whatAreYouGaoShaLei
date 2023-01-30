from skimage import io, data
import matplotlib.pyplot as plt
img = io.imread('./main32.png')

import math
# print(img.shape[0]) # 图片宽度
# print(img.shape[1]) # 图片高度
# print(img.shape[2]) # 图片通道数
# print(img.size)     # 显示总像素个数
# print(img.max())    # 最大像素值
# print(img.min())    # 最小像素值
# print(img.mean())   # 像素平均值

width = img.shape[0]
height = img.shape[1]
px = 11.25
list = []

yh = math.ceil(height / 500)
y = 0
c = 0
list = []
while ( y < height-10):
    for x in range(width):
        if ( img[x,y,:][0] == 255):
            c = c + 1
            list.append([format(x/px, '.1f'),format(y/px, '.1f')])
            break
        img[x,y,:] = [255,0,0]
    y = int(y + yh)

print(list)
