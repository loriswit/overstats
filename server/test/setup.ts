import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"

let db: MongoMemoryServer

beforeAll(async () => {
    db = await MongoMemoryServer.create()
    await mongoose.connect(db.getUri())
})

afterAll(async () => {
    await mongoose.disconnect()
    await db.stop()
})
