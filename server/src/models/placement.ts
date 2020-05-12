import { getModelForClass, index, mongoose, pre, prop, ReturnModelType } from "@typegoose/typegoose"
import { Event } from "./event"
import GameModel from "./game"

@pre<Placement>("save", async function () {
    const lastUnranked = await GameModel.findLastUnranked(this)
    if (!lastUnranked) {
        throw new mongoose.Error("There are no " + this.role + " placement games")
    }

    // set date right after last placement game
    this.date = new Date(lastUnranked.date.getTime() + 1)
})
@index({ user: 1, season: 1, role: 1 }, { unique: true })
export class Placement extends Event {
    @prop({ required: true, min: 0, max: 5000, validate: { validator: Number.isInteger } })
    public sr!: number

    public export() {
        return Object.assign(super.export(), { sr: this.sr })
    }

    public static findByEvent(this: ReturnModelType<typeof Placement>,
        { user, season, role }: Event) {
        return this.findOne({ user, season, role }).exec()
    }

    public static findByEventAndDelete(this: ReturnModelType<typeof Placement>,
        { user, season, role }: Event) {
        return this.findOneAndDelete({ user, season, role }).exec()
    }
}

const PlacementModel = getModelForClass(Placement)
export default PlacementModel
