import { useState } from 'react'

import LoginPage from './Login.jsx'
import SignupPage from "./Signin.jsx"
import MainPage from "./mainpage.jsx"
import './App.css'

function App() {
  const [Page,SetPage] = useState("Main")

  return (
    <div>
      {Page === "Login" && <LoginPage ToMain={() => SetPage("Main")} ToSign={() => SetPage("Signup")} />}
      {Page === "Signup" && <SignupPage ToLogin={() => SetPage("Login")} />}
      {Page === "Main" && <MainPage ToLogin={() => SetPage("Login")}/>}

    </div>
  )
}

export default App
