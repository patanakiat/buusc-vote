import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import pfp from "../../img/pfp.png";

export default function UserProfileMenu() {
  const { user, logout } = useAuth();
  const nav   = useNavigate();
  const [o,s] = useState(false);
  const box   = useRef(null);

  useEffect(()=>{ const fn=e=>box.current&&!box.current.contains(e.target)&&s(false);
                  window.addEventListener("mousedown",fn);return()=>window.removeEventListener("mousedown",fn);},[]);

  return(
    <div ref={box} className="relative">
      <button onClick={()=>s(!o)} className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary">
        <img src={user?.photoURL||pfp} alt="pfp" className="w-full h-full object-cover"/>
      </button>
      {o&&(
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg ring-1 ring-black/10 z-50">
          <button onClick={()=>{nav("/profile");s(false);}} className="block w-full px-4 py-2 text-left hover:bg-gray-100">โปรไฟล์</button>
          <button onClick={()=>{logout();nav("/");}} className="block w-full px-4 py-2 text-left hover:bg-gray-100">ออกจากระบบ</button>
        </div>
      )}
    </div>
  );
}
