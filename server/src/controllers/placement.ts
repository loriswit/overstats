import { Context } from "koa"
import Placement, { PlacementSchema } from "../models/placement"
import { RankedSchema } from "../models/ranked"
import { RankSchema } from "../models/rank"

export default class PlacementController {

    public static async readAll(ctx: Context) {
        ctx.body = ctx.season.placements.map((game: PlacementSchema) => game.export())
    }

    public static async create(ctx: Context) {
        const game = new Placement(ctx.request.body)
        PlacementController.checkDate(game, ctx)

        ctx.season.placements.push(game)
        PlacementController.updateRank(game, ctx)
        await ctx.user.save()

        ctx.body = game.export()
        ctx.status = 201
    }

    public static async update(ctx: Context) {
        const game = ctx.season.placements.find((p: PlacementSchema) => p._id == ctx.params.id)
        if (!game) {
            ctx.throw(404, "Placement game doesn't exist: " + ctx.params.id)
        }

        Object.assign(game, ctx.request.body)
        PlacementController.checkDate(game, ctx)
        PlacementController.updateRank(game, ctx)

        await ctx.user.save()
        ctx.body = game.export()
        ctx.status = 200
    }

    public static async delete(ctx: Context) {
        const game = ctx.season.placements.find((p: PlacementSchema) => p._id == ctx.params.id)
        ctx.season.placements.pull(ctx.params.id)
        PlacementController.updateRank(game, ctx)
        await ctx.user.save()
        ctx.status = 200
    }

    private static checkDate(game: PlacementSchema, ctx: Context) {
        const ranked = ctx.season.games
            .filter((r: RankedSchema) => r.role == game.role)

        if (ranked.length) {
            const maxDate = Math.min(...ranked.map((r: RankedSchema) => r.date.getTime()))
            if (game.date.getTime() >= maxDate) {
                ctx.throw(400, "Cannot put a placement game after the first ranked game")
            }
        }
    }

    private static updateRank(game: PlacementSchema, ctx: Context) {
        const rank = ctx.season.ranks.find((r: RankSchema) => r.role == game.role)
        if (rank) {
            const placements = ctx.season.placements
                .filter((p: PlacementSchema) => p.role == game.role)
            if (placements.length) {
                const date = Math.max(...placements.map((p: PlacementSchema) => p.date.getTime()))
                rank.date = new Date(date + 1)
            } else {
                ctx.season.ranks.pull(rank)
            }
        }
    }
}
