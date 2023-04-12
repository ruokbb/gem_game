import { _decorator, Component, Node, Label} from 'cc';
import PopupBase from "./PopupBase";
import {int} from "tsrpc-browser";
const { ccclass, property } = _decorator;

@ccclass('GainsPopup')
export class GainsPopup extends PopupBase<GainsPopupOptions>{

    @property({type: Node})
    private timeLabel?: Node

    @property({type: Node})
    private coinLabel?: Node


    /**
     * 资源弹窗路径
     */
    public static get path() {
        return 'prefabs/GainPopup';
    }

    clickConfirm(){
        this.hide()
    }

    /**
     * 更新展示
     * @param options
     * @protected
     */
    protected updateDisplay(options: GainsPopupOptions) {
        this.timeLabel!.getComponent(Label)!.string = `上次登陆时间：${options.lastLoginTime}`
        this.coinLabel!.getComponent(Label)!.string = `累计收获金币：${options.gainCoinNumber}`
    }

}

export interface GainsPopupOptions {
    lastLoginTime: string
    gainCoinNumber: int

}




