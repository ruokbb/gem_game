import {GemLevelType, GemsLevel} from "../Common";
import {getLevelGemsData} from "./util";
import {dataKey} from "./common";

let selectedGemsLevel: GemLevelType = GemsLevel.SSR as GemLevelType
let selectedGemsIndex: number[]  = []

/**
 * 判断合成宝石是否足够
 * @param gemIndex
 * @param gemLevel
 */
export function isEnoughGemInFusionApi(gemIndex: number, gemLevel: GemLevelType){
    const playerGemsData = getLevelGemsData(gemLevel)
    // 减去已选择的
    selectedGemsIndex.forEach((value: number) => {
        playerGemsData[value] -= 1
    })
    return playerGemsData[gemIndex] > 0;
}

/**
 * 获取可合成宝石数据
 */
export function getFusionGemsDataApi(){
    const PlayerGemsData = new Map<string, number[]>() //一个等级对应一个数组，数组下标+1代表宝石序号，value代表玩家拥有的数量
    Object.keys(dataKey.GEMS_LEVEL_LIST).forEach(key => {
        let gemsData: number[] = getLevelGemsData(key as GemLevelType)
        if (key as GemLevelType === selectedGemsLevel){
            // 减去已选择的
            selectedGemsIndex.forEach((value: number) => {
                gemsData[value] -= 1
            })
        }
        PlayerGemsData.set(key, gemsData)
    })
    return PlayerGemsData
}

export function selectGemApi(gemIndex: number, gemLevel: GemLevelType) {
    selectedGemsIndex.push(gemIndex)
    selectedGemsLevel = gemLevel
}

export function clearSelectedGemsDataApi(){
    selectedGemsIndex = []
}
