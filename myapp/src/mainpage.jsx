import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router"
import "./mainpage.css"

import supabase from "./supabase.js"

function MainPage() {
    const navigate = useNavigate()
    const [MusicList, SetList] = useState([])
    const [Playing, ChangePlaying] = useState(false)
    const [DownloadState, ChangeDownloadState] = useState("Status:")
    const [CurrentDuration, setCurrent] = useState("0:00")
    const [CurrentScroll, SetCurrentScroll] = useState(0)
    const [MaxScroll, SetMaxScroll] = useState(0)
    const [MaxDuration, setmax] = useState("0:00")
    const [VisualArray, SetVisualArray] = useState(Array(64).fill(0))
    const [CurrentSongName, SetSongName] = useState("")



    const [playlists, setplaylist] = useState([])
    const [currentPlaylistID, setCurrentPlayListID] = useState("")
    const [currentPlaylistSelected, setSelected] = useState("")
    const [newPlaylistName, setNewPlaylistName] = useState("")
    const [editChangesContainer, setEditContainer] = useState(false)
    const [edited, setEdited] = useState("")

    const currentaudio = useRef(null)
    const AudioContextWF = useRef(null)
    const AnalyserWF = useRef(null)
    const UnitArrayWF = useRef(null)
    let songPosition = 0;


    const renderplaylist = playlists.map((playlist,index) => {
        return (
            <div className="playlist-container-mini" key={index}>
                <button className="playlist-container-mini" onClick={() => { setSelected(playlist.name), setCurrentPlayListID(playlist.id), LoadPlaylist(playlist.id) }}>
                    <h4>{playlist.name}</h4>
                    <button onClick={() => { editChangesContainer ? (setEditContainer(false)) : (setEditContainer(true)), setEdited(playlist.name) }}>Edit</button>
                    <button>Delete</button>
                </button>
            </div>
        )
    })


    const LoadVisualBars = VisualArray.map((value, index) => {
        return (
            <div className="VisualBars" key={index} style={{ height: value / (Math.floor(Math.random() * 2)) + "px" }}>

            </div>
        )
    })



    const LoadMusicList = MusicList.map((song,index) => {
        return (
            <div id={song.title}  className={CurrentSongName === song.title ? "active" : "Song"} key={song.id}  >
                <p style={{ position: "absolute" }}  >{song.title}</p>

                <div className="OptionsDiv">
                    <button className="PlayButton" onClick={() => { PlaySong(song) }}></button>
                    <button onClick={PauseSong} className="PauseButton"></button>
                    <button onClick={() => DeleteSong(song)}>Delete</button>
                </div>


            </div>


        )
    })

    async function VerifyToken() {
    const response = await fetch("/api/GetToken");

    if (!response.ok) {
        navigate("/");
        return null;
    }

    const data = await response.json();

    if (data.status !== "success") {
        navigate("/");
        return null;
    }

    return data.Token;
}

    async function GetPlaylist() {
        const Token = await VerifyToken()

        const response = await fetch(`/api/GetPlayList/${Token["id"]}`)

        const data = await response.json()

        setplaylist(data.result)
    }

    async function CreatePlaylist() {
        const Token = await VerifyToken()

        const response = await fetch(`/api/CreatePlaylist`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user_id: Token["id"] })
        })

        const data = await response.json()

        if (data.status == "success") {
            GetPlaylist()
        }
    }

    async function LoadPlaylist(id) {
        const response = await fetch(`/api/LoadPlaylist/${id}`)

        const data = await response.json()


        SetList(data.result)
    }

    async function editPlaylist() {
        const Token = await VerifyToken()
        setEditContainer(0)
        const response = await fetch("/api/editPlaylist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: edited, new_name: newPlaylistName, user_id: Token["id"] })
        })

        const data = await response.json()
        console.log(data.status)
        if (data.status == "success") {
            GetPlaylist()
        }
    }






    function LoadSong(song) {

        const {data} = supabase.storage.from("Music").getPublicUrl(song.filename)

        const audio = new Audio(data.publicUrl)

        audio.crossOrigin = "anonymous";


        currentaudio.current = audio

        if (!AudioContextWF.current) {
            AudioContextWF.current = new AudioContext()
        }




        const source = AudioContextWF.current.createMediaElementSource(audio)
        const analyser = AudioContextWF.current.createAnalyser()


        const dataArray = new Uint8Array(analyser.frequencyBinCount)



        AnalyserWF.current = analyser
        UnitArrayWF.current = dataArray

        source.connect(analyser)
        analyser.connect(AudioContextWF.current.destination)



        audio.addEventListener("timeupdate", () => {
            setmax(`${Math.floor(audio.duration / 60)}:${Math.floor(audio.duration % 60).toString().padStart(2, "0")}`)
            setCurrent(`${Math.floor(audio.currentTime / 60)}:${Math.floor(audio.currentTime % 60).toString().padStart(2, "0")}`)
            SetCurrentScroll(audio.currentTime)
            SetMaxScroll(audio.duration)
        });


        audio.addEventListener("volumechange", (ev) => {
            console.log(audio.volume)
        })

        audio.addEventListener("ended", () => {
            songPosition += 1

            if (songPosition >= MusicList.length) {
                songPosition = 0
            }

            LoadSong(MusicList[songPosition])
            SetSongName("Now Playing:" + " " + MusicList[songPosition]["title"])
            currentaudio.current.play()
        });

        return audio
    }


    function update() {
        const analyser = AnalyserWF.current
        const dataArray = UnitArrayWF.current.slice(0, 64)


        analyser.getByteFrequencyData(dataArray)

        SetVisualArray([...dataArray])


        requestAnimationFrame(update)
    }




    function PlaySong(song) {
        if (Playing) {
            ChangePlaying(false)
            currentaudio.current?.pause()
            return
        }

        ChangePlaying(true)

        songPosition = MusicList.indexOf(song)
        SetSongName("Now Playing:" + " " + song.title)



        currentaudio.current = LoadSong(song)
        currentaudio.current.play()

        update()
    }


    function PauseSong() {
        if (!currentaudio.current) { return }

        if (Playing == true) {
            currentaudio.current?.pause()
            ChangePlaying(false)
            return
        }
        ChangePlaying(true)
        currentaudio.current.play()
    }


    function isYoutubeUrl(url) {
        try {
            const parsedUrl = new URL(url);

            return [
                "youtube.com",
                "www.youtube.com",
                "m.youtube.com",
                "youtu.be"
            ].includes(parsedUrl.hostname);
        } catch {
            return false;
        }
    }

    async function DownloadSongs() {
        const InputText = document.getElementById("Input")?.value.trim()
        const Token = await VerifyToken()

        if (InputText.length == 0) {
            alert("empty fields")
            return
        }

       if (!isYoutubeUrl(InputText)) {
        return ChangeDownloadState("Error , only youtube links are allowed!")
        }



        ChangeDownloadState("Downloading....")


        const response = await fetch("/api/DownloadSong", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Link: InputText, user_id: Token["id"], playlist_id: currentPlaylistID })
        })

        const data = await response.json()

        if (!response.ok) {
            ChangeDownloadState(data.message)
        }


        if (data.message == "success") {
            ChangeDownloadState("Successful!....")
        }


        LoadMusic()


    }


    async function DeleteSong(song) {
        const Token = await VerifyToken()


        const response = await fetch("/api/DeleteSong", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ song_id: song.id, user_id: Token["id"], playlist_id: currentPlaylistID })
        })

        const data = await response.json()

        if (data.status == "success") {
            LoadPlaylist(Token["id"])
        }
    }

    async function LoadMusic() {
        const Token = await VerifyToken()


        const response = await fetch(`/api/GetSongs/${Token["id"]}`)

        const data = await response.json()

        console.log(data.result)

        SetList(data.result)
    }

    function ChangeSongPosition() {
        const ScrollBar = document.getElementById("ScrollBar")

        if (!currentaudio.current) { return }

        currentaudio.current.currentTime = ScrollBar.value
    }




    async function shuffle() {
        const response = await fetch("/api/Shuffle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ musiclist: MusicList })
        })

        const data = await response.json()

        SetList(data.result)
    }


    document.addEventListener("contextmenu", (e) => {
        e.preventDefault()

        console.log(e.target.className)

        if (e.target.className == "playlist-container-mini") {

        }
    })

    useEffect(() => {
        if (MusicList.length == 0) {
            GetPlaylist()
        }
    }, [])





    return (
        <div>




            <div className="playlistContainer">
                <button onClick={CreatePlaylist}>+ Create</button>
                {renderplaylist}
            </div>

            {editChangesContainer && (
                <div className="editChanges" >
                    <input placeholder="Change playlist name:" onChange={(e) => { setNewPlaylistName(e.target.value) }} ></input>
                    <button onClick={() => { editPlaylist() }}>Edit</button>
                </div>

            )}



            <div className="AddSong">
                <input id="Input" type="text" placeholder="Paste youtube link to put in playlist:"></input>
                <button onClick={DownloadSongs}>submit</button>
                <p>{DownloadState || "Status:"}</p>
            </div>



            <div className="MusicDiv">


                <h1 className="PlaylistHeader">Playlist</h1>

                <div className="MusicContainer">

                    <div className="Song">
                        <p>SongName</p>
                        <div className="OptionsDiv">
                            <button className="PauseButton"></button>
                            <button className="PlayButton"></button>
                            <button>Delete</button>
                        </div>
                    </div>


                    {LoadMusicList}
                </div>

                <button onClick={shuffle} className="ShuffleButton">Shuffle</button>
            </div>


            <div className="VideoDiv">
                <h4 className="SongTitle">{CurrentSongName}</h4>
                <input onInput={ChangeSongPosition} id="ScrollBar" className="ScrollBar" type="range" min={0} max={MaxScroll} value={CurrentScroll}></input>
                <p id="Max">{MaxDuration}</p>
                <p id="Current" className="StartDuration">{CurrentDuration}</p>
            </div>

            <div className="VisualiserDiv">
                {LoadVisualBars}
            </div>



        </div>
    )
}

export default MainPage