import {_decorator, color, Component,tween,UIOpacity, Label, Node, PageView, Sprite, Vec3} from 'cc';
import {getPlayerGemsDataApi} from "../api/PlayerDataApi";
import {GemsNumber, GlobalEventTarget, GlobalEventType} from "../Common";
import {ViewBase} from "./ViewBase";

const { ccclass, property } = _decorator;

@ccclass('PackageView')
export class PackageView extends ViewBase {

    @property({type: Node})
    protected leftButtonList: Node[] = []

    @property({type: Node})
    protected rightButtonList: Node[] = []

    @property({type: Node})
    protected pageViewNode = null

    @property({type: Node})
    protected pageViewContent: Node | undefined

    @property({type: Number})
    private buttonOffset: number = 100

    @property()
    private buttonOffsetTime: number = 1

    @property()
    private packageOffsetTime: number = 1

    private leftButtonListTransform: Vec3[] = []
    private rightButtonListTransform: Vec3[] = []

    protected onLoad() {
        GlobalEventTarget.on(GlobalEventType.UPDATE_PACKAGE, this.updatePackageGems, this)
        this.updatePackageGems()

    }

    protected start() {
        // 记录各组件的位置信息
        this.leftButtonList.forEach(button => {
            this.leftButtonListTransform.push(button.position)
        })

        this.rightButtonList.forEach(button => {
            this.rightButtonListTransform.push(button.position)
        })
    }

    showVx(): Promise<unknown> {
        return new Promise(res => {
            this.node.setPosition(new Vec3(0,0,0))
            // 两排标签左右逼近
            for (let i=0; i<this.rightButtonList.length; i++){
                const rightButton = this.rightButtonList[i]
                const leftButton = this.leftButtonList[i]
                // todo 透明度渐变模式
                tween(rightButton.getComponent(UIOpacity)).to(
                    this.buttonOffsetTime,{opacity: 255}
                ).start()
                tween(leftButton.getComponent(UIOpacity)).to(
                    this.buttonOffsetTime,{opacity: 255}
                ).start()
                // todo 位置改变 可能需要启动widget
                tween(rightButton.position).to(
                   this.buttonOffsetTime, this.rightButtonListTransform[i]
                ).start()
                tween(leftButton.position).to(
                    this.buttonOffsetTime, this.leftButtonListTransform[i]
                ).start()
            }
            // 背包界面上面从上面落下, 抖动感


        })
    }

    /**
     * 准备初始状态，便于下一次showVx
     */
    hideVx(): Promise<unknown> {
        return new Promise(res => {
            this.node.setPosition(new Vec3(0,1300,0))

            for (let i=0; i<this.rightButtonList.length; i++){
                const rightButton = this.rightButtonList[i]
                const leftButton = this.leftButtonList[i]
                // todo 添加组件
                rightButton.getComponent(UIOpacity)!.opacity = 200
                leftButton.getComponent(UIOpacity)!.opacity = 200

                // todo 设置移动值，可能需要禁用width组件
                rightButton.setPosition(new Vec3(rightButton.position.x + this.buttonOffset, rightButton.position.y, rightButton.position.z))
                leftButton.setPosition(new Vec3(leftButton.position.x - this.buttonOffset, leftButton.position.y, leftButton.position.z))
            }


        })
    }


    /**
     * 滑动背包切换两侧tab
     */
    pageViewCallback(){
        // @ts-ignore
        const pageIndex = this.pageViewNode.getComponent(PageView).getCurrentPageIndex()

        this.leftButtonList.forEach((value, index) => {
            if (index === pageIndex){
                value.getComponent(Sprite)!.color = color(255,255,255)
            }else {
                value.getComponent(Sprite)!.color = color(120,120,120)
            }
        })
        this.rightButtonList.forEach((value, index) => {
            if (index === pageIndex){
                value.getComponent(Sprite)!.color = color(255,255,255)
            }else {
                value.getComponent(Sprite)!.color = color(120,120,120)
            }
        })
    }


    /**
     * 获取背包宝石数据
     */
    getGemsData(){
        return getPlayerGemsDataApi()
    }

    /**
     * 更新背包的数据
     */
    updatePackageGems(){
        const GemsData = this.getGemsData()
        GemsData.forEach((value: number[], key: string) => {
            const gems = this.pageViewContent!.getChildByName(`${key}`)
            for (let i = 0; i < GemsNumber; i++){
                let gemNodeName: string
                if (i < 9){
                    gemNodeName = `gemMask00${i + 1}`
                }else {
                    gemNodeName = `gemMask0${i + 1}`
                }
                gems!.getChildByName(gemNodeName)!.getChildByName("levelLabel")!.getComponent(Label)!.string = key
                gems!.getChildByName(gemNodeName)!.getChildByName("gemNumber")!.getComponent(Label)!.string = `${value[i]}`
            }
        })
    }
}


