import { Context } from "koa"
import GameModel, { Game } from "../models/game"
import PlacementModel from "../models/placement"
import { Season } from "../models/event"
import { isDbError } from "../utils/is-db-error"
import { getGameVersion } from "../utils/game-version"

export default class GameController {

    public static async getGame(id: string, ctx: Context, next: Function) {
        ctx.game = await GameModel.findById(id).where({ user: ctx.user }).exec()
        if (!ctx.game) {
            ctx.throw(404, "Game doesn't exist")
        }

        return next()
    }

    public static async readAll(ctx: Context) {
        const filter = { user: ctx.user } as Game
        if (ctx.request.query.season) {
            filter.season = ctx.request.query.season as Season
        }

        const games = await GameModel.find(filter).exec()
        ctx.body = games.map((game: Game) => game.export())
    }

    public static async create(ctx: Context) {
        const game = new GameModel(ctx.request.body)
        game.user = ctx.user

        try {
            await game.save()

            // replace existing placement event if any (OW1 only)
            if (getGameVersion(game) === 1 && !game.sr) {
                const old = await PlacementModel.findByEventAndDelete(game)
                if (old) {
                    const placement = new PlacementModel({
                        user: old.user, season: old.season, role: old.role, sr: old.sr
                    })
                    await placement.save()
                }
            }

            // update next game's outcome
            else {
                const next = await GameModel.findNext(game)
                await next?.save()
            }

            ctx.body = game.export()
            ctx.status = 201

        } catch (err) {
            if (isDbError(err) && err.code === 11000) {
                ctx.throw(409, "There is already a game on " + game.date.toLocaleString())
            } else {
                throw err
            }
        }
    }

    public static async read(ctx: Context) {
        ctx.body = ctx.game.export()
    }

    public static async update(ctx: Context) {
        Object.assign(ctx.game, ctx.request.body)
        const newSr = ctx.game.modifiedPaths().includes("sr")

        await ctx.game.save()

        // if needed, update next game's outcome
        if (newSr) {
            const next = await GameModel.findNext(ctx.game)
            await next?.save()
        }

        ctx.body = ctx.game.export()
    }

    public static async delete(ctx: Context) {
        await ctx.game.remove()

        // update next game's outcome
        const next = await GameModel.findNext(ctx.game)
        await next?.save()

        ctx.body = ctx.game.export()
    }
}
