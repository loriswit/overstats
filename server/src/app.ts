import Koa from "koa"
import logger from "koa-logger"
import cors from "@koa/cors"
import bodyParser from "koa-bodyparser"

import errorHandler from "./middlewares/error-handler"
import router from "./middlewares/router"

const app = new Koa()

if (process.env.NODE_ENV != "test") {
    app.use(logger())
}

export default app.use(errorHandler())
    .use(cors())
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())
