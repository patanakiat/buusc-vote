import { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";

import ScoreBoard     from "./ScoreBoard";
import AdminVoting    from "./AdminVoting";
import UsersTab       from "./UsersTab";
import VoteDetailsTab from "./VoteDetailsTab";
import AdminControls  from "./AdminControls";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  /* ---------------- live data ---------------- */
  const [tab, setTab]   = useState("results");
  const [stat, setStat] = useState({เห็นชอบ:0,ไม่เห็นชอบ:0,งดออกเสียง:0,total:0});
  const [cfg , setCfg]  = useState({isOpen:false,totalParticipants:0});

  useEffect(() => onSnapshot(collection(db,"votes"), snap=>{
    const x={เห็นชอบ:0,ไม่เห็นชอบ:0,งดออกเสียง:0,total:0};
    snap.forEach(d=>{ const c=d.data().choice; if(x[c]!=null){ x[c]++; x.total++; }});
    setStat(x);
  }), []);

  useEffect(()=> onSnapshot(doc(db,"settings","config"), d=>{
    d.exists() && setCfg(d.data());
  }), []);

  const writeCfg = v => setDoc(doc(db,"settings","config"), v);

  /* ---------------- toggle ---------------- */
  const Toggle = () => (
    <label className="relative inline-flex items-center cursor-pointer select-none">
      <input type="checkbox" className="sr-only peer"
             checked={cfg.isOpen}
             onChange={e=>writeCfg({...cfg,isOpen:e.target.checked})}/>
      <div className={`w-11 h-6 rounded-full border transition-colors
                       ${cfg.isOpen?"bg-green-500 border-green-500"
                                    :"bg-red-500   border-red-500"}`} />
      <span className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white
                        transition-transform ${cfg.isOpen && "translate-x-5"}`} />
    </label>
  );

  const labels = {
    results : "ผลการลงคะแนน",
    controls: "ตั้งค่า",
    test    : "ทดสอบ",
    users   : "ผู้ใช้งาน",
    details : "รายละเอียดคะแนน"
  };

  /* -------- scroll centre on active tab -------- */
  const listRef = useRef(null);
  const btnRef  = useRef({});

  useEffect(()=>{
    const el = btnRef.current[tab];
    el?.scrollIntoView({ behavior:"smooth", inline:"center", block:"nearest" });
  }, [tab]);

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">

      {/* top bar */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
          <h1 className="font-semibold">แผงควบคุมผู้ดูแลระบบ</h1>

          <div className="flex items-center gap-6">
            {/* desktop toggle */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm">{cfg.isOpen ? "เปิดลงคะแนน" : "ปิดลงคะแนน"}</span>
              <Toggle/>
            </div>
            <span className="hidden lg:block text-sm text-gray-500">{user.email}</span>
            <button onClick={logout}
              className="px-3 py-1.5 text-sm rounded bg-gray-900 text-white hover:bg-gray-800">
              ออกจากระบบ
            </button>
          </div>
        </div>

        {/* tab bar – scroll-snap & auto-center on mobile */}
        <nav className="border-t bg-white">
          <div
            ref={listRef}
            className="max-w-7xl mx-auto flex overflow-x-auto scrollbar-hide
                       snap-x snap-mandatory sm:overflow-x-visible">
            {Object.entries(labels).map(([id,label])=>(
              <button
  key={id}
  ref={el => (btnRef.current[id] = el)}
  onClick={()=>setTab(id)}
  className={`
    flex-shrink-0 px-5 snap-center sm:flex-1 sm:px-0
    py-3 text-sm font-medium border-b-2
    ${tab===id
      ? "border-gray-900 text-gray-900"
      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
>
  {label}
</button>
            ))}
          </div>
        </nav>
      </header>

      {/* content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {tab==="results" && (
          <ScoreBoard stats={stat} totalParticipants={cfg.totalParticipants}/>
        )}

        {tab==="controls" && (
          <div className="max-w-sm sm:max-w-xl mx-auto card text-center space-y-8">

            {/* จำนวนผู้ลงมติ */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold">จำนวนผู้ลงมติ</label>
              <input type="number" min={0}
                className="input input-bordered w-40 mx-auto text-center font-medium"
                value={cfg.totalParticipants}
                onChange={e=>writeCfg({...cfg,totalParticipants:+e.target.value||0})}/>
            </div>

            {/* mobile toggle */}
            <div className="sm:hidden flex items-center justify-center gap-2 mt-6 pt-8 border-t w-full">
              <span className="text-sm">{cfg.isOpen?"เปิดลงคะแนน":"ปิดลงคะแนน"}</span>
              <Toggle/>
            </div>
          </div>
        )}

        {tab==="test"    && <AdminVoting    />}
        {tab==="users"   && <UsersTab       />}
        {tab==="details" && <VoteDetailsTab totalParticipants={cfg.totalParticipants}/> }
      </main>
    </div>
  );
}
