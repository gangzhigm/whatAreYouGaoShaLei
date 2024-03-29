module.exports = {
    parser:  '@typescript-eslint/parser',
    extends: [
        'alloy',
        'alloy/typescript',
    ],
    plugins: ['@typescript-eslint'],
    env: {
        // 您的环境变量（包含多个预定义的全局变量）
        // Your environments (which contains several predefined global variables)
        //
        browser: true,
        node: true,
        jest: true,
        // mocha: true,
        // jquery: true
    },
    globals: {
        // 您的全局变量（设置为 false 表示它不允许被重新赋值）
        // Your global variables (setting to false means it's not allowed to be reassigned)
        //
        // myGlobal: false
    },
    rules: {
        // 自定义您的规则
        // Customize your rules
        // "@typescript-eslint/no-require-imports": false,
        "max-depth": [0, 8],//嵌套块深度
    }
};