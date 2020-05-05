import { arrayProp, getModelForClass, prop } from "@typegoose/typegoose"
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses"
import { RankedSchema } from "./ranked"
import { PlacementSchema } from "./placement"
import { RankSchema } from "./rank"

export enum SeasonName {
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
}

export class SeasonSchema extends TimeStamps {
    @prop({required: true, enum: SeasonName})
    public name!: SeasonName;

    @arrayProp({ items: PlacementSchema })
    public placements!: PlacementSchema[];

    @arrayProp({ items: RankSchema })
    public ranks!: RankSchema[];

    @arrayProp({ items: RankedSchema })
    public games!: RankedSchema[];
}

const Season = getModelForClass(SeasonSchema)
export default Season

