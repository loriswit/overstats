import { getModelForClass, index, prop } from "@typegoose/typegoose"
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses"

@index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } })
export class User extends TimeStamps {
    @prop({
        required: true,
        trim: true
    })
    public name!: string

    @prop({ required: true })
    public pass!: string

    @prop({ validate: /[^#]+#\d{4,}/ })
    public battleTag?: string

    public export() {
        return { name: this.name, battleTag: this.battleTag }
    }
}

const UserModel = getModelForClass(User)
export default UserModel
