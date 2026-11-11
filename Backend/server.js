import express from "express"
import { rateLimit } from "express-rate-limit"
import {exec} from "node:child_process"
import http from "http"
import path from "path"
import { fileURLToPath } from "node:url"

import mysqlroute from "./mysql.js"
import MusicRoute from "./music.js"
import PlaylistRoute from "./playlist.js"
import cookieParser from "cookie-parser"

import cors from "cors"
import "dotenv/config"

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3000

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)


app.use(express.json())
//app.use("/MusicFolder",express.static("MusicFolder"))
//app.use(express.static(path.join(dirname,"myapp/dist")))
app.use(cookieParser())


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // send RateLimit headers
  legacyHeaders: false, // disable X-RateLimit headers
})


const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:3000",
    "http://localhost:5173"
].filter(Boolean)

// 1. CORS
app.use(cors({
    origin: allowedOrigins,
    credentials: true
    
}));

// 2. CSRF Origin validation
app.use((req, res, next) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        const origin = req.get("Origin");

        if (!allowedOrigins.includes(origin)) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
    }

    next();
});







app.use(mysqlroute)
app.use(MusicRoute)
app.use(PlaylistRoute)
app.use(limiter)




// app.get("/{*path}",(req,res)=> {
//     res.sendFile(path.join(dirname,"myapp/dist","index.html"))
// })



// exec("cd myapp && npm run build",(err)=> {
//     if (err) {
//         throw err
//     }

//     console.log("REACT LOADED")
// })




server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
});


