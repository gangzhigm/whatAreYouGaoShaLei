
# -*- coding: UTF-8 -*-
import mysql.connector
db = mysql.connector.connect( 
    host="localhost", 
    user="root", 
    passwd="root",
    database='asd', 
    auth_plugin='mysql_native_password'
)
cursor = db.cursor()
# cursor.execute("SELECT VERSION()")
# data = cursor.fetchone()
# lena = cursor.rowcount
# print("mysql版本： %s" % data)
# print("mysql行数 %s" % lena)

# 插入新球员
# sql = "INSERT INTO player (team_id, player_name, height) VALUES (%s, %s, %s)"
# val = (1003, "约翰-科林斯", 2.08)
# cursor.execute(sql, val)
# db.commit()
# print(cursor.rowcount, "记录插入成功。")



# 查询身高大于等于2.08的球员
sql = 'SELECT player_id, player_name, height FROM player WHERE height>=2.08'
cursor.execute(sql)
data = cursor.fetchall()
for each_player in data:
  print(each_player)
cursor.close()
db.close()