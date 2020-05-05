import { Context } from "koa"
import Season, { SeasonName, SeasonSchema } from "../models/season"

export default class SeasonController {

    public static async getSeason(name: string, ctx: Context, next: Function) {
        const seasonName = SeasonName[name as keyof typeof SeasonName]
        ctx.season = ctx.user.seasons.find((season: SeasonSchema) => season.name === seasonName)

        // add season if not stored yet
        if (!ctx.season) {
            if (!Object.values(SeasonName)
                .includes(seasonName)) {
                ctx.throw(404, "Season does not exist: " + name)
            }

            const length = ctx.user.seasons.push(new Season({ name: seasonName }))
            ctx.season = ctx.user.seasons[length - 1]
        }

        return next()
    }

    public static async list(ctx: Context) {
        ctx.body = Object.entries(SeasonName)
            .map(entry => ({
                key: entry[0],
                name: entry[1]
            }))
    }
}
