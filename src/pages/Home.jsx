import ServerSidebar from "../components/ServerSidebar";
import Friendbar from "../components/Friendbar";
import "../styles/home.css";

export default function Home() {
  return (
    <div className="discord-home">
      <ServerSidebar/>
      <div className="home-content">
        <Friendbar/>
        <div className="home-main">
          <h1>Welcome</h1>
          <p>No servers yet. Click + to create one.</p>
        </div>
      </div>
    </div>
  );
}
