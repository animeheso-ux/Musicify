import express from "express"
import {database} from "./mysql.js"
import { GetRedisClient } from "./redis.js"
import { VerifyToken } from "./mysql.js"
const PlaylistRouter = express.Router()






PlaylistRouter.get("/GetPlaylist/:id",VerifyToken,async(req,res)=> {
    const cache = await GetRedisClient()
    const user_id = req.params.id
    console.log(req.Token.id,user_id)
    if (req.Token.id != user_id) {return res.status(401).json({status : "unauthorised"})}


    const session = await cache.get(`user${user_id}`)

    if (session) {
            return res.status(200).json({result : JSON.parse(session)})

    }


           database.query("SELECT * FROM playlist WHERE user_id = ?",[user_id],async(err,results)=> {
        if (err) {
            throw err
        }

        await cache.set(`user${user_id}`,JSON.stringify(results),{ EX : 300})

        return res.status(200).json({result : results})
    })


})


PlaylistRouter.post("/CreatePlaylist",async(req,res)=> {
    const cache = await GetRedisClient()
    const {user_id} = req.body


    const session = await cache.get(`user${user_id}`)

    if (session) {
        await cache.del(`user${user_id}`)
    }

    database.query("SELECT * FROM playlist WHERE user_id = ?",[user_id],(err,results)=> {
        if (err) {
                        return res.status(500).json({status : "error"})
        }

            database.query("INSERT INTO playlist (user_id,name) VALUES(?,?)",[user_id,"playlist " + results.length],(err,result1)=> {
                if (err) {
                    throw err
                }

                return res.status(200).json({status : "success"})
            })
    })

})


PlaylistRouter.get("/LoadPlaylist/:id",(req,res)=> {
    const playlist_id = req.params.id
    database.query("SELECT S.user_id, S.filename, S.title,S.id FROM songs S INNER JOIN playlist_songs PS ON S.id = PS.song_id WHERE PS.playlist_id = ?",[playlist_id],(err,results)=> {
        if (err) {
                        return res.status(500).json({status : "error"})
        }

        res.status(200).json({result : results})
    })
})

PlaylistRouter.post("/editPlaylist",async(req,res)=> {
    const {name,new_name,user_id} = req.body
    const cache = await GetRedisClient()

    database.query("UPDATE playlist SET name = ? WHERE name = ? AND user_id = ?",[new_name,name,user_id],async(err,results)=> {
        if (err) {
            return res.status(500).json({status : "error"})
        }

        const session = await cache.get(`user${user_id}`)

        if (session) {
            cache.del(`user${user_id}`)
        }


        res.status(200).json({status : "success"})
    })
})







export default PlaylistRouter