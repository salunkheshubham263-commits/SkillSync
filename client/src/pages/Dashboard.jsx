import { useState } from "react";
import Feed from "../components/dashboard/Feed";
import Network from "../components/dashboard/Network";
import Messages from "../components/dashboard/Messages";
import Projects from "../components/dashboard/Projects";
import Notiflication from "../components/dashboard/Notiflication";
import Profile from "../components/dashboard/Profile";
import Setting from "../components/dashboard/Setting";

const Dashboard = () => {
    const [active, setActive] = useState("home")
  return (
    <div className="dashboard">
      <aside className="side-bar">
        <a onClick={() => {
          location.reload();
        }}><img className="logo" src="logo-light2.jpg" alt="" /></a>
        <button className={`Task-bar ${active === "home" ? "active" : ""}`} onClick={() => setActive("home")} ><svg xmlns="http://www.w3.org/2000/svg" width={23} fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>Home</button>
        <button className={`Task-bar ${active === "network" ? "active" : ""}`} onClick={() => setActive("network")}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="23" stroke-width="2" stroke="currentColor" className="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
          Network</button>
        <button className={`Task-bar ${active === "messages" ? "active" : ""}`} onClick={() => setActive("messages")}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={23} stroke-width="2" stroke="currentColor" className="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>Messages</button>
        <button className={`Task-bar ${active === "projects" ? "active" : ""}`} onClick={() => setActive("projects")}><svg xmlns="http://www.w3.org/2000/svg" width={23} fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
        </svg>Projects</button>
        <button className={`Task-bar ${active === "notiflication" ? "active" : ""}`} onClick={() => setActive("notiflication")}><svg xmlns="http://www.w3.org/2000/svg" width={23} fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
        </svg>Notiflications</button>
        <button className={`Task-bar ${active === "profile" ? "active" : ""}`} onClick={() => setActive("profile")}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={23} stroke-width="2" stroke="currentColor" className="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>Profile</button>
        <button className={`Task-bar ${active === "setting" ? "active" : ""}`} onClick={() => setActive("setting")}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="size-6" width={23}>
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>Setting</button>
        <div className="user-info">
          <div style={{display: "flex", alignItems: "center", gap: "10px", fontWeight: "500"}}>
          <img className="DP" src="https://i.pinimg.com/736x/55/d3/12/55d31209b04604a11ec3a6088a2add39.jpg" alt="" />
          <p>Jane Smith</p>
          </div>
          <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Commodi, quasi.</p>
        </div>
      </aside>
      <div className="main-content">
        <nav>
          Navbar
        </nav>
        <div className="hero1">
          <div className="window">
            {active === "home" && <Feed />}
            {active === "network" && <Network />}
            {active === "messages" && <Messages />}
            {active === "projects" && <Projects />}
            {active === "notiflication" && <Notiflication />}
            {active === "profile" && <Profile />}
            {active === "setting" && <Setting />}
          </div>
          <div className="news">
            News
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
