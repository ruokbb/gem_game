import {_decorator, color, Component, Label, Node, PageView, Sprite} from 'cc';
import {getPlayerGemsDataApi} from "../api/PlayerDataApi";
import {GemsNumber, GlobalEventTarget, GlobalEventType} from "../Common";

const { ccclass, property } = _decorator;

@ccclass('PackageView')
export class PackageView extends Component {

    @property({type: Node})
    protected leftButtonList: Node[] = []

    @property({type: Node})
    protected rightButtonList: Node[] = []

    @property({type: Node})
    protected pageViewNode = null

    @property({type: Node})
    protected pageViewContent: Node | undefined

    protected onLoad() {
        GlobalEventTarget.on(GlobalEventType.UPDATE_PACKAGE, this.updatePackageGems, this)
        this.updatePackageGems()
    }


    /**
     * 滑动背包切换两侧tab
     */
    pageViewCallback(){
        // @ts-ignore
        const pageIndex = this.pageViewNode.getComponent(PageView).getCurrentPageIndex()

        this.leftButtonList.forEach((value, index) => {
            if (index === pageIndex){
                value.getComponent(Sprite)!.color = color(255,255,255)
            }else {
                value.getComponent(Sprite)!.color = color(120,120,120)
            }
        })
        this.rightButtonList.forEach((value, index) => {
            if (index === pageIndex){
                value.getComponent(Sprite)!.color = color(255,255,255)
            }else {
                value.getComponent(Sprite)!.color = color(120,120,120)
            }
        })
    }


    /**
     * 获取背包宝石数据
     */
    getGemsData(){
        return getPlayerGemsDataApi()
    }

    /**
     * 更新背包的数据
     */
    updatePackageGems(){
        const GemsData = this.getGemsData()
        GemsData.forEach((value: number[], key: string) => {
            const gems = this.pageViewContent!.getChildByName(`${key}`)
            for (let i = 0; i < GemsNumber; i++){
                let gemNodeName: string
                if (i < 9){
                    gemNodeName = `gemMask00${i + 1}`
                }else {
                    gemNodeName = `gemMask0${i + 1}`
                }
                gems!.getChildByName(gemNodeName)!.getChildByName("levelLabel")!.getComponent(Label)!.string = key
                gems!.getChildByName(gemNodeName)!.getChildByName("gemNumber")!.getComponent(Label)!.string = `${value[i]}`
            }
        })
    }
}


