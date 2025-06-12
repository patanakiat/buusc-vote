import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CenterPage from "../Layout/CenterPage";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../img/buu.png";

export default function Login() {
  const { login } = useAuth();
  const nav       = useNavigate();

  const [cred, setCred] = useState({ username: "", password: "" });
  const [msg , setMsg ] = useState("");
  const [err , setErr ] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e){
    e.preventDefault();
    setBusy(true); setErr(false); setMsg("");

    const res = await login(cred);
    if (!res.ok) { setErr(true); setMsg(res.msg); setBusy(false); return; }
    nav(res.admin ? "/admin" : "/voting", { replace:true });
  }

  return (
    <CenterPage>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl
                   px-6 py-8 space-y-6"
      >
        <img src={logo} alt="BUU" className="w-28 mx-auto block -mt-1" />
        <h1 className="text-2xl font-bold text-center">เข้าสู่ระบบ</h1>

        {msg && (
          <p className={`text-center text-sm ${err ? "text-red-600" : "text-green-600"}`}>
            {msg}
          </p>
        )}

        <input
          className="input input-bordered w-full"
          placeholder="ชื่อผู้ใช้"
          required
          onChange={e => setCred({ ...cred, username: e.target.value })}
        />

        <input
          type="password"
          className="input input-bordered w-full"
          placeholder="รหัสผ่าน"
          required
          onChange={e => setCred({ ...cred, password: e.target.value })}
        />

        <button
          disabled={busy}
          className="w-full py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </button>

        <div className="flex justify-center gap-6 text-sm">
          <Link to="/register" className="link">สร้างบัญชี</Link>
          <Link to="/forgot"   className="link">ลืมรหัสผ่าน?</Link>
        </div>
      </form>
    </CenterPage>
  );
}
