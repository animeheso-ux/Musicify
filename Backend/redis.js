import { createClient } from "redis";
import "dotenv/config"
let Redis


export async function GetRedisClient() {
    if (!Redis) {
    Redis = createClient({
        url : process.env.REDIS_URL
    })


    Redis.on("error",err => console.log(err))


    await Redis.connect()

    console.log("REDIS CONNECTED!")


    }


        return Redis

}