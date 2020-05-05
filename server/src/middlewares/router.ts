import Router from "koa-router"
import UserController from "../controllers/user"
import PlacementController from "../controllers/placement"
import RankController from "../controllers/rank"
import RankedController from "../controllers/ranked"
import SeasonController from "../controllers/season"
import LoginController from "../controllers/login"
import basicAuth from "./basic-auth"
import jwtAuth from "./jwt-auth"
import restrict from "./restrict"

export default new Router()
    .get("/login", basicAuth(), LoginController.login)

    .param("name", UserController.getUser)
    .post("/users", UserController.create)
    .get("/users/:name", UserController.read)
    .get("/users/:name/icon", UserController.readIcon)

    .param("season", SeasonController.getSeason)
    .get("/seasons", SeasonController.list)

    .get("/users/:name/:season/placements", PlacementController.readAll)
    .post("/users/:name/:season/placements", jwtAuth(), restrict(), PlacementController.create)
    .patch("/users/:name/:season/placements/:id", jwtAuth(), restrict(), PlacementController.update)
    .delete("/users/:name/:season/placements/:id", jwtAuth(), restrict(), PlacementController.delete)

    .get("/users/:name/:season/games", RankedController.readAll)
    .post("/users/:name/:season/games", jwtAuth(), restrict(), RankedController.create)
    .patch("/users/:name/:season/games/:id", jwtAuth(), restrict(), RankedController.update)
    .delete("/users/:name/:season/games/:id", jwtAuth(), restrict(), RankedController.delete)

    .get("/users/:name/:season/ranks", RankController.readAll)
    .post("/users/:name/:season/ranks", jwtAuth(), restrict(), RankController.create)
    .patch("/users/:name/:season/ranks/:id", jwtAuth(), restrict(), RankController.update)
