import UserModel from "../src/models/user"
import { makeToken } from "./helpers"
import request from "supertest"
import app from "../src/app"
import GameModel from "../src/models/game"
import PlacementModel from "../src/models/placement"

let token: string
let userId: string

beforeAll(async () => {
    const user = new UserModel({ name: "Test", pass: "strong-password" })
    await user.save()

    userId = user._id
    token = await makeToken(userId)
})

describe("create placements", () => {

    const payload = {
        season: "Season 22",
        role: "Tank",
        sr: 1000
    }

    test("refuse invalid placements", async () => {
        const response = await request(app.callback()).post("/users/test/placements")
            .set("Authorization", "Bearer " + token).send({
                season: "invalid",
                role: "invalid",
                sr: "invalid"
            })

        expect(response.status).toBe(422)
    })

    test("refuse placement without placement games", async () => {
        const response = await request(app.callback()).post("/users/test/placements")
            .set("Authorization", "Bearer " + token).send(payload)

        expect(response.status).toBe(400)
    })

    test("create placement game", async () => {
        await new GameModel({
            season: "Season 22", role: "Tank", outcome: "Victory",
            date: new Date(10), map: "Ilios", user: userId
        }).save()

        const response = await request(app.callback()).post("/users/test/placements")
            .set("Authorization", "Bearer " + token).send(payload)

        expect(response.status).toBe(201)
        expect(new Date(response.body.date).getTime()).toBeGreaterThan(new Date(10).getTime())
    })

    test("refuse multiple placement", async () => {
        const response = await request(app.callback()).post("/users/test/placements")
            .set("Authorization", "Bearer " + token).send(payload)

        expect(response.status).toBe(409)
    })

    test("modify first ranked game outcome", async () => {
        await PlacementModel.deleteOne({})

        await new GameModel({
            season: "Season 22", role: "Tank", sr: 900, outcome: "Victory",
            date: new Date(20), map: "Busan", user: userId
        }).save()

        const response = await request(app.callback()).post("/users/test/placements")
            .set("Authorization", "Bearer " + token).send(payload)

        const game = await GameModel.findOne({ sr: 900 }).exec()

        expect(response.status).toBe(201)
        expect(game?.outcome).toBe("Defeat")
    })
})

describe("read placements", () => {

    test("don't read non-existing placement", async () => {
        await new GameModel({
            season: "Season 1", outcome: "Draw", role: "Any", user: userId, map: "Busan"
        }).save()
        const placement = await new PlacementModel({
            season: "Season 1", sr: 100, role: "Any", user: userId
        }).save()
        await placement.remove()

        const response = await request(app.callback())
            .get("/users/test/placements/" + placement._id)
        expect(response.status).toBe(404)
    })

    test("read existing placement", async () => {
        const placement = await PlacementModel.findOne().exec()
        const response = await request(app.callback())
            .get("/users/test/placements/" + placement?._id)

        const res = response.body
        res.date = new Date(res.date)
        res.id = res._id
        delete res.id

        expect(response.status).toBe(200)
        expect(placement).toMatchObject(res)
    })

    test("read all placements", async () => {
        const count = await PlacementModel.countDocuments().exec()
        const response = await request(app.callback()).get("/users/test/placements")

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(count)
    })

    test("read placements from specific season", async () => {
        await new PlacementModel({
            season: "Season 1", sr: 100, role: "Any", user: userId
        }).save()
        const response = await request(app.callback()).get("/users/test/placements?season=Season 1")

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(1)
    })
})

describe("update placements", () => {

    test("refuse invalid placements", async () => {
        const placement = await PlacementModel.findOne().exec()
        const response = await request(app.callback())
            .patch("/users/test/placements/" + placement?._id)
            .set("Authorization", "Bearer " + token).send({ sr: "invalid" })

        expect(response.status).toBe(422)
    })

    test("update placement", async () => {
        const placement = await PlacementModel.findOne().exec()
        const response = await request(app.callback())
            .patch("/users/test/placements/" + placement?._id)
            .set("Authorization", "Bearer " + token).send({ sr: 1100 })

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({ sr: 1100 })
    })

    test("modify first ranked game outcome", async () => {
        const placement = await PlacementModel.findOne().exec()
        const response = await request(app.callback())
            .patch("/users/test/placements/" + placement?._id)
            .set("Authorization", "Bearer " + token).send({ sr: 900 })

        const game = await GameModel.findOne({ sr: 900 }).exec()

        expect(response.status).toBe(200)
        expect(game?.outcome).toBe("Draw")
    })
})
