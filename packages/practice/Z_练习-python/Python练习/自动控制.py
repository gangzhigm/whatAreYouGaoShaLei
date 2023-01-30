import pyautogui;
import time;
# pyautogui.easeInQuad        #开始慢，结束快
# pyautogui.easeOutQuad       #开始块，结束慢
# pyautogui.easeInOutQuad     #开始块，结束块，中间慢
pyautogui.easeInBounce      #结束时反弹
# pyautogui.easeInElastic     #结束时是橡皮筋
print(pyautogui.size())
print(pyautogui.position())
print(pyautogui.onScreen(0,0))
print(pyautogui.onScreen(1920,1080))
# # 将当前鼠标光标移动到位置(400,500),持续时间是2秒，移动开始慢，结束时快
# pyautogui.moveTo(400,500,2,pyautogui.easeInOutQuad)
# # 将当前鼠标光标向右移动400个像素点，持续时间是2秒，移动开始块，结束时慢
# pyautogui.move(400,0,2,pyautogui.easeOutQuad)

# # 将当前光标位置的东西移动到(100,200)处，在拖动的过程中按住鼠标左键。
# pyautogui.dragTo(100,200,button='left')
# # 将当前光标位置的东西向下移动100个像素点，在拖动的过程中按住鼠标左键。
# pyautogui.drag(100,0,button='left')

# # 将当前光标位置的东西向右移动400个像素点，持续时间2秒，开始快，结束慢。
# pyautogui.drag(400,0,2,pyautogui.easeOutQuad)

pyautogui.click()

# # 用鼠标左键，点击（100，300)的位置
# pyautogui.click(100,300,button='right')
# # 用鼠标右键，点击当前位置
# pyautogui.click(button='middle')

# # 用鼠标左键点击2次，间隔时间0.25秒
# pyautogui.click(clicks=2,interval=0.25)

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
time.sleep( 5 )
pyautogui.keyDown('ctrl')
time.sleep( 5 )
pyautogui.keyDown('shift')
time.sleep( 5 )
pyautogui.keyUp('shift')
time.sleep( 5 )
pyautogui.keyUp('ctrl')
time.sleep( 5 )
pyautogui.hotkey('ctrl', 'shift')