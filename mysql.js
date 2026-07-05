import express from "express"
import mysql from "mysql2"
import bcrypt  from "bcrypt"
import jsonwebtoken from "jsonwebtoken"
import "dotenv/config"

const router = express.Router()




export const database = mysql.createConnection({
host: 'localhost',
user: 'root',
password: process.env.DB_PASSWORD,
database: 'music_app'

})


database.connect((err)=> {
    if (err) {
        throw err
    }


    console.log("DB CONNECTED!")
})

router.post("/CreateAccount",(req,res)=> {
    const {email,username,password} = req.body

    database.query("SELECT * FROM users WHERE username = ? OR email = ? ",[username,email],(err,results)=> {
        if (err) {
            throw err
        }

        if (results.length > 0) {
            res.json({message : "Username or email has been taken!"})
            return
        }

        const hashed = bcrypt.hashSync(password,10)


        database.query("INSERT INTO users (username,email,password) VALUES(?,?,?)",[username,email,hashed],(err,results)=> {
            if (err) {
                throw err
            }

            res.json({message : "success"})
        })

    })
})

router.post("/Login",(req,res)=> {
    const {username,password} = req.body


    database.query("SELECT * FROM users WHERE username = ?",[username],(err,results)=> {
        if (err) {
            throw err
        }

        if (results.length == 0) {
            res.json({message : "account doesn't exist!"})
            return
        }

        const user = results[0]
        const IsValid = bcrypt.compareSync(password,user.password)


        if (IsValid) {
            const payload = {
                name : username,
                id : user.id,
                email : user.email,
            }
            
            const token = jsonwebtoken.sign(payload,process.env.JWT_SECRET || "YOUR_SECRET_KEY",{expiresIn : "1hr"})


            res.json({message : "success",Token : token})
        }else {
            res.json({message : "incorrect password"})
        }

    })

})


const VerifyToken = (req,res,next)=> {
    const header = req.headers["authorization"]
    const Token = header && header.split(" ")[1]

    if (!Token) {
        return res.status(401).json({status : "Token not found"})
    }

    jsonwebtoken.verify(Token,process.env.JWT_SECRET,(err,decoded)=> {
        if (err) {
            return res.status(403).json({status : "Token expired or invalid"})
        }
        req.Token = decoded
        next()
    })

}


router.get("/GetToken",VerifyToken,(req,res)=> {
    res.json({status : "success",Token : req.Token})
})







export default router