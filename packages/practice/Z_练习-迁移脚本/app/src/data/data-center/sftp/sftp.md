
<a href="https://doc.dmartech.cn/chan-pin-geng-xin-ri-zhi/sftp-yuan-cheng-fu-wu-qi-di-zhi-gai-bian-bao-cuo-ji-jie-jue-fang-an" target="_blank">
Dmartech 服务迁移后，MAC/Linux连接失败解决办法
</a>

## 模板

### 模板简介

下载的模板为zip压缩包, 解压后得到多个csv文件模板, 模板用于规范上传的数据

### 模板分类

| 模板类别 | 命名方式 | 示例 |
| --- | --- | --- |
| 用户数据模板 | user_yyyy-MM-dd-hh-mm-ss.csv | user_2021-08-08-10-12-23.csv |
| 事件数据模板 | 事件名_yyyy-MM-dd-hh-mm-ss.csv | orderDetail_2021-08-08-10-12-23.csv |

### 模板内容

1. 用户数据模板表头为所有的用户属性名称
2. 事件数据模板表头为带主键标识的用户属性名称以及该事件包含的事件属性名称

特别说明:
    1. "带主键标识的用户属性": 在"数据中心-元数据-用户属性"中可以将某些属性设置为主键标识, 例如将手机号和邮箱设为主键标识, 在导入数据时会根据这两个属性查询用户并更新数据
    2. 事件数据模板中需要两个额外的属性,"event_id"和"create_time",event_id为该事件数据的唯一标识,create_time为该事件发生的时间.

---

## 上传
### 上传路径
```
/data
```

### 连接信息

主机名：{{$parent.sftp.host}}
用户名：{{$parent.sftp.sftpUsername}}
密钥: id_rsa (获取方式: 设置中的步骤二下载得到)

### 上传方式

包括但不限于以下几种方式:
1. 通过您喜欢的SFTP客户端上传
2. 通过命令行上传 `sftp -i id_rsa 用户名@主机名`
