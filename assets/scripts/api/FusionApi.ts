import {GemLevelType, GemsLevel} from "../Common";
import {getLevelGemsData, rand, saveLevelGemsData} from "./util";
import {dataKey} from "./common";
import {fusionProbability} from "./common";

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

/**
 * 选择宝石
 * @param gemIndex
 * @param gemLevel
 */
export function selectGemApi(gemIndex: number, gemLevel: GemLevelType) {
    selectedGemsIndex.push(gemIndex)
    selectedGemsLevel = gemLevel
}

/**
 * 合成宝石
 * @param cowIndexList
 * @param gemIndexList
 * @param gemLevel
 */
export function fusionGemApi(cowIndexList: string[], gemIndexList: number[], gemLevel: GemLevelType){
    // 判断合成是否成功
    const probability = fusionProbability[cowIndexList.length - 2]
    let fusionSuccess = false
    if (rand(100) < probability){
        fusionSuccess = true
    }
    const finalIndex = rand(cowIndexList.length - 1)

    // 丢弃合成宝石
    const gemsData = getLevelGemsData(gemLevel)
    gemIndexList.forEach(value => {
        gemsData[value] -= 1
    })
    saveLevelGemsData(gemLevel, gemsData)

    // 合成成功，保存到数据库
    if (fusionSuccess){
        const gemsData: number[] = getLevelGemsData(gemLevel)
        gemsData[gemIndexList[finalIndex]] += 1
        saveLevelGemsData(gemLevel, gemsData)
    }

    return [fusionSuccess, finalIndex]

}


export function clearSelectedGemsDataApi(){
    selectedGemsIndex = []
}
