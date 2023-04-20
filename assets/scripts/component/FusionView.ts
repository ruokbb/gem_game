import {_decorator, Component, Label, Node, Vec3, PageView, resources, SpriteFrame, Sprite} from 'cc';
import {GemLevelType, GemsNumber} from "../Common";
import {NormalToast, NormalToastOptions} from "./Toast/NormalToast";
import {clearSelectedGemsDataApi, selectGemApi, fusionGemApi} from "../api/FusionApi";
import {FusionGemSelect} from "./Fusion/FusionGemSelect";
import {ResultShow} from "./Fusion/ResultShow";
import {ToastID, ToastManager} from "../ToastManager";

const {ccclass, property} = _decorator;


@ccclass('FusionView')
export class FusionView extends Component {

    @property({type: Node})
    GemsSelectViewNode: Node | undefined

    @property({type: SpriteFrame})
    cowDefaultSpriteFrame: SpriteFrame | undefined // 空槽位贴图

    @property({type: Node})
    selectPageViewNode: Node | undefined

    @property({type: Node})
    resultShowViewNode: Node | undefined // 结果展示页


    private haveSelectMain = false
    private selectCowIndex = "1" //当前选择的槽位序号
    private selectedCowIndexList: string[] = [] // 已选择的槽位序号
    private selectedGemIndexList: number[] = [] // 对应槽位选择的宝石序号
    private selectCowLevel: GemLevelType = "" // 1号槽等级


    /**
     * 点击强化槽
     */
    cowSelectCallback(event: any, data: string) {
        // 必须先选中间
        if (data !== "1" && !this.haveSelectMain) {
            return
        }
        if (data == "1") {
            this.selectPageViewNode!.getComponent(PageView)!.vertical = true
            this.updateFusionGemSelect()
        }

        this.selectCowIndex = data
        // 移动宝石选择页
        this.GemsSelectViewNode!.position = new Vec3(0, 0, 0)
    }


    /**
     * 选中指定宝石
     * @param gemLevel
     * @param gemIndex
     */
    gemSelectConfirm(gemLevel: GemLevelType, gemIndex: number) {
        const cowItem = this.node.getChildByName("cowList")!.getChildByName(`cowItem${this.selectCowIndex}`)!
        const cowItemShow = this.node.getChildByName("resultShow")!.getChildByName("fusion")!.getChildByName(`cowItem${this.selectCowIndex}`)!


        if (this.selectCowIndex == "1") {
            this.selectCowLevel = gemLevel
            if (cowItem.getChildByName("level")!.getComponent(Label)!.string != gemLevel) {
                // 切换了宝石等级
                this.resetCowSprite(false)
            }
            cowItem.getChildByName("level")!.getComponent(Label)!.string = gemLevel
            // 禁止宝石选择页再次滑动
            this.selectPageViewNode!.getComponent(PageView)!.horizontal = false
            this.selectPageViewNode!.getComponent(PageView)!.vertical = false
        }

        // 宝石选择页复位
        this.GemsSelectViewNode!.position = new Vec3(0, 1200, 0)

        // 更新宝石槽贴图
        let gemSpriteFrameResourceName: string
        if (gemIndex < 9) {
            gemSpriteFrameResourceName = `00${gemIndex + 1}`
        } else {
            gemSpriteFrameResourceName = `0${gemIndex + 1}`
        }
        resources.load(`gemSpriteFrame/${gemSpriteFrameResourceName}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
            cowItem.getComponent(Sprite)!.spriteFrame = spriteFrame
            cowItemShow.getComponent(Sprite)!.spriteFrame = spriteFrame
        })
        this.haveSelectMain = true

        // 记录当前选中的宝石数据
        this.selectedGemIndexList.push(gemIndex)
        this.selectedCowIndexList.push(this.selectCowIndex)
        selectGemApi(gemIndex, gemLevel) // 选择宝石，更新可选宝石数据
        this.updateFusionGemSelect() // 更新可选宝石展示
    }

    /**
     * 贴图复原， 已选数据清空
     * @param resetAll
     */
    resetCowSprite(resetAll = true) {
        // 清空已选数据
        this.selectedCowIndexList = []
        this.selectedGemIndexList = []
        // 贴图复原
        this.node.getChildByName("cowList")?.children.forEach(value => {
            if (!resetAll && value.name === "cowItem1") {
                return
            }
            value.getComponent(Sprite)!.spriteFrame = this.cowDefaultSpriteFrame!
            if (value.getChildByName("level") != null) {
                value.getChildByName("level")!.getComponent(Label)!.string = ""
            }
        })
        this.node.getChildByName("resultShow")?.getChildByName("fusion")!.children.forEach(value => {
            if (!resetAll && value.name === "cowItem1") {
                return
            }
            value.getComponent(Sprite)!.spriteFrame = this.cowDefaultSpriteFrame!
            if (value.getChildByName("level") != null) {
                value.getChildByName("level")!.getComponent(Label)!.string = ""
            }
        })
    }

    /**
     * 清空槽位
     */
    clearCow() {
        // 宝石选择页复位
        this.GemsSelectViewNode!.position = new Vec3(0, 1200, 0)

        // 变量复原
        this.haveSelectMain = false
        this.selectCowIndex = "1"

        this.resetCowSprite()

        clearSelectedGemsDataApi() // 清空选中的其他宝石的数据
        this.updateFusionGemSelect()
    }

    /**
     * 更新可选择的宝石贴图数据
     */
    updateFusionGemSelect() {
        this.GemsSelectViewNode!.getChildByName("GemSelectView")!.getComponent(FusionGemSelect)!.updatePackageGems()
    }

    /**
     * 点击合成按钮
     */
    clickFusionButton() {
        // 判断是否选择完
        if (this.selectedCowIndexList.length < 2) {
            // 提示
            const normalToastOptions : NormalToastOptions = {
                content : "槽位空缺，无法合成宝石"
            }
            ToastManager.show(NormalToast.path, ToastID.FusionButton, normalToastOptions)
            return
        }
        // 调接口获取合成结果
        const result = fusionGemApi(this.selectedCowIndexList, this.selectedGemIndexList, this.selectCowLevel)
        const cowIndexString = this.selectedCowIndexList[result[1] as number]

        // 清空槽位
        this.clearCow()

        // 把结果展示展示页拉到中间，滚动展示
        this.resultShowViewNode!.position = new Vec3(0, 0, 0)
        this.resultShowViewNode!.getComponent(ResultShow)!.startShow(result[0] as boolean, cowIndexString)
    }

}


