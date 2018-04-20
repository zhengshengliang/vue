<!-- 
    Created by Leon on 2018/3/16.
    简化input输入框的写法
 -->

<template>
    <el-col :span="span">
        <el-form-item :label="label"
                      :label-width="labelWidth + 'px'"
                      :prop="prop">
            <el-input size="small"
                      type="search"
                      v-model="currentValue"
                      @change="change"
                      :disabled="isDisabled"
                      :placeholder="Placeholder">
            </el-input>
        </el-form-item>
    </el-col>
</template>

<script>
    export default {
        props: {
            prop: [String],
            value: [String, Number], // 默认值
            label: {
                String,
                default: '未定义'
            },
            span: {
                Number,
                default: 5
            },
            placeholder: {
                String,
            },
            labelWidth: {
                Number,
                default: '80'
            },
            disabled: Boolean,
        },
        data() {
            return {
                Placeholder: this.placeholder || '请输入' + this.label,
                currentValue: this.value + '',
                isDisabled: this.disabled || false
            }
        },
        watch: {
            'value': function(newValue) {
                this.currentValue = newValue
            }
        },
        methods: {
            change(e) {
                this.$emit('input', e);
            }
        }
    };
</script>