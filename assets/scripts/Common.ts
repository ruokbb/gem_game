import {EventTarget} from "cc"

export const GlobalEventTarget = new EventTarget()

const GemsLevel = {
    UR : "UR",
    SSR: "SSR",
    SR: "SR",
    R: "R",
    N: "N"
}

const GlobalEventType = {
    UPDATE_COIN : "updateCoin",
    UPDATE_LEVEL : "updateLevel",
    UPDATE_PACKAGE : "updatePackage"
}

type GemLevelType = keyof typeof GemsLevel | ""
const GemsNumber = 25

// 各个等级每小时获取金币数
const LevelGain = new Map<string, number>([
    [GemsLevel.UR, 2500],
    [GemsLevel.SSR, 500],
    [GemsLevel.SR, 100],
    [GemsLevel.R, 20],
    [GemsLevel.N, 4]])
const LevelNullGain = 1
const LevelRank = 4 // 等级计算系数，收益除以该系数为该宝石提供的等级

const PlayerGemsData = new Map<string, number[]>() //一个等级对应一个数组，数组下标+1代表宝石序号，value代表玩家拥有的数量

const GemsPoolExpenses = [8000, 800, 80, 40000]

const GemsPoolOdds = [
    [GemsLevel.SSR,GemsLevel.SR,GemsLevel.SR,GemsLevel.SR,GemsLevel.SR,GemsLevel.SR],
    [GemsLevel.SR,GemsLevel.R,GemsLevel.R,GemsLevel.R,GemsLevel.R,GemsLevel.R ],
    [GemsLevel.R, GemsLevel.N, GemsLevel.N,GemsLevel.N,GemsLevel.N,GemsLevel.N],
    [GemsLevel.SSR, GemsLevel.SSR,GemsLevel.SSR,GemsLevel.SSR,GemsLevel.SSR,GemsLevel.SSR]
]

export type DrawCardResultType =  {
    success: boolean
    warning?: string
    level?: GemLevelType
    gemIndex?: number
    isNew?: boolean
    coinAfterDraw?: number
}

export {
    GemsLevel, GemsNumber, PlayerGemsData, LevelGain, LevelNullGain, LevelRank,
    GemsPoolOdds, GemsPoolExpenses, GlobalEventType
}

export type { GemLevelType }

