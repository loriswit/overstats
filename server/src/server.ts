import mongoose from "mongoose"
import app from "./app"

if (process.env.NODE_ENV == "development") {
    mongoose.set("debug", true)
}

const uri = process.env.MONGODB_URI ?? "mongodb://localhost/overstats"
mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => {
        const port = (process.env.PORT ?? 3000) as number
        app.listen(port)

        console.info("Listening on port " + port)
    })
    .catch(err => {
        console.error(err)
        process.exit(1)
    })
