import { _decorator, Component,UITransform, tween, Tween, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Background')
export class Background extends Component {

    @property({type: Number, displayName: "滚动时间", range: [0, 2, 0.1]})
    private scrollTime: number = 0.5



    /**
     * 切换view, 背景滚动
     * @param viewIndex
     */
    backgroundScroll(viewIndex: number){
        // 停止缓动
        Tween.stopAllByTarget(this.node)
        // 移动背景
        // @ts-ignore
        const ViewWidth = Math.floor(this.node.getComponent(UITransform)!.width / 8)
        const targetX = Math.floor(ViewWidth / 2) + ViewWidth * viewIndex
        tween(this.node).to(
           this.scrollTime, {position: new Vec3(targetX, this.node.position.y, 0)}
        ).start()
    }

}