<template>
    <div class="indexDB">
        <h1>indexDB</h1>
        <p v-text="canDoyouwantdo ? '当前浏览器是否支持indexDB：是' : '当前浏览器是否支持indexDB：否'"></p>
        <ul class="logbox">
            <li v-for="(item) in log" :key="item.id" v-text="item.value"></li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: 'typewriter',
        data() {
            return {
                canDoyouwantdo:false,
                log:[]
            }
        },
        created() {
            const that = this;
            that.canDoyouwantdo = window.indexedDB ? true : false;

            const request = window.indexedDB.open('person',1);

            let db;
            request.onerror = function(){
                that.addLog(`数据库打开失败！`);
            }

            request.onsuccess = function(){
                that.addLog(`数据库打开成功！`);
                db = request.result;
                console.log(db);
            }

            request.onupgradeneeded = function(event){
                that.addLog(`当前数据库版本不可用！`);
                db = event.target.result;
                const objectStore = db.createObjectStore('person', { keyPath: 'id'});
                // createObjectStore 新建一个对象存储空间（类似数据库中的数据表）
                objectStore.createdIndex( 'name', 'name', { unique: false});
                objectStore.createdIndex( 'name', 'name', { unique: false});
                // createdIndex 创建一个新的字段/列，为要包含的每个数据库记录定义一个新的数据点。
                // createIndex（indexName，keyPath，objectParameters）
                // INDEXNAME 要创建的索引的名称。请注意，可以使用空名称创建索引。
                // keyPath 索引使用的关键路径。请注意，可以使用空创建索引keyPath，也可以将序列（数组）作为a传递keyPath。
                // objectParameters 一个IDBIndexParameters对象 (unique, multiEntry, locale)
                // unique 如果为true，则索引将不允许单个键的重复值。
                // multiEntry 如果true，当keyPath解析为Array 时，索引将在每个数组元素的索引中添加一个条目。如果false，它将添加一个包含Array的单个条目。

            }
        },
        methods: {
            addLog(data){
                this.log.push({
                    id:this.log.length,
                    value:`${data} - ${(new Date()).getFullYear()}年${(new Date()).getMonth()+1}月${(new Date()).getDate()}日`
                })
            },
            // addData(){
            //     const request = db.transaction( ['person'], 'readwrite')
            // },
        }
    }
</script>
<style lang='scss' scoped>
.logbox{
    list-style: none;
}
</style>