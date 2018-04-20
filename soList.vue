<template>
    <section>
        <div id="app" slot="content" class="contract-container">
            <div class="operate-wrap">
                <el-form :model="View.queryParams" ref="soList" :rules="rules">
                    <el-row>
                        <InputWidget :span="5" label="发运单号" prop="soNo" v-model.trim="View.queryParams.soNo"></InputWidget>
                        <EnumSelectWidget label="类型" prop="soType" enumKey="soType" v-model.trim="View.queryParams.soType"></EnumSelectWidget>
                        <InputWidget label="线路" prop="routeCode" v-model.trim="View.queryParams.routeCode"></InputWidget>
                        <MultiSelectWidget :span="6" prop="soStatus" label="状态" enumKey="soStatusV3" v-model.trim="View.queryParams.soStatus"></MultiSelectWidget>
                        <ArrowWidget :value="View.arrowUp" @change="View.arrowUp = !View.arrowUp"></ArrowWidget>
                    </el-row>

                    <el-row>
                        <InputWidget label="波次号" :span="6" prop="waveCode" v-model.trim="View.queryParams.waveCode"></InputWidget>
                        <InputWidget label="客户" prop="customerName" v-model.trim="View.queryParams.customerName"></InputWidget>
                        <InputWidget label="客户名称" prop="customerName" v-model.trim="View.queryParams.customerName"></InputWidget>
                        <InputWidget label="货主" prop="ownerCode" v-model.trim="View.queryParams.ownerCode"></InputWidget>
                    </el-row>

                    <el-row v-show="View.arrowUp">
                        <DateWidget label="要求发运时间" :labelWidth="100"
                                    propFrom="sendTimeStart"
                                    propTo="sendTimeEnd"
                                    :timeFrom="View.queryParams.sendTimeStart"
                                    :timeTo="View.queryParams.sendTimeEnd"
                                    :keyArr="[1, 3, 0]"
                                    @change="emitCallback2"
                        ></DateWidget>

                        <DateWidget label="生单时间" :labelWidth="100"
                                    propFrom="createTimeStart"
                                    propTo="createTimeEnd"
                                    :timeFrom="View.queryParams.createTimeStart"
                                    :timeTo="View.queryParams.createTimeEnd"
                                    @change="emitCallback"
                        ></DateWidget>
                    </el-row>

                    <el-row type="flex">
                        <el-col :span="20">
                            <el-button type="primary" :loading="View.loading1" @click="submitForm('soList')" size="small">查询</el-button>
                            <el-button type="warning" @click="emptyFilterValue()" size="small">清空</el-button>
                            <el-button type="primary" v-auth="PERMISSION.CONFIRM_SHIP" :loading="View.loading1" @click="shipBatch()" size="small">确认发运</el-button>
                            <el-button type="primary" v-auth="PERMISSION.BOX_LABEL_PRINT" :loading="View.loading1" @click="printCheckOrderBatch()" size="small">打印复核单</el-button>
                        </el-col>
                    </el-row>
                </el-form>

                <el-table slot="table" :data="View.resultList" stripe border :row-class-name="tableRowClassName" class="adjust-font">
                    <el-table-column label="序号" type="index" width="60"></el-table-column>
                    <el-table-column label="发运单号" prop="soNo" width="220"></el-table-column>
                    <el-table-column label="类型" prop="soTypeDesc" min-width="130"></el-table-column>
                    <el-table-column label="状态" prop="soStatusDesc" min-width="100"></el-table-column>
                    <el-table-column label="客户" prop="customerCode" min-width="150"></el-table-column>
                    <el-table-column label="客户名称" prop="customerName" width="100"></el-table-column>
                    <el-table-column label="波次号" prop="waveCode" min-width="150"></el-table-column>
                    <el-table-column label="货主" prop="ownerCode" min-width="100"></el-table-column>
                    <el-table-column label="要求发运时间" prop="sendTime" min-width="140"></el-table-column>
                    <el-table-column label="线路" prop="routeCode" min-width="100"></el-table-column>
                    <el-table-column label="线路名称" prop="routeName" min-width="100"></el-table-column>
                    <el-table-column label="需求数量" prop="planQty" min-width="100"></el-table-column>
                    <el-table-column label="分配数量" prop="allocateQty" min-width="100"></el-table-column>
                    <el-table-column label="发运数量" prop="shipQty" min-width="100"></el-table-column>
                    <el-table-column label="发运差异" prop="diffQty" min-width="100"></el-table-column>
                    <el-table-column label="操作" min-width="80px" fixed="right">
                        <template slot-scope="scope">
                            <a type="text" v-auth="PERMISSION.DETAIL" href="javascript:;" @click="showDetail(scope.row.soId)">详情</a>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="pager-right">
                    <el-pagination
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                            :current-page="View.currentPage || 1"
                            :page-sizes="[50, 100]"
                            :page-size="View.pageSize"
                            layout="total, sizes, prev, pager, next, jumper"
                            :total="View.totalCount">
                    </el-pagination>
                </div>
            </div>
        </div>

    </section>
</template>

<script>
    import InputWidget from '@components/Widget/InputWidget';
    import DateWidget from '@components/Widget/DateWidget_V2';
    import EnumSelectWidget from '@components/Widget/EnumSelectWidget';
    import MultiSelectWidget from '@components/Widget/MultiSelectWidget';
    import ArrowWidget from '@components/Widget/ArrowWidget';
    import {RuleValid as RV} from '@lib/utils';
    import {getUrlParam} from '../../lib/url.js';
    import {ConfirmShipBatch, QuerySoList, PrintShipment} from './service/service.js';

    export default {
        components: {
            InputWidget,
            DateWidget,
            EnumSelectWidget,
            MultiSelectWidget,
            ArrowWidget,
        },
        data() {
            const waveCode = getUrlParam('waveCode');

            const View = {
                currentPage: 1,
                pageSize: Number(localStorage.getItem('pageSize') || '50') || 50,
                totalCount: 0,
                resultList: [],
                percentage: 0,
                percentageStatus: '',
                dialogVisible: false,
                showClose: false,
                queryParams: {
                    soNo: '',
                    soType: '',
                    soStatus: ['500'],
                    routeCode: '',
                    customerCode: '',
                    customerName: '',
                    ownerCode: '',
                    waveCode: waveCode,
                    sendTimeStart: '',
                    sendTimeEnd: '',
                    createTimeStart: '',
                    createTimeEnd: '',
                    openSo: '',
                    closeSo: '',
                },

                loading1: false,
                arrowUp: false,
            };

            const baseCheck = {
                required: false,
                trigger: 'change',
                validator: RV.validator,
            };

            const checkSend = [
                {
                    ...baseCheck,
                    start: () => {
                        return this.View.queryParams.sendTimeStart;
                    },
                    end: () => {
                        return this.View.queryParams.sendTimeEnd;
                    },
                    message: '发运开始时间不能大于结束时间'
                }
            ];

            const checkCreate = [
                {
                    ...baseCheck,
                    start: () => {
                        return this.View.queryParams.createTimeStart;
                    },
                    end: () => {
                        return this.View.queryParams.createTimeEnd;
                    },
                    message: '生单开始时间不能大于结束时间'
                }
            ];

            return {
                View,
                PERMISSION: {
                    CONFIRM_SHIP: 'OUB701',
                    BOX_LABEL_PRINT: 'OUB702',
                    DETAIL: 'OUB703',
                },
                rules: {
                    sendTimeStart: checkSend,
                    sendTimeEnd: checkSend,
                    createTimeStart: checkCreate,
                    createTimeEnd: checkCreate,
                }
            }
        },
        mounted() {

        },
        methods: {
            emitCallback(emitObj) {
                const {startTime = '', endTime = ''} = emitObj;

                this.View.queryParams['createTimeStart'] = startTime;
                this.View.queryParams['createTimeEnd'] = endTime;
            },
            emitCallback2(emitObj) {
                const {startTime = '', endTime = ''} = emitObj;

                this.View.queryParams['sendTimeStart'] = startTime;
                this.View.queryParams['sendTimeEnd'] = endTime;
            },
            //确认发运
            shipBatch(page) {
                if (this.View.loading1) return;

                const params = Object.assign(this.View.queryParams, {current_page: page, page_size: this.View.pageSize});
                this.View.loading1 = true;
                ConfirmShipBatch(params)
                    .then((res) => {
                        this.View.loading1 = false;
                        this.$alert(res || '操作成功!', '提示', {
                            confirmButtonText: '确定',
                            type: 'success',
                            callback: () => {
                                this.query();
                            }
                        });
                    })
                    .catch((err) => {
                        this.View.loading1 = false;
                        this.$alert(err.msg || '服务器错误!', '提示', {confirmButtonText: '确定', type: 'error'});
                    })
            },
            /**
             * 打印复核单
             */
            printCheckOrderBatch() {
                if (this.View.loading1) { return; }

                this.View.loading1 = true;
                PrintShipment()
                    .then((res) => {
                        this.View.loading1 = false;
                        this.$alert(res || '操作成功!', '提示', {
                            confirmButtonText: '确定',
                            type: 'success',
                            callback: () => {
                                this.query();
                            }
                        });
                    })
                    .catch((err) => {
                        this.View.loading1 = false;
                        this.$alert(err.msg || '服务器错误!', '提示', {confirmButtonText: '确定', type: 'error'});
                    })
            },
            //点击详情，查看详细信息
            showDetail(soId) {
                this.Open('/app/newoub/soList/' + soId);
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.View.currentPage = 1;
                        this.query();
                    } else {
                        return false;
                    }
                });
            },
            query() {
                if (this.View.loading1) {
                    return;
                }

                const currentPage = this.View.currentPage;
                const pageSize = this.View.pageSize;
                const params = Object.assign(this.View.queryParams, {currentPage, pageSize});

                Object.keys(this.View.queryParams).forEach(i => {
                    console.log(i + ': ' + this.View.queryParams[i]);
                });

                this.View.loading1 = true;
                QuerySoList(params)
                    .then((res) => {
                        this.View.loading1 = false;
                        this.View.totalCount = res.total;
                        this.View.resultList = res.list || [];
                    })
                    .catch((err) => {
                        this.View.loading1 = false;
                        this.View.resultList = [];

                        this.$alert(err.msg || '服务器错误!', '提示', {confirmButtonText: '确定', type: 'error'});
                    })
            },
            emptyFilterValue() {
                Object.keys(this.View.queryParams).forEach(i => {
                    this.View.queryParams[i] = '';
                });
                this.View.soStatusFrom = '100';
                this.View.soStatusTo = '400';
            },
            handleSizeChange(val) {
                this.View.pageSize = val;
                localStorage.setItem('pageSize', val);
                this.View.currentPage = 1;
                this.query();
            },
            handleCurrentChange(page) {
                this.View.currentPage = page;
                this.query();
            },
            tableRowClassName({row}) {
                if (row.soStatus == 900) {
                    return 'success-row'
                }
                return '';
            }
        },
    }
</script>
