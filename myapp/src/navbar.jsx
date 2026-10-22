import "./navbar.css"
import sakuraflower from "./assets/sakura2.svg"
import icon from "./assets/Icon.png"

function NavbarProp({Tologout}) {
    return (
<nav class=" navbar Navbar">
  <div class="container-fluid">
    <div>
      <input type="button" className="Icon" href="/"></input>
    </div>

    <div className="ms-auto">
      <a class="navbar-brand MainHeader" href="/">About</a>
    <a class="navbar-brand MainHeader" href="/" onClick={Tologout}>Logout</a>

    </div>

  </div>
</nav>


    )
}


export default NavbarProp
