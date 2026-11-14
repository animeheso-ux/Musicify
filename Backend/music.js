import express from "express"
import ffmpegPath from "ffmpeg-static"
import ytDlpExec from "yt-dlp-exec"
import { fileURLToPath } from "node:url"
import { GetRedisClient } from "./redis.js"

import { database } from "./mysql.js"
import { VerifyToken } from "./mysql.js"


import path from "path"

import supabase from "./superbase.js"
import fs from "fs/promises";
import os from "os";
import multer from "multer"



const router = express.Router()


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
//const destination = path.join(dirname, "MusicFolder")

//multer diskstorage is for my own local file system
//multer memorystorage is for online as I can get the buff of the folder and send it into supabase

const filefilter = (req, file, cb) => {

    const ismp3 = path.extname(file.originalname).toLowerCase() == ".mp3"


    const validmime = file.mimetype == 'audio/mpeg' || file.mimetype === 'audio/mp3';


    if (ismp3 && validmime) {
        cb(null, true)
    } else {
        cb(new Error("only .mp3 files are allowed!"), false)
    }
}

const upload = multer({ storage: multer.memoryStorage(), limits: 50 * 1024 * 1024, fileFilter: filefilter })





// router.get("/test-upload", async (req, res) => {
//     try {
//         const file = await fs.readFile("./test.mp3");

//         const { data, error } = await supabase
//             .storage
//             .from("Music")
//             .upload("test.mp3", file, {
//                 contentType: "audio/mpeg"
//             });

//         if (error) throw error;

//         res.json({
//             message: "Upload successful!",
//             data
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: error.message });
//     }
// });


router.post("/uploadSongs", VerifyToken, upload.single("file"), async (req, res) => {

    let uploadedPath;
    let songId;

    try {
        // 1. Validate user
        if (!req.Token?.id) {
            return res.status(403).json({
                status: "unauthorised"
            });
        }

        const { playlist_id } = req.body;
        const file = req.file;
        const user_id = req.Token.id;

        // 2. Check required information
        if (!playlist_id || !file) {
            return res.status(400).json({
                message: "Missing required information"
            });
        }

        // 3. Validate MP3
        if (
            file.mimetype !== "audio/mpeg" ||
            path.extname(file.originalname).toLowerCase() !== ".mp3"
        ) {
            return res.status(400).json({
                message: "Only MP3 files are allowed"
            });
        }

        // 4. Generate filename
        const title = path.parse(file.originalname).name;
        const filename = `${user_id}/${Date.now()}.mp3`;





        // 5. Upload to Supabase
        const { data, error } = await supabase
            .storage
            .from("Music")
            .upload(filename, file.buffer, {
                contentType: "audio/mpeg",
                upsert: false
            });

        if (error) throw error;

        uploadedPath = data.path;

        const existingSong = await database.query(
            "SELECT * FROM songs WHERE title = $1",
            [title]
        );



        if (existingSong.rows.length > 0 ) {
                    songId = existingSong.rows[0].id;
                    
        }else {
                    const insertedSong = await database.query(
            `INSERT INTO songs
            (user_id, title, filename,song_id)
            VALUES ($1, $2, $3,$4)
            RETURNING id`,
            [user_id, title, data.path, path.parse(data.path).name]
        );

         songId = insertedSong.rows[0].id;
        }

        // 6. Save song metadata


        // 7. Add song to playlist if not already there
        await database.query(
            `INSERT INTO playlist_songs (playlist_id, song_id)
             SELECT $1, $2
             WHERE NOT EXISTS (
                 SELECT 1 FROM playlist_songs
                 WHERE playlist_id = $1 AND song_id = $2
             )`,
            [playlist_id, songId]
        );

        // 8. Add song to user library if not already there
        await database.query(
            `INSERT INTO usersongs (user_id, song_id)
             SELECT $1, $2
             WHERE NOT EXISTS (
                 SELECT 1 FROM usersongs
                 WHERE user_id = $1 AND song_id = $2
             )`,
            [user_id, songId]
        );

        res.status(200).json({
            message: "Upload successful",
            song_id: songId
        });

    } catch (err) {
        console.error("UploadSongs error:", err);

        // 9. Remove uploaded file if something went wrong
        if (uploadedPath) {
            const { error: removeError } = await supabase
                .storage
                .from("Music")
                .remove([uploadedPath]);

            if (removeError) {
                console.error("Supabase cleanup failed:", removeError);
            }
        }

        res.status(500).json({
            message: "Upload error, please try again!"
        });
    }
});

////////////////


router.post("/DownloadSong", async (req, res) => {
    const { user_id, playlist_id, Link } = req.body;

    let tempDir;
    let uploadedPath;

    try {
        if (!user_id || !playlist_id || !Link) {
            return res.status(400).json({
                message: "Missing required information"
            });
        }

        // 1. Validate YouTube URL
        let parsedUrl;

        try {
            parsedUrl = new URL(Link);
        } catch {
            return res.status(400).json({
                message: "Invalid YouTube URL"
            });
        }

        const allowedHosts = [
            "youtube.com",
            "www.youtube.com",
            "m.youtube.com",
            "youtu.be"
        ];

        if (
            !["https:", "http:"].includes(parsedUrl.protocol) ||
            !allowedHosts.includes(parsedUrl.hostname)
        ) {
            return res.status(400).json({
                message: "Only YouTube URLs are allowed"
            });
        }

        // 2. Get YouTube information
        const info = await ytDlpExec(Link, {
            dumpSingleJson: true,
            jsRuntimes: "node",
            remoteComponents: "ejs:github"
        });




        if (info.duration > 600) {
            return res.status(400).json({
                message: "Youtube video is too long!"
            });
        }

        // 3. Check if song already exists
        const existingSong = await database.query(
            "SELECT * FROM songs WHERE song_id = $1",
            [info.id]
        );

        let songId;

        if (existingSong.rows.length > 0) {
            songId = existingSong.rows[0].id;

        } else {
            console.log("Song not found. Downloading...");

            // 4. Create temporary directory
            tempDir = await fs.mkdtemp(
                path.join(os.tmpdir(), "musicify-")
            );

            // 5. Download MP3 temporarily
            await ytDlpExec(Link, {
                extractAudio: true,
                audioFormat: "mp3",
                ffmpegLocation: ffmpegPath,
                output: path.join(tempDir, "%(id)s.%(ext)s")
            });

            // 6. Read downloaded MP3
            const filePath = path.join(tempDir, `${info.id}.mp3`);
            const fileBuffer = await fs.readFile(filePath);

            // 7. Upload to Supabase Music bucket
            const storagePath = `${info.id}.mp3`;

            const { data, error } = await supabase
                .storage
                .from("Music")
                .upload(storagePath, fileBuffer, {
                    contentType: "audio/mpeg",
                    upsert: false
                });

            if (error) throw error;

            uploadedPath = data.path;

            // 8. Save song metadata
            const insertedSong = await database.query(
                `INSERT INTO songs
                (user_id, title, filename, song_id)
                VALUES ($1, $2, $3, $4)
                RETURNING id`,
                [user_id, info.title, data.path, info.id]
            );

            songId = insertedSong.rows[0].id;
        }

        // 9. Add song to playlist if not already there
        await database.query(
            `INSERT INTO playlist_songs (playlist_id, song_id)
             SELECT $1, $2
             WHERE NOT EXISTS (
                 SELECT 1 FROM playlist_songs
                 WHERE playlist_id = $1 AND song_id = $2
             )`,
            [playlist_id, songId]
        );

        // 10. Add song to user library if not already there
        await database.query(
            `INSERT INTO usersongs (user_id, song_id)
             SELECT $1, $2
             WHERE NOT EXISTS (
                 SELECT 1 FROM usersongs
                 WHERE user_id = $1 AND song_id = $2
             )`,
            [user_id, songId]
        );

        res.json({
            message: "success",
            song_id: songId
        });

    } catch (error) {
        console.error("DownloadSong error:", error);

        if (uploadedPath) {
            const { error: removeError } = await supabase
                .storage
                .from("Music")
                .remove([uploadedPath]);

            if (removeError) {
                console.error("Supabase cleanup failed:", removeError);
            }
        }

        res.status(500).json({
            message: "Download error, please try again!"
        });

    } finally {
        if (tempDir) {
            await fs.rm(tempDir, {
                recursive: true,
                force: true
            }).catch(console.error);
        }
    }
});




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

    if (req.Token.id !== parseInt(id)) { return res.status(401).json({ status: "unauthorised" }) }

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