'''
Author: gangzhigm 864853934@qq.com
Date: 2023-01-30 09:46:50
LastEditors: gangzhigm 864853934@qq.com
LastEditTime: 2023-01-30 13:54:20
FilePath: \whatAreYouGaoShaLei\packages\cca\test.py
Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
'''
from selenium import webdriver
# 引入 ActionChains 类
from selenium.webdriver.common.action_chains import ActionChains
# 引入 元素 类
from selenium.webdriver.common.by import By
# 引入 TIME 类
import time
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

# driver = webdriver.Firefox()   # Firefox浏览器
# driver = webdriver.Chrome()    # Chrome浏览器
# driver = webdriver.Ie()        # Internet Explorer浏览器
# driver = webdriver.Opera()     # Opera浏览器
# driver = webdriver.PhantomJS()   # PhantomJS

driver = webdriver.Edge()      # Edge浏览器

# 打开网页
# driver.get("https://store.playstation.com/zh-hans-hk/pages/latest")
driver.get("https://library.playstation.com/recently-purchased")


# element = WebDriverWait(driver, 10, 0.5).until(
#     EC.presence_of_element_located((By.ID, "kw"))
# )

# print(element)









# cookies = [
#     {
#         domain
#         expirationDate
#         hostOnly
#         name
#         path
#         sameSite 
#         secure 
#         session 
#         storeId 
#         value 
#         id 
#     }
# ]
# for item in cookies:
#     # driver.add_cookie(item)
#     print(item)

# driver.implicitly_wait(120)

# 定位到要悬停的元素 利用ID查找
# above = driver.find_element(By.ID,"signin-entrance-input-signinId")
# # 定位到要悬停的元素 利用类名查找
# above = driver.find_element(By.CLASS_NAME,"ember-text-field ember-view textfield")

# # 定位到要悬停的元素 利用name查找
# above = driver.find_element(By.NAME,"设置")

# 定位到要悬停的元素 利用标签名查找
# above = driver.find_element(By.TAG_NAME,"button")

# 定位到要悬停的元素 利用XPATH查找
# above = driver.find_element(By.XPATH,"登录")

# # 定位到要悬停的元素 利用CSS选择器查找
# above = driver.find_element(By.CSS_SELECTOR,"设置")


# 对定位到的元素执行鼠标悬停操作
# ActionChains(driver).move_to_element(above).perform()

# print(above)

















# 安装seleniumm
# pip install selenium

# 2. 下载浏览器驱动

# Firefox浏览器驱动：geckodriver

# Chrome浏览器驱动：chromedriver ,CNPM Binaries Mirror (npmmirror.com)， taobao备用地址

# IE浏览器驱动：IEDriverServer

# Edge浏览器驱动：MicrosoftWebDriver

# Opera浏览器驱动：operadriver

# PhantomJS浏览器驱动：phantomjs

# 需要把浏览器驱动放入系统路径中，或者直接告知selenuim的驱动路径

# 另外启动浏览器，可以设置一些参数，比如无界面之类的，详细参考：

# selenium启动Chrome配置参数问题
# 129 赞同 · 19 评论文章
# 补充上面一个参数，添加代理：options.add_argument("--proxy-server=http://XXXXX.com:80")
# 可以测试是否正常使用，以下代码：

# from selenium import webdriver


# driver = webdriver.Firefox()   # Firefox浏览器
# # driver = webdriver.Firefox("驱动路径")

# driver = webdriver.Chrome()    # Chrome浏览器

# driver = webdriver.Ie()        # Internet Explorer浏览器

# driver = webdriver.Edge()      # Edge浏览器

# driver = webdriver.Opera()     # Opera浏览器

# driver = webdriver.PhantomJS()   # PhantomJS

# # 打开网页
# driver.get(url) # 打开url网页 比如 driver.get("http://www.baidu.com")
# 2021年6月27日 补充

# 用selenium 登录新版的edge方法

# 首先，安装pip install msedge-selenium-tools

# 接下来，使用以下代码：

# from selenium import webdriver
# from msedge.selenium_tools import Edge, EdgeOptions
# options = EdgeOptions()
# options.use_chromium = True
# options.binary_location = r"C:\xx\Microsoft\EdgeCore\93.0.926.0\msedge.exe" # 浏览器的位置
# driver = Edge(options=options, executable_path=r"D:\xx\Desktop\edgedriver_win64\msedgedriver.exe") # 相应的浏览器的驱动位置
# ​
# driver.get("http://www.baidu.com")
# ​






# 元素定位
# find_element_by_id()
# find_element_by_name()
# find_element_by_class_name()
# find_element_by_tag_name()
# find_element_by_link_text()
# find_element_by_partial_link_text()
# find_element_by_xpath()
# find_element_by_css_selector()
# 在element变成elements就是找所有满足的条件，返回数组。

# 一般我都自己采用 xpath 获取元素的，复制即可


# 关于获取对象的api查找：

# selenium.webdriver.remote.webelement - Selenium 3.14 documentation
# ​www.selenium.dev/selenium/docs/api/py/webdriver_remote/selenium.webdriver.remote.webelement.html
# 控制浏览器操作
# 控制浏览器窗口大小
# driver.set_window_size(480, 800)

# 浏览器后退，前进
# # 后退 driver.back()

# # 前进 driver.forward()

# 刷新
# driver.refresh() # 刷新

# Webelement常用方法
# 点击和输入
# driver.find_element_by_id("kw").clear() # 清楚文本 driver.find_element_by_id("kw").send_keys("selenium") # 模拟按键输入 driver.find_element_by_id("su").click() # 单机元素

# 提交
# 可以在搜索框模拟回车操作

# search_text = driver.find_element_by_id('kw') search_text.send_keys('selenium') search_text.submit()

# 其他
# size： 返回元素的尺寸。

# text： 获取元素的文本。

# get_attribute(name)： 获得属性值。

# is_displayed()： 设置该元素是否用户可见。

# 鼠标操作
# 在 WebDriver 中， 将这些关于鼠标操作的方法封装在 ActionChains 类提供。

# ActionChains 类提供了鼠标操作的常用方法：

# perform()： 执行所有 ActionChains 中存储的行为；
# context_click()： 右击；
# double_click()： 双击；
# drag_and_drop()： 拖动；
# move_to_element()： 鼠标悬停。
# 举个例子：

# from selenium import webdriver
# # 引入 ActionChains 类
# from selenium.webdriver.common.action_chains import ActionChains

# driver = webdriver.Chrome()
# driver.get("https://www.baidu.cn")

# # 定位到要悬停的元素
# above = driver.find_element_by_link_text("设置")
# # 对定位到的元素执行鼠标悬停操作
# ActionChains(driver).move_to_element(above).perform()
# 键盘事件
# 以下为常用的键盘操作：

# send_keys(Keys.BACK_SPACE) 删除键（BackSpace）
# send_keys(Keys.SPACE) 空格键(Space)
# send_keys(Keys.TAB) 制表键(Tab)
# send_keys(Keys.ESCAPE) 回退键（Esc）
# send_keys(Keys.ENTER) 回车键（Enter）
# send_keys(Keys.CONTROL,'a') 全选（Ctrl+A）
# send_keys(Keys.CONTROL,'c') 复制（Ctrl+C）
# send_keys(Keys.CONTROL,'x') 剪切（Ctrl+X）
# send_keys(Keys.CONTROL,'v') 粘贴（Ctrl+V）
# send_keys(Keys.F1) 键盘 F1
# ……
# send_keys(Keys.F12) 键盘 F12
# # 输入框输入内容
# driver.find_element_by_id("kw").send_keys("seleniumm")

# # 删除多输入的一个 m
# driver.find_element_by_id("kw").send_keys(Keys.BACK_SPACE)
# 获取断言信息
# title = driver.title # 打印当前页面title
# now_url = driver.current_url # 打印当前页面URL
# user = driver.find_element_by_class_name('nums').text # # 获取结果数目
# 等待页面加载完成
# 显示等待
# 显式等待使WebdDriver等待某个条件成立时继续执行，否则在达到最大时长时抛出超时异常（TimeoutException）。

# from selenium import webdriver
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC

# driver = webdriver.Firefox()
# driver.get("http://www.baidu.com")

# element = WebDriverWait(driver, 5, 0.5).until(
#                       EC.presence_of_element_located((By.ID, "kw"))
#                       )
# element.send_keys('selenium')
# driver.quit()
# WebDriverWait类是由WebDirver 提供的等待方法。在设置时间内，默认每隔一段时间检测一次当前页面元素是否存在，如果超过设置时间检测不到则抛出异常。具体格式如下：

# WebDriverWait(driver, timeout, poll_frequency=0.5, ignored_exceptions=None)

# driver ：浏览器驱动。
# timeout ：最长超时时间，默认以秒为单位。
# poll_frequency ：检测的间隔（步长）时间，默认为0.5S。
# ignored_exceptions ：超时后的异常信息，默认情况下抛NoSuchElementException异常。
# WebDriverWait()一般由until()或until_not()方法配合使用，下面是until()和until_not()方法的说明。
# until(method, message=‘’) 调用该方法提供的驱动程序作为一个参数，直到返回值为True。
# until_not(method, message=‘’) 调用该方法提供的驱动程序作为一个参数，直到返回值为False。
# 在本例中，通过as关键字将expected_conditions 重命名为EC，并调用presence_of_element_located()方法判断元素是否存在。

# 隐式等待
# 如果某些元素不是立即可用的，隐式等待是告诉WebDriver去等待一定的时间后去查找元素。 默认等待时间是0秒，一旦设置该值，隐式等待是设置该WebDriver的实例的生命周期。

# from selenium import webdriver
# driver = webdriver.Firefox()    
# driver.implicitly_wait(10) # seconds    
# driver.get("http://somedomain/url_that_delays_loading")    
# myDynamicElement = driver.find_element_by_id("myDynamicElement") 
# 在不同的窗口和框架之间移动
# driver.switch_to_window("windowName")
# driver.switch_to_frame("frameName")
# 以直接取表单的id 或name属性。如果iframe没有可用的id和name属性，则可以通过下面的方式进行定位。

# #先通过xpth定位到iframe
# xf = driver.find_element_by_xpath('//*[@id="x-URS-iframe"]')

# #再将定位对象传给switch_to_frame()方法
# driver.switch_to_frame(xf)
# 一旦我们完成了frame中的工作，我们可以这样返回父frame:

# driver.switch_to_default_content()
# 警告框处理
# alert = driver.switch_to_alert()
# text：返回 alert/confirm/prompt 中的文字信息。
# accept()：接受现有警告框。
# dismiss()：解散现有警告框。
# send_keys(keysToSend)：发送文本至警告框。keysToSend：将文本发送至警告框。
# 下拉框选择
# from selenium import webdriver
# from selenium.webdriver.support.select import Select
# from time import sleep

# driver = webdriver.Chrome()
# driver.implicitly_wait(10)
# driver.get('http://www.baidu.com')
# sel = driver.find_element_by_xpath("//select[@id='nr']")
# Select(sel).select_by_value('50')  # 显示50条
# 文件上传
# driver.find_element_by_name("file").send_keys('D:\\upload_file.txt')  # # 定位上传按钮，添加本地文件
# cookie操作
# WebDriver操作cookie的方法：

# get_cookies()： 获得所有cookie信息。
# get_cookie(name)： 返回字典的key为“name”的cookie信息。
# add_cookie(cookie_dict) ： 添加cookie。“cookie_dict”指字典对象，必须有name 和value 值。
# delete_cookie(name,optionsString)：删除cookie信息。“name”是要删除的cookie的名称，“optionsString”是该cookie的选项，目前支持的选项包括“路径”，“域”。
# delete_all_cookies()： 删除所有cookie信息
# 调用JavaScript代码
# js="window.scrollTo(100,450);"
# driver.execute_script(js) # 通过javascript设置浏览器窗口的滚动条位置
# 通过execute_script()方法执行JavaScripts代码来移动滚动条的位置。

# 窗口截图
# driver.get_screenshot_as_file("D:\\baidu_img.jpg") # 截取当前窗口，并指定截图图片的保存位置
# 关闭浏览器
# close() 关闭单个窗口
# quit() 关闭所有窗口


# 直接用cookie登录方法
# 链接：https://www.jianshu.com/p/773c58406bdb

# 手动获取网页的cookie，将其序列化并存储在本地
# 写入代码
# for item in cookies:
#     driver.add_cookie(item)
# 参考链接：

# http://www.testclass.net/selenium_python
# https://selenium-python-zh.readthedocs.io








input('wait...')