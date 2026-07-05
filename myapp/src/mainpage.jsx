import { useEffect , useState , useRef } from "react"
import NavbarProp from "./navbar.jsx"
import "./mainpage.css"

function MainPage({ToLogin}) {
    const [MusicList,SetList] = useState([])
    const [Playing,ChangePlaying] = useState(false)
    const [DownloadState,ChangeDownloadState] = useState("Status:")
    const [CurrentDuration,setCurrent] = useState("0:00")
    const [CurrentScroll,SetCurrentScroll] = useState(0)
    const [MaxScroll,SetMaxScroll] = useState(0)
    const [MaxDuration,setmax] = useState("0:00")
    const [VisualArray,SetVisualArray] = useState(Array(64).fill(0))
    const [CurrentSongName,SetSongName] = useState("")
    const currentaudio = useRef(null)
    const AudioContextWF = useRef(null)
    const AnalyserWF = useRef(null)
    const UnitArrayWF = useRef(null)
    let songPosition = 0;


        const LoadVisualBars = VisualArray.map((value,index)=> {
        return (
            <div className="VisualBars" key={index} style={{height : value/(Math.floor(Math.random() * 2)) + "px"}}>

            </div>
        )
    })



        const LoadMusicList = MusicList.map((song)=> {
        return(
        <div  id={song.title} className={CurrentSongName === song.title ? "active" : "Song"} key={song.id}  >
        <p style={{position : "absolute"}}  >{song.title}</p>

        <div className="OptionsDiv">
        <button className="PlayButton"  onClick={() => {PlaySong(song)}}></button>
        <button onClick={PauseSong} className="PauseButton"></button>
        <button onClick={()=> DeleteSong(song)}>Delete</button>
        </div>


       </div>


        )
    })



    async function VerifyToken() {
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


    function Logout() {
        if (localStorage.getItem("Token")) {
            localStorage.removeItem("Token")
            ToLogin()
        }
    }



    function LoadSong(song) {
        
    const audio = new Audio(`/MusicFolder/${song.filename}`)

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
        setmax(`${Math.floor(audio.duration / 60)}:${Math.floor(audio.duration % 60).toString().padStart(2,"0")}`)
        setCurrent(`${Math.floor(audio.currentTime / 60)}:${Math.floor(audio.currentTime % 60).toString().padStart(2,"0")}`)
        SetCurrentScroll(audio.currentTime)
        SetMaxScroll(audio.duration)
    });


    audio.addEventListener("volumechange",(ev)=> {
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
  const dataArray = UnitArrayWF.current.slice(0,64)


  analyser.getByteFrequencyData(dataArray)

  SetVisualArray([...dataArray])


  requestAnimationFrame(update)
}




function PlaySong(song) {
    let musiclist = []
    if (Playing) {
        ChangePlaying(false)
        currentaudio.current?.pause()
        return
    }

    ChangePlaying(true)

    songPosition = MusicList.indexOf(song)
    SetSongName("Now Playing:" + " " +  song.title)



    currentaudio.current = LoadSong(song)
    currentaudio.current.play()

    update()
}


function PauseSong() {
    if (!currentaudio.current) {return}

    if (Playing == true) {
        currentaudio.current?.pause()
        ChangePlaying(false)
        return
    }
    ChangePlaying(true)
    currentaudio.current.play()
}




    async function DownloadSongs() {
        const InputText = document.getElementById("Input")?.value
        const Token = await VerifyToken()

        if (InputText.length == 0) {
            alert("empty fields")
            return
        }


        ChangeDownloadState("Downloading....")


        const response = await fetch("/DownloadSong",{
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({Link : InputText,user_id : Token["id"]})
        })

        const data = await response.json()

        console.log(data.message)


        if (data.message == "success") {
            ChangeDownloadState("Successful!....")
        }


        LoadMusic()


    }


    async function DeleteSong(song) {
        const Token = await VerifyToken()

        
         const response = await fetch("/DeleteSong",{
        method : "POST",
        headers : {"Content-Type" : "application/json"},
        body : JSON.stringify({song_id : song.id,user_id : Token["id"]})
    })

    const data = await response.json()


    SetList(data.result)
    }

    async function LoadMusic() {
        const Token = await VerifyToken()


        const response = await fetch(`/GetSongs/${Token["id"]}`)

        const data = await response.json()

        console.log(data.result)

        SetList(data.result)
    }

    function ChangeSongPosition() {
    const ScrollBar = document.getElementById("ScrollBar")

    if (!currentaudio.current) {return}

    currentaudio.current.currentTime = ScrollBar.value
}




    async function shuffle() {
        const response = await fetch("/Shuffle",{
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({musiclist : MusicList})
        })

        const data = await response.json()

        SetList(data.result)
    }


    useEffect(()=> {
        if (MusicList.length == 0 && window.location.port == 3000) {
            LoadMusic()
        }
    },[])


    return (
        <div>

            <NavbarProp></NavbarProp>


             <div className="AddSong">
        <input id="Input" type="text" placeholder="Paste youtube link to put in playlist:"></input>
        <button onClick={DownloadSongs}>submit</button>
        <p>{DownloadState || "Status:"}</p>
       </div>

       <button className="LogoutButton" onClick={Logout}>Log out</button>

       <div className="MusicDiv">

        
        <h1 className="PlaylistHeader">Playlist</h1>

        <div className="MusicContainer">
        {LoadMusic}

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

            <button  onClick={shuffle} className="ShuffleButton">Shuffle</button>
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