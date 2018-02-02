// 简单类型
let a:number;
let b = true;
let c :[string,number]
enum Color {Red,Green,Blue}
let d:{name:string}={name:'linkFly'}
// 复杂类型
// array
let list_a :number[] =[1,2,3]
let list_b:Array<number>=[1,2,3]
let list_c:[string,number]=['linkFly',0]
// any
let notSure:any =4
notSure=true
//函数类型
// ES6
let fn:(id:string)=>number=(id)=>1
// ES5
let fns:(id:string)=>number=function(id){return 1}
// 高级类型
// 联合类型
let foo:string|number
// 类型断言，强制使用兼容类型中的某一类型
(foo as string)
// 类型保护（判断）
if(typeof foo =="string"){

}
// 类型保护(判断)
if(foo instanceof String){

}
// Model
let users : { id: number, name: string } = { id: 1, name: 'linkFly' }

// Class类
class User {
    // 只读属性
    readonly id: number
  
    // 存取器, get/set
    private _name: string
    get name(): string {
      // dosomething 
      return this._name
    }
    set name (name: string) {
      console.log('this is set method')
      // dosomething
      this._name = name
    }
  
    // 构造函数
    constructor (id: number, theName: string) {
        // 只读属性只能在构造函数里初始化
        this.id = id
        this._name = theName
    }
  
    // 实例方法
    say () {
      console.log(`name: ${this.name}`)
    }
  
    // 静态方法（类方法）
    static print () {
      console.log('static method')
    }
  }
  
  let user = new User(1, 'linkFly')
  user.name = 'tasaid' // 会输出 'this is set method'
  user.say() // 实例方法
  User.print() // 静态方法
//   泛型
// 这个 T 就是泛型，也可以叫其他名字
function identity<T>(arg: T): T {
    // dosomething
    return arg
}

identity<string>('linkfly')
identity('linkfly') // 自动推导
identity(0)
identity(true)