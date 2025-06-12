/*  src/components/Voting/VotingPage.jsx
    – Same UI   +   “เปิด/ปิด” listener
      (แค่เพิ่มตัวแปร isOpen  ไม่แตะเลย์เอาต์) */

      import { useEffect, useState } from "react";
      import CenterPage from "../Layout/CenterPage";
      import { useAuth } from "../../contexts/AuthContext";
      import { fetchVote, submitVote } from "../../lib/votes";
      import { collection, query, where, getDocs, doc, onSnapshot } from "firebase/firestore";
      import { db } from "../../lib/firebase";
      import logo from "../../img/buu.png";
      import UserProfileMenu from "../UI/UserProfileMenu";
      
      /* ---------- listening helper ---------- */
      function useVotingStatus() {
        const [isOpen, setIsOpen] = useState(false);
        useEffect(
          () =>
            onSnapshot(doc(db, "settings", "config"), snap => {
              if (snap.exists()) setIsOpen(!!snap.data().isOpen);
            }),
          []
        );
        return isOpen;
      }
      
      export default function VotingPage() {
        const { user } = useAuth();
      
        /* ---------- state ---------- */
        const [username, setUsername] = useState("");
        const [choice,   setChoice]   = useState("");
        const [saved,    setSaved]    = useState(false);
        const [loading,  setLoading]  = useState(true);
      
        const isOpen = useVotingStatus();           // ← on/off flag
        const display = user?.displayName || "ไม่ระบุ";
      
        /* 1️⃣  ค้น username ด้วย uid */
        useEffect(() => {
          async function run() {
            if (!user?.uid) return;
            const q = query(collection(db, "usernames"), where("uid", "==", user.uid));
            const snap = await getDocs(q);
            if (!snap.empty) setUsername(snap.docs[0].id);
            setLoading(false);
          }
          run();
        }, [user]);
      
        /* 2️⃣  โหลดคะแนนเดิม (ถ้ามี) */
        useEffect(() => {
          if (!username) return;
          fetchVote(username).then((v) => v && setChoice(v.choice));
        }, [username]);
      
        /* 3️⃣  submit */
        async function handleSubmit(e) {
          e.preventDefault();
          if (!isOpen) return;               // ถ้ายังไม่เปิดรับให้ทำอะไร
          await submitVote(username, user.uid, choice);
          setSaved(true);
        }
      
        /* ---------- render ---------- */
        if (loading) {
          return (
            <CenterPage>
              <div className="card w-full max-w-sm">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-gray-600">กำลังโหลด...</span>
                </div>
              </div>
            </CenterPage>
          );
        }
      
        return (
          <CenterPage>
            <div className="relative w-full max-w-sm mx-auto">
              <div className="absolute top-4 right-4">
                <UserProfileMenu />
              </div>
      
              {/* header */}
              <div className="text-center mb-8">
                <img src={logo} alt="BUU Logo" className="w-32 h-32 mx-auto mb-6 drop-shadow-sm" />
              </div>
      
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                {/* voter info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 text-center">
                    ข้อมูลผู้ลงคะแนน
                  </h2>
                </div>
      
                <div className="p-6 space-y-5">
                  {/* details */}
                  <div className="space-y-4">
                    {[
                      ["ชื่อ-นามสกุล", display],
                      ["ชื่อผู้ใช้", username],
                      ["สถานะ", "สมาชิกสภานิสิต"]
                    ].map(([label, val]) => (
                      <div key={label}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {label}
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3
                                        text-center text-gray-800 font-medium">
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>
      
                  {/* select */}
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      เลือกการลงคะแนน <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={choice}
                      onChange={e => {setChoice(e.target.value); setSaved(false);}}
                      required
                      disabled={!isOpen}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center
                                 focus:ring-2 focus:ring-primary focus:border-primary
                                 bg-white text-gray-800 font-medium transition
                                 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="" disabled>-- กรุณาเลือกการลงคะแนน --</option>
                      <option value="เห็นชอบ">เห็นชอบ</option>
                      <option value="ไม่เห็นชอบ">ไม่เห็นชอบ</option>
                      <option value="งดออกเสียง">งดออกเสียง</option>
                    </select>
                  </div>
      
                  {/* notice */}
                  {!isOpen && (
                    <p className="text-center text-sm text-red-600">
                      ระบบยังไม่เปิดรับการลงคะแนน
                    </p>
                  )}
      
                  {/* saved */}
                  {saved && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade">
                      <div className="flex items-center justify-center text-green-700 font-medium">
                        ลงคะแนนเสียงเรียบร้อยแล้ว
                      </div>
                    </div>
                  )}
      
                  {/* submit */}
                  <button
                    type="submit"
                    disabled={!choice || !isOpen}
                    className="w-full py-4 px-6 bg-primary text-white font-semibold rounded-lg
                               hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200"
                  >
                    {isOpen ? (choice ? "ลงคะแนนเสียง" : "กรุณาเลือกการลงคะแนน") : "ปิดรับคะแนน"}
                  </button>
                </div>
              </form>
      
              <div className="text-center mt-6 text-xs text-gray-400">
                ระบบลงคะแนนเสียง | สภานิสิต มหาวิทยาลัยบูรพา
              </div>
            </div>
          </CenterPage>
        );
      }
      