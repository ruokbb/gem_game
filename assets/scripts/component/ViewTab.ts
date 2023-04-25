import { _decorator, Component,Color,Sprite, Node, Vec3 } from 'cc';
import {FusionView} from "./FusionView";
import {GlobalVar} from "../Global";
import {Background} from "./Background";
const { ccclass, property } = _decorator;

@ccclass('ViewTab')
export class ViewTab extends Component {

    @property({type: Node, displayName: "视图节点"})
    private view: Node | undefined

    @property({type: Node, displayName: "其他视图节点"})
    private otherView: Node[] = []

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

        let leaveFusionView = false
        // 对应view位置移动到中间，其他移动到上面
        this.view!.position = new Vec3(0 ,0,0)
        if (this.node.name === "FusionView"){
            GlobalVar.stayFusionView = true
        }else {
            if (GlobalVar.stayFusionView){
                GlobalVar.stayFusionView = false
                leaveFusionView = true
            }
        }
        // TabIcon 边缘发光
        this.setGlow(new Color(255,0,0,255), 0.02)

        // 清空合成宝石那边的临时选择数据
        this.otherView.forEach((value) => {
            value.getComponent(ViewTab)!.setGlow(new Color(255,0,0,255), 0)
            value.position = new Vec3(0, 1200, 0)
            if (value.name == "FusionView" && leaveFusionView){
                value.getComponent(FusionView)!.clearCow()
            }
        })
    }

    setGlow(color: Color, width: number){
        this.node.getComponent(Sprite)!.customMaterial!.setProperty("outline_color", color)
        this.node.getComponent(Sprite)!.customMaterial!.setProperty("outline_width", width)
    }

}


