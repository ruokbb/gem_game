import { _decorator, Component, Node, Label} from 'cc';
import ToastBase from "./ToastBase";
const { ccclass, property } = _decorator;

@ccclass('NormalToast')
export class NormalToast extends ToastBase<NormalToastOptions>{

    @property({type: Node})
    private contentLabel?: Node

    /**
     * 资源弹窗路径
     */
    public static get path() {
        return 'prefabs/NormalToast';
    }

    /**
     * 更新展示
     * @param options
     * @protected
     */
    protected updateDisplay(options: NormalToastOptions) {
        this.contentLabel!.getComponent(Label)!.string = options.content
    }
}

export interface NormalToastOptions {
    content : string
}




