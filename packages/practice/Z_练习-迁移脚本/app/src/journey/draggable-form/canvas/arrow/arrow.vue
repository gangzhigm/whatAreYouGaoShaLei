<template>
    <g class="arrow" v-blur="cancelSelect" :class="{selected, readonly: !writable || isChecking}" @click="selectArrow">
        <path class="path-bg" v-if="writable && !isChecking" :d="arrowLineDValue"></path>
        <path class="path" :d="arrowLineDValue" :id="from + '' + to"></path>
        <path class="pointer" v-if="arrowPointerDValue" :d="arrowPointerDValue"></path>

        <circle v-if="selectedControllerId === from || selectedControllerId === to"
                :fill="selectedControllerId === from ? '#ff4574' : '#29bdfb'"
                r="4">
            <animateMotion :dur="animationDuration" repeatCount="indefinite">
                <mpath v-bind:xlink:href="'#' + from + to"/>
            </animateMotion>
        </circle>
        <use xlink:href="#icon-round-close"
             v-if="selected && writable"
             class="close-button"
             width="16"
             height="16"
             :style="closerPositionStyle"
             @click="deleteArrow"></use>
    </g>
</template>

<script type="text/ecmascript-6">
    import { mapState, mapMutations, mapGetters, mapActions } from 'vuex';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {DELETE_ARROW} from '@/store/vuex/mutationTypes';
    import {SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import {ANCHOR_SIZE, CONTROLLER_DEFAULT_HEIGHT, CONTROLLER_DEFAULT_WIDTH} from '../controller/controller.vue';
    import {
        AB_TEST_CONTROLLER,
        ATTRIBUTE_CONDITION_CONTROLLER,
        DECISION_CONTROLLER,
        EVENT_CONDITION_CONTROLLER,
        TAG_CONDITION_CONTROLLER
    } from '../controller/CONTROLLER_TYPES';

    const ANIMATION_BALL_SPEED = 100;   // 轨迹球速度，每秒100px
    export const ARROW_POINTER_WIDTH = 12;     // 箭头宽度
    export const ARROW_POINTER_HEIGHT = 14;    // 箭头高度
    export default {
        props: {
            from: Number,   // controllerId
            to: Number,     // controllerId
        },
        data() {
            return {
                selected: false,
            };
        },
        mounted() {
            if (this.writable) {
                window.addEventListener('keyup', this.deleteKeyHandler, false);
                this.$once('hook:beforeDestroy', () => {
                    window.removeEventListener('keyup', this.deleteKeyHandler, false);
                });
            }
        },
        methods: {
            ...mapMutations([DELETE_ARROW]),
            ...mapActions([SAVE_JOURNEY]),
            deleteKeyHandler(e) {
                if ((e.keyCode === 46 || e.keyCode === 8) && this.selected) {
                    this.deleteArrow();
                    this.selected = false;
                }
            },
            selectArrow() {
                if (this.writable) {
                    this.selected = !this.selected;
                }
            },
            cancelSelect() {
                this.selected = false;
            },
            isVerticalControllers(t) {
                return [
                    DECISION_CONTROLLER,
                    EVENT_CONDITION_CONTROLLER,
                    ATTRIBUTE_CONDITION_CONTROLLER,
                    TAG_CONDITION_CONTROLLER
                ].includes(t);
            },
            deleteArrow() {
                this.DELETE_ARROW({
                    from: this.from,
                    to: this.to
                });
                this.SAVE_JOURNEY();
            }
        },
        computed: {
            ...mapGetters(['journeyWritable']),
            ...mapState({
                ratio: state => state[DRAGGABLE_JOURNEY_STORE_NAME].ratio,
                selectedControllerId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].selectedControllerId,
                fromController (state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.controllers[this.from];
                },
                toController (state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.controllers[this.to];
                },
                isChecking: state => state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking,
                readonlyIds: state => state[DRAGGABLE_JOURNEY_STORE_NAME].readonlyControllerIds,
            }),
            writable () {
                return this.journeyWritable && (!this.readonlyIds.includes(this.from) 
                    || !this.readonlyIds.includes(this.to));
            },
            isVerticalOutput() {
                return this.isVerticalControllers(this.fromController.type)
                    && this.fromController.output2
                    && this.fromController.output2.includes(this.to);
            },
            /**
             * 获取起始点、终止点
             * 注意
             * 1. controller 是绝对定位的，controller.left 是 left 值 controller.top 是 top 值
             * 2. controller 图标的高度和 controller 的宽度一样
             * 3. controller 水平方向的连接点(anchor)在图标高度一半的地方
             * 4. 双出口控件的图标绕图标中心旋转了45度
             * 5. 只有双出口控件水平方向上的连接点(anchor)不用考虑连接点尺寸
             * @return {Array}
             */
            startAndEnd() {
                const controllerActualHeight = CONTROLLER_DEFAULT_HEIGHT * this.ratio;
                const controllerActualWidth = CONTROLLER_DEFAULT_WIDTH * this.ratio;
                let startX = this.fromController.left * this.ratio,
                    startY = this.fromController.top * this.ratio,
                    endX = this.toController.left * this.ratio - ARROW_POINTER_WIDTH / 4,
                    endY = this.toController.top * this.ratio;

                // 箭头路径开始点
                if (this.isVerticalOutput) {
                    // 竖直出口
                    startX += controllerActualWidth / 2;
                    startY += controllerActualHeight;
                } else {
                    // 水平出口
                    if (this.isVerticalControllers(this.fromController.type)) {
                        // 竖直控件的水平出口
                        startX += controllerActualWidth + (controllerActualWidth * 1.414 - controllerActualWidth) / 2;
                        startY += controllerActualWidth / 2;
                    } else {
                        // 水平控件的水平出口
                        // ab测试控件额外处理
                        if (this.fromController.type === AB_TEST_CONTROLLER) {
                            if (this.fromController.processInfo.ABTest.bRatio >= 0) {
                                if (this.fromController.output1.includes(this.to)) {
                                    // A 出口
                                    startY -= ANCHOR_SIZE * 2;
                                } else if (this.fromController.output3.includes(this.to)) {
                                    // C 出口
                                    startY += ANCHOR_SIZE * 2;
                                }
                            } else {
                                if (this.fromController.output1.includes(this.to)) {
                                    // A 出口
                                    startY -= ANCHOR_SIZE;
                                } else if (this.fromController.output2.includes(this.to)) {
                                    // B 出口
                                    startY += ANCHOR_SIZE;
                                }
                            }
                        }
                        startX += controllerActualWidth;
                        if (this.writable) {
                            startX += ANCHOR_SIZE / 2;
                        }
                        startY += controllerActualWidth / 2;
                    }
                }

                // 箭头路径结束点
                if (this.isVerticalControllers(this.toController.type)) {
                    endX -= (controllerActualWidth * 1.414 - controllerActualWidth) / 2;
                } else {
                    if (this.writable) {
                        endX -= ANCHOR_SIZE / 2;
                    }
                }
                endY += controllerActualWidth / 2;

                return [startX, startY, endX, endY];
            },
            /**
             * 生成 arrow 路径坐标点数组
             * <path> 会将将这些点依次用直线连接
             * 出口可能是竖直的、也可能是水平的，入口只能是水平的；
             * 出口要有一段竖直/水平的过渡，入口要有一段水平过渡；
             * 连接线既可以向左也可以向右时，选择向右；
             * @return {Array}
             */
            path() {
                const TRANSITION_LENGTH = 16;
                const points = [];
                const [startX, startY, endX, endY] = this.startAndEnd;
                const pointAfterStart = {};
                const pointBeforeEnd = {x: endX - TRANSITION_LENGTH, y: endY};
                let middleX, middleY;

                // start point
                points.push({x: startX, y: startY});

                if (this.isVerticalOutput) {
                    // vertical output
                    pointAfterStart.x = startX;
                    pointAfterStart.y = startY + TRANSITION_LENGTH;
                    middleX = (pointBeforeEnd.x - pointAfterStart.x) / 2 + pointAfterStart.x;
                    middleY = (pointBeforeEnd.y - pointAfterStart.y) / 2 + pointAfterStart.y;

                    points.push(pointAfterStart);

                    if (pointBeforeEnd.x > pointAfterStart.x) {
                        if (pointBeforeEnd.y > pointAfterStart.y) {
                            // 右下
                            points.push({x: pointAfterStart.x, y: pointBeforeEnd.y});
                        } else {
                            // 右上
                            points.push({x: middleX, y: pointAfterStart.y});
                            points.push({x: middleX, y: pointBeforeEnd.y});
                        }
                    } else {
                        if (pointBeforeEnd.y > pointAfterStart.y) {
                            // 左下
                            points.push({x: pointAfterStart.x, y: middleY});
                            points.push({x: pointBeforeEnd.x, y: middleY});
                        } else {
                            let x = Math.min(
                                pointAfterStart.x - (CONTROLLER_DEFAULT_WIDTH / 2 + TRANSITION_LENGTH),
                                pointBeforeEnd.x
                            );
                            // 左上
                            points.push({x, y: pointAfterStart.y});
                            points.push({x, y: pointBeforeEnd.y});
                        }
                    }
                } else {
                    // horizontal output
                    pointAfterStart.x = startX + TRANSITION_LENGTH;
                    pointAfterStart.y = startY;
                    middleX = (pointBeforeEnd.x - pointAfterStart.x) / 2 + pointAfterStart.x;
                    middleY = (pointBeforeEnd.y - pointAfterStart.y) / 2 + pointAfterStart.y;

                    points.push(pointAfterStart);

                    if (pointBeforeEnd.x > pointAfterStart.x) {
                        if (pointBeforeEnd.y > pointAfterStart.y) {
                            // 右下
                            points.push({x: middleX, y: pointAfterStart.y});
                            points.push({x: middleX, y: pointBeforeEnd.y});
                        } else {
                            // 右上
                            points.push({x: middleX, y: pointAfterStart.y});
                            points.push({x: middleX, y: pointBeforeEnd.y});
                        }
                    } else {
                        if (pointBeforeEnd.y > pointAfterStart.y) {
                            // 左下
                            points.push({x: pointAfterStart.x, y: middleY});
                            points.push({x: pointBeforeEnd.x, y: middleY});
                        } else {
                            // 左上
                            points.push({x: pointAfterStart.x, y: middleY});
                            points.push({x: pointBeforeEnd.x, y: middleY});
                        }
                    }
                }

                // point before end
                points.push(pointBeforeEnd);
                // end point
                points.push({x: endX, y: endY});

                return points;
            },
            closerPositionStyle() {
                if (this.path.length !== 0) {

                    // 路径上的终点
                    let {x, y} = this.path[this.path.length - 1];

                    // 终点的左上方
                    x -= 25;
                    y -= 25;

                    return `-webkit-transform: translate(${x}px, ${y}px);
                        -moz-transform: translate(${x}px, ${y}px);
                        -ms-transform: translate(${x}px, ${y}px);
                        -o-transform: translate(${x}px, ${y}px);
                        transform: translate(${x}px, ${y}px);`;
                }
                return '';
            },
            arrowLineDValue() {
                return this.path
                    .map(({x, y}, index) => {
                        // 生成 svg <path> d 属性
                        const previousPoint = this.path[index - 1];
                        const nextPoint = this.path[index + 1];

                        // 起始点
                        if (index === 0) {
                            return `M${x} ${y}`;
                        }

                        // 最后一点
                        if (!nextPoint) {
                            return `L${x} ${y}`;
                        }

                        // 没有转折（水平/竖直线）或者转折太小（尺寸小于圆角尺寸)
                        let minPath = Math.min(
                            ...[
                                Math.abs(x - previousPoint.x),
                                Math.abs(y - previousPoint.y),
                                Math.abs(x - nextPoint.x),
                                Math.abs(y - nextPoint.y)
                            ].filter(delta => delta !== 0)
                        );
                        if (previousPoint.x === nextPoint.x || previousPoint.y === nextPoint.y || minPath < 5) {
                            return `L${x} ${y}`;
                        }

                        // 转折处 5px 的圆角
                        if (previousPoint.x < x) {
                            if (nextPoint.y < y) {
                                // right-top
                                return `L${x - 5} ${y} A5 5 45 0 0 ${x} ${y - 5}`;
                            } else if (nextPoint.y > y) {
                                // right-bottom
                                return `L${x - 5} ${y} A5 5 45 0 1 ${x} ${y + 5}`;
                            }
                        } else if (previousPoint.x > x) {
                            if (nextPoint.y < y) {
                                // left-top
                                return `L${x + 5} ${y} A5 5 45 0 1 ${x} ${y - 5}`;
                            } else if (nextPoint.y > y) {
                                // left-bottom
                                return `L${x + 5} ${y} A5 5 45 0 0 ${x} ${y + 5}`;
                            }
                        } else if (previousPoint.y < y) {
                            if (nextPoint.x < x) {
                                // bottom-left
                                return `L${x} ${y - 5} A5 5 45 0 1 ${x - 5} ${y}`;
                            } else if (nextPoint.x > x) {
                                // bottom-right
                                return `L${x} ${y - 5} A5 5 45 0 0 ${x + 5} ${y}`;
                            }
                        } else if (previousPoint.y > y) {
                            if (nextPoint.x < x) {
                                // top-left
                                return `L${x} ${y + 5} A5 5 45 0 0 ${x - 5} ${y}`;
                            } else if (nextPoint.x > x) {
                                // top-right
                                return `L${x} ${y + 5} A5 5 45 0 1 ${x + 5} ${y}`;
                            }
                        }
                    })
                    .join(' ');
            },
            animationDuration() {
                const pathLength = this.path.reduce((acc, {x, y}, index) => {
                    if (index === 0) return acc;
                    const previousPoint = this.path[index - 1];
                    return acc + Math.abs(x - previousPoint.x) + Math.abs(y - previousPoint.y);
                }, 0);
                return Math.ceil(pathLength / ANIMATION_BALL_SPEED) + 's'; // 不足 1s 按 1s 算
            },
            arrowPointerDValue() {
                const endPoint = this.path[this.path.length - 1];
                const arrowTipX = endPoint.x + 5;
                if (endPoint) {
                    return `
                        M${arrowTipX} ${endPoint.y}
                        L${arrowTipX - ARROW_POINTER_WIDTH} ${endPoint.y - ARROW_POINTER_HEIGHT / 2}
                        L${arrowTipX - ARROW_POINTER_WIDTH + 2} ${endPoint.y}
                        L${arrowTipX - ARROW_POINTER_WIDTH} ${endPoint.y + ARROW_POINTER_HEIGHT / 2}
                        Z
                    `;
                }
                return '';
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .arrow {
        position: absolute;
        left: -1px;
        top: -1px;
        width: 1px;
        height: 1px;
        // overflow: visible !important;

        &:not(.readonly) {
            path {
                cursor: pointer;
            }

            :hover {
                .path {
                    stroke: lighten(#ff4574, 10%);
                }

                .pointer {
                    fill: lighten(#ff4574, 10%);
                }
            }
        }

        &.selected {
            z-index: 1;

            .path {
                stroke: #ff4574;
            }

            .pointer {
                fill: #ff4574;
            }
        }

        .path {
            stroke-width: 4px;
            stroke: #cacaca;
            stroke-linecap: round;
            stroke-linejoin: round;
            fill: none;
            @include transition(stroke .2s ease);
        }

        .path-bg {
            stroke-width: 16px;
            stroke: transparent;
            stroke-linecap: round;
            stroke-linejoin: round;
            fill: none;
        }

        .pointer {
            fill: #cacaca;
            @include transition(fill .2s ease);
        }

        .close-button {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 1;
            width: 1px;
            height: 1px;
            cursor: pointer;
            fill: currentColor;
            @include transition(fill .2s ease);

            &:hover {
                fill: $red;
            }
        }
    }
</style>
