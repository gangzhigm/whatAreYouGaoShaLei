"use strict";
// 定义IOC容器
class IOC {
    constructor() {
        this.container = new Map();
    }
    bind(key, Fn) {
        const factory = () => new Fn();
        this.container.set(key, { factory, singleton: true });
    }
    restore(key) {
        this.container.delete(key);
    }
    use(namespace) {
        let item = this.container.get(namespace);
        if (item !== undefined) {
            if (item.singleton && !item.instance) {
                item.instance = item.factory();
            }
            return item.singleton ? item.instance : item.factory();
        }
        else {
            throw new Error('未找到构造方法');
        }
    }
}
class UserService {
    constructor() {
    }
    test(name) {
        console.log(`my name is ${name}`);
    }
}
const container = new IOC();
container.bind('UserService', UserService);
const userService = container.use('UserService');
userService.test('大史不说话');
