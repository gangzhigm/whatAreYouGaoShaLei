"use strict";
// Partial：接口全部字段变为可选类型
// interface User {
//   id: number
//   name: string
//   age: number
// }
// 现在Form拥有User里面的所有字段，但是全是可选的
// type Form = Partial<User>
// Partial的作用是将传入的属性变成可选项，原理就是使用keyof拿到所有属性名，
// 然后再使用in遍历，T[P]拿到相应的值。
// type Partial<T> = {
//     [P in keyof T]?: T[P]
// }
