/*  src/components/Admin/VoteDetailsTab.jsx
 *  – high-DPI JPEG export (identical quality on iPad & PC)
 *  – keeps the original look / layout
 */

import { useState, useEffect, useRef } from "react";
import {
  collection, onSnapshot, doc, deleteDoc, getDocs
} from "firebase/firestore";
import html2canvas from "html2canvas";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";

/* ---------- desktop board spec ---------- */
const BOARD_WIDTH = 1024;

/* inline styles (html2canvas reads computed values only) */
const cardStyles = {
  background   : "#fff",
  borderRadius : "16px",
  padding      : "32px",
  border       : "1px solid #e5e7eb",
  boxShadow    : "0 25px 50px -12px rgba(0,0,0,.25)",
  width        : BOARD_WIDTH + "px"
};
const summaryCard = c => ({
  background: {blue:"#dbeafe",green:"#dcfce7",red:"#fee2e2",
               orange:"#ffedd5",gray:"#f3f4f6"}[c],
  border: `1px solid ${
    {blue:"#93c5fd",green:"#86efac",red:"#fca5a5",
     orange:"#fdba74",gray:"#d1d5db"}[c]}`,
  borderRadius:"12px",padding:"16px",textAlign:"center",flex:"1 1 120px"
});
const txt = (c,b)=>({
  color:{blue:"#1e40af",green:"#166534",red:"#991b1b",
         orange:"#9a3412",gray:"#374151"}[c],
  fontSize:b?"24px":"14px",fontWeight:b?"bold":"500",marginBottom:b?0:8
});

/* responsive scale (fit width / handle rotation) */
function useScale(base){
  const calc=()=>Math.min(1,(window.innerWidth-24)/base);
  const[sc,set]=useState(calc);
  useEffect(()=>{
    let t;const up=()=>{clearTimeout(t);t=setTimeout(()=>set(calc()),80)};
    window.addEventListener("resize",up);
    window.addEventListener("orientationchange",up);
    window.visualViewport?.addEventListener("resize",up);
    return()=>{window.removeEventListener("resize",up);
      window.removeEventListener("orientationchange",up);
      window.visualViewport?.removeEventListener("resize",up);clearTimeout(t);}
  },[base]);return sc;
}

/* ---------------- component ---------------- */
export default function VoteDetailsTab({ totalParticipants }) {
  const scale = useScale(BOARD_WIDTH);
  const { registerListener } = useAuth();
  const shotRef = useRef(null);

  const [names,setNames]=useState({});
  const [rows ,setRows ]=useState([]);
  const [stats,setStats]=useState({เห็นชอบ:0,ไม่เห็นชอบ:0,งดออกเสียง:0,total:0});
  const [confirm,setConfirm]=useState(false);

  /* cache display names */
  useEffect(()=>{
    const u=onSnapshot(collection(db,"usernames"),s=>{
      const m={};s.forEach(d=>{m[d.id]=d.data().nameSurname||d.id});setNames(m);
    });
    return registerListener?registerListener(u):u;
  },[registerListener]);

  /* live votes */
  useEffect(()=>{
    const u=onSnapshot(collection(db,"votes"),s=>{
      const list=s.docs.map(d=>{
        const v=d.data();const dt=v.ts?.toDate?.()||v.timestamp?.toDate?.();
        return{
          id:d.id,user:names[d.id]||d.id,username:d.id,choice:v.choice,
          ts:dt?dt.toLocaleString("th-TH",{dateStyle:"short",timeStyle:"short"}):"-",
          ms:dt?dt.getTime():0
        };
      }).sort((a,b)=>a.ms-b.ms);
      setRows(list);
      const x={เห็นชอบ:0,ไม่เห็นชอบ:0,งดออกเสียง:0,total:list.length};
      list.forEach(r=>{if(x[r.choice]!=null)x[r.choice]++});setStats(x);
    });
    return registerListener?registerListener(u):u;
  },[names,registerListener]);

  const notVoted=Math.max(0,totalParticipants-stats.total);

  const colBg=c=>c==="เห็นชอบ"?"bg-green-100 text-green-800":
                 c==="ไม่เห็นชอบ"?"bg-red-100 text-red-800":
                 "bg-gray-100 text-gray-800";

  async function deleteVote(id){
    if(window.confirm("ลบคะแนนนี้?"))await deleteDoc(doc(db,"votes",id));
  }
  async function wipeAll(){
    const snap=await getDocs(collection(db,"votes"));
    await Promise.all(snap.docs.map(d=>deleteDoc(d.ref)));
    setConfirm(false);
  }

  /* ------------------------------------------------------------------
   *  DOWNLOAD  (high-DPI, glitch-free on every platform)
   * ------------------------------------------------------------------ */
  async function downloadJPEG(){
    /* 1) clone the board */
    const clone = shotRef.current.cloneNode(true);
    clone.style.transform = "none";
    clone.style.width     = BOARD_WIDTH + "px";

    /* expand the scroll container to reveal every row */
    const sc = clone.querySelector("[data-scroll]");
    if (sc){
      sc.style.maxHeight = "none";
      sc.style.overflow  = "visible";
    }

    /* move clone off-screen */
    const wrap = document.createElement("div");
    wrap.style.position = "fixed";
    wrap.style.left     = "-9999px";
    wrap.style.top      = "0";
    wrap.appendChild(clone);
    document.body.appendChild(wrap);

    try{
      /* 2) rasterise – use fixed scale=2 (guaranteed crisp, avoids PC half-pixel glitch) */
      const canvas = await html2canvas(clone,{
        scale        : 2,                // fixed ⬅️[1]
        background   : "#fff",
        useCORS      : true,
        letterRendering: true,
        allowTaint   : false,
        foreignObjectRendering: false,
        scrollX      : 0,
        scrollY      : 0,
        width        : BOARD_WIDTH,
        height       : clone.scrollHeight
      });

      /* 3) trigger download */
      const a=document.createElement("a");
      a.href     = canvas.toDataURL("image/jpeg",0.95);
      a.download = `vote-details-${Date.now()}.jpg`;
      a.click();
    }finally{
      wrap.remove();
    }
  }                                                   // ← fixed logic mirrors demo [1]

  /* ------------ UI ------------ */
  return(
  <div className="w-full flex justify-center overflow-x-auto py-6">
    <div style={{transform:`scale(${scale})`,transformOrigin:"top center",width:BOARD_WIDTH}}>
      <div ref={shotRef} style={cardStyles}>
        {/* header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <h2 className="text-xl font-bold">ผลการลงคะแนนเสียง</h2>
          <div className="flex gap-3">
            <button onClick={downloadJPEG}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              ดาวน์โหลด JPEG
            </button>
            <button onClick={()=>setConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              เริ่มการลงคะแนนใหม่
            </button>
          </div>
        </div>

        {/* summary */}
        <div style={{display:"flex",flexWrap:"wrap",gap:16,marginBottom:32}}>
          {[{l:"ผู้ลงมติ",v:totalParticipants,col:"blue"},
            {l:"เห็นชอบ",v:stats.เห็นชอบ,col:"green"},
            {l:"ไม่เห็นชอบ",v:stats.ไม่เห็นชอบ,col:"red"},
            {l:"งดออกเสียง",v:stats.งดออกเสียง,col:"gray"},
            {l:"ไม่ลงคะแนน",v:notVoted,col:"orange"}]
            .map(({l,v,col})=>(
            <div key={l} style={summaryCard(col)}>
              <div style={txt(col,false)}>{l}</div>
              <div style={txt(col,true)}>{v}</div>
            </div>
          ))}
        </div>

        {/* table */}
        <div data-scroll
             style={{overflow:"auto",border:"1px solid #d1d5db",
                     borderRadius:12,maxHeight:"70vh"}}>
          <table style={{minWidth:800,width:"100%",borderCollapse:"collapse"}}>
            <thead style={{background:"#f9fafb"}}>
              {["ชื่อ-สกุล","Username","ตัวเลือก","เวลา","จัดการ"].map((h,i)=>(
                <th key={h}
                    style={{padding:16,textAlign:i===4?"center":"left",
                            fontSize:14,fontWeight:600,color:"#374151"}}>{h}</th>
              ))}
            </thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={r.id}
                    style={{background:i%2?"#f9fafb":"#fff",
                            borderTop:"1px solid #e5e7eb"}}>
                  <td style={{padding:16,fontSize:14,fontWeight:500}}>{r.user}</td>
                  <td style={{padding:16,fontSize:14,color:"#6b7280"}}>{r.username}</td>
                  <td style={{padding:16}}>
                    <span className={`px-2 py-1 rounded text-xs ${colBg(r.choice)}`}>
                      {r.choice}
                    </span>
                  </td>
                  <td style={{padding:16,fontSize:14,color:"#6b7280"}}>{r.ts}</td>
                  <td style={{padding:16,textAlign:"center"}}>
                    <button onClick={()=>deleteVote(r.id)}
                      style={{color:"#dc2626",padding:8,background:"none",
                              border:"none",cursor:"pointer"}}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={5}
                  style={{padding:48,textAlign:"center",color:"#6b7280"}}>
                    ยังไม่มีการลงคะแนน
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* confirm modal */}
    {confirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
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
  </div>
  );
}
