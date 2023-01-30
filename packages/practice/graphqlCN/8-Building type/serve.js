/*
 * @Description: GraphQL.js : building type
 * @Author: gangzhigm
 * @LastEditors: gangzhigm
 * @LastEditTime: 2019-02-15 15:09:50
 */
// var express = require('express');
// var graphqlHTTP = require('express-graphql');
// var { buildSchema } = require('graphql');

// var schema =buildSchema(`
//   type User {
//     id: String
//     name: String
//   }

//   type Query {
//     user(id: String): User
//   }
// `);

// // 从 id 映射到 User 对象
// var fakeDatabase = {
//   'a': {
//     id: 'a',
//     name: 'alice',
//   },
//   'b': {
//     id: 'b',
//     name: 'bob',
//   },
// };

// var root = {
//   user: function({id}){
//     return fakeDatabase[id];
//   }
// };

// var app = express();
// app.use('/graphql', graphqlHTTP({
//   schema: schema,
//   rootValue: root,
//   graphiql: true,
// }));
// app.listen(4000,function(){
//   console.log(`running a graphql api serve at 4000`)
// })


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


var express = require('express');
var graphqlHTTP = require('express-graphql');
var graphql = require('graphql');

//Maps id to User object
var fakeDatabase = {
  'a':{
    id:'a',
    name:'alice',
  },
  'b':{
    id:'b',
    name:'bob',
  },
};

//定义 user 类型
var userType = new graphql.GraphQLObjectType({
  name:'User',
  fields:{
    id:{ type:graphql.GraphQLString},
    name:{ type:graphql.GraphQLString},
  }
});

//定义 Query 类型
var queryType = new graphql.GraphQLObjectType({
  name: 'Query',
  fields:{
    user:{
      type:userType,
      // 'args' 描述了 user 查询接受的参数
      args: {
        id:{ type: graphql.GraphQLString}
      },
      resolve: function(_,{id}){
        return fakeDatabase[id];
      }
    }
  }
});

var schema = new graphql.GraphQLSchema({query:queryType});

var app = express();
app.use('/graphql', graphqlHTTP({
  schema:schema,
  graphiql: true,
}));
app.listen(4000,function(){
  console.log(`running a graphql api serve at 4000`)
})