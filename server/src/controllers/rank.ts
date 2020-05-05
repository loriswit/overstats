import { Context } from "koa"
import Rank, { RankSchema } from "../models/rank"
import { PlacementSchema } from "../models/placement"

export default class RankController {

    public static async readAll(ctx: Context) {
        ctx.body = ctx.season.ranks.map((rank: RankSchema) => rank.export())
    }

    public static async create(ctx: Context) {
        const rank = new Rank(ctx.request.body)
        if (ctx.season.ranks.find((r: RankSchema) => r.role == rank.role)) {
            ctx.throw(409, "An initial rank for this role already exists")
        }

        const placements = ctx.season.placements
            .filter((placement: PlacementSchema) => placement.role == rank.role)
        if (placements.length == 0) {
            ctx.throw(400, "There are no " + rank.role + " placement games")
        }

        // get date from most recent placement game
        const date = Math.max(...placements.map((p: PlacementSchema) => p.date.getTime()))
        rank.date = new Date(date + 1)

        ctx.season.ranks.push(rank)
        await ctx.user.save()

        ctx.body = rank.export()
        ctx.status = 201
    }

    public static async update(ctx: Context) {
        const rank = ctx.season.ranks.find((r: RankSchema) => r._id == ctx.params.id)
        if (!rank) {
            ctx.throw(404, "Initial rank doesn't exist: " + ctx.params.id)
        }

        rank.sr = ctx.request.body.sr

        await ctx.user.save()
        ctx.body = rank.export()
        ctx.status = 200
    }
}
