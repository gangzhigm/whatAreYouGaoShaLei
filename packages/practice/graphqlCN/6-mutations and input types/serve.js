/*
 * @Description: GraphQL.js : mutations and input types
 * @Author: gangzhigm
 * @LastEditors: gangzhigm
 * @LastEditTime: 2019-02-20 10:02:05
 */
var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

// 使用 GraphQL schema language 构建 schema
var schema = buildSchema(`
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type Query {
    getMessage(id: ID!): Message    
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }
`)

// 如果 Message 拥有复杂字段，我们可以把它们放在这个对象里边。
class Message{
  constructor(id, {content, author}){
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

// 映射 username 到 content
var fakeDatabase = {};

var root = {
  getMessage:function ({id}){
    if(!fakeDatabase[id]){
      throw new Error(`no message exists with id ${id}`);
    }
    return new Message(id, fakeDatabase[id]);
  },
  createMessage:function({input}){
    // 在数据库中创建一个随机ID
    var id = require('crypto').randomBytes(10).toString('hex');

    fakeDatabase[id] = input;
    return new Message(id, input);
  },
  updateMessage:function({id, input}){
    if(!fakeDatabase[id]){
      throw new Error(`no message exists with id ${id}`);
    }
    // 替换所有旧数据，有些应用需要局部更新。
    fakeDatabase[id] = input;
    return new Message(id,input);
  },
};
var app = express();
app.use('/graphql',graphqlHTTP({
  schema:schema,
  rootValue:root,
  graphiql: true,
}));
app.listen(4000,function(){
  console.log('running a graphql api serve at localhost:4000/graphql')
})