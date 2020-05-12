import Koa from "koa"
import logger from "koa-logger"
import cors from "@koa/cors"
import bodyParser from "koa-bodyparser"
import mongoose from "mongoose"

import errorHandler from "./middlewares/error-handler"
import router from "./middlewares/router"

const app = new Koa()
    .use(logger())
    .use(errorHandler())
    .use(cors())
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())

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

if (process.env.NODE_ENV == "development") {
    mongoose.set("debug", true)
}
