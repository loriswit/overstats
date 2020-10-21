import { index, prop, Ref } from "@typegoose/typegoose"
import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses"
import { User } from "./user"

export enum Role {
    Tank = "Tank",
    Damage = "Damage",
    Support = "Support",
    Any = "Any"
}

export enum Season {
    S1 = "Season 1",
    S2 = "Season 2",
    S3 = "Season 3",
    S4 = "Season 4",
    S5 = "Season 5",
    S6 = "Season 6",
    S7 = "Season 7",
    S8 = "Season 8",
    S9 = "Season 9",
    S10 = "Season 10",
    S11 = "Season 11",
    S12 = "Season 12",
    S13 = "Season 13",
    S14 = "Season 14",
    S15 = "Season 15",
    S16 = "Season 16",
    S17 = "Season 17",
    RQB = "Role Queue Beta",
    S18 = "Season 18",
    S19 = "Season 19",
    S20 = "Season 20",
    S21 = "Season 21",
    S22 = "Season 22",
    S23 = "Season 23",
    S24 = "Season 24",
}

export interface Event extends Base {
}

@index({ user: 1, season: 1, date: 1, role: 1 }, { unique: true })
export class Event extends TimeStamps {
    @prop({ required: true, immutable: true, ref: User })
    public user!: Ref<User>

    @prop({ required: true, immutable: true, enum: Season })
    public season!: Season

    @prop({ required: true, immutable: true, default: Date.now, })
    public date!: Date

    @prop({ required: true, immutable: true, enum: Role })
    public role!: Role

    public export() {
        return { id: this._id, season: this.season, date: this.date, role: this.role, }
    }
}
