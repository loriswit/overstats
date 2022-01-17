import { Context } from "koa"
import PlacementModel, { Placement } from "../models/placement"
import GameModel from "../models/game"
import { Season } from "../models/event"
import { isDbError } from "../utils/is-db-error"

export default class PlacementController {

    public static async getPlacement(id: string, ctx: Context, next: Function) {
        ctx.placement = await PlacementModel.findById(id).where({ user: ctx.user }).exec()
        if (!ctx.placement) {
            ctx.throw(404, "Placement doesn't exist")
        }

        return next()
    }

    public static async readAll(ctx: Context) {
        const filter = { user: ctx.user } as Placement
        if (ctx.request.query.season) {
            filter.season = ctx.request.query.season as Season
        }

        const placements = await PlacementModel.find(filter).exec()
        ctx.body = placements.map((placement: Placement) => placement.export())
    }

    public static async create(ctx: Context) {
        const placement = new PlacementModel(ctx.request.body)
        placement.user = ctx.user

        try {
            await placement.save()

            // update first ranked game outcome
            const firstRanked = await GameModel.findFirstRanked(placement)
            await firstRanked?.save()

            ctx.body = placement.export()
            ctx.status = 201

        } catch (err) {
            if (isDbError(err) && err.code === 11000) {
                ctx.throw(409, "A " + placement.role + " placement rank already exists")
            } else {
                throw err
            }
        }
    }

    public static async read(ctx: Context) {
        ctx.body = ctx.placement.export()
    }

    public static async update(ctx: Context) {
        Object.assign(ctx.placement, ctx.request.body)
        const newSr = ctx.placement.modifiedPaths().includes("sr")

        await ctx.placement.save()

        // if needed, update first ranked game outcome
        if (newSr) {
            const firstRanked = await GameModel.findFirstRanked(ctx.placement)
            await firstRanked?.save()
        }

        ctx.body = ctx.placement.export()
    }
}
