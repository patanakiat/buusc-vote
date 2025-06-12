import { useState, useEffect, useRef } from "react";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs
} from "firebase/firestore";
import html2canvas from "html2canvas";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";

/* -------------------------------------------------- */
/* styles kept as objects so html2canvas captures them */
const cardStyles = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "32px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)"
};
const summaryCardStyle = (c) => ({
  backgroundColor:
    c === "blue"   ? "#dbeafe" :
    c === "green"  ? "#dcfce7" :
    c === "red"    ? "#fee2e2" :
    c === "orange" ? "#ffedd5" : "#f3f4f6",
  border: `1px solid ${
    c === "blue"   ? "#93c5fd" :
    c === "green"  ? "#86efac" :
    c === "red"    ? "#fca5a5" :
    c === "orange" ? "#fdba74" : "#d1d5db"} `,
  borderRadius: "12px",
  padding: "16px",
  textAlign: "center"
});
const summaryTextStyle = (c,bold)=>({
  color:
    c==="blue"   ? "#1e40af":
    c==="green"  ? "#166534":
    c==="red"    ? "#991b1b":
    c==="orange" ? "#9a3412":   "#374151",
  fontSize: bold? "24px":"14px",
  fontWeight: bold? "bold":"500",
  marginBottom: bold? "0":"8px"
});
/* -------------------------------------------------- */

export default function VoteDetailsTab({ totalParticipants }) {
  const { registerListener } = useAuth();

  const [nameMap, setNameMap] = useState({});
  const [rows,    setRows]    = useState([]);
  const [stats,   setStats]   = useState({เห็นชอบ:0,ไม่เห็นชอบ:0,งดออกเสียง:0,total:0});
  const [confirm, setConfirm] = useState(false);
  const shotRef = useRef(null);

  /* -------- cache all usernames once -------- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db,"usernames"), snap => {
      const map = {};
      snap.forEach(d => { map[d.id] = d.data().nameSurname || d.id; });
      setNameMap(map);
    });
    return registerListener ? registerListener(unsub) : unsub;
  }, [registerListener]);

  /* -------- live votes list -------- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db,"votes"), snap => {
      const list = snap.docs.map(d => {
        const v = d.data();
        const id = d.id;
        const date = v.ts?.toDate?.() || v.timestamp?.toDate?.() || null;
        return {
          id,
          user     : nameMap[id] || id,
          username : id,
          choice   : v.choice,
          ts       : date ? date.toLocaleString("th-TH",{dateStyle:"short",timeStyle:"short"}) : "-",
          dateMs   : date ? date.getTime() : 0
        };
      });
      list.sort((a,b)=>a.dateMs-b.dateMs);
      setRows(list);

      const s={เห็นชอบ:0,ไม่เห็นชอบ:0,งดออกเสียง:0,total:0};
      list.forEach(r=>{ if(s[r.choice]!=null) s[r.choice]++; s.total++; });
      setStats(s);
    });
    return registerListener ? registerListener(unsub) : unsub;
  }, [nameMap,registerListener]);

  const notVoted = Math.max(0,totalParticipants-stats.total);

  /* -------- utils -------- */
  const getChoiceColor = c =>
    c==="เห็นชอบ"   ? "#dcfce7"
  : c==="ไม่เห็นชอบ"? "#fee2e2"
  :                    "#f3f4f6";

  async function deleteVote(id){
    if(window.confirm("ลบคะแนนนี้?"))
      await deleteDoc(doc(db,"votes",id));
  }

  async function wipeAll(){
    const snap = await getDocs(collection(db,"votes"));
    await Promise.all(snap.docs.map(d=>deleteDoc(d.ref)));

    /* clear UI immediately */
    setRows([]);
    setStats({เห็นชอบ:0,ไม่เห็นชอบ:0,งดออกเสียง:0,total:0});
    setConfirm(false);
  }

  async function downloadJPEG(){
    await new Promise(r=>setTimeout(r,100));   // wait layout
    const canvas = await html2canvas(shotRef.current,{scale:2,backgroundColor:"#fff"});
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg",0.95);
    link.download = `vote-details-${Date.now()}.jpg`;
    link.click();
  }

  /* -------- UI -------- */
  return (
    <div className="max-w-6xl mx-auto">

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-center mb-4">ยืนยันการเริ่มใหม่</h3>
            <p className="text-gray-600 text-center mb-6">
              การดำเนินการนี้จะลบข้อมูลคะแนนทั้งหมด ต้องการดำเนินการต่อหรือไม่?
            </p>
            <div className="flex gap-3">
              <button onClick={()=>setConfirm(false)}
                      className="flex-1 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200">
                ยกเลิก
              </button>
              <button onClick={wipeAll}
                      className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700">
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* printable container */}
      <div ref={shotRef} style={cardStyles}>

        {/* header + actions */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"32px"}}>
          <h2 style={{fontSize:"24px",fontWeight:"bold",color:"#1f2937"}}>ผลการลงคะแนนเสียง</h2>
          <div style={{display:"flex",gap:"12px"}}>
            <button onClick={downloadJPEG}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              ดาวน์โหลด JPEG
            </button>
            <button onClick={()=>setConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
              เริ่มการลงคะแนนใหม่
            </button>
          </div>
        </div>

        {/* summary cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"16px",marginBottom:"32px"}}>
          {[
            {l:"ผู้ลงมติ",  v:totalParticipants, col:"blue"},
            {l:"เห็นชอบ",  v:stats.เห็นชอบ,     col:"green"},
            {l:"ไม่เห็นชอบ",v:stats.ไม่เห็นชอบ, col:"red"},
            {l:"งดออกเสียง",v:stats.งดออกเสียง,col:"gray"},
            {l:"ไม่ลงคะแนน",v:notVoted,          col:"orange"},
          ].map(({l,v,col})=>(
            <div key={l} style={summaryCardStyle(col)}>
              <div style={summaryTextStyle(col,false)}>{l}</div>
              <div style={summaryTextStyle(col,true)}>{v}</div>
            </div>
          ))}
        </div>

        {/* vote table */}
        <div style={{overflow:"hidden",border:"1px solid #d1d5db",borderRadius:"12px"}}>
          <table style={{width:"100%",borderCollapse:"collapse",background:"#fff"}}>
            <thead style={{background:"#f9fafb"}}>
              {["ชื่อ-สกุล","Username","ตัวเลือก","เวลา","จัดการ"].map((h,i)=>(
                <th key={h} style={{
                  padding:"16px",textAlign:i===4?"center":"left",
                  fontSize:"14px",fontWeight:"600",color:"#374151",
                  width:["25%","25%","20%","20%","10%"][i]
                }}>{h}</th>
              ))}
            </thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={r.id} style={{
                  background:i%2?"#f9fafb":"#fff",
                  borderTop:"1px solid #e5e7eb"
                }}>
                  <td style={{padding:"16px",fontSize:"14px",fontWeight:"500"}}>{r.user}</td>
                  <td style={{padding:"16px",fontSize:"14px",color:"#6b7280"}}>{r.username}</td>
                  <td style={{padding:"16px"}}>
                    <span style={{
                      display:"inline-flex",padding:"4px 12px",borderRadius:"6px",
                      fontSize:"12px",fontWeight:"500",background:getChoiceColor(r.choice),
                      border:"1px solid #d1d5db"
                    }}>{r.choice}</span>
                  </td>
                  <td style={{padding:"16px",fontSize:"14px",color:"#6b7280"}}>{r.ts}</td>
                  <td style={{padding:"16px",textAlign:"center"}}>
                    <button onClick={()=>deleteVote(r.id)}
                      style={{color:"#dc2626",padding:"8px",border:"none",background:"transparent",cursor:"pointer"}}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={5} style={{padding:"48px",textAlign:"center",color:"#6b7280"}}>
                  ยังไม่มีการลงคะแนน
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
