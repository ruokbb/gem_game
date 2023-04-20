import {_decorator, color, Component, Label, Node, SpriteFrame, Sprite, resources} from 'cc';
import {GemsPoolExpenses, GemsPoolOdds, GemsNumber, GlobalEventTarget, GlobalEventType} from "../Common";
import {drawCardApi} from "../api/DrawCardApi"
import {NormalToast, NormalToastOptions} from "./Toast/NormalToast";
import {ToastManager, ToastID} from "../ToastManager";

const { ccclass, property } = _decorator;

@ccclass('DrawCardView')
export class DrawCardView extends Component {

    @property({type: Node})
    private gemsPools: Node[] = []

    // @ts-ignore
    @property({type: Node})
    private resultShowLabelNode: Node | undefined

    @property({type: Node})
    private resultShowSpriteNode: Node | undefined

    private poolIndex: number = 0
    private expenses: number = 0 //抽卡费用
    // 用于抽卡展示轮播
    private poolSet: string[] = []
    private poolSetShowIndex: number = 0 // 等级切换
    private poolSpriteFrameShowIndex: number = 0 // 图片切换

    private drawResult: {level:string,gemIndex: number, isNew: boolean} = {level: "", gemIndex: 0, isNew: false}

    private showTag = false // 控制是否滚动
    private updateTimes = 0

    @property({type: Number, range: [1, 60, 1], slide: true, displayName: "变化间隔(帧)"})
    private changeInterval = 1

    @property({type: Number, range: [0,5,0.1], slide:true, displayName:"变化时间(s)"})
    private changeTime = 0

    private gemSpriteFrames: SpriteFrame[] = new Array<SpriteFrame>(GemsNumber)

    protected start() {
        // 游戏打开默认选择一池
        this.choosePool("", "1")

        // 加载宝石贴图
        for (let i = 0; i < GemsNumber; i++){
            let gemSpriteFrameResourceName: string
            if (i < 9){
                gemSpriteFrameResourceName = `00${i + 1}`
            }else {
                gemSpriteFrameResourceName = `0${i + 1}`
            }
            resources.load( `gemSpriteFrame/${gemSpriteFrameResourceName}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
                this.gemSpriteFrames[i] = spriteFrame
            })
        }

    }

    protected update(dt: number) {
        if (this.showTag){
            this.updateTimes += 1
            if (this.updateTimes >= this.changeInterval){
                this.updateTimes = 0
                // 更改抽卡结果
                if (this.poolSetShowIndex >= this.poolSet.length){
                    this.poolSetShowIndex = 0
                }
                if (this.poolSpriteFrameShowIndex >= this.gemSpriteFrames.length){
                    this.poolSpriteFrameShowIndex = 0
                }
                this.resultShowLabelNode!.getComponent(Label)!.string = this.poolSet[this.poolSetShowIndex]
                this.resultShowSpriteNode!.getComponent(Sprite)!.spriteFrame = this.gemSpriteFrames[this.poolSpriteFrameShowIndex]
                this.poolSetShowIndex += 1
                this.poolSpriteFrameShowIndex += 1
            }
        }
    }

    /**
     *
     * @param event
     * @param data
     */
    choosePool(event: any, data: string){
        const poolNumber = parseInt(data)
        this.poolIndex = poolNumber - 1
        // 设置选中状态
        this.gemsPools.forEach((value, index) => {
            if (index + 1 === poolNumber){
                value.getComponent(Sprite)!.color = color(255, 0,0)
            }else {
                value.getComponent(Sprite)!.color = color(255,255,255)
            }
        })

        const pool = GemsPoolOdds[this.poolIndex]
        this.expenses = GemsPoolExpenses[this.poolIndex]
        this.node.getChildByName("drawCardButton")!.getChildByName("Label")!.getComponent(Label)!.string = `抽卡（${this.expenses}）`
        this.poolSet = Array.from(new Set(pool))
    }

    /**
     * 最终结果展示
     */
    showFinalResult(){
        this.showTag = false
        this.resultShowLabelNode!.getComponent(Label)!.string = this.drawResult.level
        this.resultShowSpriteNode!.getComponent(Sprite)!.spriteFrame = this.gemSpriteFrames[this.drawResult.gemIndex]
        if (this.drawResult.isNew){
            this.resultShowSpriteNode!.getChildByName("isNew")!.getComponent(Label)!.string = "NEW"
        }else {
            this.resultShowSpriteNode!.getChildByName("isNew")!.getComponent(Label)!.string = ""
        }
    }


    /**
     * 点击抽卡按钮
     */
    drawCallback(){
        const drawResult = drawCardApi(this.poolIndex)
        // 抽卡失败，进行提示
        if (!drawResult.success){
            const toastOptions: NormalToastOptions = {
                content: drawResult.warning!
            }
            ToastManager.show(NormalToast.path,ToastID.DrawFailed, toastOptions)
            return
        }
        this.drawResult.level = drawResult.level as string
        this.drawResult.gemIndex = drawResult.gemIndex as number
        this.drawResult.isNew = drawResult.isNew as boolean
        // 更新金币展示
        GlobalEventTarget.emit(GlobalEventType.UPDATE_COIN, drawResult.coinAfterDraw)
        GlobalEventTarget.emit(GlobalEventType.UPDATE_PACKAGE)

        this.resultShowSpriteNode!.getChildByName("isNew")!.getComponent(Label)!.string = ""

        // 设置抽取结果，画面展示
        this.resultShowLabelNode!.parent!.parent!.active = true
        this.showTag = true
        this.scheduleOnce(this.showFinalResult, this.changeTime)
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
            this.resultShowLabelNode!.parent!.parent!.active = false
        }
    }

}


