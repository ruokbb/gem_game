import {sys} from "cc";
import {dataKey} from "./common";
import {GemLevelType, GemsLevel, GemsNumber} from "../Common";


/**
 * 金币保存到本地
 * @param coin
 */
function savePlayerCoin(coin: number){
    sys.localStorage.setItem(dataKey.COIN, `${coin}`)
}

/**
 * 获取玩家金币数量
 */
export function getPlayerCoin() {
    const coin = sys.localStorage.getItem(dataKey.COIN)
    if (coin == null){
        return 0
    }else {
        return Number(coin)
    }
}

/**
 * 修改金币
 * @param changeNumber
 */
export function changePlayerCoin(changeNumber: number){
    const coinNum = getPlayerCoin()
    const newCoinNum = coinNum + changeNumber
    if (newCoinNum < 0){
        return -1
    }else {
        savePlayerCoin(newCoinNum)
        return newCoinNum
    }
}

/**
 * 获取指定等级宝石的数据
 * @param level
 */
export function getLevelGemsData(level: GemLevelType){
    const localGemsDataString = sys.localStorage.getItem(level)
    let gemsDataString : string
    let gemsData: number[] = new Array<number>(GemsNumber)
    if (localGemsDataString == null) {
        for (let i = 0; i < GemsNumber; i++) {
            gemsData[i] = 0
        }
    }else {
        gemsDataString = String(localGemsDataString)
        gemsData = JSON.parse(gemsDataString)
    }
    return gemsData
}

/**
 * 保存指定等级宝石数据
 * @param level
 * @param GemsData
 */
export function saveLevelGemsData(level: GemLevelType, GemsData: number[]){
    sys.localStorage.setItem(level, JSON.stringify(GemsData))
}

/**
 * 获取随机数
 */
// @ts-ignore
export const rand = (function(){
    var today = new Date();
    var seed = today.getTime();
    function rnd(){
        seed = ( seed * 9301 + 49297 ) % 233280;
        return seed / ( 233280.0 );
    };
    return function rand(number_: number){
        // return Math.ceil(rnd(seed) * number);
        return Math.ceil(rnd() * number_);
    };
})();
