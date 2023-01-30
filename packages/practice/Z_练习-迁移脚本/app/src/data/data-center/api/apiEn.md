# send request
### http request mode
```
POST
```
### Data receiving url

{{$parent.api.url}}
### Batch Data Interface

{{$parent.api.batchUrl}}

# Request example
### Request example of import user data
```
{
    "type": "user",
    "properties": {
        "mobile": "18366668888",
        "email": "zhangsan@qdum.com",
        "name": "zhangsan"
        ...
    }
}
```

### Request example of delete user data
```
{
    "type": "user_delete",
    "properties": {
        "mobile": "18366668888",
        "email": "zhangsan@qdum.com"
    }
}
```


### Request example of import event data
```
{
    "type": "event",
    "event": "order_detail",
    "properties": {
        "mobile": "18366668888",
        "email": "zhangsan@qdum.com",
        "event_id": "2018071216423310001",
        "create_time": "2018-07-12 16:42:33",
        "shop_name": "<Store name>",
        "amount": "<Order amount>",
        "item_num": "<Quantity of commodity>",
        ...
    }
}
```

### Request example of batch import user data
```
{
    "type": "user_batch",
    "properties": [{
        "mobile": "18366668886",
        "email": "zhangyi@qdum.com",
        "name": "zhangyi"
        ...
    },{
        "mobile": "18366668887",
        "email": "zhanger@qdum.com",
        "name": "zhanger"
        ...
    },{
        "mobile": "18366668888",
        "email": "zhangsan@qdum.com",
        "name": "zhangsan"
        ...
    }]
}
```

### Request example of batch import event data
```
{
    "type": "event_batch",
    "event": "order_detail",
    "properties": [{
        "mobile": "18366668886",
        "email": "zhangyi@qdum.com",
        "event_id": "2018071216423310001",
        "create_time": "2018-07-12 16:42:33",
        "shop_name": "<Store name>",
        "amount": <Order amount>,
        "item_num": <Quantity of commodity>,
        ...
    },{
        "mobile": "18366668887",
        "email": "zhanger@qdum.com",
        "event_id": "2018071216423310002",
        "create_time": "2018-07-12 16:42:33",
        "shop_name": "<Store name>",
        "amount": <Order amount>,
        "item_num": <Quantity of commodity>,
        ...
    },{
        "mobile": "18366668888",
        "email": "zhangsan@qdum.com",
        "event_id": "2018071216423310003",
        "create_time": "2018-07-12 16:42:33",
        "shop_name": "<Store name>",
        "amount": <Order amount>,
        "item_num": <Quantity of commodity>,
        ...
    }]
}
```
# Parameter explanation
### Parameter explanation of import user data

parameter | necessary | explanation
:--- | :------: |:-
type | yes | “Type” value is user when importing user data,identify that this is a request of  import  user
properties | yes | user property,the value come from “user property”

### Parameter explanation of delete user data
parameter | necessary | explanation
:--- | :------: |:-
type | yes |  “Type” value is user_delete when deleting user data,identify that this is a request of delete user data
properties | yes | The value come from “user property with primary key identifier ”

Parameter explanation of import event data
parameter | necessary | explanation
:--- | :-: |:-
type | yes | “Type” value is “event” when importing user data,identify that this is a request of import event data
event| yes | Event name,identify that  this undating data request is for which event
properties | yes | Event property,the value come from “event property“ and “user property with  primary key identifier”
event_id | yes | primary key,the unique Identification of events,e.g.:oder ID
create_time | yes | Event time,e.g.:order time

### Parameter explanation of batch import user data
parameter | necessary | explanation
:--- | :------: |:-
type | yes |The value is user_batch when batch import user data , Identifies that this is a request for batch import parameter explanation of user data
properties | yes | A list of user attributes, each of which represents a piece of user data, each of which takes its value from "user attributes."

### Parameter explanation of batch import event data
parameter | necessary | explanation
:--- | :------: |:-
type | yes |The value is event_batch when batch import event data, identify that this is a request of import user data
properties | yes | List of event properties, each item representing an event data, each item taking its value from "event properties" and "user properties identified by a primary key"

### Special parameter explaination
```
properties all need “user property with primary key identifier“,and at least one have assigned value

special note:
    1.”user property with primary key identifier”:In ”data center-metadata-user property”meun,
    you can set up some properties as primary key,for example,set up “mobile”and “email” as  primary key,
    when importing data, users are queried and updated based on these two properties.
    2. Two additional properties are required in the event data,"event_id" and "create_time",event_id is a unique identifier for the event data,create_time is the time when the event occurred.
```

# Return

### when request succeed,the JSON package returned as follows:
```
{"errcode":0,"errmsg":"Request successfully"}
```
### when request filed,the JSON package returned as follows:
```
{"errcode":10001,"errmsg":"json data format failed"}
```
### Return code specification

return code | specification
:---|:---
0 | Request succeed
10000 | System error
10001 | Jason format failed
10002 | “type”value illegal
10003 | miss secret parameters
10004 | property list is empty
20000 | Authentication failed
20001 | user property with primary key identifier missing
20002 | need at least one valued user property with primary key identifier
20003 | Data validation failed

### Remarks
```
This result only identifies the request result. For the data import result, please view the import details of the relevant data sources in the system.
```
