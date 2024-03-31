import Database from "bun:sqlite";
import { migrate,getMigrations } from "bun-sqlite-migrations";

export const createDb=()=>{
console.log("creating database");

    const db= new Database("elysia-rest-api.db")
    migrate(db,getMigrations('./migrations'))    
    return db
}
