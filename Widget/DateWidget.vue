<!--
    时间控件：不包含年月日时分秒
    Created by Leon on 2018/3/20.

    更新日志
    * 2018-4-10 1. 返回参数改为{startTime, endTime}；优化内部逻辑。
    * 2018-3-30 1. 解决了一个bug，该bug会导致手动选择日期时，回传的日期的是date型而不是long型
                2. 优化内部逻辑代码
    * 2018-3-29 优化内部逻辑代码；修改回调参数 this.$emit('change', startTime, endTime); 更方便使用
    * 2018-3-20 完成雏形

/**
 * @param label | String | label名称
 * @param label-width | Number | 非必填 | label的宽度，防止名称过长造成换行
 * @param timeFrom | Date, String, Number | 开始时间
 * @param timeFrom | Date, String, Number | 结束时间
 * 返回对象属性:
 *      change  Function | 回调函数，自己绑定一个callback方法
 */
<DateWidget label="生单时间" :label-width="96"
            :timeFrom="View.queryParams.createTimeStart"
            :timeTo="View.queryParams.createTimeEnd"
            @change="emitCallback"
></DateWidget>

/**
 * 今天 近三天 时间控件回调
 * @param startTime | long | 开始时间
 * @param endTime | long | 结束时间
 */
emitCallback(emitObj) {
    const {startTime = '', endTime = ''} = emitObj;

    this.View.queryParams['createTimeStart'] = startTime;
    this.View.queryParams['createTimeEnd'] = endTime;
},

``` 使用方式
1. 引入组件: import DateWidget from '@components/Widget/DateWidget';
2. 注册组件: components: {DateWidget}
3. 绑定一个自己的回调，将{startTime，endTime}赋值给View

```

 -->
<template>
    <el-col :span="span">
        <el-form-item :label="label" :label-width="labelWidth + 'px'">
            <div class="data-pick">
                <div class="clearfix">
                    <el-date-picker
                            class="pick1"
                            size="small"
                            type="date"
                            :editable="false"
                            placeholder="请选择开始时间"
                            format="yyyy-MM-dd"
                            v-model="from"
                            @change=" (e) => dateChange(1, e)"
                            :picker-options="pickerOptions1"
                    ></el-date-picker>

                    <span class="gap"> - </span>

                    <el-date-picker
                            class="pick2"
                            size="small"
                            type="date"
                            :editable="false"
                            placeholder="请选择结束时间"
                            format="yyyy-MM-dd"
                            v-model="to"
                            @change=" (e) => dateChange(2, e)"
                            :picker-options="pickerOptions2"
                    ></el-date-picker>

                    <div class="operate">
                        <el-button size="mini" type="primary" round @click="handlePlanTime(1)">今天</el-button>
                        <el-button size="mini" type="primary" round @click="handlePlanTime(3)">近三天</el-button>
                    </div>
                </div>
            </div>
        </el-form-item>
    </el-col>

</template>

<script>
    import {handlePlanTime as HandlePlanTime} from '@lib/utils';
    export default {
        props: {
            timeFrom: [Date, String, Number],
            timeTo: [Date, String, Number],
            label: {
                String,
                default: '未定义'
            },
            span: {
                Number,
                default: 24
            },
            labelWidth: {
                Number,
            },
            placeholder: {
                String,
                default: '请输入'
            },
        },
        data() {
            const pickerOptions = {
                disabledDate() {
                    return false;
                }
            };

            return {
                from: this.timeFrom,
                to: this.timeTo,
                pickerOptions1: pickerOptions,
                pickerOptions2: pickerOptions,
                maxValue: this.max,
                minValue: this.min,
            }
        },
        watch: {
            'timeFrom': function(newValue) {
                this.from = newValue;
            },
            'timeTo': function(newValue) {
                this.to = newValue;
            },
        },
        methods: {
            dateChange(type, e) {
                let startTime = '';
                let endTime = '';
                const longTime = this.parseToLongTime(type, e);
                if (type == 1) {
                    startTime = longTime;
                    endTime = this.to;
                } else {
                    startTime = this.from;
                    endTime = longTime;
                }

                this.$emit('change', {startTime, endTime});
            },
            handlePlanTime(val) {
                const {startTime, endTime} = HandlePlanTime(val);
                this.from = startTime;
                this.to = endTime;
                this.$emit('change', {startTime, endTime});
            },
            parseToLongTime(type, newValue) {
                if (!(newValue instanceof Date)) {
                    return newValue || '';
                }
                return type == 1 ? newValue.setHours(0, 0, 0, 0) : newValue.setHours(23, 59, 59, 999);
            }
        }
    };
</script>

<style lang="less">
    .data-pick {
        .clearfix::after {
            content: '';
            display: block;
            clear: both;
        }
        .pick1 {
            float: left;
            margin-right: 8px;
        }

        .gap {
            float: left;
        }

        .pick2 {
            float: left;
            margin-left: 8px;
        }

        .operate {
            float: left;
            margin-left: 15px;
        }
    }
</style>