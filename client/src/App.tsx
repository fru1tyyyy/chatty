import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useSocket } from "./hooks/useSocket";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat"

function AppInner(){
  const {token, user, isLoading, fetchMe} = useAuthStore();
  useSocket();

  useEffect(() => {
    if(token && !user) fetchMe();
  }, [token]);

  if(isLoading){
    return(
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-secondary)" }}>Loading...</div>
    );
  }

  return(
    <Routes>
      <Route path="/login" element={!token ? <Login/> : <Navigate to="/"/>}/>
      <Route path="/register" element={!token ? <Register/> : <Navigate to="/"/>}/>
      <Route path="/*" element={token ? <Chat/> : <Navigate to="/login"/>}/>
    </Routes>
  )
}

export default function App(){
  return(
    <BrowserRouter>
    <AppInner/>
    </BrowserRouter>
  );
}
