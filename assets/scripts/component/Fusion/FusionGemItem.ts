import { _decorator, Component, Node, Event } from 'cc';
import {FusionView} from "../FusionView";
import {GemLevelType} from "../../Common";
import {isEnoughGemInFusionApi} from "../../api/FusionApi";

const { ccclass, property } = _decorator;


@ccclass('FusionGemItem')
export class FusionGemItem extends Component {

    @property({type: Node})
    private fusionView: Node | undefined

    protected onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this.gemSelectClick, this)
    }

    gemSelectClick(event: Event){
        // 终止传递
        event.propagationStopped = true
        // 读取编号
        const nameIndex = this.node.name.substring(7)
        let gemIndex = 0
        if (Number(nameIndex.substring(1, 2)) == 0){
            gemIndex = Number(nameIndex.substring(2)) - 1
        }else {
            gemIndex = Number(nameIndex.substring(1)) - 1
        }
        // 读取等级
        const gemLevel = this.node.parent!.name

        // 判断是否存在宝石
        if (!isEnoughGemInFusionApi(gemIndex, gemLevel as GemLevelType)){
            // todo 触发提示
        }else {
            this.fusionView!.getComponent(FusionView)!.gemSelectConfirm(gemLevel as GemLevelType, gemIndex)
        }
    }
}


