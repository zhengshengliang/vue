<!-- 
    Created by Leon on 2018/3/16.
    上下箭头
 -->

<template>
    <el-col :span="span">
        <span class="arrow" title="点我隐藏或显示查询项" @click="change">
            <img src="https://img.xingbianli.cn/1510715612305143472281.png" height="30" width="30" v-show="!currentValue"/>
            <img src="https://img.xingbianli.cn/1510715553513143472281.png" height="30" width="30" v-show="currentValue"/>
        </span>
    </el-col>
</template>

<script>
    export default {
        props: {
            value: [Boolean], // 默认值
            span: {
                Number,
                default: 1
            },
        },
        data() {
            return {
                currentValue: this.value,
            }
        },
        watch: {
            'value': function(newValue) {
                this.currentValue = newValue;
            }
        },
        methods: {
            change() {
                this.currentValue = !this.currentValue;
                this.$emit('change');
            }
        }
    };
</script>

<style lang="less">
    .arrow {
        cursor: pointer;
        margin-left: 15px;
    }
</style>