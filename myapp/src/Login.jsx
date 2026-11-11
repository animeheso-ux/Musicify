import { useEffect } from "react"

import "./Login.css"
import { useNavigate } from "react-router"


import icon from "./assets/Icon.png"

function LoginPage() {
    const navigate = useNavigate()

    async function VerifyToken() {

        const response = await fetch("/api/GetToken")

        const data = await response.json()

            if (data.status == "success") {
                navigate("/Home")
            }
    }

     async function  Login(e) {
        e.preventDefault()
            const usernameText = document.getElementById("usernameText")?.value
            const PasswordText = document.getElementById("passwordText")?.value

          
    
            if (usernameText.length == 0 || PasswordText.length == 0) {
                alert("user or password cannot be empty")
                return
            }
    

    
            const response = await fetch("/api/Login",{
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify({username : usernameText,password : PasswordText})
            })
    
            const data = await response.json()
    
            alert(data.message)
    
            if (data.message == "success") {
                navigate("/Home")
            }
        }



        useEffect(()=> {
            VerifyToken()
        },[])






    return (
        <div>

            <form onSubmit={(e) => {Login(e)}}>
            <div className="LoginContainer">
                            <h1 className="MainHeader">Download music that lifts the soul!</h1>
                <h2 className="MainHeader">Welcome!</h2>
                <input id="usernameText" type="text" placeholder="Username:"></input>
                 <input type="password" id="passwordText" placeholder="Password:"></input>

                 <input type="submit" className="LoginButton"  ></input>
                 <a href="/Sign" >Sign up!</a>


                 
            </div>
            </form>




        </div>
    )
}


export default LoginPage