import {_decorator, Component, Vec3} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ResultShow')
// @ts-ignore
export class ResultShow extends  Component{

    private showTag = false
    private fusionSuccess = false
    private finalCowIndexString = "1"

    private focusCowIndex = "1"


    /**
     * 按顺序滚动选择，先快后慢，最后停到随机到的位置
     */
    showTween(){
        const cowItemShow = this.node.getChildByName("fusion")!.getChildByName(`cowItem${this.focusCowIndex}`)!
        // todo 选中的外框发光

        // index 递增
        let focusIndex: number = parseInt(this.focusCowIndex)
        focusIndex += 1
        if (focusIndex > 5){
            this.focusCowIndex = "1"
        }else {
            this.focusCowIndex = `${focusIndex}`
        }

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
    startShow(showChangeTime: number, fusionSuccess: boolean, finalCowIndexString: string){
        this.showTag = true
        this.fusionSuccess = fusionSuccess
        this.finalCowIndexString = finalCowIndexString
        this.scheduleOnce(this.showFinalResult, showChangeTime)
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


