import { arrayProp, getModelForClass, index, modelOptions, prop } from "@typegoose/typegoose"
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses"
import { SeasonSchema } from "./season"

@modelOptions({
    schemaOptions: { collection: "users" },
    options: { runSyncIndexes: true }
})
@index({ name: 1 }, {
    unique: true,
    collation: {
        locale: "en",
        strength: 2
    }
})
export class UserSchema extends TimeStamps {
    @prop({
        required: true,
        trim: true
    })
    public name!: string

    @prop({ required: true })
    public pass!: string

    @prop({ validate: /[^#s]+#[0-9]{4,}/ })
    public battleTag?: string

    @arrayProp({ items: SeasonSchema })
    public seasons!: SeasonSchema[]
}

const User = getModelForClass(UserSchema)
export default User
