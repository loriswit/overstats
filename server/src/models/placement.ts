import { getModelForClass, prop } from "@typegoose/typegoose"
import { GameSchema } from "./game"

export enum Outcome {
    Victory = "Victory",
    Defeat = "Defeat",
    Draw = "Draw"
}

export class PlacementSchema extends GameSchema {
    @prop({
        required: true,
        enum: Outcome
    })
    public outcome!: Outcome;

    public export(): any {
        return Object.assign(super.export(), { outcome: this.outcome })
    }
}

const Placement = getModelForClass(PlacementSchema)
export default Placement
