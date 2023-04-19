import {Node,tween,UITransform, Vec2,Widget, BlockInputEvents, Component, _decorator, UIOpacity, Vec3} from 'cc'
const { ccclass, property } = _decorator;

/**
 * Toast基类
 */
@ccclass
export default class ToastBase<Options = any> extends Component {


    /** 消息持续时间 */
    @property({displayName: "持续时间"})
    public toastDuration: number = 3

    /** 展示/隐藏动画的时长 */
    public animDuration: number = 0.3;

    /** toast移动动画时长 */
    public animMoveDuration: number = 0.5

    /** toast选项 */
    protected options: Options | undefined;

    /** 展示位置 从0开始*/
    get locationIndex(): number {
        return this._locationIndex;
    }
    set locationIndex(value: number) {
        this._locationIndex = value;
    }
    private _locationIndex = 0

    /** Toast之间间隔 */
    private locationInterval = 50

    /** toast高度 */
    private toastHeight = 60

    /** toastID */
    get toastID(): string {
        return this._toastID;
    }
    set toastID(value: string) {
        this._toastID = value;
    }
    private _toastID = "normalToast"

    /**
     * 展示Toast
     * @param options 弹窗选项
     * @param duration 动画时长
     * @param locationIndex 出现位置
     */
    public show(options?: Options, locationIndex: number = 0, duration: number = this.animDuration, ) {
        this._locationIndex = locationIndex
        return new Promise<void>(res => {
            // 储存选项
            this.options = options;
            // 初始化节点
            const main = this.node;
            this.node.active = true;
            main.active = true;
            // 动画展示
            const mainTrans = main!.getComponent(UITransform)!
            mainTrans.setAnchorPoint(new Vec2(0.5, 0.5))
            main.setScale(new Vec3(1, 0.1, 1))
            main.getComponent(UIOpacity)!.opacity = 0
            // 根据locationIndex设置高度
            const interval = Math.floor(this.locationInterval + this.toastHeight / 2) * (this.locationIndex + 1)
            main.addComponent(Widget)
            main.getComponent(Widget)!.isAlignHorizontalCenter = true
            const mainPosition = main.getPosition()
            main.setPosition(mainPosition.x, interval, 0)
            // 初始化
            this.init(this.options!);
            // 更新样式
            this.updateDisplay(this.options!);
            // 播放弹窗主体动画
            let scaleTween = tween(main)
                .to(duration, { scale: new Vec3(1,1,1)}, { easing: 'backOut' })
            let opacityTween = tween(main.getComponent(UIOpacity))
                .to(duration, { opacity: 225 })
                .call(() => {
                    // 弹窗已完全展示
                    this.onShow && this.onShow();
                    // Done
                    res();
                })
            scaleTween.start()
            opacityTween.start()
        });
    }

    /**
     * 隐藏toast
     * @param duration 动画时长
     */
    public hide(duration: number = this.animDuration) {
        return new Promise<void>(res => {
            const node = this.node;
            // 播放Toast主体动画
            let scaleTween = tween(this.node)
                .to(duration, { scale: new Vec3(1,0.1,1)}, { easing: 'backIn' })
            let opacityTween = tween(this.node.getComponent(UIOpacity))
                .to(duration, { opacity: 0})
                .call(() => {
                    // 关闭节点
                    node.active = false;
                    // 弹窗已完全隐藏（动画完毕）
                    this.onHide && this.onHide();
                    // Done
                    res();
                    // 弹窗完成回调
                    this.finishCallback && this.finishCallback();
                })
            scaleTween.start()
            opacityTween.start()
        });
    }

    /**
     * 向上移动
     * @param latestIndex 最新位置
     */
    public move(latestIndex: number){
        // 移动
        if (latestIndex == this.locationIndex){ return }
        return new Promise<void>(res => {
            // 根据locationIndex设置高度
            this.locationIndex = latestIndex
            const interval = Math.floor(this.locationInterval + this.toastHeight / 2) * (this.locationIndex + 1)
            const nodePosition = this.node.position
            tween(this.node.position)
                .to(this.animMoveDuration, new Vec3(nodePosition.x, interval, 0))
                .start()
        })
    }


    /**
     * 初始化（派生类请重写此函数以实现自定义逻辑）
     */
    protected init(options: Options) { }

    /**
     * 更新样式（派生类请重写此函数以实现自定义样式）
     * @param options toast选项
     */
    protected updateDisplay(options: Options) { }

    /**
     * Toast已完全展示（派生类请重写此函数以实现自定义逻辑）
     */
    protected onShow() { }

    /**
     * Toast已完全隐藏（派生类请重写此函数以实现自定义逻辑）
     * @param suspended 是否被挂起
     */
    protected onHide() { }

    /**
     * Toast流程结束回调（注意：该回调为 PopupManager 专用，重写 hide 函数时记得调用该回调）
     */
    // @ts-ignore
    protected finishCallback: () => void = null;

    /**
     * 设置Toast完成回调（该回调为 PopupManager 专用）
     * @param callback 回调
     */
    public setFinishCallback(callback: () => void) {
        this.finishCallback = callback;
    }

}