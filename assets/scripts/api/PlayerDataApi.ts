import {sys} from "cc";
import {dataKey,} from "./common";
import {changePlayerCoin, getLevelGemsData, getPlayerCoin} from "./util";
import {GemLevelType, GemsLevel, GemsNumber, LevelGain} from "../Common";


/**
 * 获取玩家金币数量
 */
export function getPlayerCoinApi() {
    return getPlayerCoin()
}


/**
 * 获取宝石数据
 */
export function getPlayerGemsDataApi(){
    const PlayerGemsData = new Map<string, number[]>() //一个等级对应一个数组，数组下标+1代表宝石序号，value代表玩家拥有的数量
    Object.keys(dataKey.GEMS_LEVEL_LIST).forEach(key => {
        let gemsData: number[] = getLevelGemsData(key as GemLevelType)
        PlayerGemsData.set(key, gemsData)
    })
    return PlayerGemsData
}


/**
 * 计算收益
 */
export function calPlayerGainApi(){
    const lastCalTimeString = sys.localStorage.getItem(dataKey.LAST_GAIN_TIME)
    let lastCalTime: Date
    const nowTime: Date = new Date()
    sys.localStorage.setItem(dataKey.LAST_GAIN_TIME, JSON.stringify(nowTime.getTime()))
    if (lastCalTimeString != null){
        lastCalTime = new Date(Number(lastCalTimeString))
    }else {
        // 第一次计算收益
        return getPlayerCoin()
    }
    const interval = Math.floor(nowTime.getTime() / 1000 - lastCalTime.getTime() / 1000)


    const gemsSecondGain = new Array<number>(GemsNumber).fill(1 / 3600)
    Object.keys(GemsLevel).forEach(key => {
        let gemsData: number[] = getLevelGemsData(key as GemLevelType)
        const secondGain = LevelGain.get(key) as number / 3600
        gemsData.forEach((gemNumber, gemIndex) => {
            if (gemNumber > 0 && gemsSecondGain[gemIndex] < secondGain){
                gemsSecondGain[gemIndex] = secondGain
            }
        })
    })

    let totalGain = 0
    gemsSecondGain.forEach(value => {
        totalGain += value
    })
    return changePlayerCoin(totalGain * interval)

}
