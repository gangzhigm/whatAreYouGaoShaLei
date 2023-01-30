import Model from 'web-model';
import LINKS from '@/LINKS';


export default new Model({
    base: LINKS.SCRM_API_BASE + '/api/scrm/v1',
    api: {

        /**
         * 获取价值与活跃list
         * statisticalMethodtype=1 价值
         *  statisticalMethodtype=2 活跃
         *
         * @param statisticalMethodtype
         */
        getReport (statisticalMethodtype) {
            return this.request
                .get('/customerPriceOrActice')
                .query({
                    statisticalMethodtype
                });
        },


        gainConsume () {
            return this.request
                .get('/customerReport/threeGradeCountAndMoney');
        },


        /**
         * 获取订单记录
         * @param goodsName
         * @param id
         * @param pageNumber
         */
        getOrder (goodsName, id, pageNumber) {
            return this.request
                .get('/sales')
                .query({
                    goodsName,
                    id,
                    pageNumber
                });
        },

        getGoodsDetail (id, saleId) {
            return this.request
                .get('/goodsDetail')
                .query({
                    id,
                    saleId
                });
        },

        /**
         *  --- START migrated from outdated src/data/report/customer/customerReportService.js ---
         */

        /**
         * 数据总览
         * @param endDate
         * @param startDate
         */
        dataScreening (endDate, startDate) {
            return this.request
                .get('/customerReport/customerDataScreening')
                .query({ endDate, startDate });
        },


        /**
         * 数据完整度分析-1
         * @param endDate
         * @param startDate
         * @param type 0首页 1联系人相关页
         */
        dataAnalyze (endDate, startDate, type) {
            return this.request
                .get('/customerReport/dataIntegrityExist')
                .query({ endDate, startDate, type });
        },


        /**
         * 数据完整度分析-2
         * @param endDate
         * @param startDate
         */
        dataAnalyzeTwo (endDate, startDate) {
            return this.request
                .get('/customerReport/dataIntegrityUnexist')
                .query({ endDate, startDate });
        },


        /**
         * 会员、非会员、粉丝发展趋势
         * @param endDate
         * @param startDate
         */
        memberTendency (endDate, startDate) {
            return this.request
                .get('/customerReport/customerTrend')
                .query({ endDate, startDate });
        },


        /**
         * 会员、非会员、粉丝复购分析-1
         * @param endDate
         * @param startDate
         */
        influenceSaleCount (endDate, startDate) {
            return this.request
                .get('/customerReport/influenceSaleCount')
                .query({ endDate, startDate });
        },


        /**
         * 会员、非会员、粉丝复购分析-2
         * @param endDate
         * @param startDate
         */
        influenceSalePercent (endDate, startDate) {
            return this.request
                .get('/customerReport/influenceSalePercent')
                .query({ endDate, startDate });
        },


        /**
         * 会员、非会员、粉丝订单与销售-1
         * @param endDate
         * @param startDate
         */
        salesCount (endDate, startDate) {
            return this.request
                .get('/customerReport/salesCount')
                .query({ endDate, startDate });
        },


        /**
         *会员、非会员、粉丝订单与销售-2
         * @param endDate
         * @param startDate
         */
        salesMoney (endDate, startDate) {
            return this.request
                .get('/customerReport/salesMoney')
                .query({ endDate, startDate });
        },


        /**
         *消费力与活跃渠道-1
         * @param endDate
         * @param startDate
         */
        CountAndMoney (endDate, startDate) {
            return this.request
                .get('/customerReport/threeGradeCountAndMoney')
                .query({ endDate, startDate });
        },


        /**
         * 消费力与活跃渠道-2
         * @param endDate
         * @param startDate
         *
         */
        Proportion (endDate, startDate) {
            return this.request
                .get('/customerReport/threeGradeProportion')
                .query({ endDate, startDate });
        },

        /**
         *  --- END migrated from outdated src/data/report/customer/customerReportService.js ---
         */

        /**
         *  --- START migrated from outdated src/data/report/journey/model.js ---
         */

        /**
         * 首页
         */
        // 首页的数据纵览(第一个时间是结束)
        dataSummary (endDate, startDate) {
            return this.request
                .get('/homePage/dataScreening')
                .query({ endDate, startDate });
        },

        // 线下订单量(分别是主图和侧边栏)
        offlineOrderDiagram (endDate, startDate) {
            return this.request
                .get('/saleReport/saleAnalyze')
                .query({ endDate, startDate });
        },
        offlineOrderSide (endDate, startDate) {
            return this.request
                .get('/homePage/salePandect')
                .query({ endDate, startDate });
        },

        // 会员、非会员、粉丝发展趋势(分别是主图和侧边栏)
        /**
         * @param endDate
         * @param startDate
         * @param type 0首页 1联系人相关页
         * @returns {*}
         */
        customerTrendDiagram (endDate, startDate, type) {
            return this.request
                .get('/customerReport/dataIntegrityExist')
                .query({ endDate, startDate, type });
        },
        customerTrendSide (endDate, startDate) {
            return this.request
                .get('/homePage/customerPandect')
                .query({ endDate, startDate });
        },

        // 多渠道营销
        marketing (endDate, startDate) {
            return this.request
                .get('/homePage/multiChannel')
                .query({ endDate, startDate });
        },

        // 订单转化排名
        orderRank (endDate, startDate) {
            return this.request
                .get('/homePage/transformRanking')
                .query({ endDate, startDate });
        },


        /**
         * 订单相关页
         */

        // 订单相关的数据纵览(第一个时间是结束)
        orderSummary (endDate, startDate) {
            return this.request
                .get('/saleReport/saleDataScreening')
                .query({ endDate, startDate });
        },

        // 线下订单成交量 图 2,3,4, 第一个接口同 offlineOrderDiagram
        offlineOrderDiagramTwo (endDate, startDate) {
            return this.request
                .get('/saleReport/saleAnalyzeSCRM')
                .query({ endDate, startDate });
        },

        offlineOrderDiagramThree (endDate, startDate) {
            return this.request
                .get('/saleReport/saleCountByHour')
                .query({ endDate, startDate });
        },

        offlineOrderDiagramFour (endDate, startDate) {
            return this.request
                .get('/saleReport/saleCountByWeek')
                .query({ endDate, startDate });
        },

        // 热销产品分类和品类
        goodsClass (endDate, startDate) {
            return this.request
                .get('/saleReport/hotSellPrimaryCategory')
                .query({ endDate, startDate });
        },

        goodsCategory (endDate, startDate) {
            return this.request
                .get('/saleReport/hotSellSecondaryCategory')
                .query({ endDate, startDate });
        },

        // 客单价分析
        unitPriceAnalysis (endDate, startDate) {
            return this.request
                .get('/saleReport/perMoneyAnalyze')
                .query({ endDate, startDate });
        },

        /*
        *  联系人新增汇总
        *  @param endDate
        *  @param startDate
        */
        concatIncreaseOverview (endDate, startDate) {
            return this.request
                .get('/homePage/contact')
                .query({ endDate, startDate });
        },
        /*
        *  联系人发展趋势
        *  @param endDate
        *  @param startDate
        */
        contactTrend (endDate, startDate) {
            return this.request
                .get('/homePage/contactPandect')
                .query({ endDate, startDate });
        },

        /**
         *  --- END migrated from outdated src/data/report/journey/model.js ---
         */

        
        /**
        * --- START migrated from outdated src/data/report ---
        */
        
        /**
         * 订单及销售转化(废弃)
         * @param journeyId 模板ID
         * @return {*}
         */
        orderConversion (journeyId) {
            return this.request
                .get('/saleTotalAndSaleCountTransform')
                .query({ journeyId });
        },

        /**
         * 会员与粉丝转化（废弃）
         * @param endDate
         * @param journeyId 模板ID
         * @param startDate
         * @return {*}
         */
        memberConversion (journeyId, startDate, endDate) {
            return this.request
                .get('/memberFansTransform')
                .query({ endDate, journeyId, startDate });
        },
        
        /**
         * 获取实时旅程邮件控件详情
         */
        getRTJoyDetail(taskInstantiationId) {
            return this.request
                .get('/rtJourneyReport/exclusionStatistics')
                .query({ taskInstantiationId });
        }

        
        /**
        * --- END migrated from outdated src/data/report ---
        */
        
    }
});

