import {_decorator, Component, find, Label, Node, resources, Sprite, SpriteFrame} from 'cc';
import {initialize} from "./Initialize";
import {GemsLevel, GemsNumber, GlobalEventTarget, GlobalEventType, LevelGain} from "./Common";
import {calPlayerGainApi, getLastCalTime, getPlayerCoinApi, getPlayerGemsDataApi} from "./api/PlayerDataApi";
import {GainsPopup, GainsPopupOptions} from "./component/popups/GainsPopup";
import PopupManager, {PopupCacheMode, PopupParamsType} from "./PopupManager";

const { ccclass, property } = _decorator;


@ccclass('Game')
export class Game extends Component {

    @property({type: Node})
    private coinLabelNode: Node | undefined

    @property({type: Node})
    private levelLabelNode: Node | undefined

    @property({type: Number, displayName: "金币收益计算间隔（s）"})
    private coinInterval: number = 10

    public showingView: Node | null | undefined // 正在展示的界面
    public selectedViewTab: Node | null | undefined // 选中的ViewTab

    public test() {}

    protected onLoad() {
        // todo 绑定mainView 和对应 tab
        this.showingView = find("Canvas/MainView")
        this.selectedViewTab = find("Canvas/MainViewTab")

        // 监听金币、等级刷新事件
        GlobalEventTarget.on(GlobalEventType.UPDATE_COIN, this.updateCoinShow, this)
        GlobalEventTarget.on(GlobalEventType.UPDATE_LEVEL, this.updateLevelShow, this)

        initialize()
        // 初始获取金币展示
        this.updateCoinShow(-1)
        // 初始计算等级展示
        this.updateLevelShow()
        // 弹窗展示计算挂机收益
        this.calGain(true)

        //启动金币收益变化展示
        this.schedule(()=> {
            this.calGain()
        },this.coinInterval)

        // 初始化主页和背包宝石贴图
        const mainGems = find("Canvas/View/MainView/gems")
        const packageGemsContent = find(`Canvas/View/PackageView/levelLayout/gemsPageView/view/content`)
        const gemsSelectContent = find("Canvas/View/FusionView/gemSelect/GemSelectView/levelLayout/gemsPageView/view/content")
        for (let i = 0; i < GemsNumber; i++){
            let gemSpriteFrameResourceName: string
            if (i < 9){
                gemSpriteFrameResourceName = `00${i + 1}`
            }else {
                gemSpriteFrameResourceName = `0${i + 1}`
            }
            resources.load( `gemSpriteFrame/${gemSpriteFrameResourceName}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
                // 更新主页贴图
                mainGems!.getChildByName(`gemMask${gemSpriteFrameResourceName}`)!.getChildByName("gemSprite")!.getComponent(Sprite)!.spriteFrame = spriteFrame
                // 更新背包和合成选择的贴图
                Object.keys(GemsLevel).forEach((key: string)=> {
                    const packageLevelGems = packageGemsContent!.getChildByName(key)
                    packageLevelGems!.getChildByName(`gemMask${gemSpriteFrameResourceName}`)!.getChildByName("gemSprite")!.getComponent(Sprite)!.spriteFrame = spriteFrame
                    const fusionSelectGems = gemsSelectContent!.getChildByName(key)
                    fusionSelectGems!.getChildByName(`gemMask${gemSpriteFrameResourceName}`)!.getChildByName("gemSprite")!.getComponent(Sprite)!.spriteFrame = spriteFrame
                })
            })
            
        }

    }

    /**
     * 获取金币数，更新展示
     */
    updateCoinShow(coin: number){
        // 更新展示
        if (coin >= 0){
            this.coinLabelNode!.getComponent(Label)!.string = `金币：${Math.floor(coin)}`
        }else {
           const playerCoin = Math.floor(getPlayerCoinApi())
            this.coinLabelNode!.getComponent(Label)!.string = `金币：${playerCoin}`
        }

    }

    calGain(showPopup = false){
        const result = calPlayerGainApi()
        if (showPopup){
            const options: GainsPopupOptions = {
                lastLoginTime: getLastCalTime() as string ,
                gainCoinNumber: result[1] as number
            }
            const params : PopupParamsType = {
                mode : PopupCacheMode.Once
            }
            PopupManager.show(GainsPopup.path, options, params)
        }
        const playCoin = result[0]
        this.updateCoinShow(playCoin)
    }

    /**
     * 获取等级，更新展示
     */
    updateLevelShow(){
        const GemsData = getPlayerGemsDataApi()
        const topGemsLevel = Array<number>(GemsNumber).fill(0)

        GemsData.forEach((value, key) =>{
            value.forEach((gemNum,gemIndex) => {
                if (gemNum>0){
                    // 计算宝石等级
                    const gain = LevelGain.get(key) as number
                    const level = gain / 4
                    if (topGemsLevel[gemIndex] < level){
                        topGemsLevel[gemIndex] = level
                    }
                }
            })
        })
        let sumLevel: number = 0
        topGemsLevel.forEach(value=>{
            sumLevel += value
        })
        this.levelLabelNode!.getComponent(Label)!.string = `LV：${sumLevel}`
    }


}