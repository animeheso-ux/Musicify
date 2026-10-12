import express from "express"
import {database} from "./mysql.js"


const PlaylistRouter = express.Router()






PlaylistRouter.get("/GetPlaylist/:id",(req,res)=> {
    const user_id = req.params.id

    database.query("SELECT * FROM playlist WHERE user_id = ?",[user_id],(err,results)=> {
        if (err) {
            throw err
        }

        res.status(200).json({result : results})
    })
})


PlaylistRouter.post("/CreatePlaylist",(req,res)=> {
    const {user_id} = req.body

    database.query("SELECT * FROM playlist WHERE user_id = ?",[user_id],(err,results)=> {
        if (err) {
            throw err
        }

            database.query("INSERT INTO playlist (user_id,name) VALUES(?,?)",[user_id,"playlist " + results.length],(err,result1)=> {
                if (err) {
                    throw err
                }

                res.status(200).json({status : "success"})
            })
    })

})


PlaylistRouter.get("/LoadPlaylist/:id",(req,res)=> {
    const playlist_id = req.params.id
    database.query("SELECT S.user_id, S.filename, S.title,S.id FROM songs S INNER JOIN playlist_songs PS ON S.id = PS.song_id WHERE PS.playlist_id = ?",[playlist_id],(err,results)=> {
        if (err) {
            throw err
        }

        res.status(200).json({result : results})
    })
})









export default PlaylistRouter