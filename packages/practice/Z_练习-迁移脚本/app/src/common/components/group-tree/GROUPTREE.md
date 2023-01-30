<!--多层分组优化 -->
# tree-menu.vue
# 该组件为递归组件
>   1、树形结构组件，不包括侧边栏的固定分组，搜索。
>   2、递归组件在传参时就不能单纯的时候$emit了，在组件中使用的是Bus.$emit,
    ```
    Bus.$emit('abc',moduleRange);
    ```
    暂存在Bus中，各个组件在取参数的时候使用在created或者mounted中使用Bus.$on即可。在使用Bus.$on时，加传一个参数 "moduleRange"(模块)。在指定模块下进行下一步操作：
    ```
    Bus.$on('abc', moduleRange => {
                if (moduleRange === 'materialModule')  {
                    do something......
                }
            });
    ```
    这样避免多个页面在使用同一个Bus时相互影响。

# search.vue
# 搜索



# search-tree.vue
# 带有树形menu的组件


# left-sideBar.vue
# 侧边栏

