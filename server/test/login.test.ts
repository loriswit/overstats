import request from "supertest"
import bcrypt from "bcrypt"
import app from "../src/app"
import UserModel from "../src/models/user"

describe("login", () => {

    let token: string

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

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ username: "Test", token: expect.any(String) })

        token = response.body.token
    })

    test("accept token", async () => {
        const payload = { season: "Season 1", role: "Tank", outcome: "Draw", map: "Oasis" }
        const response = await request(app.callback()).post("/users/test/games")
            .set("Authorization", "Bearer " + token).send(payload)

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject(payload)
    })
})
