import { Game } from "../models/game"

export function getGameVersion(game: Game): number {
    return game.season.startsWith("OW2") ? 2 : 1
}
