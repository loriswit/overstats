import request from "supertest"
import app from "../src/app"
import { makeToken } from "./helpers"
import UserModel from "../src/models/user"
import GameModel, { Game } from "../src/models/game"
import PlacementModel from "../src/models/placement"

let token: string
let userId: string

beforeAll(async () => {
    const user = new UserModel({ name: "Test", pass: "strong-password" })
    await user.save()

    userId = user._id
    token = await makeToken(userId)
})

describe("create games", () => {

    const payload = {
        season: "Season 22",
        date: new Date(5).toISOString(),
        role: "Tank",
        map: "Busan",
    } as any

    test("refuse invalid games", async () => {
        const response = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send({
                season: "invalid",
                date: "invalid",
                role: "invalid",
                map: "invalid",
                outcome: "invalid",
                sr: "invalid"
            })

        expect(response.status).toBe(422)
    })

    test("refuse placement game without outcome", async () => {
        const response = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send(payload)

        expect(response.status).toBe(400)
    })

    test("create new placement game", async () => {
        payload.outcome = "Victory"
        const response = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send(payload)

        const game = await GameModel.findById(response.body.id).exec()

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({ ...payload, ranked: false, balance: "Balanced" })
        expect(game).not.toBeNull()
    })

    test("refuse new game on same date", async () => {
        const response = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send(payload)

        expect(response.status).toBe(409)
    })

    test("refuse ranked game before placement games", async () => {
        payload.date = new Date(5).toISOString()
        payload.sr = 1000
        const response = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send(payload)

        expect(response.status).toBe(422)
    })

    test("refuse first ranked game without outcome", async () => {
        payload.date = new Date(15).toISOString()
        delete payload.outcome
        const response = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send(payload)

        expect(response.status).toBe(400)
    })

    test("create new ranked game", async () => {
        payload.outcome = "Victory"
        const response = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send(payload)

        const game = await GameModel.findById(response.body.id).exec()

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({ ...payload, ranked: true, balance: "Balanced" })
        expect(game).not.toBeNull()

        await game?.remove()
    })

    test("infer outcome from placement", async () => {
        await new PlacementModel({
            season: "Season 22", role: "Tank", sr: 1100, user: userId
        }).save()

        delete payload.outcome
        const response = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send(payload)

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({ outcome: "Defeat" })
    })

    test("infer outcome from previous game", async () => {
        payload.date = new Date(30).toISOString()
        payload.sr = 900
        const response = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send(payload)

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({ outcome: "Defeat" })
    })

    test("modify next game's outcome", async () => {
        payload.date = new Date(20).toISOString()
        payload.sr = 800

        const response = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send(payload)

        const game = await GameModel.findById(response.body.id)
        const next = await GameModel.findNext(game as Game)

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({ outcome: "Defeat" })
        expect(next).toMatchObject({ outcome: "Victory", date: new Date(30) })
    })

    test("refuse placement game after ranked games", async () => {
        payload.date = new Date(25).toISOString()
        delete payload.sr
        const response = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send(payload)

        expect(response.status).toBe(422)
    })

    test("modify placement's date", async () => {
        payload.date = new Date(10).toISOString()
        payload.outcome = "Draw"
        delete payload.sr

        const response = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send(payload)

        const placement = await PlacementModel.findOne().exec()

        expect(response.status).toBe(201)
        expect(placement?.date.getTime()).toBeGreaterThan(new Date(10).getTime())
    })
})

describe("read games", () => {

    test("don't read non-existing game", async () => {
        const game = await new GameModel({
            season: "Season 1", date: new Date(), outcome: "Draw",
            role: "Tank", map: "Busan", user: userId
        }).save()
        await game.remove()

        const response = await request(app.callback()).get("/users/test/games/" + game._id)
        expect(response.status).toBe(404)
    })

    test("read existing game", async () => {
        const game = await GameModel.findOne().exec()
        const response = await request(app.callback()).get("/users/test/games/" + game?._id)

        const res = response.body
        res.date = new Date(res.date)
        res.id = res._id
        delete res.id
        delete res.ranked

        expect(response.status).toBe(200)
        expect(game).toMatchObject(res)
    })

    test("read all games", async () => {
        const count = await GameModel.countDocuments().exec()
        const response = await request(app.callback()).get("/users/test/games")

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(count)
    })

    test("read games from specific season", async () => {
        await new GameModel({
            season: "Season 6", date: new Date(), outcome: "Draw",
            role: "Tank", map: "Busan", user: userId
        }).save()
        const response = await request(app.callback()).get("/users/test/games?season=Season 6")

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(1)
    })
})

describe("update games", () => {

    const payload = {
        map: "Ilios",
        outcome: "Defeat",
        balance: "Enemy Advantage"
    } as any

    test("refuse invalid games", async () => {
        const game = await GameModel.findOne().exec()
        const response = await request(app.callback()).patch("/users/test/games/" + game?._id)
            .set("Authorization", "Bearer " + token).send({
                map: "invalid",
                outcome: "invalid",
                sr: "invalid"
            })

        expect(response.status).toBe(422)
    })

    test("update placement game", async () => {
        const game = await GameModel.findOne({ sr: { $exists: false } }).exec() as Game
        const response = await request(app.callback()).patch("/users/test/games/" + game._id)
            .set("Authorization", "Bearer " + token).send(payload)

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({ ...payload, ranked: false })
    })

    test("update ranked game", async () => {
        const game = await GameModel.findOne({ sr: { $exists: true } }).exec() as Game
        const response = await request(app.callback()).patch("/users/test/games/" + game._id)
            .set("Authorization", "Bearer " + token).send(payload)

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({ ...payload, ranked: true })
    })

    test("infer outcome from changed skill rating", async () => {
        payload.sr = 1100
        const game = await GameModel.findOne({ sr: 800 }).exec()
        const response = await request(app.callback()).patch("/users/test/games/" + game?._id)
            .set("Authorization", "Bearer " + token).send(payload)

        const next = await GameModel.findNext(game as Game)

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({ outcome: "Victory" })
        expect(next).toMatchObject({ outcome: "Defeat" })
    })
})

describe("delete games", () => {

    let game: Game

    test("delete existing game", async () => {
        game = await GameModel.findOne().exec() as Game
        const response = await request(app.callback()).delete("/users/test/games/" + game._id)
            .set("Authorization", "Bearer " + token)

        const res = response.body
        res.date = new Date(res.date)
        res.id = res._id
        delete res.id
        delete res.ranked

        const deleted = await GameModel.findById(game._id).exec()

        expect(response.status).toBe(200)
        expect(game).toMatchObject(res)
        expect(deleted).toBeNull()
    })

    test("don't read non-existing game", async () => {
        const response = await request(app.callback()).delete("/users/test/games/" + game._id)
            .set("Authorization", "Bearer " + token)

        expect(response.status).toBe(404)
    })
})
