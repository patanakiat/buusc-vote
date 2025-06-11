import {
    createContext, useContext, useEffect, useState
  } from "react";
  import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut
  } from "firebase/auth";
  import {
    doc, getDoc, setDoc
  } from "firebase/firestore";
  import { auth, db } from "../lib/firebase";
  
  /* --------------------------------------------------------- */
  const AuthCtx = createContext();
  
  /* provider keeps <App/> in sync with Firebase session */
  export function AuthProvider({ children }) {
    const [user, setUser] = useState(undefined); // undefined = still loading
  
    useEffect(() =>
      onAuthStateChanged(auth, u => setUser(u || null)), []);
  
    /* --------------- LOGIN (username + password) --------------- */
    async function login({ username, password }) {
      try {
        // 1️⃣ look up username → e-mail
        const snap = await getDoc(doc(db, "usernames", username));
        if (!snap.exists()) return { ok: false, msg: "ไม่พบชื่อผู้ใช้" };
  
        const { email } = snap.data();
        // 2️⃣ real Firebase sign-in
        await signInWithEmailAndPassword(auth, email, password);
        return { ok: true };
      } catch (err) {
        return { ok: false, msg: err.message };
      }
    }
  
    /* --------------- REGISTER --------------- */
    async function register({ nameSurname, studentId, username, email, password }) {
      try {
        // create Auth user
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: nameSurname });
  
        // store username → email mapping
        await setDoc(doc(db, "usernames", username), {
          uid: cred.user.uid,
          email,
          nameSurname,
          studentId
        });
        return { ok: true };
      } catch (err) {
        return { ok: false, msg: err.message };
      }
    }
  
    function logout() {
      return signOut(auth);
    }
  
    return (
      <AuthCtx.Provider value={{ user, login, register, logout }}>
        {children}
      </AuthCtx.Provider>
    );
  }
  
  /* -------------------- hooks -------------------- */
  export const useAuth = () => useContext(AuthCtx);
  
  export function RequireAuth({ children }) {
    const { user } = useAuth();
    if (user === undefined) return <p className="text-center mt-20">กำลังโหลด...</p>;
    return user ? children : <h2 className="text-center mt-20">กรุณาเข้าสู่ระบบ</h2>;
  }
  