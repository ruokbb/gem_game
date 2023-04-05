import {_decorator, Component, Vec3, tween} from 'cc';

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

    private focusCowIndex = "1"

    scrollObj = {
        value: 0
    }


    /**
     * 按顺序滚动选择，先快后慢，最后停到随机到的位置
     */
    showTween(index: number){
        const cowItemShow = this.node.getChildByName("fusion")!.getChildByName(`cowItem${this.focusCowIndex}`)!
        // todo 选中的外框发光

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
        this.fusionSuccess = fusionSuccess
        this.finalCowIndexString = finalCowIndexString

        tween(this.scrollObj).to(
            this.showChangeTime, {value: this.scrollTimes}, {
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


