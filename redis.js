import { createClient } from "redis";

let Redis


export async function GetRedisClient() {
    if (!Redis) {
    Redis = createClient()


    Redis.on("error",err => console.log(err))


    await Redis.connect()

    console.log("REDIS CONNECTED!")


    }


        return Redis

}