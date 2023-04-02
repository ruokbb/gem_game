import { _decorator, Component, Node, Vec3 } from 'cc';
import {FusionView} from "./FusionView";
const { ccclass, property } = _decorator;

@ccclass('ViewTab')
export class ViewTab extends Component {

    @property({type: Node})
    private view: Node | undefined

    @property({type: Node})
    private otherView: Node[] = []


    /**
     * 切换view的按钮点击
      */
    tabClick(){
        // 对应view位置移动到中间，其他移动到上面
        this.view!.position = new Vec3(0 ,0,0)
        this.otherView.forEach((value) => {
            value.position = new Vec3(0, 1200, 0)
            if (value.name == "FusionView"){
                // todo 通过全局变量判断是否从fusionView切走了
                value.getComponent(FusionView)!.clearCow()
            }
        })
    }

}


