import express from "express"
import { rateLimit } from "express-rate-limit"
import {exec} from "node:child_process"
import http from "http"
import path from "path"
import { fileURLToPath } from "node:url"

import { database } from "./mysql.js"
import mysqlroute from "./mysql.js"
import MusicRoute from "./music.js"


const app = express()
const server = http.createServer(app)
const PORT = 3000

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // send RateLimit headers
  legacyHeaders: false, // disable X-RateLimit headers
})

app.use(express.json())
app.use("/MusicFolder",express.static("MusicFolder"))
app.use(express.static(path.join(dirname,"myapp/dist")))

app.use(mysqlroute)
app.use(MusicRoute)
app.use(limiter)




app.get("/{*path}",(req,res)=> {
    res.sendFile(path.join(dirname,"myapp/dist","index.html"))
})



exec("cd myapp && npm run build",(err)=> {
    if (err) {
        throw err
    }

    console.log("REACT LOADED")
})


server.listen(PORT,()=> console.log("port connected"),exec(`start http://localhost:${PORT}`))


