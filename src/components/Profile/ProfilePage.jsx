import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CenterPage from "../Layout/CenterPage";
import { useAuth } from "../../contexts/AuthContext";
import { storage, db } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, query, collection, where, getDocs } from "firebase/firestore";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import pfp from "../../img/pfp.png";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [photo, setPhoto] = useState(user.photoURL || pfp);
  const [msg, setMsg] = useState(null);
  const [edit, setEdit] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ old: "", new1: "", new2: "" });
  const [data, setData] = useState({
    name: "", studentId: "", username: "", email: user.email
  });

  /* ────────── fetch Firestore profile ────────── */
  useEffect(() => {
    const q = query(collection(db, "usernames"), where("uid", "==", user.uid));
    getDocs(q).then(s => {
      if (!s.empty) {
        const d = s.docs[0];
        setData({
          name: d.data().nameSurname || "",
          studentId: d.data().studentId || "",
          username: d.id,
          email: user.email
        });
      }
    });
  }, [user]);

  /* ────────── avatar upload ────────── */
  async function choosePic(file) {
    if (!file) return;
    setMsg("กำลังอัปโหลดรูป…");
    const r = ref(storage, `profile-pictures/${user.uid}`);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);
    await updateProfile(user, { photoURL: url });
    setPhoto(url);
    setMsg("อัปโหลดรูปสำเร็จ");
  }

  /* ────────── save basic info ────────── */
  async function saveInfo() {
    await updateProfile(user, { displayName: data.name });
    await updateDoc(doc(db, "usernames", data.username), {
      nameSurname: data.name, studentId: data.studentId
    });
    setMsg("บันทึกข้อมูลแล้ว");
    setEdit(false);
  }

  /* ────────── change password ────────── */
  async function savePwd() {
    if (pw.new1 !== pw.new2) return setMsg("รหัสผ่านใหม่ไม่ตรงกัน");
    const cred = EmailAuthProvider.credential(user.email, pw.old);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, pw.new1);
    setPw({ old: "", new1: "", new2: "" });
    setPwOpen(false);
    setMsg("เปลี่ยนรหัสผ่านสำเร็จ");
  }

  /* ─────────────────── UI ─────────────────── */
  return (
    <CenterPage>
      <div className="w-full max-w-sm mx-auto"> {/* Force container width */}
        <div className="card px-4 sm:px-6 space-y-6 text-black overflow-hidden"> {/* Add overflow-hidden */}
          {/* back arrow */}
          <button
            onClick={() => navigate("/voting")}
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth={2}
                 className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            กลับหน้าลงคะแนน
          </button>

          <h2 className="text-xl font-bold text-center">โปรไฟล์</h2>

          {/* avatar */}
          <div className="flex flex-col items-center">
            <img src={photo}
                 alt="avatar"
                 onClick={() => fileRef.current.click()}
                 className="w-28 h-28 rounded-full object-cover border-2 border-primary
                            mb-2 cursor-pointer hover:opacity-80 transition"/>
            <input hidden ref={fileRef} type="file" accept="image/*"
                   onChange={e => choosePic(e.target.files[0])}/>
            <span className="text-xs text-gray-500">คลิกที่รูปเพื่อเปลี่ยน</span>
          </div>

          {/* profile fields */}
          <div className="space-y-6 w-full"> {/* Force width */}
            {["name", "studentId", "username", "email"].map(k => (
              <label key={k} className="block w-full">
                <span className="text-sm">
                  {k === "name" ? "ชื่อ-นามสกุล" : k === "studentId" ? "รหัสนิสิต" : k === "username" ? "ชื่อผู้ใช้" : "อีเมล"}
                </span>
                <input
                  value={data[k]}
                  readOnly={k !== "name" && k !== "studentId" || !edit}
                  onChange={e => setData({ ...data, [k]: e.target.value })}
                  className={`input input-bordered w-full min-w-0 ${
                    (!edit || k === "username" || k === "email") && "bg-gray-100 cursor-default"
                  }`}
                  style={{ maxWidth: '100%' }} // Force max width
                />
              </label>
            ))}
          </div>

          {/* edit / save buttons */}
          <div className="w-full"> {/* Force width */}
            {edit ? (
              <div className="flex gap-2 w-full">
                <button onClick={saveInfo}
                        className="flex-1 py-2 rounded-lg bg-primary text-white hover:bg-primary/90">
                  บันทึก
                </button>
                <button onClick={() => { setEdit(false); setMsg(null); }}
                        className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
                  ยกเลิก
                </button>
              </div>
            ) : (
              <button onClick={() => setEdit(true)}
                      className="w-full py-2 rounded-lg bg-primary text-white hover:bg-primary/90">
                แก้ไขข้อมูล
              </button>
            )}
          </div>

          {/* password section - FIXED */}
          <div className="border-t pt-4 w-full overflow-hidden"> {/* Force width and add overflow */}
            <div className="space-y-3 w-full">
              <button
                onClick={() => setPwOpen(!pwOpen)}
                className="w-full py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                style={{ maxWidth: '100%' }} // Force max width
              >
                {pwOpen ? "ซ่อนการเปลี่ยนรหัสผ่าน" : "เปลี่ยนรหัสผ่าน"}
              </button>

              {pwOpen && (
                <div className="space-y-3 w-full overflow-hidden"> {/* Force width and overflow */}
                  {["old", "new1", "new2"].map((k, i) => (
                    <input
                      key={k}
                      type="password"
                      placeholder={i === 0 ? "รหัสผ่านเดิม" : i === 1 ? "รหัสผ่านใหม่" : "ยืนยันรหัสผ่านใหม่"}
                      value={pw[k]}
                      onChange={e => setPw({ ...pw, [k]: e.target.value })}
                      className="input input-bordered w-full min-w-0"
                      style={{ maxWidth: '100%' }} // Force max width
                    />
                  ))}
                  <button
                    onClick={savePwd}
                    className="w-full py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                    style={{ maxWidth: '100%' }} // Force max width
                  >
                    บันทึกรหัสผ่านใหม่
                  </button>
                </div>
              )}
            </div>
          </div>

          {msg && <p className="text-center text-green-600">{msg}</p>}
        </div>
      </div>
    </CenterPage>
  );
}
