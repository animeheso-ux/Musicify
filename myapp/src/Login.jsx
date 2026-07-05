import { useEffect } from "react"

import NavbarProp from "./navbar.jsx"
import "./Login.css"


import icon from "./assets/Icon.png"

function LoginPage({ToMain,ToSign}) {

    async function VerifyToken() {
        const Token = localStorage.getItem("Token")

        if (!Token) {
            return
        }

        const response = await fetch("/GetToken",{
            headers : {
                "authorization" : `Bearer ${Token}`,
                "Content-Type" : "application/json"
            }
        })

        const data = await response.json()

            if (data.status == "success") {
                ToMain()
            }
    }

     async function  Login(params) {
            const usernameText = document.getElementById("usernameText")?.value
            const PasswordText = document.getElementById("passwordText")?.value

          
    
            if (usernameText.length == 0 || PasswordText.length == 0) {
                alert("user or password cannot be empty")
                return
            }
    

    
            const response = await fetch("Login",{
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify({username : usernameText,password : PasswordText})
            })
    
            const data = await response.json()
    
            alert(data.message)
    
            if (data.message == "success") {
                localStorage.setItem("Token",data.Token)
                ToMain()
            }
        }



        useEffect(()=> {
            VerifyToken()
        },[])






    return (
        <div>
            <NavbarProp></NavbarProp>


            <div className="LoginContainer">
                            <h1 className="MainHeader">Download music that lifts the soul!</h1>
                <h2 className="MainHeader">Welcome!</h2>
                <textarea id="usernameText" placeholder="Username:"></textarea>
                 <textarea id="passwordText" placeholder="Password:"></textarea>

                 <button className="LoginButton" onClick={Login}>Login</button>
                 <a href="#" onClick={ToSign}>Sign in</a>


                 
            </div>




        </div>
    )
}


export default LoginPage