import { getModelForClass, prop } from "@typegoose/typegoose"
import { GameSchema } from "./game"

export class RankedSchema extends GameSchema {
    @prop({
        required: true,
        min: 0,
        max: 5000,
        validate: { validator: Number.isInteger }
    })
    public sr!: Number

    public export(): any {
        return Object.assign(super.export(), { sr: this.sr })
    }
}

const Ranked = getModelForClass(RankedSchema)
export default Ranked
