import {_decorator, Component,Sprite, color, Color, Vec3, tween, Node, Tween} from 'cc';
import {fastRemove} from "../../../../../../../../Applications/CocosCreator/Creator/3.6.3/CocosCreator.app/Contents/Resources/resources/3d/engine/cocos/core/utils/array";

const { ccclass, property } = _decorator;

@ccclass('ResultShow')
// @ts-ignore
export class ResultShow extends  Component{

    private scrollingTag = false // 判断跑灯是否结束
    private fusionSuccessFlash = false // 合成成功控制发光

    private fusionSuccess = false
    private finalCowIndexString = "1"

    @property({type: Number, range: [0,5,0.1], slide:true, displayName:"变化时间(s)"})
    private showChangeTime = 0

    @property({type:Number, range: [50, 200, 1], slide:true, displayName: "滚动次数"})
    private scrollTimes = 100

    @property({type: Number,range: [0, 255, 1], displayName: "滚动选中透明度"})
    private selectedAlpha = 0

    @property({type: Number, range: [0, 255, 1], displayName: "滚动残影透明度"})
    private selectedLastAlpha = 0

    @property({type: Color, displayName: "合成成功彩虹色"})
    private fusionSuccessColorList: Color[] = []

    @property({type: Node, displayName: "槽位节点列表"})
    private cowList: Node[] = []


    private colorUpdateTimes = 0
    @property({type: Number, range: [1, 60, 1], slide: true, displayName: "变化间隔(帧)"})
    private colorChangeInterval = 1

    @property({type: Number, range: [0,5,0.1], slide:true, displayName:"变化时间(s)"})
    private colorChangeTime = 0

    private startScroll = false
    private scrollTween: Tween<any> | undefined


    scrollObj = {
        value: 0
    }

    protected update(dt: number) {
        if (!this.fusionSuccessFlash) return

        // 闪光
        const cowNode = this.cowList[parseInt(this.finalCowIndexString) - 1]
        this.colorUpdateTimes += 1
        if (this.colorUpdateTimes > this.colorChangeInterval){
            this.colorUpdateTimes = 0
            // 变换颜色

        }


    }


    /**
     * 按顺序滚动选择，先快后慢
     */
    showTween(index: number){
        const cowIndex = index % this.cowList.length + 1
        let cowLastIndex = cowIndex - 1
        if (cowLastIndex<=0) cowLastIndex = 5
        const cowName = `cowItem${cowIndex}`
        const cowLastName = `cowItem${cowLastIndex}`
        this.cowList.forEach(((value, index1) => {
            const resSpriteMask = value.getChildByName("Sprite")!.getComponent(Sprite)
            if (value.name == cowName){
                resSpriteMask!.color = color(255, 0,0, this.selectedAlpha)

            }else if (value.name == cowLastName){
                if (this.startScroll){
                    this.startScroll = false
                }else {
                    resSpriteMask!.color = color(255, 0,0, this.selectedLastAlpha)
                }
            }else {
                resSpriteMask!.color = color(255, 0,0, 0)
            }
        }))
    }

    /**
     * 最终结果展示
     */
    showFinalResult(){
        this.scrollingTag = false
        this.fusionSuccessFlash = false
        // 跑灯停留
        const cowName = `cowItem${this.finalCowIndexString}`
        this.cowList.forEach(((value, index1) => {
            const resSpriteMask = value.getChildByName("Sprite")!.getComponent(Sprite)
            if (value.name == cowName){
                resSpriteMask!.color = color(255, 0,0, this.selectedAlpha)
            }else {
                resSpriteMask!.color = color(255, 0,0, 0)
            }
        }))
        // 判断是否成功
        if (this.fusionSuccess){
            // 触发update 遮照发光
            // 显示升级后等级打包
            this.fusionSuccessFlash = true
        } else {
            // todo 遮照全部变灰


        }
    }

    /**
     * 开始展示
     */
    startShow(fusionSuccess: boolean, finalCowIndexString: string){
        this.scrollingTag = true
        this.fusionSuccessFlash = false
        this.startScroll = true

        this.fusionSuccess = fusionSuccess
        this.finalCowIndexString = finalCowIndexString // "12345"

        const finalScrollTimes = this.scrollTimes + parseInt(this.finalCowIndexString) - 1 - (this.scrollTimes % this.cowList.length)

        this.scrollTween = tween(this.scrollObj).to(
            this.showChangeTime, {value: finalScrollTimes}, {
                easing: "quadInOut",
                // @ts-ignore
                onUpdate: (target: {value: number}, ratio) => {
                    this.showTween(Math.floor(target.value))
                }
            }
        ).call(()=>{
            this.showFinalResult()
        })
        this.scrollTween.start()
    }

    /**
     * 点击蒙版
     */
    drawFinishCallback(){
        if (this.scrollingTag){
            // 结束滚动
            this.scrollTween!.stop()
            this.showFinalResult()
        }else {
            // 关闭界面
            this.node.position = new Vec3(0 ,1300, 0)
            this.fusionSuccessFlash = false
        }
    }
}


