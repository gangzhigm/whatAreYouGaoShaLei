# import pyautogui;

# # print(pyautogui.size())
# # print(pyautogui)
# # print(pyautogui.position())
# # print(pyautogui.onScreen(0,0))

# # pyautogui.moveTo(740,240);
# # pyautogui.moveTo(940,240);

# # pyautogui.moveTo(740,270);
# # pyautogui.moveTo(840,270);
# # pyautogui.moveTo(940,270);
# # pyautogui.moveTo(1040,270);
# # pyautogui.click(clicks=20,interval=0.01)
# # pyautogui.moveTo(1040,300);
# # pyautogui.click(clicks=20,interval=0.01)
# # y = 270
# # for i in range(13):
# #     pyautogui.moveTo(1040,y);
# pyautogui.click(clicks=50,interval=0.01)
#     # y+=30

# # pyautogui.click(clicks=20,interval=0.01)


# # pyautogui.move(-100,0,2,pyautogui.easeInElastic)
# # pyautogui.move(100,0)
# # pyautogui.easeInQuad        #开始慢，结束快
# # pyautogui.easeOutQuad       #开始块，结束慢
# # pyautogui.easeInOutQuad     #开始块，结束块，中间慢
# # pyautogui.easeInBounce      #结束时反弹
# # pyautogui.easeInElastic     #结束时是橡皮筋
# # 将当前光标位置的东西移动到(100,200)处，在拖动的过程中按住鼠标左键。
# # pyautogui.dragTo(100,200,button='left')
# # 将当前光标位置的东西向下移动100个像素点，在拖动的过程中按住鼠标左键。
# # pyautogui.drag(100,0,button='left')
# # 将当前光标位置的东西向右移动400个像素点，持续时间2秒，开始快，结束慢。
# # pyautogui.drag(400,0,2,pyautogui.easeOutQuad)
# # pyautogui.click()
# # pyautogui.click(100,300)
# # # 用鼠标左键，点击（100，300)的位置
# # >>> pyautogui.click(100,300,button='right')
# # # 用鼠标右键，点击当前位置
# # >>> pyautogui.click(button='middle')
# # 用鼠标左键点击2次，间隔时间0.25秒
# # pyautogui.click()
# # pyautogui.write("Hello World!")
# # pyautogui.press('f11')
# # ['\t', '\n', '\r', ' ', '!', '"', '#', '$', '%', '&', "'", '(',
# # ')', '*', '+', ',', '-', '.', '/', '0', '1', '2', '3', '4', '5', '6', '7',
# # '8', '9', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`',
# # 'a', 'b', 'c', 'd', 'e','f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
# # 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '{', '|', '}', '~',
# # 'accept', 'add', 'alt', 'altleft', 'altright', 'apps', 'backspace',
# # 'browserback', 'browserfavorites', 'browserforward', 'browserhome',
# # 'browserrefresh', 'browsersearch', 'browserstop', 'capslock', 'clear',
# # 'convert', 'ctrl', 'ctrlleft', 'ctrlright', 'decimal', 'del', 'delete',
# # 'divide', 'down', 'end', 'enter', 'esc', 'escape', 'execute', 'f1', 'f10',
# # 'f11', 'f12', 'f13', 'f14', 'f15', 'f16', 'f17', 'f18', 'f19', 'f2', 'f20',
# # 'f21', 'f22', 'f23', 'f24', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9',
# # 'final', 'fn', 'hanguel', 'hangul', 'hanja', 'help', 'home', 'insert', 'junja',
# # 'kana', 'kanji', 'launchapp1', 'launchapp2', 'launchmail',
# # 'launchmediaselect', 'left', 'modechange', 'multiply', 'nexttrack',
# # 'nonconvert', 'num0', 'num1', 'num2', 'num3', 'num4', 'num5', 'num6',
# # 'num7', 'num8', 'num9', 'numlock', 'pagedown', 'pageup', 'pause', 'pgdn',
# # 'pgup', 'playpause', 'prevtrack', 'print', 'printscreen', 'prntscrn',
# # 'prtsc', 'prtscr', 'return', 'right', 'scrolllock', 'select', 'separator',
# # 'shift', 'shiftleft', 'shiftright', 'sleep', 'space', 'stop', 'subtract', 'tab',
# # 'up', 'volumedown', 'volumemute', 'volumeup', 'win', 'winleft', 'winright', 'yen',
# # 'command', 'option', 'optionleft', 'optionright']
# # press()函数实际上是模拟按下一个键，然后释放它，其实就是keyDown()和keyUp()函数的包装。这些函数可以自己调用。
# # pyautogui.keyDown('ctrl')
# # pyautogui.keyDown('shift')
# # pyautogui.keyUp('shift')
# # pyautogui.keyUp('ctrl')
# # time.sleep( 5 )

# # pyautogui.hotkey('art', 'shift')







# # img_path = r'.\python_autogui_img\one.png';
# # 截图
# # im = pyautogui.screenshot();
# # 不截全屏，截取区域图片。截取区域region参数为：左上角XY坐标值、宽度和高度
# # im = pyautogui.screenshot(region=(0, 0, 300 ,400))
# # 保存图片
# # im.save(img_path);
# # pyautogui.screenshot(img_path) # 截全屏并设置保存图片的位置和名称
# # pyautogui.screenshot(r'C:\Users\ZDH\Desktop\PY\region_screenshot.png', region=(0, 0, 300, 400))
# # im = pyautogui.screenshot(r'C:\Users\ZDH\Desktop\PY\my_screenshot.png') # 截全屏并设置保存图片的位置和名称
# # print(im) # 打印图片的属性
 
 
# # pix = pyautogui.screenshot().getpixel((220, 200)) # 获取坐标(220,200)所在屏幕点的RGB颜色
# # positionStr = ' RGB:(' + str(pix[0]).rjust(3) + ',' + str(pix[1]).rjust(3) + ',' + str(pix[2]).rjust(3) + ')'
# # print(pix) # 打印结果为RGB:( 60, 63, 65)
# # print(positionStr) # 打印结果为RGB:( 60, 63, 65)
# # pix = pyautogui.pixel(220, 200) # 获取坐标(220,200)所在屏幕点的RGB颜色与上面三行代码作用一样
# # positionStr = ' RGB:(' + str(pix[0]).rjust(3) + ',' + str(pix[1]).rjust(3) + ',' + str(pix[2]).rjust(3) + ')'
# # print(positionStr) # 打印结果为RGB:( 60, 63, 65)
 
# # # 如果你只是要检验一下指定位置的像素值，可以用pixelMatchesColor(x,y,RGB)函数，把X、Y和RGB元组值穿入即可
# # # 如果所在屏幕中(x,y)点的实际RGB三色与函数中的RGB一样就会返回True，否则返回False
# # # tolerance参数可以指定红、绿、蓝3种颜色误差范围
# # pixelSure = pyautogui.pixelMatchesColor(100, 200, (255, 255, 255))
# # pixelSure = pyautogui.pixelMatchesColor(100, 200, (255, 255, 245), tolerance=10)

 
# # # 获得文件图片在现在的屏幕上面的坐标，返回的是一个元组(top, left, width, height)
# # # 如果截图没找到，pyautogui.locateOnScreen()函数返回None
# # a = pyautogui.locateOnScreen(img_path);
# # print(a) # 打印结果为Box(left=0, top=0, width=300, height=400)
# # x, y = pyautogui.center(a) # 获得文件图片在现在的屏幕上面的中心坐标
# # print(x, y) # 打印结果为150 200
# # x, y = pyautogui.locateCenterOnScreen(img_path) # 这步与上面的四行代码作用一样
# # print(x, y) # 打印结果为150 200
 
# # # 匹配屏幕所有与目标图片的对象，可以用for循环和list()输出
# # pyautogui.locateAllOnScreen(r'C:\Users\ZDH\Desktop\PY\region_screenshot.png')
# # for pos in pyautogui.locateAllOnScreen(r'C:\Users\ZDH\Desktop\PY\region_screenshot.png'):
# #   print(pos)
# # # 打印结果为Box(left=0, top=0, width=300, height=400)
# # a = list(pyautogui.locateAllOnScreen(r'C:\Users\ZDH\Desktop\PY\region_screenshot.png'))
# # print(a) # 打印结果为[Box(left=0, top=0, width=300, height=400)]





import pyautogui;

# print(pyautogui.size())
# print(pyautogui)
# print(pyautogui.position())
# print(pyautogui.onScreen(0,0))

# pyautogui.moveTo(740,240);
# pyautogui.moveTo(940,240);

# pyautogui.moveTo(740,270);
# pyautogui.moveTo(840,270);
# pyautogui.moveTo(940,270);
# pyautogui.moveTo(1040,270);
# pyautogui.click(clicks=20,interval=0.01)
# pyautogui.moveTo(1040,300);
# pyautogui.click(clicks=20,interval=0.01)
# y = 270
# for i in range(13):
#     pyautogui.moveTo(1040,y);
pyautogui.click(clicks=50,interval=0.01)
    # y+=30

# pyautogui.click(clicks=20,interval=0.01)


# pyautogui.move(-100,0,2,pyautogui.easeInElastic)
# pyautogui.move(100,0)
# pyautogui.easeInQuad        #开始慢，结束快
# pyautogui.easeOutQuad       #开始块，结束慢
# pyautogui.easeInOutQuad     #开始块，结束块，中间慢
# pyautogui.easeInBounce      #结束时反弹
# pyautogui.easeInElastic     #结束时是橡皮筋
# 将当前光标位置的东西移动到(100,200)处，在拖动的过程中按住鼠标左键。
# pyautogui.dragTo(100,200,button='left')
# 将当前光标位置的东西向下移动100个像素点，在拖动的过程中按住鼠标左键。
# pyautogui.drag(100,0,button='left')
# 将当前光标位置的东西向右移动400个像素点，持续时间2秒，开始快，结束慢。
# pyautogui.drag(400,0,2,pyautogui.easeOutQuad)
# pyautogui.click()
# pyautogui.click(100,300)
# # 用鼠标左键，点击（100，300)的位置
# >>> pyautogui.click(100,300,button='right')
# # 用鼠标右键，点击当前位置
# >>> pyautogui.click(button='middle')
# 用鼠标左键点击2次，间隔时间0.25秒
# pyautogui.click()
# pyautogui.write("Hello World!")
# pyautogui.press('f11')
# ['\t', '\n', '\r', ' ', '!', '"', '#', '$', '%', '&', "'", '(',
# ')', '*', '+', ',', '-', '.', '/', '0', '1', '2', '3', '4', '5', '6', '7',
# '8', '9', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`',
# 'a', 'b', 'c', 'd', 'e','f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
# 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '{', '|', '}', '~',
# 'accept', 'add', 'alt', 'altleft', 'altright', 'apps', 'backspace',
# 'browserback', 'browserfavorites', 'browserforward', 'browserhome',
# 'browserrefresh', 'browsersearch', 'browserstop', 'capslock', 'clear',
# 'convert', 'ctrl', 'ctrlleft', 'ctrlright', 'decimal', 'del', 'delete',
# 'divide', 'down', 'end', 'enter', 'esc', 'escape', 'execute', 'f1', 'f10',
# 'f11', 'f12', 'f13', 'f14', 'f15', 'f16', 'f17', 'f18', 'f19', 'f2', 'f20',
# 'f21', 'f22', 'f23', 'f24', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9',
# 'final', 'fn', 'hanguel', 'hangul', 'hanja', 'help', 'home', 'insert', 'junja',
# 'kana', 'kanji', 'launchapp1', 'launchapp2', 'launchmail',
# 'launchmediaselect', 'left', 'modechange', 'multiply', 'nexttrack',
# 'nonconvert', 'num0', 'num1', 'num2', 'num3', 'num4', 'num5', 'num6',
# 'num7', 'num8', 'num9', 'numlock', 'pagedown', 'pageup', 'pause', 'pgdn',
# 'pgup', 'playpause', 'prevtrack', 'print', 'printscreen', 'prntscrn',
# 'prtsc', 'prtscr', 'return', 'right', 'scrolllock', 'select', 'separator',
# 'shift', 'shiftleft', 'shiftright', 'sleep', 'space', 'stop', 'subtract', 'tab',
# 'up', 'volumedown', 'volumemute', 'volumeup', 'win', 'winleft', 'winright', 'yen',
# 'command', 'option', 'optionleft', 'optionright']
# press()函数实际上是模拟按下一个键，然后释放它，其实就是keyDown()和keyUp()函数的包装。这些函数可以自己调用。
# pyautogui.keyDown('ctrl')
# pyautogui.keyDown('shift')
# pyautogui.keyUp('shift')
# pyautogui.keyUp('ctrl')
# time.sleep( 5 )

# pyautogui.hotkey('art', 'shift')







# img_path = r'.\python_autogui_img\one.png';
# 截图
# im = pyautogui.screenshot();
# 不截全屏，截取区域图片。截取区域region参数为：左上角XY坐标值、宽度和高度
# im = pyautogui.screenshot(region=(0, 0, 300 ,400))
# 保存图片
# im.save(img_path);
# pyautogui.screenshot(img_path) # 截全屏并设置保存图片的位置和名称
# pyautogui.screenshot(r'C:\Users\ZDH\Desktop\PY\region_screenshot.png', region=(0, 0, 300, 400))
# im = pyautogui.screenshot(r'C:\Users\ZDH\Desktop\PY\my_screenshot.png') # 截全屏并设置保存图片的位置和名称
# print(im) # 打印图片的属性
 
 
# pix = pyautogui.screenshot().getpixel((220, 200)) # 获取坐标(220,200)所在屏幕点的RGB颜色
# positionStr = ' RGB:(' + str(pix[0]).rjust(3) + ',' + str(pix[1]).rjust(3) + ',' + str(pix[2]).rjust(3) + ')'
# print(pix) # 打印结果为RGB:( 60, 63, 65)
# print(positionStr) # 打印结果为RGB:( 60, 63, 65)
# pix = pyautogui.pixel(220, 200) # 获取坐标(220,200)所在屏幕点的RGB颜色与上面三行代码作用一样
# positionStr = ' RGB:(' + str(pix[0]).rjust(3) + ',' + str(pix[1]).rjust(3) + ',' + str(pix[2]).rjust(3) + ')'
# print(positionStr) # 打印结果为RGB:( 60, 63, 65)
 
# # 如果你只是要检验一下指定位置的像素值，可以用pixelMatchesColor(x,y,RGB)函数，把X、Y和RGB元组值穿入即可
# # 如果所在屏幕中(x,y)点的实际RGB三色与函数中的RGB一样就会返回True，否则返回False
# # tolerance参数可以指定红、绿、蓝3种颜色误差范围
# pixelSure = pyautogui.pixelMatchesColor(100, 200, (255, 255, 255))
# pixelSure = pyautogui.pixelMatchesColor(100, 200, (255, 255, 245), tolerance=10)

 
# # 获得文件图片在现在的屏幕上面的坐标，返回的是一个元组(top, left, width, height)
# # 如果截图没找到，pyautogui.locateOnScreen()函数返回None
# a = pyautogui.locateOnScreen(img_path);
# print(a) # 打印结果为Box(left=0, top=0, width=300, height=400)
# x, y = pyautogui.center(a) # 获得文件图片在现在的屏幕上面的中心坐标
# print(x, y) # 打印结果为150 200
# x, y = pyautogui.locateCenterOnScreen(img_path) # 这步与上面的四行代码作用一样
# print(x, y) # 打印结果为150 200
 
# # 匹配屏幕所有与目标图片的对象，可以用for循环和list()输出
# pyautogui.locateAllOnScreen(r'C:\Users\ZDH\Desktop\PY\region_screenshot.png')
# for pos in pyautogui.locateAllOnScreen(r'C:\Users\ZDH\Desktop\PY\region_screenshot.png'):
#   print(pos)
# # 打印结果为Box(left=0, top=0, width=300, height=400)
# a = list(pyautogui.locateAllOnScreen(r'C:\Users\ZDH\Desktop\PY\region_screenshot.png'))
# print(a) # 打印结果为[Box(left=0, top=0, width=300, height=400)]