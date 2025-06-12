import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [focus, setFocus] = useState(null);

  /* pull usernames + presence */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "usernames"), async snap => {
      const now = Date.now();
      const arr = await Promise.all(
        snap.docs.map(async d => {
          const data = d.data();
          const pres = await getDoc(doc(db, "presence", data.uid));
          const last = pres.exists() ? pres.data().ts?.toMillis?.() : 0;
          const online = now - last < 120000; // 2 min
          return { id: d.id, ...data, online };
        })
      );
      setUsers(arr);
    });
    return unsub;
  }, []);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* list */}
      <div className="space-y-2">
        {users.map(u => (
          <button
            key={u.uid}
            onClick={() => setFocus(u)}
            className="w-full flex items-center justify-between bg-white px-4 py-3 rounded-lg 
                       shadow hover:shadow-md transition"
          >
            <span className="font-medium truncate">{u.nameSurname || u.email}</span>
            <span className={`w-3 h-3 rounded-full ${u.online ? "bg-green-500" : "bg-gray-400"}`} />
          </button>
        ))}
      </div>

      {/* detail */}
      {focus && (
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">ข้อมูลผู้ใช้</h3>
            <button onClick={() => setFocus(null)} className="text-sm text-gray-500">✕ ปิด</button>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <dt className="font-medium">ชื่อ-สกุล</dt> <dd>{focus.nameSurname}</dd>
            <dt className="font-medium">ชื่อผู้ใช้</dt> <dd>{focus.id}</dd>
            <dt className="font-medium">อีเมล</dt>     <dd>{focus.email}</dd>
            <dt className="font-medium">รหัสนิสิต</dt> <dd>{focus.studentId || "-"}</dd>
            <dt className="font-medium">สถานะ</dt>
            <dd className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${focus.online ? "bg-green-500" : "bg-gray-400"}`} />
              {focus.online ? "ออนไลน์" : "ออฟไลน์"}
            </dd>
          </dl>
        </div>
      )}
    </div>
  );
}
