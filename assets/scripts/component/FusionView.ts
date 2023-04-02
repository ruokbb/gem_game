import {_decorator, Component, Label, Node, Vec3, PageView, resources, SpriteFrame, Sprite} from 'cc';
import {GemLevelType, GemsNumber} from "../Common";
import {clearSelectedGemsDataApi, selectGemApi} from "../api/FusionApi";
import {FusionGemSelect} from "./Fusion/FusionGemSelect";

const { ccclass, property } = _decorator;


@ccclass('FusionView')
export class FusionView extends Component {

    @property({type: Node})
    GemsSelectViewNode: Node | undefined

    @property({type:SpriteFrame})
    cowDefaultSpriteFrame: SpriteFrame | undefined

    @property({type: Node})
    selectPageViewNode: Node | undefined

    private haveSelectMain = false
    private selectCowIndex = "1"
    private selectCowLevel = ""

    /**
     * 点击强化槽
     */
    cowSelectCallback(event: any, data: string){
        // 必须先选中间
        if (data !== "1" && !this.haveSelectMain){
           return
        }
        if (data == "1"){
            this.selectPageViewNode!.getComponent(PageView)!.vertical = true
            this.updateFusionGemSelect()
        }

        this.selectCowIndex = data
        // 移动宝石选择页
        this.GemsSelectViewNode!.position = new Vec3(0,0,0)
    }


    /**
     * 选中指定宝石
     * @param gemLevel
     * @param gemIndex
     */
    gemSelectConfirm(gemLevel: GemLevelType, gemIndex: number){
        const cowItem = this.node.getChildByName("cowList")!.getChildByName(`cowItem${this.selectCowIndex}`)!
        const cowItemShow = this.node.getChildByName("resultShow")!.getChildByName("fusion")!.getChildByName(`cowItem${this.selectCowIndex}`)!


        if (this.selectCowIndex == "1"){
            this.selectCowLevel = gemLevel
            if (cowItem.getChildByName("level")!.getComponent(Label)!.string != gemLevel){
                // 切换了宝石等级
                this.resetCowSprite(false)
            }
            cowItem.getChildByName("level")!.getComponent(Label)!.string = gemLevel
            // 禁止宝石选择页再次滑动
            this.selectPageViewNode!.getComponent(PageView)!.horizontal = false
            this.selectPageViewNode!.getComponent(PageView)!.vertical = false
        }

        // 宝石选择页复位
        this.GemsSelectViewNode!.position = new Vec3(0,1200,0)

        // 更新宝石槽贴图
        let gemSpriteFrameResourceName: string
        if (gemIndex < 9){
            gemSpriteFrameResourceName = `00${gemIndex + 1}`
        }else {
            gemSpriteFrameResourceName = `0${gemIndex + 1}`
        }
        resources.load( `gemSpriteFrame/${gemSpriteFrameResourceName}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
            cowItem.getComponent(Sprite)!.spriteFrame = spriteFrame
            cowItemShow.getComponent(Sprite)!.spriteFrame = spriteFrame
        })
        this.haveSelectMain = true

        // 记录当前选中的宝石数据
        selectGemApi(gemIndex, gemLevel)
        this.updateFusionGemSelect() // 更新可选宝石数据展示
    }

    resetCowSprite(resetAll=true){
        // 贴图复原
        this.node.getChildByName("cowList")?.children.forEach(value => {
            if (!resetAll && value.name === "cowItem1"){
                return
            }
            value.getComponent(Sprite)!.spriteFrame = this.cowDefaultSpriteFrame!
            if (value.getChildByName("level") != null){
                value.getChildByName("level")!.getComponent(Label)!.string = ""
            }
        })
        this.node.getChildByName("resultShow")?.getChildByName("fusion")!.children.forEach(value => {
            if (!resetAll && value.name === "cowItem1"){
                return
            }
            value.getComponent(Sprite)!.spriteFrame = this.cowDefaultSpriteFrame!
            if (value.getChildByName("level") != null){
                value.getChildByName("level")!.getComponent(Label)!.string = ""
            }
        })
    }

    /**
     * 清空槽位
     */
    clearCow(){
        // 宝石选择页复位
        this.GemsSelectViewNode!.position = new Vec3(0,1200,0)

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
   updateFusionGemSelect(){
       this.GemsSelectViewNode!.getChildByName("GemSelectView")!.getComponent(FusionGemSelect)!.updatePackageGems()
   }

}


