import {_decorator, Component, Label, Node, Vec3} from 'cc';
import {getPlayerGemsDataApi} from "../api/PlayerDataApi";
import {GemLevelType, GemsNumber, GlobalEventType, LevelGain, GlobalEventTarget} from "../Common";
import {ViewBase} from "./ViewBase";
import {MainGridLayoutVx} from "./Vx/MainGridLayoutVx";
const { ccclass, property } = _decorator;


@ccclass('MainView')
export class MainView extends ViewBase {

    @property({type: Node})
    private mainGemsLayout: Node | undefined

    protected onLoad() {
        GlobalEventTarget.on(GlobalEventType.UPDATE_PACKAGE, this.updateTopGems, this)
        this.updateTopGems()
    }

    /**
     * 更新主页的宝石等级展示（取最高等级）
     */
    updateTopGems(){
        const GemsData = getPlayerGemsDataApi()

        // 通过收益计算最高等级
        let gemsShowData: GemLevelType[] = new Array(GemsNumber).fill("")
        GemsData.forEach((value, key) =>{
            value.forEach((gemNum,gemIndex) => {
                if (gemNum>0){
                    // 计算宝石等级
                    const gain = LevelGain.get(key) as number
                    if (gemsShowData[gemIndex] == ""){
                        gemsShowData[gemIndex] = key as GemLevelType
                    }else {
                        // 判断哪个宝石收益更高，等级也就更高
                        const oldGain = LevelGain.get(key) as number
                        if (oldGain < gain){
                            gemsShowData[gemIndex] = key as GemLevelType
                        }
                    }
                }
            })
        })

        // 更新等级
        // const mainGems = find("Canvas/View/MainView/gems")
        gemsShowData.forEach((value, index) => {
            let gemNodeName: string
            if (index < 9){
                gemNodeName = `gemMask00${index + 1}`
            }else {
                gemNodeName = `gemMask0${index + 1}`
            }
            const gemMask = this.mainGemsLayout!.getChildByName(gemNodeName)
            gemMask!.getChildByName("levelLabel")!.getComponent(Label)!.string = value
        })
    }


    public showVx(): Promise<unknown> {
        return new Promise(res => {
            this.node.setPosition(new Vec3(0,0,0))
            this.mainGemsLayout!.getComponent(MainGridLayoutVx)!.show()
        })
    }

    public hideVx() {
        return new Promise(res => {
            this.node.setPosition(new Vec3(0,1300,0))
            this.mainGemsLayout!.getComponent(MainGridLayoutVx)!.hide()
        })
    }

}


