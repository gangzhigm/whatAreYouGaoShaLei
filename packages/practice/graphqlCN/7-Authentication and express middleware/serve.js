/*
 * @Description: GraphQL.js : Authentication and express middleware
 * @Author: gangzhigm
 * @LastEditors: gangzhigm
 * @LastEditTime: 2019-02-15 15:09:21
 */
var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
  type Query {
    ip:String
  }
`);

function loggingMiddleware(req, res, next){
  console.log('ip:', req.ip);
  next();
}

var root = {
  ip: function (args, request) {
    return request.ip;
  }
}

var app =express();
app.use(loggingMiddleware);
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000,function(){
  console.log(`running a graphql api serve at 4000/graphql`);
})