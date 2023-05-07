import {_decorator, Component, Sprite, Node, Material, find, resources, SpriteFrame, UITransform} from 'cc';
import {FusionView} from "./FusionView";
import {GlobalVar} from "../Global";
import {Background} from "./Background";
import {ViewBase} from "./ViewBase";
import {Game} from "../Game";
import {GemsLevel} from "../Common";
const { ccclass, property } = _decorator;

@ccclass('ViewTab')
export class ViewTab extends Component {

    @property({type: Node, displayName: "视图节点"})
    private view: Node | undefined

    @property({type: Number, displayName:"视图下标（从0开始）"})
    private viewIndex: number = 0 // 从左到右，从0开始

    @property({type: Node, displayName: "背景节点"})
    private bg: Node | undefined

    protected start() {
        this.loadEffect("material/outline")
        const gameObject: Game = find("Canvas")!.getComponent(Game)!
        const selectedViewTab: Node = gameObject.selectedViewTab!
        if (this.node.name == selectedViewTab.name){
            this.setGlow()
        }
    }


    loadEffect(resourcePath: string){
        resources.load( resourcePath, Material, (err, material) => {
            this.node.getComponent(Sprite)!.setMaterial(material, 0)
        })
    }


    /**
     * 切换view的按钮点击
      */
    tabClick(){
        const gameObject: Game = find("Canvas")!.getComponent(Game)!
        const showingView: Node = gameObject.showingView!
        const selectedViewTab: Node = gameObject.selectedViewTab!

        if (selectedViewTab.name == this.node.name){
            return
        }

        // 移动背景
        // @ts-ignore
        this.bg.getComponent(Background).backgroundScroll(this.viewIndex)

        // tab外发光取消
        selectedViewTab.getComponent(ViewTab)!.setGlow(false)
        if (showingView.name == "FusionView"){
            // 清空合成宝石那边的临时选择数据
            showingView.getComponent(FusionView)!.clearCow()
        }
        // 触发隐藏动效
        showingView.getComponent(ViewBase)!.hideVx()

        // 展示触发动效
        this.view!.getComponent(ViewBase)!.showVx()

        // TabIcon 边缘发光
        this.setGlow()

        // 更新选中的view和tab
        gameObject.selectedViewTab = this.node
        gameObject.showingView = this.view
    }

    setGlow(showGlow = true){
        // todo 控制发光
        if (!showGlow){
            this.node.getComponent(Sprite)!.customMaterial!.setProperty("glowRange", 0)
            return
        }
        const width = this.node.getComponent(UITransform)!.contentSize.width
        const height = this.node.getComponent(UITransform)!.contentSize.height
        this.node.getComponent(Sprite)!.customMaterial!.setProperty("spriteWidth", width)
        this.node.getComponent(Sprite)!.customMaterial!.setProperty("spriteHeight", height)
        this.node.getComponent(Sprite)!.customMaterial!.setProperty("glowRange", 6)
        this.node.getComponent(Sprite)!.customMaterial!.setProperty("glowThreshold", 0.1)
        // const pass = this.node.getComponent(Sprite)!.customMaterial!.passes[0]
        // pass.setUniform(pass.getHandle("outline_color"), color)
        // pass.setUniform(pass.getHandle("outline_width"), width)
    }
}


