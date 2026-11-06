
import "./Login.css"
import validator from "validator"
import { useNavigate } from "react-router"

function SignIn() {


    async function createaccount() {
        const emailText = document.getElementById("EmailText")?.value
        const usernameText = document.getElementById("usernameText")?.value
        const PasswordText = document.getElementById("passwordText")?.value
        const ConfrimText = document.getElementById("confrimText")?.value
        const isemail = validator.isEmail(emailText)

        if (isemail != true) {
            alert("Email not valid")
            return
        }

        if (usernameText.length == 0 || PasswordText.length == 0) {
            alert("user or password cannot be empty")
            return
        }

        if (PasswordText != ConfrimText) {
            alert("Fields do not match")
            return
        }

        const response = await fetch("/CreateAccount", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailText, username: usernameText, password: PasswordText })
        })

        const data = await response.json()

        alert(data.message)

        if (data.message == "success") {
            useNavigate("/Login")
        }
    }


    return (
        <div>

            <form onSubmit={(e) => {e.preventDefault(),createaccount}} >
                <div className="LoginContainer">
                    <h1>create account!</h1>
                    <input type="email" id="EmailText" placeholder="Email :" />
                    <input type="text" id="usernameText" placeholder="Username:" />
                    <input type="password" id="passwordText" placeholder="Password:" />
                    <input type="password" id="confrimText" placeholder="Confirm password:" />

                    <input type="submit" placeholder="Create"></input>
                    <a href="/Login">Back to login</a>
                </div>
            </form>
        </div>
    )
}


export default SignIn