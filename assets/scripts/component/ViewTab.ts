import { _decorator, Component,Color,Sprite, Node, Vec3, find } from 'cc';
import {FusionView} from "./FusionView";
import {GlobalVar} from "../Global";
import {Background} from "./Background";
import {ViewBase} from "./ViewBase";
import {Game} from "../Game";
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
        // 移动背景
        // @ts-ignore
        this.bg.getComponent(Background).backgroundScroll(this.viewIndex)

        const showingView: Node = find("Canvas")!.getComponent(Game)!.showingView!
        const selectedViewTab: Node = find("Canvas")!.getComponent(Game)!.selectedViewTab!
        // tab外发光取消
        selectedViewTab.getComponent(ViewTab)!.setGlow(new Color(255,0,0,255), 0)
        if (showingView.name == "FusionView"){
            // 清空合成宝石那边的临时选择数据
            showingView.getComponent(FusionView)!.clearCow()
        }
        // 触发隐藏动效
        showingView.getComponent(ViewBase)!.hideVx()

        // 展示触发动效
        this.view!.getComponent(ViewBase)!.showVx()

        // TabIcon 边缘发光
        this.setGlow(new Color(255,0,0,255), 0.02)
    }

    setGlow(color: Color, width: number){
        this.node.getComponent(Sprite)!.customMaterial!.setProperty("outline_color", color)
        this.node.getComponent(Sprite)!.customMaterial!.setProperty("outline_width", width)
    }

}


