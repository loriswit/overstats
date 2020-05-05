import { Context } from "koa"
import Ranked, { RankedSchema } from "../models/ranked"
import { PlacementSchema } from "../models/placement"

export default class RankedController {

    public static async readAll(ctx: Context) {
        ctx.body = ctx.season.games.map((game: RankedSchema) => game.export())
    }

    public static async create(ctx: Context) {
        const game = new Ranked(ctx.request.body)
        RankedController.checkDate(game, ctx)

        ctx.season.games.push(game)
        await ctx.user.save()

        ctx.body = game.export()
        ctx.status = 201
    }

    public static async update(ctx: Context) {
        const game = ctx.season.games.find((r: RankedSchema) => r._id == ctx.params.id)
        if (!game) {
            ctx.throw(404, "Ranked game doesn't exist: " + ctx.params.id)
        }

        Object.assign(game, ctx.request.body)
        RankedController.checkDate(game, ctx)

        await ctx.user.save()
        ctx.body = game.export()
        ctx.status = 200
    }

    public static async delete(ctx: Context) {
        ctx.season.games.pull(ctx.params.id)
        await ctx.user.save()
        ctx.status = 200
    }

    private static checkDate(game: RankedSchema, ctx: Context) {
        const placements = ctx.season.placements
            .filter((p: PlacementSchema) => p.role == game.role)

        if (placements.length) {
            const minDate = Math.max(...placements.map((p: PlacementSchema) => p.date.getTime()))
            if (game.date.getTime() <= minDate) {
                ctx.throw(400, "Cannot put a ranked game before the last placement game")
            }
        }
    }
}
