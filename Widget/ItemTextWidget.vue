<!-- 
    Created by Leon on 2018/3/28.
 -->
<template>
    <main class="item-text">
        <el-col :span="item.span || 6" v-for="item, index in items" :key="index">
            <el-form-item :label="item.label">
                <label class="label-content" >{{item.data}}</label>
            </el-form-item>
        </el-col>
    </main>
</template>

<script>
    export default {
        props: {
            items: {
                Array,
                default: []
            },
            label: {
                String,
                default: '未定义'
            },
            span: {
                Number,
                default: 5
            },
        },
        data() {
            return {

            }
        },
    };
</script>

<style lang="less">
    .item-text .el-form-item {
        margin-bottom: 5px;
    }
</style>
