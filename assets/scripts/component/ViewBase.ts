import { _decorator, Component, Node, Label} from 'cc';
const { ccclass, property } = _decorator;

@ccclass("ViewBase")
export class ViewBase extends Component{

    /**
     * 界面展示
     * @protected
     */
    public showVx() { }

    /**
     * 界面隐藏
     * @protected
     */
    public hideVx() { }

}
