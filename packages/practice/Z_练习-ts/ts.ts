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


// Required：接口全部字段变为必填类型
// interface User {
//   id: number
//   name?: string
//   age?: number
// }
// 现在Form拥有User里面的所有字段，但是全部变为必填字段
// type Form = Required<User>
// Required 的作用是将传入的属性变为必选项，原理是使用-？将可选项的？去掉。与之对应的还有个+？。
// type Required<T> = {
//     [P in keyof T] -? = T[P]
// }



// // Readonly：接口全部字段变为只读类型
// interface User {
//   id: number
//   name: string
//   age: number
// }
// type Form = Readonly<User>
// const zhangsan: Form = {
//   id: 1,
//   name: '张三',
//   age: 18
// }
// // 报错
// // zhangsan.name = '李四'
// // Readonly的作用是将传入的属性变为只读选项
// type Readonly<T> = {
//     readonly [ p in keyof T]: T[p]
// }


// Mutable
// Mutable的作用是将传入属性的readonly移除。
// type Mutable<T> = {
//     -readonly [ p in keyof T]: T[p]
// }


// Record
// Record的作用是将K中所有属性的值转化成T类型
// type Record<K extends keyof T>{
//     [P in K]: T[P]
// }



// Pick：提取接口中的某些字段
// interface User {
//     id: number
//     name: string
//     age: number
//   }
//   // 此时From中就只有name、age字段
//   type Form = Pick<User, 'name' | 'age'>
// Pick
// Pick的作用是从T中取出一系列K的属性
//   type Pick<T, K extends keyof T> = {
//     [P in keyof K]: T[P]

//   }





// Exclude：排除type中的某些字段
// type Name = 'zhangsan' | 'lisi'
// // 此时Form中只有lisi字段
// type Form = Exclude<Name, 'zhangsan'>
// Exclude
// Exclude的作用是从T中找出U中没有的元素
// type Exclude<T, U> = T extends U ? never : T;







// Omit：排除接口中的某些字段
// interface User {
//   id: number
//   name: string
//   age: number
// }
// // 此时From中就只有id字段
// type Form = Omit<User, 'name' | 'age'>
// Omit的作用是忽略对象的某些属性功能
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>









// Extract：提取type中的某些字段
type Name = 'zhangsan' | 'lisi'
// 此时Form中只有zhangsan字段
type Form = Extract<Name, 'zhangsan'>
