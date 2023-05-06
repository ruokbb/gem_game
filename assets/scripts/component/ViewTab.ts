import { _decorator, Component,Color,Sprite, Node, Vec3, find } from 'cc';
import {FusionView} from "./FusionView";
import {GlobalVar} from "../Global";
import {Background} from "./Background";
import {ViewBase} from "./ViewBase";
import {Game} from "../Game";
import {game} from "../../../../../../../Applications/CocosCreator/Creator/3.6.3/CocosCreator.app/Contents/Resources/resources/3d/engine/cocos/core";
const { ccclass, property } = _decorator;

@ccclass('ViewTab')
export class ViewTab extends Component {

    @property({type: Node, displayName: "视图节点"})
    private view: Node | undefined

    @property({type: Number, displayName:"视图下标（从0开始）"})
    private viewIndex: number = 0 // 从左到右，从0开始

    @property({type: Node, displayName: "背景节点"})
    private bg: Node | undefined


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
        // const pass = this.node.getComponent(Sprite)!.customMaterial!.passes[0]
        // pass.setUniform(pass.getHandle("outline_color"), color)
        // pass.setUniform(pass.getHandle("outline_width"), width)
    }

}


