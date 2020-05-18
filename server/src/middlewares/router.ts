import Router from "koa-router"
import UserController from "../controllers/user"
import GameController from "../controllers/game"
import SeasonController from "../controllers/season"
import LoginController from "../controllers/login"
import basicAuth from "./basic-auth"
import jwtAuth from "./jwt-auth"
import restrict from "./restrict"
import PlacementController from "../controllers/placement"

export default new Router()
    .get("/login", basicAuth(), LoginController.login)

    .get("/seasons", SeasonController.list)

    .param("name", UserController.getUser)
    .post("/users", UserController.create)
    .get("/users/:name", UserController.read)
    .delete("/users/:name", jwtAuth(), restrict(), UserController.delete)

    .param("game", GameController.getGame)
    .get("/users/:name/games", GameController.readAll)
    .post("/users/:name/games", jwtAuth(), restrict(), GameController.create)
    .get("/users/:name/games/:game", GameController.read)
    .patch("/users/:name/games/:game", jwtAuth(), restrict(), GameController.update)
    .delete("/users/:name/games/:game", jwtAuth(), restrict(), GameController.delete)

    .param("placement", PlacementController.getPlacement)
    .get("/users/:name/placements", PlacementController.readAll)
    .post("/users/:name/placements", jwtAuth(), restrict(), PlacementController.create)
    .get("/users/:name/placements/:placement", PlacementController.read)
    .patch("/users/:name/placements/:placement", jwtAuth(), restrict(), PlacementController.update)
