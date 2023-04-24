import {_decorator, color, Color, Component, Node, Sprite, tween, Tween, Vec3} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ResultShow')
// @ts-ignore
export class ResultShow extends  Component{

    private scrollingTag = false // 判断跑灯是否结束
    private fusionSuccessFlash = false // 合成成功控制发光

    private fusionSuccess = false
    private finalCowIndexString = "1"

    @property({type: Number, range: [0,5,0.1], slide:true, displayName:"滚动时间(s)"})
    private showChangeTime = 0

    @property({type:Number, range: [0, 100, 1], slide:true, displayName: "滚动次数"})
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
            cowNode.getChildByName("Sprite")!.getComponent(Sprite)!.color = this.fusionSuccessColorList[this.colorUpdateTimes % this.fusionSuccessColorList.length]
        }
    }


    /**
     * 按顺序滚动选择，先快后慢
     */
    showTween(index: number){
        let cowIndex = index % this.cowList.length + 1
        if (cowIndex == 1) cowIndex += 1

        const cowName = `cowItem${cowIndex}`
        this.cowList.forEach(((value) => {
            const resSpriteMask = value.getChildByName("Sprite")!.getComponent(Sprite)
            if (value.name == cowName){
                resSpriteMask!.color = color(255, 0,0, this.selectedAlpha)
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
        // todo 其余宝石同时产生裂痕shader，最后一个产生一般最后决定成功，闪光shader
        if (this.fusionSuccess){
            // 触发update 遮照发光
            // 显示升级后等级打包
            this.fusionSuccessFlash = true
        } else {
            this.resultShowCowMaskChange(new Color(144,144,144, 120))
        }
    }

    /**
     * 开始展示
     */
    startShow(fusionSuccess: boolean, finalCowIndexString: string){
        console.log(`宝石：${finalCowIndexString}, 合成结果：${fusionSuccess}`)
        this.scrollingTag = true
        this.fusionSuccessFlash = false
        this.startScroll = true

        this.fusionSuccess = fusionSuccess
        this.finalCowIndexString = finalCowIndexString // "12345"

        const finalScrollTimes = this.scrollTimes + parseInt(this.finalCowIndexString) - 1 - (this.scrollTimes % this.cowList.length)
        this.scrollObj.value = 0

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
    scrollFinishCallback(){
        if (this.scrollingTag){
            // 结束滚动
            this.scrollTween!.stop()
            this.showFinalResult()
        }else {
            // 关闭界面
            this.node.position = new Vec3(0 ,1300, 0)
            this.fusionSuccessFlash = false
            this.resultShowCowMaskChange(new Color(255, 0, 0, 0))
        }
    }

    /**
     *  控制全部的展示槽颜色变化
     * @param maskColor
     */
    resultShowCowMaskChange(maskColor: Color){
        this.cowList.forEach((value: Node) => {
            const maskSprite = value.getChildByName("Sprite")!.getComponent(Sprite)
            maskSprite!.color =  maskColor
        })
    }
}


