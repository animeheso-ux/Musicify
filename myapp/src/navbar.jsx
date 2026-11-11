import "./navbar.css"
import sakuraflower from "./assets/sakura2.svg"
import icon from "./assets/Icon.png"
import { useNavigate , useLocation } from "react-router"


function NavbarProp() {
  const navigate = useNavigate()
  const location = useLocation()

  async function Logout() {
    const proceed = confirm("Log out of your account?")

    if (!proceed) {return}

    const response = await fetch("/api/Logout")

    const data = await response.json()

    if (data.status == "success") {
      navigate("/")
    }

          
    // if (  localStorage.getItem("Token")) {
    //   localStorage.removeItem("Token")
    //   navigate("/")
    // }

  }


    return (
<nav class=" navbar Navbar">
  <div class="container-fluid">
    <div>
      <input type="button" className="Icon" href="/"></input>
    </div>

    <div className="ms-auto">
      <a class="navbar-brand MainHeader" href="/">About</a>
      {location.pathname == "/Home" && (    <a class="navbar-brand MainHeader" onClick={Logout}>Logout</a>)}

    </div>

  </div>
</nav>


    )
}


export default NavbarProp
