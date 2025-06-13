import {
  createContext, useContext, useEffect, useRef, useState
} from "react";
import {
  setPersistence, browserLocalPersistence,
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, updateProfile,
  sendEmailVerification, signOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

auth.languageCode = "th";
const AuthCtx = createContext();

/* ───────────────── provider ───────────────── */
export function AuthProvider({ children }) {
  const [user,    setUser]   = useState(undefined);
  const [isAdmin, setAdmin]  = useState(false);
  const [loading, setLoad]   = useState(true);
  const listeners            = useRef([]);

  /* keep session */
  useEffect(()=>{ setPersistence(auth, browserLocalPersistence); }, []);

  /* auth state */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async u=>{
      if (u) {
        const adm = await getDoc(doc(db,"admins",u.email));
        setAdmin(adm.exists());
      } else {
        setAdmin(false);
        listeners.current.forEach(fn=>fn?.());
        listeners.current = [];
      }
      setUser(u); setLoad(false);
    });
    return unsub;
  },[]);

  const registerListener = (un)=>(listeners.current.push(un),un);

  /* ---------------- LOGIN (case-insensitive username) ---------------- */
  async function login({ username, password }) {
    const key = username.trim().toLowerCase();      // canonical key
    let snap  = await getDoc(doc(db,"usernames",key));

    /* fallback – support legacy mixed-case docs */
    if (!snap.exists() && key !== username.trim())
      snap = await getDoc(doc(db,"usernames",username.trim()));

    if (!snap.exists())
      return { ok:false, msg:"ไม่พบชื่อผู้ใช้" };

    try {
      await signInWithEmailAndPassword(auth, snap.data().email, password);

      /* admin flag */
      const admDoc = await getDoc(doc(db,"admins", snap.data().email));
      const admin  = admDoc.exists();

      /* verify for non-admin */
      await auth.currentUser.reload();
      if (!admin && !auth.currentUser.emailVerified) {
        await signOut(auth);
        return { ok:false,
                 msg:"กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ กรุณาตรวจสอบกล่องจดหมายหรือสแปม" };
      }
      return { ok:true, admin };
    } catch (e) {
      return {
        ok : false,
        msg: e.code==="auth/invalid-credential" ? "รหัสผ่านไม่ถูกต้อง"
                                                : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"
      };
    }
  }

  /* ---------------- REGISTER (store username lower-case) ---------------- */
  async function register(p) {
    const { nameSurname, studentId, username, email, password } = p;
    const key = username.trim().toLowerCase();      // canonical

    if ((await getDoc(doc(db,"usernames",key))).exists())
      return { ok:false, msg:"ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" };

    try {
      const cred = await createUserWithEmailAndPassword(auth,email,password);
      await updateProfile(cred.user,{ displayName:nameSurname });

      /* store under lower-case key; keep original case in a field */
      await setDoc(doc(db,"usernames",key),{
        uid:cred.user.uid, email, nameSurname, studentId,
        usernameOriginal: username
      });

      await sendEmailVerification(cred.user);
      await signOut(auth);
      return { ok:true };
    } catch (e) {
      return {
        ok:false,
        msg:e.code==="auth/email-already-in-use"?"อีเมลนี้ถูกใช้ไปแล้ว":e.message
      };
    }
  }

  /* ---------------- LOGOUT ---------------- */
  const logout = async ()=>{
    listeners.current.forEach(fn=>fn?.());  listeners.current=[];
    await signOut(auth);
  };

  /* ---------------- render ---------------- */
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
        <span className="ml-3">กำลังโหลด...</span>
      </div>
    );

  return (
    <AuthCtx.Provider
      value={{ user, isAdmin, login, register, logout, registerListener }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
