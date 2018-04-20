
<!--
    时间控件：不包含年月日时分秒
    Created by Leon on 2018/3/20.

    更新日志
    * 2018-4-17 1. 调整部分样式; 新增`明天`radio选项
    * 2018-4-13 1. 调整部分样式; 2. 新增prop属性(用于清空) 3. 准备下一版本增加rules
    * 2018-4-10 1. 返回参数改为 object = {startTime, endTime}； 优化内部逻辑。
    * 2018-3-30 1. 解决了一个bug，该bug会导致手动选择日期时，回传的日期的是date型而不是long型
                2. 优化内部逻辑代码
    * 2018-3-29 优化内部逻辑代码；修改回调参数 this.$emit('change', startTime, endTime)
    * 2018-3-20 完成雏形

    /**
     * @param label | String | label名称
     * @param label-width | Number | 非必填 | label的宽度，防止名称过长造成换行
     * @param timeFrom | Date, String, Number | 开始时间
     * @param timeTo | Date, String, Number | 结束时间
     * @param propFrom | String | 开始时间
     * @param propTo | String| 结束时间
     * @param keyArr | Array | [1, 3, 0] => 1：今天；3：近三天； 0：明天
     *
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
    <el-col :span="span" class="beta-data-container clearfix">
        <div class="data-pick">
            <el-form-item :label="label" :label-width="labelWidth + 'px'" :prop="propFrom">
                <el-date-picker
                        size="small"
                        type="date"
                        :editable="false"
                        placeholder="请选择开始时间"
                        format="yyyy-MM-dd"
                        v-model="from"
                        @change=" (e) => dateChange(1, e)"
                        :picker-options="pickerOptions1"
                ></el-date-picker>
            </el-form-item>
        </div>

        <div class="data-pick gap">
            <span>
                 -
            </span>
        </div>

        <div class="data-pick">
            <el-form-item label="" :label-width="10 + 'px'" :prop="propTo">
                <el-date-picker
                        size="small"
                        type="date"
                        :editable="false"
                        placeholder="请选择结束时间"
                        format="yyyy-MM-dd"
                        v-model="to"
                        @change=" (e) => dateChange(2, e)"
                        :picker-options="pickerOptions2"
                ></el-date-picker>
            </el-form-item>
        </div>

        <div class="operate data-pick">
            <el-button v-if="this.keyArr.indexOf(1) > -1" size="mini" type="primary" round @click="handlePlanTime(1)">今天</el-button>
            <el-button v-if="this.keyArr.indexOf(3) > -1" size="mini" type="primary" round @click="handlePlanTime(3)">近三天</el-button>
            <el-button v-if="this.keyArr.indexOf(0) > -1" size="mini" type="primary" round @click="handlePlanTime(0)">明天</el-button>
        </div>
    </el-col>

</template>

<script>
    import {handlePlanTime as HandlePlanTime} from '@lib/utils';
    export default {
        props: {
            propFrom: [String],
            propTo: [String],
            timeFrom: [Date, String, Number],
            timeTo: [Date, String, Number],
            keyArr: {
                type: Array,
                default: function() {
                    return [1, 3];
                }
            },
            label: {
                String,
                default: '未定义',
            },
            span: {
                Number,
                default: 24
            },
            labelWidth: {
                default: 80,
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
    .beta-data-container {
        .clearfix::after {
            content: '';
            display: block;
            clear: both;
        }
        .data-pick {
            float: left;
        }

        .gap {
            margin: 8px 0px 10px 10px;
            float: left;
        }

        .operate {
            float: left;
            margin-left: 15px;
            padding: 5px;
        }
    }
</style>