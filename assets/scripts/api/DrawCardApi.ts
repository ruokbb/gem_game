import {GemsNumber, DrawCardResultType, GemLevelType, GemsPoolOdds, GemsPoolExpenses} from "../Common";
import {changePlayerCoin, getLevelGemsData, rand, saveLevelGemsData} from "./util";


/**
 * 抽卡api
 * @param poolIndex
 */
export function drawCardApi(poolIndex: number){
    const pool = GemsPoolOdds[poolIndex]
    let apiResult: DrawCardResultType = {
        success: true
    }

    const poolExpenses = GemsPoolExpenses[poolIndex]
    // 扣钱
    const coinAfterDraw = changePlayerCoin(poolExpenses * -1)
    if (coinAfterDraw < 0){
        apiResult.success = false
        apiResult.warning = "金币不足"
        return apiResult
    }

    // 抽卡
    const index = rand(pool.length) - 1
    const gemIndex = rand(GemsNumber) - 1
    let isNew = false
    // 判断是否是最新的
    const gemsData: number[] = getLevelGemsData(pool[index] as GemLevelType)
    if (gemsData[gemIndex] === 0){
        isNew = true
    }
    // 保存到数据库
    gemsData[gemIndex] += 1
    console.log(`${pool[index]}: ${gemsData}`)
    saveLevelGemsData(pool[index] as GemLevelType, gemsData)

    apiResult.level = pool[index] as GemLevelType
    apiResult.gemIndex = gemIndex
    apiResult.isNew = isNew
    apiResult.coinAfterDraw = coinAfterDraw
    return apiResult
}