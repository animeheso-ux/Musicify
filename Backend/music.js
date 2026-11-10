import express from "express"
import ffmpegPath from "ffmpeg-static"
import ytDlpExec from "yt-dlp-exec"
import { fileURLToPath } from "node:url"
import { GetRedisClient } from "./redis.js"

import { database } from "./mysql.js"
import { VerifyToken } from "./mysql.js"


import path from "path"

const router = express.Router()


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)


const destination = path.join(dirname, "MusicFolder")




router.post("/DownloadSong", async (req, res) => {
    const { user_id, playlist_id } = req.body

    try {
        const { Link } = req.body
        console.log(Link)

        const info = await ytDlpExec(Link, {
            dumpSingleJson: true,
            skipDownload: true
        })

        database.query("SELECT * FROM songs WHERE song_id = $1", [info.id], async (err, results) => {
            if (err) {
                throw err
            }

            if (results.rows.length > 0) {

                const SONG_ID = results.rows[0].id

                database.query("SELECT * FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2", [playlist_id, SONG_ID], (err, results) => {
                    if (err) {
                        throw err
                    }

                    if (results.rows.length == 0) {
                        database.query("INSERT INTO playlist_songs (playlist_id, song_id) VALUES ($1, $2)", [playlist_id, SONG_ID], (err, results) => {
                            if (err) {
                                throw err
                            }
                        })
                    }
                })

                database.query("SELECT * FROM usersongs WHERE user_id = $1 AND song_id = $2", [user_id, SONG_ID], (err, results) => {
                    if (err) {
                        throw err
                    }

                    if (results.rows.length == 0) {
                        database.query("INSERT INTO usersongs (user_id, song_id) VALUES ($1, $2)", [user_id, SONG_ID], (err, results) => {
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

            database.query("INSERT INTO songs (user_id, title, filename, song_id) VALUES ($1, $2, $3, $4) RETURNING id", [user_id, info.title, videofile, info.id], (err, results) => {
                if (err) {
                    throw err
                }

                const SONG_ID = results.rows[0].id

                database.query("SELECT * FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2", [playlist_id, SONG_ID], (err, results) => {
                    if (err) {
                        throw err
                    }

                    if (results.rows.length == 0) {
                        database.query("INSERT INTO playlist_songs (playlist_id, song_id) VALUES ($1, $2)", [playlist_id, SONG_ID], (err, results) => {
                            if (err) {
                                throw err
                            }
                        })
                    }
                })

                database.query("INSERT INTO usersongs (user_id, song_id) VALUES ($1, $2)", [user_id, SONG_ID], (err, results) => {
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


router.post("/DeleteSong", async (req, res) => {
    const { song_id, user_id, playlist_id } = req.body
    const cache = await GetRedisClient()

    console.log(song_id)

    const session = await cache.get(`user${user_id}`)

    database.query("DELETE FROM usersongs WHERE user_id = $1 AND song_id = $2", [user_id, song_id], async (err, results) => {
        if (err) {
            throw err
        }

        if (session) {
            await cache.del(`user${user_id}`)
        }

        database.query("DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2", [playlist_id, song_id], async (err, results) => {
            if (err) {
                throw err
            }

            res.status(200).json({ status: "success" })
        })
    })
})


router.get("/GetSongs/:id", VerifyToken, (req, res) => {
    const id = req.params.id

    if (req.Token.id !== id) { return res.status(401).json({ status: "unauthorised" }) }

    database.query("SELECT S.user_id, S.filename, S.title, S.id FROM songs S INNER JOIN usersongs US ON S.id = US.song_id WHERE US.user_id = $1", [id], (err, results) => {
        if (err) {
            throw err
        }

        res.json({ result: results.rows })
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