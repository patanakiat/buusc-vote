import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import CenterPage from "../Layout/CenterPage";
import logo from "../../img/buu.png";

export default function ResetPassword() {
  const { token } = useParams();
  const [f, set]   = useState({ pwd: "", confirm: "" });
  const [done, setDone] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (f.pwd !== f.confirm) return alert("รหัสผ่านไม่ตรงกัน");
    /* TODO: POST /reset/${token} */
    setDone(true);
  }

  return (
    <CenterPage>
      <form onSubmit={submit} className="card">
        <img src={logo} alt="BUU" className="w-36 mx-auto -mt-6 mb-2 animate-fade" />
        <h1 className="text-2xl font-bold text-center animate-fade">ตั้งรหัสผ่านใหม่</h1>

        {done ? (
          <p className="text-center">
            บันทึกสำเร็จ <Link className="link" to="/">เข้าสู่ระบบ</Link>
          </p>
        ) : (
          <>
            <input
              type="password"
              placeholder="รหัสผ่านใหม่"
              required
              className="input input-bordered w-full"
              onChange={e => set({ ...f, pwd: e.target.value })}
            />

            <input
              type="password"
              placeholder="ยืนยันรหัสผ่าน"
              required
              className="input input-bordered w-full"
              onChange={e => set({ ...f, confirm: e.target.value })}
            />

            <button className="w-full py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition">
              บันทึก
            </button>
          </>
        )}
      </form>
    </CenterPage>
  );
}
