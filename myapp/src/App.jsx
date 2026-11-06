import { useState } from 'react'

import LoginPage from './Login.jsx'
import SignupPage from "./Signin.jsx"
import MainPage from "./mainpage.jsx"
import NavbarProp from './navbar.jsx'
import ErrorPage from './ErrorPage.jsx'
import HomePage from './HomePage.jsx'
import './App.css'
import { Route , Routes } from 'react-router'

function App() {
  const [Page,SetPage] = useState("Main")

  return (
    <div>

      <NavbarProp/>


      <Routes>
        <Route path='/' element={<HomePage/>}></Route>
        <Route path='/Login' element={<LoginPage/>}></Route>
        <Route path='/Sign' element={<SignupPage/>}></Route>
        <Route path='/Home' element={<MainPage/>}></Route>
        <Route path="*" element={<ErrorPage />} />
      </Routes>

    </div>
  )
}

export default App
