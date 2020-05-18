import request from "supertest"
import app from "../src/app"
import { Season } from "../src/models/event"

describe("read seasons", () => {

    test("get seasons list", async () => {
        const response = await request(app.callback()).get("/seasons")
        expect(response.status).toBe(200)
        expect(response.body.length).toBe(Object.keys(Season).length)
    })
})
