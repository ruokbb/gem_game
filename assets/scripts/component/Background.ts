import { _decorator, Component,UITransform, tween, Tween, Node, Vec3, find} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Background')
export class Background extends Component {

    @property({type: Number, displayName: "滚动时间", range: [0, 2, 0.1]})
    private scrollTime: number = 0.5

    private startX: number = 0
    private viewWidth: number = 0

    protected onLoad() {
        // 设置位置
        const canvas = find("Canvas")
        this.startX = canvas!.position.x * -1
        this.viewWidth = canvas!.getComponent(UITransform)!.width
        this.node.position = new Vec3(this.startX, 0, 0)
    }


    /**
     * 切换view, 背景滚动
     * @param viewIndex
     */
    backgroundScroll(viewIndex: number){
        // 停止缓动
        Tween.stopAllByTarget(this.node)
        // 移动背景
        // @ts-ignore
        const targetX = this.startX + this.viewWidth * viewIndex * -1
        tween(this.node).to(
           this.scrollTime, {position: new Vec3(targetX, this.node.position.y, 0)}
        ).start()
    }

}