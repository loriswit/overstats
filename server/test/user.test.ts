import request from "supertest"
import app from "../src/app"
import { makeTokenFor } from "./helpers"

describe("create users", () => {

    test("refuse empty username", async () => {
        const response = await request(app.callback()).post("/users")
            .send({ name: "", pass: "strong-password" })

        expect(response.status).toBe(422)
    })

    test("refuse short passwords", async () => {
        const response = await request(app.callback()).post("/users")
            .send({ name: "test", pass: "123" })

        expect(response.status).toBe(422)
    })

    test("refuse invalid BattleTag", async () => {
        const response = await request(app.callback()).post("/users")
            .send({ name: "test", pass: "strong-password", battleTag: "test-1234" })

        expect(response.status).toBe(422)
    })

    test("create new user", async () => {
        const response = await request(app.callback()).post("/users")
            .send({ name: " Test ", pass: "strong-password" })

        expect(response.status).toBe(201)
        expect(response.body).toEqual({ name: "Test" })
    })

    test("create new user with BattleTag", async () => {
        const response = await request(app.callback()).post("/users")
            .send({ name: " TestBT ", pass: "strong-password", battleTag: "Test#1234" })

        expect(response.status).toBe(201)
        expect(response.body).toEqual({ battleTag: "Test#1234", name: "TestBT" })
    })

    test("refuse new user with same name", async () => {
        const response = await request(app.callback()).post("/users")
            .send({ name: " tEsT ", pass: "good-password" })

        expect(response.status).toBe(409)
    })
})

describe("read users", () => {
    test("don't read non-existing user", async () => {
        const response = await request(app.callback()).get("/users/invalid")
        expect(response.status).toBe(404)
    })

    test("read existing user", async () => {
        const response = await request(app.callback()).get("/users/test")
        expect(response.status).toBe(200)
        expect(response.body).toEqual({ name: "Test" })
    })

    test("read existing user with BattleTag", async () => {
        const response = await request(app.callback()).get("/users/testbt")
        expect(response.status).toBe(200)
        expect(response.body).toEqual({ battleTag: "Test#1234", name: "TestBT" })
    })
})

describe("delete users", () => {

    let token: string

    beforeAll(async () => {
        token = await makeTokenFor("Test")
    })

    test("don't delete non-existing user", async () => {
        const response = await request(app.callback()).delete("/users/invalid")
        expect(response.status).toBe(404)
    })

    test("refuse unauthenticated requests", async () => {
        const response = await request(app.callback()).delete("/users/test")
        expect(response.status).toBe(401)
    })

    test("don't delete someone else's user", async () => {
        const response = await request(app.callback()).delete("/users/testbt")
            .set("Authorization", "Bearer " + token)

        expect(response.status).toBe(403)
    })

    test("delete existing user", async () => {
        const response = await request(app.callback()).delete("/users/test")
            .set("Authorization", "Bearer " + token)

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ name: "Test" })
    })

    test("don't read deleted user", async () => {
        const response = await request(app.callback()).get("/users/test")
        expect(response.status).toBe(404)
    })
})
