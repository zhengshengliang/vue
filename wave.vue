<template>
    <section>
        <div id="app" slot="content">
            <div class="operate-wrap">
                <el-form :model="View.queryParams" label-width="80px" ref="bomList">
                    <el-row>
                        <InputWidget labelWidth="80" label="BOM单号" prop="bomCode" v-model.trim="View.queryParams.bomCode"></InputWidget>
                        <InputWidget label="商品编码" prop="skuCode" v-model.trim="View.queryParams.skuCode"></InputWidget>
                        <InputWidget label="商品名称" prop="commodityName" v-model.trim="View.queryParams.commodityName"></InputWidget>
                        <MultiSelectWidget :span="7" label="状态" prop="statusList" enumKey="bomStatus" v-model.trim="View.queryParams.statusList"></MultiSelectWidget>
                    </el-row>
                    <el-row>
                        <el-col>
                            <el-button :loading="View.loading" @click="submitForm('bomList')" type="primary" size="small">查询</el-button>
                            <el-button @click="emptyFilterValue('bomList')" type="warning" size="small">清空</el-button>
                            <el-button type="primary" @click="jumpEdit(0)" v-auth="PERMISSION.NEW" size="small">新建</el-button>
                        </el-col>
                    </el-row>
                </el-form>

                <el-table slot="table" :data="View.resultList" stripe border class="adjust-font"
                          :row-key="getRowKeys"
                          :expand-row-keys="View.expandRowKeysArr"
                          @expand-change="showMoreDetail"
                          @row-click="showMoreDetail">
                    <el-table-column label=" " type="expand" width="50">
                        <template slot-scope="props">
                            <el-table slot="table" :data="props.row.detailList" class="adjust-font">
                                <el-table-column label="序号" type="index" prop="index"></el-table-column>
                                <el-table-column label="顺序号" prop="seqNum"></el-table-column>
                                <el-table-column label="商品编码" prop="skuCode" min-width="100"></el-table-column>
                                <el-table-column label="商品名称" prop="commodityName" min-width="150"></el-table-column>
                                <el-table-column label="规格" prop="spec" width="100"></el-table-column>
                                <el-table-column label="数量" prop="skuQty" min-width="100"></el-table-column>
                                <el-table-column label="单位" prop="unitName" min-width="100"></el-table-column>
                                <el-table-column label="备注" prop="remark" min-width="150"></el-table-column>
                            </el-table>
                        </template>
                    </el-table-column>
                    <el-table-column label="序号" type="index" width="60"></el-table-column>
                    <el-table-column label="BOM单号" width="180">
                        <template slot-scope="scope">
                            <div  @click="stopBubble">
                                <a style="text-decoration: underline" @click="jumpToDetailPage(scope.row.bomCode)">{{ scope.row.bomCode }}</a><br/>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="商品编码" prop="skuCode" min-width="100"></el-table-column>
                    <el-table-column label="商品名称" prop="commodityName" min-width="150"></el-table-column>
                    <el-table-column label="规格" prop="spec" width="100"></el-table-column>
                    <el-table-column label="数量" prop="bomQty" min-width="100"></el-table-column>
                    <el-table-column label="单位" prop="unitName" min-width="100"></el-table-column>
                    <el-table-column label="状态" prop="statusDesc" min-width="150"></el-table-column>
                    <el-table-column label="修改人" prop="updateBy" width="100"></el-table-column>
                    <el-table-column label="修改时间" prop="updateTime" min-width="200"></el-table-column>
                    <el-table-column label="操作" min-width="110" fixed="right">
                        <template slot-scope="scope">
                            <div @click="stopBubble">
                                <a type="text" v-auth="PERMISSION.EDIT"
                                   v-if="scope.row.status === 100"
                                   href="javascript:;"
                                   @click="operate(1, scope.row)">
                                    编辑
                                </a>
                                <a type="text"
                                   v-if="scope.row.status === 100"
                                   v-auth="PERMISSION.OFF" href="javascript:;"
                                   @click="operate(2, scope.row)">
                                    启用
                                </a>
                                <a type="text" v-auth="PERMISSION.ON"
                                   v-if="scope.row.status === 200"
                                   href="javascript:;" @click="operate(3, scope.row)">
                                    停用
                                </a>
                                <a type="text"
                                   v-if="scope.row.status === 100"
                                   v-auth="PERMISSION.DELETE"
                                   href="javascript:;"
                                   @click="operate(4, scope.row)">
                                    删除
                                </a>
                            </div>
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
    import MultiSelectWidget from '@components/Widget/MultiSelectWidget';
    import {
        BomList,
        BomOneList,
        BomOff,
        BomOn,
        BomDel,
    } from './service/service.js';

    export default {
        components: {
            InputWidget,
            MultiSelectWidget
        },
        data() {
            const View = {
                currentPage: 1,
                pageSize: Number(localStorage.getItem('pageSize') || '50') || 50,
                totalCount: 0,
                resultList: [], //查询结果

                queryParams: {
                    bomCode: '',
                    statusList: [],
                    skuCode: '',
                    commodityName: '',
                },

                expandRowKeysArr: [],

                loading: false,
            };

            return {
                View,
                PERMISSION: {
                    NEW: 'SR101',
                    EDIT: 'SR102',
                    DELETE: 'SR103',
                    ON: 'SR104',
                    OFF: 'SR105',
                },
                catData: {
                    pageName: 'bom-list',
                    msg: 'Failed',
                },
            }
        },
        mounted() {
            this.query();
        },
        methods: {
            operate(index, row) {
                const id = row.id;
                if (!id) {
                    this.$alert('当前bom行无Id!', '提示', {confirmButtonText: '确定', type: 'info'});
                    return;
                }

                switch (index) {
                    case 1:
                        this.jumpEdit(row.bomCode);
                        break;
                    case 2:
                    case 3:
                        this.onOff(index, id, row);
                        break;
                    case 4:
                        this.bomDel(id);
                        break;
                    default:
                        break;
                }
            },
            bomDel(id) {
                this.$confirm('确认删除？', '提示').then(() => {
                    const catData = {...this.catData, msg: 'bomDel'};
                    this.View.loading = true;
                    BomDel(id, {}, catData)
                        .then(() => {
                            this.View.loading = false;
                            this.$alert('操作成功!', '提示', {confirmButtonText: '确定', type: 'success'});
                            this.query();
                        })
                        .catch(err => {
                            this.View.loading = false;
                            this.$alert(err.msg || '未知原因导致失败!', '提示', {confirmButtonText: '确定', type: 'info'});
                        })
                }).catch(() => {})
            },

            onOff(index, id) {
                const opFunc = index === 2 ? BomOn : BomOff;
                const catData = {...this.catData, msg: opFunc.name};
                this.View.loading = true;
                opFunc(id, {}, catData)
                    .then(() => {
                        this.View.loading = false;
                        this.$alert('操作成功!', '提示', {confirmButtonText: '确定', type: 'success'});
                        this.query();
                    })
                    .catch(err => {
                        this.View.loading = false;
                        this.$alert(err.msg || '未知原因导致失败!', '提示', {confirmButtonText: '确定', type: 'info'});
                    })
            },


            bomOneList(row, bomId) {
                const catData = {...this.catData, msg: 'BomOneList'};
                this.View.loading = true;
                BomOneList(bomId, {}, catData)
                    .then((res = {}) => {
                        this.View.loading = false;
                        row.detailList = res || [];

                        this.View.expandRowKeysArr.push(bomId);
                    })
                    .catch(err => {
                        this.View.loading = false;
                        row.detailList = [];
                        this.View.expandRowKeysArr.push(bomId);
                        this.$alert(err.msg || '服务器错误!', '提示', {confirmButtonText: '确定', type: 'info'});
                    })
            },
            showMoreDetail(row) {
                const bomId = row.id;
                if (!bomId) {
                    this.$alert('当前bom行无Id!', '提示', {confirmButtonText: '确定', type: 'info'});
                    return;
                }
                const index = this.View.expandRowKeysArr.findIndex(item => item === bomId);
                if (index >= 0) {
                    this.View.expandRowKeysArr.splice(index, 1);
                } else {
                    this.bomOneList(row, bomId);
                }
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
                const params = {
                    ...this.View.queryParams,
                    currentPage: this.View.currentPage,
                    pageSize: this.View.pageSize,
                };

                const catData = {...this.catData, msg: 'BomList'};
                this.View.loading = true;
                BomList(params, catData)
                    .then((res = {}) => {
                        this.View.loading = false;
                        this.View.totalCount = res.totalNum || 0;
                        const bomHeaderList = res.bomHeaderList || [];
                        bomHeaderList.forEach(item => {
                            item.detailList = [];
                        });
                        this.View.resultList = bomHeaderList;

                        this.View.expandRowKeysArr = [];
                    })
                    .catch((err = {}) => {
                        this.View.loading = false;
                        this.View.totalCount = 0;
                        this.View.resultList = [];

                        this.$alert(err.msg || '服务器错误!', '提示', {confirmButtonText: '确定', type: 'error'});
                    });
            },
            getRowKeys(row) {
                return row.id;
            },
            jumpToDetailPage(bomCode) {
                this.Open(`/app/sr/bom/view/${bomCode}`);
            },
            stopBubble(e) {
                e.stopPropagation();
            },
            jumpEdit(bomCode) {
                this.Open(`/app/sr/bom/edit/${bomCode}`);
            },

            emptyFilterValue() {
                Object.keys(this.View.queryParams).forEach(i => {
                    this.View.queryParams[i] = i == 'statusList' ? [] : '';
                });
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
        },
    }
</script>



