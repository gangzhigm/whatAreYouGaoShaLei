/*
 * @Description: express + graphql.js + express-graphql => hello
 * @Author: gangzhigm
 * @LastEditors: gangzhigm
 * @LastEditTime: 2019-02-15 14:51:57
 */
// 导入 express
var express = require('express');
// 导入 express-graphql express 的 graphql 库
var graphqlHTTP = require('express-graphql');
// 导入 graphql 的 buildSchema 组件
var { buildSchema } = require('graphql');

// 使用 GraphQL Schema Language 创建一个 schema
var schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// root 提供所有 API 入口端点相应的解析器函数
var root = {
  hello: () => {
    return 'Hello world!';
  },
};

//启用express服务
var app = express();

//编写访问 /graphql 的 中间件
/**
 * @example: graphqlHTTP({schema, graphiql, rootValue, context, pretty, formatError, extensions, validationRules, validationRules})
 * @param {Object} schema : GraphQLSchema的实例,必填项。
 * @param {Boolean} graphiql : 设置为 true 时,开启图形化调试页面。
 * @param {Object} rootValue : 作为 Resolver 的逻辑实例。
 * 
 * 暂时放置 @param {Type} context
 * 暂时放置 @param {Type} pretty
 * 暂时放置 @param {Type} formatError
 * 暂时放置 @param {Type} extensions
 * 暂时放置 @param {Type} validationRules
 */
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
// 由于我们对 graphqlHTTP 设置 graphiql: true，你可以使用 GraphiQL 工具来手动执行 GraphQL 查询。
// { hello }