import { useEffect, useState } from "react"
import "./playlist.css"
import NavbarProp from "./navbar.jsx"

function PlaylistPage() {
    const [Playlist,SetPlaylist] = useState([{name : "example"},{name : "example2"}])

    const renderplaylist = Playlist.map((playlist)=> {
        return (
                <button className="playlist-container-mini">
                    <h4>{playlist.name}</h4>
                </button>
        )
    })

     async function GetToken() {
        const Token = localStorage.getItem("Token")

        if (!Token) {
            ToLogin()
            return
        }

        const response = await fetch("/GetToken",{
            headers : {
                "authorization" : `Bearer ${Token}`,
                "Content-Type" : "application/json"
            }
        })

        const data = await response.json()

            if (data.status != "success") {
                ToLogin()
            }

    
            return data.Token
    }



    async function GetPlaylist() {
        const Token = await GetToken()
    }

    useEffect(()=> {
        GetPlaylist()
    },[])

    return (
        <div>
            <NavbarProp></NavbarProp>
            <h1 style={{textAlign : "center" , textDecoration : "underline"}}>Playlists</h1>

            <div className="playlistContainer">
                {renderplaylist}
            </div>
        </div>
    )
}


export default PlaylistPage