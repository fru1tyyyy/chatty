import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ServerSidebar from "../components/ServerSidebar";
import Friendbar from "../components/Friendbar";
import "../styles/home.css";

export default function Home() {
  useEffect(() => {
    document.title = "Chatty";
  }, []); 

  return (
    <div className="discord-home">
      <ServerSidebar />
      <div className="home-content">
        <Friendbar />
        <Link to="/Login">
          <button className="logout-button">Logout</button>
        </Link>
        <div className="home-main">
          <h1>Welcome</h1>
          <p>No servers yet. Click + to create one.</p>
        </div>
      </div>
    </div>
  );
}