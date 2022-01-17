import { MongoServerError } from "mongodb"

export function isDbError(err: unknown): err is MongoServerError {
    return err instanceof Error && err.name === "MongoServerError"
}
