import { getModelForClass, prop } from "@typegoose/typegoose"
import { EventSchema } from "./event"

export class RankSchema extends EventSchema {
    @prop({
        required: true,
        min: 0,
        max: 5000,
        validate: { validator: Number.isInteger }
    })
    public sr!: Number;

    public export(): any {
        return Object.assign(super.export(), { sr: this.sr })
    }
}

const Rank = getModelForClass(RankSchema)
export default Rank
