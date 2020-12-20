import request from "supertest"
import bcrypt from "bcrypt"
import app from "../src/app"
import UserModel from "../src/models/user"

describe("login", () => {

    let token: string
    let newToken: string

    test("refuse missing basic-auth", async () => {
        const response = await request(app.callback()).get("/login")
        expect(response.status).toBe(401)
    })

    test("refuse non-existing username", async () => {
        const response = await request(app.callback()).get("/login")
            .auth(" tEsT ", "strong-password")

        expect(response.status).toBe(401)
    })

    test("refuse wrong password", async () => {
        // create new user
        const pass = await bcrypt.hash("strong-password", 10)
        await new UserModel({ name: "Test", pass }).save()

        const response = await request(app.callback()).get("/login")
            .auth(" tEsT ", "wrong-password")

        expect(response.status).toBe(401)
    })

    test("log user in", async () => {
        const response = await request(app.callback()).get("/login")
            .auth("Test", "strong-password")

        token = response.body.token

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ username: "Test", token: expect.any(String), expires: expect.any(String) })
        expect(Date.parse(response.body.expires)).not.toBeNaN()
    })

    test("get new token", async () => {
        const response = await request(app.callback()).get("/token")
            .set("Authorization", "Bearer " + token)

        newToken = response.body.token

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ token: expect.any(String), expires: expect.any(String) })
        expect(Date.parse(response.body.expires)).not.toBeNaN()
    })

    test("accept token", async () => {
        const payload = { season: "Season 1", role: "Tank", outcome: "Draw", map: "Oasis" }

        const response1 = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send(payload)

        const response2 = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + newToken).send(payload)

        expect(response1.status).toBe(201)
        expect(response1.body).toMatchObject(payload)

        expect(response2.status).toBe(201)
        expect(response2.body).toMatchObject(payload)
    })
})
