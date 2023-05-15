import {_decorator, Component, tween, UIOpacity, Node, Label, resources, Material, Sprite, find} from 'cc';
import {Game} from "../../Game";
import {bindNumericOr} from "../../../../../../../../Applications/CocosCreator/Creator/3.6.3/CocosCreator.app/Contents/Resources/resources/3d/engine/cocos/core/animation/marionette/parametric";
const { ccclass, property } = _decorator;

@ccclass("MainGridLayoutVx")
export class MainGridLayoutVx extends Component{
    @property({type: Number, range: [0,5,0.1], displayName: "动画持续时间"})
    private animTime = 0

    @property({type: Number, range: [0,0.5,0.1], displayName: "批次间隔" })
    private echelonInterval = 0

    @property({type: Number, displayName: "shader延迟"})
    private shaderDelay = 0

    private VxObj = {
        value : 1
    }

    protected start() {
        // todo 每一个grid绑定material
        this.node.children.forEach((gemMask: Node) => {
            this.loadMaterial("material/lineJitterH", gemMask)
        })
    }

    /**
     * 加载，material
     * @param resourcePath
     * @param target
     */
    loadMaterial(resourcePath: string, target: Node){
        resources.load( resourcePath, Material, (err, material) => {
            target.getComponent(Sprite)!.customMaterial = material
        })
    }


    public show() {
        return new Promise(res => {
            this.node.children.forEach((gemMask: Node) => {
                const indexStr = gemMask.name.slice(-3)
                let index = 0
                if (indexStr[1] == "0"){
                    index = parseInt(indexStr[2])
                }else {
                    index = parseInt(indexStr.slice(-2))
                }
                const echelon = this.getEchelon(index)
                // 渐显
                tween(gemMask.getComponent(UIOpacity))
                    .delay((echelon - 1) * this.echelonInterval)
                    .to(this.animTime, {opacity:255})
                    .start()
                // shader 波动
                const tmpVxObj = Object.assign({}, this.VxObj)
                tween(tmpVxObj)
                    .delay((echelon - 1) * this.echelonInterval + this.shaderDelay)
                    .to(this.animTime,{value: 0}, {
                        // @ts-ignore
                        onUpdate(target: {value: Number}, ration){
                            // todo 控制shader变量
                            const pass = gemMask.getComponent(Sprite)!.material!.passes[0]
                            const tmp = target.value as number
                            pass.setUniform(pass.getHandle("frequency"), tmp)
                            pass.setUniform(pass.getHandle("intensity"), tmp)
                        }

                    })
                    .start()
            })
        })
    }

    public hide(){
        this.node.children.forEach((gemMask: Node) => {
            gemMask.getComponent(UIOpacity)!.opacity = 0
            this.VxObj.value = 1
        })
    }



    /**
     * 获取展示批次
     * @param index
     * @return 批次
     */
    getEchelon(index: number){
        if (index ==13){
            return 1
        }
        if (index % 5 == 1 || index % 5 == 0 || index <= 5 || index >= 21){
            return 3
        }
        return 2
    }


}
