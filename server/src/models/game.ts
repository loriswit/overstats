import { getModelForClass, mongoose, pre, prop, ReturnModelType } from "@typegoose/typegoose"
import { Event } from "./event"
import PlacementModel from "./placement"
import { getGameVersion } from "../utils/game-version"

export enum GameMap {
    BlizzardWorld = "Blizzard World",
    Busan = "Busan",
    CircuitRoyal = "Circuit Royal",
    Colosseo = "Colosseo",
    Dorado = "Dorado",
    Eichenwalde = "Eichenwalde",
    Esperanca = "Esperança",
    Hanamura = "Hanamura",
    Havana = "Havana",
    Hollywood = "Hollywood",
    HorizonLunarColony = "Horizon Lunar Colony",
    Ilios = "Ilios",
    Junkertown = "Junkertown",
    KingsRow = "King's Row",
    LijiangTower = "Lijiang Tower",
    Midtown = "Midtown",
    Nepal = "Nepal",
    NewQueenStreet = "New Queen Street",
    Numbani = "Numbani",
    Oasis = "Oasis",
    Paraiso = "Paraíso",
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

export enum Outcome {
    Victory = "Victory",
    Defeat = "Defeat",
    Draw = "Draw"
}

export function diffToOutcome(diff: number): Outcome {
    if (diff > 0) {
        return Outcome.Victory
    }
    if (diff < 0) {
        return Outcome.Defeat
    }
    return Outcome.Draw
}

@pre<Game>("validate", async function () {
    if (this.modifiedPaths().includes("date")) {
        if (!this.sr) {
            const firstRanked = await GameModel.findFirstRanked(this)
            if (firstRanked && this.date >= firstRanked.date) {
                this.invalidate("date", "Cannot put a placement game after the first ranked game")
            }
        } else {
            const lastUnranked = await GameModel.findLastUnranked(this)
            if (lastUnranked && this.date <= lastUnranked.date) {
                this.invalidate("date", "Cannot put a ranked game before the last placement game")
            }
        }
    }
})
@pre<Game>("save", async function () {
    // infer outcome
    if (getGameVersion(this) > 1) {
        if (!this.outcome) {
            throw new mongoose.Error("Cannot infer outcome in Overwatch 2")
        }
        // no SR in OW2
        this.sr = undefined
        return
    }
    if (!this.sr) {
        if (!this.outcome) {
            throw new mongoose.Error("Cannot infer outcome of a placement game")
        }
    } else {
        const previous = await GameModel.findPrevious(this)
        if (!previous) {
            const placement = await PlacementModel.findByEvent(this)
            if (placement) {
                this.outcome = diffToOutcome(this.sr - placement.sr)
            } else if (!this.outcome) {
                throw new mongoose.Error("Cannot infer outcome of the first ranked game")
            }
        }
        if (previous && previous.sr) {
            this.outcome = diffToOutcome(this.sr - previous.sr)
        }
    }
})
export class Game extends Event {
    @prop({ required: true, enum: GameMap })
    public map!: GameMap

    @prop({ required: true, enum: Balance, default: Balance.Balanced })
    public balance!: Balance

    @prop({ enum: Outcome })
    public outcome!: Outcome

    @prop({ min: 0, max: 5000, validate: { validator: Number.isInteger } })
    public sr?: number

    public static findFirstRanked(this: ReturnModelType<typeof Game>,
        { user, season, role }: Event) {
        return this.findOne({ user, season, role, sr: { $exists: true } })
            .sort({ date: 1 }).exec()
    }

    public static findLastUnranked(this: ReturnModelType<typeof Game>,
        { user, season, role }: Event) {
        return this.findOne({ user, season, role, sr: { $exists: false } })
            .sort({ date: -1 }).exec()
    }

    public static findPrevious(this: ReturnModelType<typeof Game>, game: Game) {
        return this.findOne({
            user: game.user, season: game.season, role: game.role,
            sr: { $exists: game.sr !== undefined }, date: { $lt: game.date }
        })
            .sort({ date: -1 }).exec()
    }

    public static findNext(this: ReturnModelType<typeof Game>, game: Game) {
        return this.findOne({
            user: game.user, season: game.season, role: game.role,
            sr: { $exists: game.sr !== undefined }, date: { $gt: game.date }
        })
            .sort({ date: 1 }).exec()
    }

    public export() {
        return Object.assign(super.export(), {
            map: this.map,
            balance: this.balance,
            outcome: this.outcome,
            ranked: this.sr != undefined,
            sr: this.sr
        })
    }
}

const GameModel = getModelForClass(Game)
export default GameModel
