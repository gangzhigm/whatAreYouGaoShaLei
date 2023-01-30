/*
 * @Description:  GraphQL.js : object type
 * @Author: gangzhigm
 * @LastEditors: gangzhigm
 * @LastEditTime: 2019-02-15 15:04:38
 */
var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

// 用 GraphQL schema language 构造一个 schema
var schema = buildSchema(`
  type RandomDie{
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  type Query {
    getDie(numSides: Int): RandomDie
  }
`)

// 该类继承 RandomDie GraphQL 类型 \？？？
class RandomDie {
  constructor(numSides) {
    this.numSides = numSides;
  }

  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides);
  }

  roll({numRolls}) {
    console.log(numRolls)
    var output = [];
    for(var i =0;i< numRolls;i++){
      output.push(this.rollOnce());
    }
    return output;
  }
}

// root 规定了顶层api入口
var root = {
  getDie:function({numSides}){
    return new RandomDie(numSides || 6);
  }
}

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue:root,
  graphiql: true,
}));
app.listen(4000,function(){
  console.log(`running a graphql api server at localhost:4000/graphql`)
})

