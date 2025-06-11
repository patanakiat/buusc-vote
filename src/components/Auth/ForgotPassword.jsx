import { useState } from "react";
import { Link } from "react-router-dom";
import CenterPage from "../Layout/CenterPage";
import logo from "../../img/buu.png";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <CenterPage>
      <form
        onSubmit={e => { e.preventDefault(); /* TODO send e-mail */ setSent(true); }}
        className="card"
      >
        <img src={logo} alt="BUU" className="w-36 mx-auto -mt-6 mb-2 animate-fade" />
        <h1 className="text-2xl font-bold text-center animate-fade">รีเซ็ตรหัสผ่าน</h1>

        {sent ? (
          <p className="text-center">หากอีเมลถูกต้อง ระบบได้ส่งลิงก์ไปแล้ว</p>
        ) : (
          <>
            <input
              type="email"
              placeholder="อีเมล"
              required
              className="input input-bordered w-full"
              onChange={e => setEmail(e.target.value)}
            />
            <button className="w-full py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition">
              ส่งลิงก์
            </button>
          </>
        )}

        <p className="text-sm text-center">
          <Link to="/" className="link">กลับสู่หน้าเข้าสู่ระบบ</Link>
        </p>
      </form>
    </CenterPage>
  );
}
