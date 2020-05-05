import { prop } from "@typegoose/typegoose"
import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses"

export enum Role {
    Tank = "Tank",
    Damage = "Damage",
    Support = "Support"
}

export interface EventSchema extends Base {
}

export class EventSchema extends TimeStamps {
    @prop({
        required: true,
        default: Date.now
    })
    public date!: Date

    @prop({ enum: Role })
    public role?: Role

    public export(): any {
        return {
            id: this._id,
            date: this.date,
            role: this.role,
        }
    }
}
