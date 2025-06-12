/*  src/components/Admin/AdminVoting.jsx
    – เพิ่มเอฟเฟ็กต์ Hover / Click
      • ตัวอักษร-สี + ขอบ-สี (เขียว/แดง/เทา) เหมือนเดิม
      • เมื่อโฮเวอร์: กล่องขยายเล็ก ๆ, พื้นหลังจาง ๆ, เงา, ring
      • เมื่อคลิกค้าง: ยุบเล็กน้อย (active:scale-95)
*/

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminVoting() {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");

  async function vote(choice) {
    const randomUser = "test_" + Math.random().toString(36).slice(2, 8);
    await addDoc(collection(db, "votes"), {
      uid: user.uid,
      username: randomUser,
      choice,
      isAdminTest: true,
      timestamp: serverTimestamp()
    });
    setMsg(`✔ บันทึก “${choice}” แล้ว`);
    setTimeout(() => setMsg(""), 2500);
  }

  const buttons = [
    { label: "เห็นชอบ",     color: "green" },
    { label: "ไม่เห็นชอบ",  color: "red"   },
    { label: "งดออกเสียง",  color: "gray"  }
  ];

  /* util คืนคลาส tailwind ตามสี  */
  const cls = c => `
    w-full py-4 rounded-lg font-bold border-2 border-current
    text-${c}-600 hover:text-${c}-700
    hover:bg-${c}-50 hover:shadow-md hover:ring-2 hover:ring-${c}-300/60
    transform transition duration-150
    hover:scale-105 active:scale-95
  `;

  return (
    <div className="max-w-md mx-auto card text-center space-y-8">
      <h2 className="text-xl font-semibold">ทดสอบลงคะแนน</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {buttons.map(b => (
          <button key={b.label} onClick={() => vote(b.label)} className={cls(b.color)}>
            {b.label}
          </button>
        ))}
      </div>

      {msg && <p className="text-green-600 font-medium">{msg}</p>}
    </div>
  );
}
