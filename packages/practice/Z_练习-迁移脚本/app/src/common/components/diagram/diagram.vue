<template>
    <div class="diagram">
        <div v-if="!diagramData.open" class="diagram-warnning">
            <div class="warn">
                <img src="./diagram-icon.png" alt="diagram-icon">
                <p class="warn-title">{{diagramData.title}}</p>
                <i>{{components.contact | t}}</i>
            </div>
            <div class="backdrop blur">
                <h2>{{diagramData.title}}</h2>
                <img v-if="diagramData.echatOption.series[0].type==='line'" src="./line.png" alt="">
                <img v-if="diagramData.echatOption.series[0].type==='pie'" src="./pie.png" alt="">
                <div class="gray-modal"></div>
            </div>
        </div>
        <div class="diagram-wrapper" :style="{width: diagramData.diagramSummary.summary.length===3?'80%':'100%'}">
            <inline-loading v-if="loading"/>
            <div v-show="!loading" v-if="diagramData.open" class="diagram-body">
                <h2 v-if="diagramData.title">{{diagramData.title}}</h2>
                <p class="data-update-frequency" v-if="diagramData.title">
                    {{(realtime ? 'data.realTime' : 'data.oneDayDelay') | t}}
                </p>
                <div :class="diagramData.className" ref="chart"
                     :style="{width: diagramData.diagramWidth, height: diagramData.diagramHeight}"></div>
            </div>
        </div>
        <div v-if="diagramData.open&&diagramData.diagramSummary.summary.length===3" class="summary-wrapper">
            <ul class="summary">
                <li v-for="item in diagramData.diagramSummary.summary">
                    <div class="text">
                        <span v-if="item.type==='cash'" class="symbol-cash">￥</span>
                        <span class="number">{{item.number.toLocaleString()}}</span>
                        <span v-if="item.type==='percent'" class="symbol-percent">%</span>
                    </div>
                    <p>{{item.text}}</p>
                </li>
            </ul>
            <router-link class="pull-right see-more" :to="{name: diagramData.diagramSummary.link}">
                {{diagramData.diagramSummary.linkTitle}}&gt;
            </router-link>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/line';
    import 'echarts/lib/chart/bar';
    import 'echarts/lib/chart/pie';
    import 'echarts/lib/component/tooltip';
    import 'echarts/lib/component/legend';
    import 'echarts/lib/component/dataZoom';
    import debounce from 'lodash/debounce';

    const diagrams = new Set();

    const resizer = debounce(function () {
        diagrams.forEach(chart => chart.resize());
    }, 100);

    export default {
        props: {
            diagramData: {
                type: Object
            },
            realtime: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                loading: false,
            };
        },
        created() {
            this.$on('clearEchats', () => {
                this.loading = true;
            });
            this.$on('setEchats', () => {
                this.chart.setOption(this.diagramData.echatOption);
                this.loading = false;
            });
        },
        mounted() {
            if (this.diagramData.open) {
                this.chart = echarts.init(this.$refs.chart);
                this.$emit('setEchats');
                diagrams.add(this.chart);
                if (diagrams.size === 1) {
                    window.addEventListener('resize', resizer, false);
                }
                this.$once('hook:beforeDestroy', () => {
                    diagrams.delete(this.chart);
                    if (diagrams.size === 0) {
                        window.removeEventListener('resize', resizer, false);
                    }
                });
            } else {
                this.loading = false;
            }
        }
    };
</script>
<style lang="scss">
    @import '../../scss/base/variables';
    @import '../../scss/base/mixin';

    .diagram {
        display: flex;
        overflow: hidden;
        position: relative;
        background: white;

        .diagram-warnning {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 2;
            width: 100%;
            height: 100%;
            .warn {
                position: absolute;
                z-index: 1;
                left: 50%;
                top: 50%;
                margin: -55px 0 0 -100px;
                width: 200px;
                text-align: center;
                img {
                    width: 45px;
                    height: 55px;
                }
                .warn-title {
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #000000;
                }
                i {
                    font-size: 16px;
                    font-weight: bold;
                    color: $dark-green;
                }
            }
            .backdrop {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                &.blur {
                    filter: blur(4px) grayscale(85%);
                    -webkit-filter: blur(4px) grayscale(85%);
                }
                h2 {
                    position: absolute;
                    left: 0;
                    top: 30px;
                    padding: 0 40px;
                    font-size: 14px;
                }
                img {
                    width: 100%;
                    height: 100%;
                }
                .gray-modal {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background: gray;
                    opacity: .2;
                }
            }
        }

        .diagram-wrapper {
            height: 100%;
            position: relative;

            .diagram-body {
                box-sizing: border-box;
                padding: 25px 0;
                height: 100%;

                h2 {
                    height: 24px;
                    padding: 0 25px;
                    font-size: 14px;
                }

                .data-update-frequency {
                    color: $disabled;
                    padding-left: 25px;
                }
            }
        }

        .summary-wrapper {
            @include box-sizing();
            padding: 32px 24px 16px;
            width: 20%;
            border-left: 1px solid $border-color;
            background: white;

            .summary {
                height: 290px;
                white-space: nowrap;

                li {
                    padding: 20px 0;
                    height: 50px;
                    text-align: center;
                    .text {
                        display: inline-block;
                        .symbol-cash, .symbol-percent, .number {
                            color: #7b5eea;
                        }
                        .symbol-cash, .symbol-percent {
                            font-size: 14px;
                        }
                        .number {
                            font-size: 28px;
                            font-weight: lighter;
                        }
                    }
                    p {
                        text-align: center;
                        font-size: 14px;
                        color: $color-light-content;
                    }
                }
            }

            .see-more {
                text-align: right;
                color: $theme;
                text-decoration: underline;

                &:hover {
                    color: $light-theme;
                }

                &:active {
                    color: $dark-theme;
                }
            }
        }
    }
</style>
