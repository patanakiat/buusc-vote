import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CenterPage from "../Layout/CenterPage";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../img/buu.png";

export default function Register() {
  const { register } = useAuth();
  const nav                = useNavigate();
  const [f, set]           = useState({
    nameSurname: "", studentId: "", username: "", email: "", pwd: "", confirm: ""
  });
  const [msg, setMsg]      = useState(null);
  const [count, setCount]  = useState(3);

  /* validation regex */
  const studentIdRx = /^(64|65|66|67|68|69|70)\d{6}$/;
  const usernameRx  = /^[A-Za-z0-9]+$/;
  const emailRx     = /^[\w.+-]+@go\.buu\.ac\.th$/;

  async function submit(e) {
    e.preventDefault();

    if (!f.nameSurname.includes(" "))
      return setMsg("กรุณากรอกชื่อจริงและนามสกุลโดยเว้นวรรคระหว่างกัน");

    if (!studentIdRx.test(f.studentId))
      return setMsg("รหัสนิสิตต้องเป็นตัวเลข 8 หลักและขึ้นต้นด้วย 64-70");

    if (!usernameRx.test(f.username))
      return setMsg("ชื่อผู้ใช้ใช้ตัวอักษรอังกฤษหรือตัวเลขเท่านั้น");

    if (!emailRx.test(f.email))
      return setMsg("ใช้อีเมล @go.buu.ac.th เท่านั้น");

    if (f.pwd !== f.confirm)
      return setMsg("รหัสผ่านไม่ตรงกัน");

    const ok = await register({
      nameSurname: f.nameSurname,
      studentId:   f.studentId,
      username:    f.username,
      email:       f.email,
      password:    f.pwd
    });
    if (!ok) return setMsg("ไม่สามารถสมัครได้");

    setMsg("สมัครสำเร็จ! จะกลับสู่หน้าเข้าสู่ระบบใน 3 วินาที...");
    const id = setInterval(() => setCount(c => c - 1), 1000);
    setTimeout(() => { clearInterval(id); nav("/"); }, 3000);
  }

  return (
    <CenterPage>
      <form onSubmit={submit} className="card">
        <img src={logo} alt="BUU" className="w-36 mx-auto -mt-6 mb-2 animate-fade" />
        <h1 className="text-3xl font-bold text-center animate-fade">สมัครสมาชิก</h1>

        {msg && (
          <p className="text-center text-green-600">{msg.replace("3", count)}</p>
        )}

        <input
          placeholder="ชื่อจริง - นามสกุล"
          className="input input-bordered w-full"
          required
          onChange={e => set({ ...f, nameSurname: e.target.value })}
        />

        <input
          placeholder="รหัสนิสิต"
          className="input input-bordered w-full"
          required
          maxLength={8}
          onChange={e => set({ ...f, studentId: e.target.value })}
        />

        <input
          placeholder="ชื่อผู้ใช้"
          className="input input-bordered w-full"
          required
          onChange={e => set({ ...f, username: e.target.value })}
        />

        <input
          type="email"
          placeholder="อีเมล (@go.buu.ac.th)"
          className="input input-bordered w-full"
          pattern="^[\w.+-]+@go\.buu\.ac\.th$"
          title="ต้องใช้อีเมล @go.buu.ac.th"
          required
          onChange={e => set({ ...f, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="รหัสผ่าน"
          className="input input-bordered w-full"
          required
          onChange={e => set({ ...f, pwd: e.target.value })}
        />

        <input
          type="password"
          placeholder="ยืนยันรหัสผ่าน"
          className="input input-bordered w-full"
          required
          onChange={e => set({ ...f, confirm: e.target.value })}
        />

        <button className="w-full py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition">
          สมัครสมาชิก
        </button>

        <div className="flex justify-center gap-6 text-sm">
          <Link className="link" to="/">เข้าสู่ระบบ</Link>
        </div>
      </form>
    </CenterPage>
  );
}
