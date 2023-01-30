
<a href="https://doc.dmartech.cn/chan-pin-geng-xin-ri-zhi/sftp-yuan-cheng-fu-wu-qi-di-zhi-gai-bian-bao-cuo-ji-jie-jue-fang-an" target="_blank">
Solution for connection failure on MAC/Linux after Dmartech migration
</a>

## Template

### Template introduction

The downloaded template is zip compressed package.After decompression, several CSV file templates are obtained. The templates are used to standardize the uploaded data.

### Template classification

| Template classification | naming patterns | Example |
| --- | --- | --- |
| user data template | user_yyyy-MM-dd-hh-mm-ss.csv | user_2021-08-08-10-12-23.csv |
| event data template | event name_yyyy-MM-dd-hh-mm-ss.csv | orderDetail_2021-08-08-10-12-23.csv |

### Template content

1. User data template header is all user properties
2. Event data template header is “user property with  primary key identifier” and “event properties of this event”

special note::
    1. ”user property with primary key identifier”: In ”data center-metadata-user property” meun,you can set up some properties as primary key,for example,set up “mobile” and “email” as primary key, when importing data, users are queried and updated based on these two properties.
    2. Two additional properties are required in the event data template,"event_id" and "create_time",event_id is a unique identifier for the event data,create_time is the time when the event occurred.

---

## upload
### Upload path
```
/data
```

### Connection information

Host name:{{$parent.sftp.host}}
User name：{{$parent.sftp.sftpUsername}}
Keys: id_rsa (How to get it: download from step 2 in setting)

### Upload mode

Including but not limited to the following ways:
1. Upload through your favorite SFTP client
2. Upload from the command  `sftp -i id_rsa user name@hose name`
