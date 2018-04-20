<!--
    Created by Leon on 2018/3/16.
    简化选择框的写法
 -->

<template>
    <el-col :span="span">
        <el-form-item :label="label"
                      :prop="prop"
                      :label-width="labelWidth + 'px'">
            <el-select size="small" v-model="currentValue" @change="changeCommodity" :placeholder="Placeholder" clearable>
                <el-option v-for="desc,code in typeObj" :label="desc" :value="code" :key="code"></el-option>
            </el-select>
        </el-form-item>
    </el-col>
</template>

<script>
    import EnumSelector from '@components/Selector/EnumSelector';
    export default {
        components: {
            EnumSelector
        },

        props: {
            value: [String, Number], // 默认值
            prop: [String],
            label: {
                String,
                default: '未定义'
            },
            span: {
                Number,
                default: 5
            },
            enumKey: {
                String,
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
                currentValue: this.value + '',
                labelValue: this.label || '',
                typeObj: this.GetEnum(this.enumKey),
                isDisabled: this.disabled || false,
                Placeholder: this.placeholder || '请选择' + this.label,
            }
        },
        watch: {
            'value': function(newValue) {
                this.currentValue = newValue;
            }
        },
        methods: {
            changeCommodity(e) {
                this.$emit('input', e);
            }
        }
    };
</script>