import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"

const db = new MongoMemoryServer()

beforeAll(async () => {
    const uri = await db.getUri()
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    })
})

afterAll(async () => {
    await mongoose.disconnect()
    await db.stop()
})
