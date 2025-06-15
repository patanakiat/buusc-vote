import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CenterPage from "../Layout/CenterPage";
import { useAuth } from "../../contexts/AuthContext";
import { storage, db } from "../../lib/firebase";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, query, collection, where, getDocs } from "firebase/firestore";
import {
  updateProfile, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential
} from "firebase/auth";

import pfp from "../../img/pfp.png";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [photo, setPhoto] = useState(user.photoURL || pfp);
  const [msg,   setMsg]   = useState(null);
  const [edit,  setEdit]  = useState(false);
  const [pwOpen,setPwOpen]= useState(false);
  const [pw,    setPw]    = useState({ old:"", new1:"", new2:"" });
  const [data,  setData]  = useState({
    name:"", studentId:"", username:"", email:user.email
  });

  /* ─── load Firestore profile ─── */
  useEffect(() => {
    const q = query(collection(db,"usernames"), where("uid","==",user.uid));
    getDocs(q).then(snap=>{
      if (!snap.empty) {
        const d = snap.docs[0];
        setData({
          name      : d.data().nameSurname || "",
          studentId : d.data().studentId   || "",
          username  : d.id,
          email     : user.email
        });
      }
    });
  }, [user]);

  /* ─── avatar upload ─── */
  async function choosePic(file){
    if(!file) return;
    setMsg("กำลังอัปโหลดรูป…");
    const dest = ref(storage, `profile-pictures/${user.uid}`);
    await uploadBytes(dest, file);
    const url = await getDownloadURL(dest);
    await updateProfile(user, { photoURL: url });
    await updateDoc(doc(db,"usernames",data.username.toLowerCase()),{ photoURL:url },{ merge:true });
    setPhoto(url); setMsg("อัปโหลดรูปสำเร็จ");
  }

  /* ─── save info ─── */
  async function saveInfo(){
    await updateProfile(user,{ displayName:data.name });
    await updateDoc(doc(db,"usernames",data.username.toLowerCase()),{
      nameSurname:data.name, studentId:data.studentId
    });
    setMsg("บันทึกข้อมูลแล้ว"); setEdit(false);
  }

  /* ─── save password ─── */
  async function savePwd(){
    if(pw.new1!==pw.new2) return setMsg("รหัสผ่านใหม่ไม่ตรงกัน");
    const cred = EmailAuthProvider.credential(user.email, pw.old);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, pw.new1);
    setPw({ old:"",new1:"",new2:"" }); setPwOpen(false); setMsg("เปลี่ยนรหัสผ่านสำเร็จ");
  }

  /* ─── UI ─── */
  return (
    <CenterPage>
      {/* outer wrapper centres & scales card on tiny screens */}
      <div className="flex flex-col items-center justify-center w-full
                      p-4 sm:p-0 min-h-screen">

        {/* card : 384 px on ≥sm, 90 vw & scale-95 on xs */}
        <div className="card w-full max-w-[90vw] sm:max-w-sm mx-auto
                        px-4 sm:px-6 py-6 sm:py-8 space-y-6
                        sm:scale-100 scale-95">

          {/* back */}
          <button onClick={()=>navigate("/voting")}
                  className="flex items-center gap-2 text-primary hover:text-primary/80">
            ← กลับหน้าลงคะแนน
          </button>

          <h2 className="text-xl font-bold text-center">โปรไฟล์</h2>

          {/* avatar */}
          <div className="flex flex-col items-center">
            <img src={photo} alt="avatar"
                 onClick={()=>fileRef.current.click()}
                 className="w-28 h-28 rounded-full object-cover border-2 border-primary
                            cursor-pointer hover:opacity-80 transition" />
            <input hidden ref={fileRef} type="file" accept="image/*"
                   onChange={e=>choosePic(e.target.files[0])}/>
            <span className="text-xs text-gray-500 mt-1">คลิกที่รูปเพื่อเปลี่ยน</span>
          </div>

          {/* fields */}
          {["name","studentId","username","email"].map(k=>(
            <label key={k} className="block">
              <span className="text-sm">
                {k==="name"?"ชื่อ-นามสกุล":k==="studentId"?"รหัสนิสิต":k==="username"?"ชื่อผู้ใช้":"อีเมล"}
              </span>
              <input
                value={data[k]}
                readOnly={!edit || k==="username" || k==="email"}
                onChange={e=>setData({...data,[k]:e.target.value})}
                className={`input input-bordered w-full ${
                  (!edit||k==="username"||k==="email") && "bg-gray-100"}`}
              />
            </label>
          ))}

          {/* action buttons */}
          {edit
            ? <div className="flex gap-2">
                <button onClick={saveInfo}
                        className="flex-1 py-2 rounded-lg bg-primary text-white">บันทึก</button>
                <button onClick={()=>{setEdit(false);setMsg(null)}}
                        className="flex-1 py-2 rounded-lg bg-gray-200">ยกเลิก</button>
              </div>
            : <button onClick={()=>setEdit(true)}
                      className="w-full py-2 rounded-lg bg-primary text-white">แก้ไขข้อมูล</button>}

          {/* password change */}
          <div className="border-t pt-4 space-y-3">
            <button onClick={()=>setPwOpen(!pwOpen)}
                    className="w-full py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">
              {pwOpen?"ซ่อนการเปลี่ยนรหัสผ่าน":"เปลี่ยนรหัสผ่าน"}
            </button>

            {pwOpen && (
              <>
                {["old","new1","new2"].map((k,i)=>(
                  <input key={k} type="password"
                         className="input input-bordered w-full"
                         placeholder={i===0?"รหัสผ่านเดิม":i===1?"รหัสผ่านใหม่":"ยืนยันรหัสผ่านใหม่"}
                         value={pw[k]} onChange={e=>setPw({...pw,[k]:e.target.value})}/>
                ))}
                <button onClick={savePwd}
                        className="w-full py-2 rounded-lg bg-primary text-white">
                  บันทึกรหัสผ่านใหม่
                </button>
              </>
            )}
          </div>

          {msg && <p className="text-center text-green-600">{msg}</p>}
        </div>
      </div>
    </CenterPage>
  );
}
