import express from "express"
import ffmpegPath from "ffmpeg-static"
import ytDlpExec from "yt-dlp-exec"
import { fileURLToPath } from "node:url"


import { database } from "./mysql.js"

import path from "path"

const router = express.Router()


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)


const destination = path.join(dirname, "MusicFolder")



router.post("/DownloadSong", async (req, res) => {
    const {user_id, playlist_id } = req.body



    try {
        const { Link } = req.body
        console.log(Link)

        const info = await ytDlpExec(Link, {
            dumpSingleJson: true,
            skipDownload: true
        })

        database.query("SELECT * FROM songs WHERE song_id = ?", [info.id], async (err, results) => {
            if (err) {
                throw err
            }





            if (results.length > 0) {

                const SONG_ID = results[0].id

                database.query("SELECT * FROM playlist_songs WHERE playlist_id = ? AND song_id = ?", [playlist_id, SONG_ID], (err, results) => {
                    if (err) {
                        throw err
                    }

                    if (results.length == 0) {
                        database.query("INSERT INTO playlist_songs (playlist_id,song_id) VALUES(?,?)", [playlist_id, SONG_ID], (err, results) => {
                            if (err) {
                                throw err
                            }

                        })
                    }
                })



                database.query("SELECT * FROM usersongs WHERE user_id = ? AND song_id = ?", [user_id, SONG_ID], (err, results) => {
                    if (err) {
                        throw err
                    }




                    if (results.length == 0) {

                        database.query("INSERT INTO usersongs (user_id,song_id) VALUES(?,?)", [user_id, SONG_ID], (err, results) => {
                            if (err) {
                                throw err
                            }

                        })
                    }


                })




                res.json({ message: "success" })
                return
            }


            console.log("cannot find track..downloading...")
            const videofile = `${info.id}.mp3`

            await ytDlpExec(Link, {
                extractAudio: true,
                audioFormat: 'mp3',
                ffmpegLocation: ffmpegPath,
                output: path.join(destination, "%(id)s.%(ext)s")
            })









            database.query("INSERT INTO songs (user_id,title,filename,song_id) VALUES(?,?,?,?) ", [user_id, info.title, videofile, info.id], (err, results) => {
                if (err) {
                    throw err
                }

                const SONG_ID = results.insertId


                database.query("SELECT * FROM playlist_songs WHERE playlist_id = ? AND song_id = ?", [playlist_id, SONG_ID], (err, results) => {
                    if (err) {
                        throw err
                    }

                    if (results.length == 0) {
                        database.query("INSERT INTO playlist_songs (playlist_id,song_id) VALUES(?,?)", [playlist_id, SONG_ID], (err, results) => {
                            if (err) {
                                throw err
                            }

                        })
                    }
                })


                database.query("INSERT INTO usersongs (user_id,song_id) VALUES(?,?)", [user_id, SONG_ID], (err, results) => {
                    if (err) {
                        throw err
                    }


                })




            })



            res.json({ message: "success" })
        })





    }



    catch {
        res.json({ message: "Download error, Please try again!" })
    }


})


router.post("/DeleteSong", (req, res) => {
    const { song_id, user_id } = req.body

    console.log(song_id)


    database.query("DELETE FROM usersongs WHERE user_id = ? AND song_id = ?", [user_id, song_id], (err, results) => {
        if (err) {
            throw err
        }
    })


    database.query("SELECT S.user_id, S.filename, S.title,S.id FROM songs S INNER JOIN usersongs US ON S.id = US.song_id WHERE US.user_id = ?", [user_id], (err, results) => {
        if (err) {
            throw err
        }

        res.json({ result: results })
    })



})


router.get("/GetSongs/:id", (req, res) => {
    const id = req.params.id


    database.query("SELECT S.user_id, S.filename, S.title,S.id FROM songs S INNER JOIN usersongs US ON S.id = US.song_id WHERE US.user_id = ?", [id], (err, results) => {
        if (err) {
            throw err
        }

        res.json({ result: results })
    })


})


router.post("/Shuffle", (req, res) => {
    const { musiclist } = req.body

    const n = musiclist.length;

    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [musiclist[i], musiclist[j]] = [musiclist[j], musiclist[i]];
    }

    res.json({ result: musiclist })
})



export default router