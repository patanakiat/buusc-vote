import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CenterPage from "../Layout/CenterPage";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../img/buu.png";

export default function Login() {
  const { login } = useAuth();
  const nav                = useNavigate();
  const [cred, setCred]    = useState({ username: "", password: "" });
  const [msg, setMsg]      = useState(null);
  const [count, setCount]  = useState(3);

  async function submit(e) {
    e.preventDefault();
    if (!(await login(cred))) return setMsg("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    setMsg("เข้าสู่ระบบสำเร็จ 3 วินาที...");
    const id = setInterval(() => setCount(c => c - 1), 1000);
    setTimeout(() => { clearInterval(id); nav("/dashboard"); }, 3000);
  }

  return (
    <CenterPage>
      <form onSubmit={submit} className="card">
        <img src={logo} alt="BUU" className="w-36 mx-auto -mt-6 mb-2 animate-fade" />
        <h1 className="text-3xl font-bold text-center animate-fade">เข้าสู่ระบบ</h1>

        {msg && (
          <p className="text-center text-green-600">{msg.replace("3", count)}</p>
        )}

        <input
          placeholder="ชื่อผู้ใช้"
          className="input input-bordered w-full"
          required
          onChange={e => setCred({ ...cred, username: e.target.value })}
        />

        <input
          type="password"
          placeholder="รหัสผ่าน"
          className="input input-bordered w-full"
          required
          onChange={e => setCred({ ...cred, password: e.target.value })}
        />

        <button className="w-full py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition">
          เข้าสู่ระบบ
        </button>

        <div className="flex justify-center gap-6 text-sm">
          <Link to="/register" className="link">สร้างบัญชี</Link>
          <Link to="/forgot"   className="link">ลืมรหัสผ่าน?</Link>
        </div>
      </form>
    </CenterPage>
  );
}
