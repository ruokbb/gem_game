import {_decorator, Component, Label, Node, PageView} from 'cc';
import {PackageView} from "../PackageView";
import {getFusionGemsDataApi} from "../../api/FusionApi";

const { ccclass, property } = _decorator;

@ccclass('FusionGemSelect')
// @ts-ignore
export class FusionGemSelect extends PackageView {
    @property({type: Node})
    // @ts-ignore
    private pageViewNode: Node | undefined
    
    pageViewCallback() {
        if (!this.pageViewNode!.getComponent(PageView)!.vertical){
            return
        }
        super.pageViewCallback();
    }

    /**
     * 获取可合成宝石数据
     */
    getGemsData(): Map<string, number[]> {
        return getFusionGemsDataApi()
    }

}


