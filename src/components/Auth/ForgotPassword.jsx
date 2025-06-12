import { useState } from "react";
import { Link } from "react-router-dom";
import CenterPage from "../Layout/CenterPage";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";
import logo from "../../img/buu.png";

export default function ForgotPassword() {
  const [sent, setSent]   = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try { await sendPasswordResetEmail(auth, email); } catch (_) {}
    setSent(true);
  }

  return (
    <CenterPage>
      <form onSubmit={handleSubmit}
            className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl
                       px-6 py-8 space-y-6">

        <img src={logo} alt="BUU" className="w-28 mx-auto block -mt-1" />
        <h1 className="text-2xl font-bold text-center">รีเซ็ตรหัสผ่าน</h1>

        {sent ? (
          <p className="text-center text-sm">
            หากอีเมลถูกต้อง ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว
          </p>
        ) : (
          <>
            <input type="email" placeholder="อีเมล" required
                   className="input input-bordered w-full"
                   onChange={e=>setEmail(e.target.value)}/>
            <button
              className="w-full py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition">
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
