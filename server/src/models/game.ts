import { prop } from "@typegoose/typegoose"
import { EventSchema } from "./event"

export enum GameMap {
    BlizzardWorld = "Blizzard World",
    Busan = "Busan",
    Dorado = "Dorado",
    Eichenwalde = "Eichenwalde",
    Hanamura = "Hanamura",
    Havana = "Havana",
    Hollywood = "Hollywood",
    HorizonLunarColony = "Horizon Lunar Colony",
    Ilios = "Ilios",
    Junkertown = "Junkertown",
    KingsRow = "King's Row",
    LijiangTower = "Lijiang Tower",
    Nepal = "Nepal",
    Numbani = "Numbani",
    Oasis = "Oasis",
    Paris = "Paris",
    Rialto = "Rialto",
    Route66 = "Route 66",
    TempleOfAnubis = "Temple of Anubis",
    VolskayaIndustries = "Volskaya Industries",
    WatchpointGibraltar = "Watchpoint: Gibraltar"
}

export enum Balance {
    Balanced = "Balanced",
    Enemy = "Enemy Advantage",
    Allied = "Allied Advantage"
}

export class GameSchema extends EventSchema {
    @prop({
        required: true,
        enum: GameMap
    })
    public map!: GameMap

    @prop({
        required: true,
        enum: Balance,
        default: Balance.Balanced
    })
    public balance!: Balance

    public export(): any {
        return Object.assign(super.export(), {
            map: this.map,
            balance: this.balance,
        })
    }
}
