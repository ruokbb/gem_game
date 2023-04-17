import {Node,tween,UITransform, BlockInputEvents, Component, _decorator, UIOpacity, Vec3} from 'cc'
const { ccclass, property } = _decorator;

/**
 * Toast基类
 */
@ccclass
export default class ToastBase<Options = any> extends Component {

    @property({ type: Node, tooltip: '弹窗主体' })
    public main: Node | undefined

    /** 消息持续时间 */
    @property({displayName: "持续时间"})
    public toastDuration: number = 3

    /** 展示/隐藏动画的时长 */
    public animDuration: number = 0.3;

    /** toast选项 */
    protected options: Options | undefined;

    /**
     * 展示Toast
     * @param options 弹窗选项
     * @param duration 动画时长
     */
    public show(options?: Options, duration: number = this.animDuration) {
        return new Promise<void>(res => {
            // 储存选项
            this.options = options;
            // 初始化节点
            const main = this.main!;
            this.node.active = true;
            main.active = true;
            // todo 修改动画展示
            main.setScale(new Vec3(0.5, 0.5, 1))
            main.getComponent(UIOpacity)!.opacity = 0
            // 初始化
            this.init(this.options!);
            // 更新样式
            this.updateDisplay(this.options!);
            // 播放弹窗主体动画
            let scaleTween = tween(main)
                .to(duration, { scale: new Vec3(1,1,1)}, { easing: 'backOut' })
            let opacityTween = tween(main.getComponent(UIOpacity))
                .to(duration, { opacity: 255 })
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
     * @param suspended 是否被挂起
     * @param duration 动画时长
     */
    public hide(suspended: boolean = false, duration: number = this.animDuration) {
        return new Promise<void>(res => {
            const node = this.node;
            // todo 修改播放Toast主体动画
            let scaleTween = tween(this.main)
                .to(duration, { scale: new Vec3(0.5,0.5,1)}, { easing: 'backIn' })
            let opacityTween = tween(this.main!.getComponent(UIOpacity))
                .to(duration, { opacity: 0})
                .call(() => {
                    // 关闭节点
                    node.active = false;
                    // 弹窗已完全隐藏（动画完毕）
                    this.onHide && this.onHide(suspended);
                    // Done
                    res();
                    // 弹窗完成回调
                    this.finishCallback && this.finishCallback(suspended);
                })
            scaleTween.start()
            opacityTween.start()
        });
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
    protected onHide(suspended: boolean) { }

    /**
     * Toast流程结束回调（注意：该回调为 PopupManager 专用，重写 hide 函数时记得调用该回调）
     */
    // @ts-ignore
    protected finishCallback: (suspended: boolean) => void = null;

    /**
     * 设置Toast完成回调（该回调为 PopupManager 专用）
     * @param callback 回调
     */
    public setFinishCallback(callback: (suspended: boolean) => void) {
        this.finishCallback = callback;
    }

}