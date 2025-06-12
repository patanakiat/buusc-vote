/*  Burapha University SC – Register page
    • verifies mail prefix === studentId
    • sends verify-mail on success (handled in AuthContext)
*/
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CenterPage from "../Layout/CenterPage";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../img/buu.png";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [form, set] = useState({
    nameSurname: "",
    studentId  : "",
    username   : "",
    email      : "",
    pwd        : "",
    confirm    : ""
  });
  const [msg,   setMsg] = useState("");
  const [cnt,   setCnt] = useState(5);
  const [busy,  setBusy]= useState(false);

  /* regex */
  const idRx   = /^(64|65|66|67|68|69|70)\d{6}$/;
  const userRx = /^[A-Za-z0-9]+$/;
  const mailRx = /^[\w.+-]+@go\.buu\.ac\.th$/;

  async function handleSubmit(e) {
    e.preventDefault();

    /* ---- client-side validation ---- */
    if (!form.nameSurname.includes(" "))
      return setMsg("กรุณากรอกชื่อจริงและนามสกุลโดยเว้นวรรคระหว่างกัน");
    if (!idRx.test(form.studentId))
      return setMsg("รหัสนิสิตต้องเป็น 8 หลักและขึ้นต้นด้วย 64-70");
    if (!userRx.test(form.username))
      return setMsg("ชื่อผู้ใช้ใช้ตัวอักษรอังกฤษหรือตัวเลขเท่านั้น");
    if (!mailRx.test(form.email))
      return setMsg("ใช้อีเมล @go.buu.ac.th เท่านั้น");

    /* NEW: e-mail prefix must match student-ID */
    const prefix = form.email.split("@")[0];
    if (prefix !== form.studentId)
      return setMsg("อีเมลต้องตรงกับรหัสนิสิต");

    if (form.pwd !== form.confirm)
      return setMsg("รหัสผ่านไม่ตรงกัน");

    /* ---- Firebase ---- */
    setBusy(true);
    const { ok, msg: err } = await register({
      nameSurname: form.nameSurname,
      studentId  : form.studentId,
      username   : form.username,
      email      : form.email,
      password   : form.pwd
    });
    setBusy(false);

    if (!ok) return setMsg(err);

    /* ---- success banner ---- */
    setMsg(`สมัครสำเร็จ! ระบบได้ส่งอีเมลยืนยันแล้ว 
            จะกลับสู่หน้าเข้าสู่ระบบใน ${cnt} วินาที…`);
    const t = setInterval(()=>setCnt(c=>c-1),1000);
    setTimeout(()=>{ clearInterval(t); nav("/"); },5000);
  }

  return (
    <CenterPage>
      <form onSubmit={handleSubmit} className="card space-y-6">
        <img src={logo} alt="BUU" className="w-28 mx-auto block -mt-8"/>
        <h1 className="text-3xl font-bold text-center">สมัครสมาชิก</h1>

        {msg && (
          <p className={`text-center text-sm ${msg.startsWith("สมัครสำเร็จ")?"text-green-600":"text-red-600"}`}>
            {msg.replace(cnt+1+"",cnt+"")}
          </p>
        )}

        <input className="input input-bordered w-full" placeholder="ชื่อจริง - นามสกุล"
               required onChange={e=>set({...form,nameSurname:e.target.value})}/>

        <input className="input input-bordered w-full" placeholder="รหัสนิสิต"
               maxLength={8} required onChange={e=>set({...form,studentId:e.target.value})}/>

        <input className="input input-bordered w-full" placeholder="ชื่อผู้ใช้"
               required onChange={e=>set({...form,username:e.target.value})}/>

        <input type="email" className="input input-bordered w-full"
               placeholder="อีเมล (@go.buu.ac.th)" pattern={mailRx.source}
               required onChange={e=>set({...form,email:e.target.value})}/>

        <input type="password" className="input input-bordered w-full"
               placeholder="รหัสผ่าน" required onChange={e=>set({...form,pwd:e.target.value})}/>

        <input type="password" className="input input-bordered w-full"
               placeholder="ยืนยันรหัสผ่าน" required onChange={e=>set({...form,confirm:e.target.value})}/>

        <button disabled={busy}
                className="w-full py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50">
          {busy ? "กำลังสมัคร…" : "สมัครสมาชิก"}
        </button>

        <div className="flex justify-center gap-6 text-sm">
          <Link className="link" to="/">เข้าสู่ระบบ</Link>
        </div>
      </form>
    </CenterPage>
  );
}
