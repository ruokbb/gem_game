import {_decorator, Component,Sprite, color, Vec3, tween, Node} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ResultShow')
// @ts-ignore
export class ResultShow extends  Component{

    private showTag = false
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


    @property({type: Node, displayName: "槽位节点列表"})
    private cowList: Node[] = []

    private startScroll = false


    scrollObj = {
        value: 0
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
     * 直接展示最终结果展示
     */
    showFinalResult(){
        this.showTag = false
    }

    /**
     * 开始展示
     */
    startShow(fusionSuccess: boolean, finalCowIndexString: string){
        this.showTag = true
        this.startScroll = true

        this.fusionSuccess = fusionSuccess
        this.finalCowIndexString = finalCowIndexString // "12345"

        const finalScrollTimes = this.scrollTimes + parseInt(this.finalCowIndexString) - 1 - (this.scrollTimes % this.cowList.length)

        tween(this.scrollObj).to(
            this.showChangeTime, {value: finalScrollTimes}, {
                easing: "quadInOut",
                // @ts-ignore
                onUpdate: (target: {value: number}, ratio) => {
                    this.showTween(Math.floor(target.value))
                }
            }
        )
    }

    /**
     * 点击蒙版
     */
    drawFinishCallback(){
        if (this.showTag){
            // 结束滚动
            this.unscheduleAllCallbacks()
            this.showFinalResult()
        }else {
            // 关闭界面
            this.node.position = new Vec3(0 ,1300, 0)
        }
    }

}


