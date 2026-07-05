import NavbarProp from "./navbar.jsx"
import "./Login.css"
import validator from "validator"

function SignIn({ToLogin}) {


    async function  createaccount(params) {
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

        const response = await fetch("/CreateAccount",{
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({email : emailText,username : usernameText,password : PasswordText})
        })

        const data = await response.json()

        alert(data.message)

        if (data.message == "success") {
            ToLogin()
        }
    }


    return (
        <div>

            <NavbarProp></NavbarProp>
            
            <div className="LoginContainer">
                <h1>create account!</h1>
                <textarea id="EmailText" placeholder="Email :"></textarea>
                <textarea id="usernameText" placeholder="Username:"></textarea>
                 <textarea id="passwordText" placeholder="Password:"></textarea>
                <textarea id="confrimText" placeholder="Confrim password:"></textarea>

                 <button onClick={createaccount}>Create</button>
            </div>
        </div>
    )
}


export default SignIn