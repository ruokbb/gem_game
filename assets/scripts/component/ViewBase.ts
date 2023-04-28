import { _decorator, Component,Vec3, Node, Label} from 'cc';
const { ccclass, property } = _decorator;

@ccclass("ViewBase")
export class ViewBase extends Component{

    /**
     * 界面展示
     * @protected
     */
    public showVx() {
        return new Promise(res => {
            this.node.setPosition(new Vec3(0,0,0))
        })
    }

    /**
     * 界面隐藏
     * @protected
     */
    public hideVx() {
        return new Promise(res => {
            this.node.setPosition(new Vec3(0,1300,0))
        })
    }

}
