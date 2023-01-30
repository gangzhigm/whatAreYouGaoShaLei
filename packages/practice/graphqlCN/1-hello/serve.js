/*
 * @Description: GraphQL Hello
 * @Author: gangzhigm
 * @LastEditors: gangzhigm
 * @LastEditTime: 2019-02-15 14:23:11
 */
var { graphql, buildSchema } = require( 'graphql' );

// 使用 GraphQL schema language 构建一个 schema（结构）
// 定义了一个类型为String的查询项hello
var schema = buildSchema(`
    type Query {
        hello : String
    }
`);

// 根节点为每个API入口端点提供一个 resolver 函数
// 定义了 hello 的 返回逻辑
var root = {
    hello : () => {
        return 'hello world!';
    },
};

// 运行 GraphQL query '{ hello }', 输出响应
// 模拟运行
// 访问 hello 打印 传回数据
graphql( schema, '{ hello }', root ).then((response) => {
    console.log(response);
})