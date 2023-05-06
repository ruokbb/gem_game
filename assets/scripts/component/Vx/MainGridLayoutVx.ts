import { _decorator, Component,tween,UIOpacity, Node, Label} from 'cc';
const { ccclass, property } = _decorator;

@ccclass("MainGridLayoutVx")
export class MainGridLayoutVx extends Component{
    @property({type: Number, range: [0,1,0.1], displayName: "动画持续时间"})
    private animTime = 0

    @property({type: Number, range: [0,0.5,0.1], displayName: "批次间隔" })
    private echelonInterval = 0

    @property({type: Number, displayName: "shader延迟"})
    private shaderDelay = 0

    private VxObj = {
        value : 0
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
                tween(this.VxObj)
                    .delay((echelon - 1) * this.echelonInterval + this.shaderDelay)
                    .to(this.animTime,{value: 1}, {
                        // @ts-ignore
                        onUpdate(target: {value: Number}, ration){
                            // todo 控制shader变量
                        }

                    })
                    .start()
            })
        })
    }

    public hide(){
        this.node.children.forEach((gemMask: Node) => {
            gemMask.getComponent(UIOpacity)!.opacity = 0
            this.VxObj.value = 0
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
