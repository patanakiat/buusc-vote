import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import pfp from "../../img/pfp.png";

/* collator ไทย 1 ตัวใช้ซ้ำตลอด  */
const thColl = new Intl.Collator("th", { numeric: true, sensitivity: "base" });

export default function UsersTab() {
  const { registerListener } = useAuth();

  /* raw streams */
  const [usernameDocs , setUsernameDocs ] = useState(null);   // null = ยังโหลด
  const [presenceMap  , setPresenceMap  ] = useState(null);

  /* ui state */
  const [focus , setFocus ] = useState(null);   // modal รายละเอียด
  const [zoom  , setZoom  ] = useState(null);   // modal รูป
  const [search, setSearch] = useState("");

  /* ---------- presence (โหลดก่อน) ---------- */
  useEffect(() => {
    const stop = onSnapshot(collection(db, "presence"), snap => {
      const now = Date.now();
      setPresenceMap(
        Object.fromEntries(
          snap.docs.map(d => [
            d.id,
            now - (d.data().ts?.toMillis?.() || 0) < 120000
          ])
        )
      );
    });
    return registerListener ? registerListener(stop) : stop;
  }, [registerListener]);

  /* ---------- usernames ---------- */
  useEffect(() => {
    const stop = onSnapshot(collection(db, "usernames"), snap =>
      setUsernameDocs(snap.docs)
    );
    return registerListener ? registerListener(stop) : stop;
  }, [registerListener]);

  /* ---------- รวม + ค้น + จัดเรียง ---------- */
  const list = (() => {
    if (!usernameDocs || !presenceMap) return null;         // ยังรอข้อมูล

    /* merge */
    const users = usernameDocs.map(d => {
      const v = d.data();
      return {
        uid       : v.uid,
        id        : d.id,
        name      : v.nameSurname || "",
        email     : v.email       || "",
        studentId : v.studentId   || "",
        photoURL  : v.photoURL    || pfp,
        online    : !!presenceMap[v.uid]
      };
    });

    /* search filter */
    const q = t => (t || "").toLowerCase().includes(search.toLowerCase());
    const filtered = users.filter(u =>
      [u.name, u.id, u.email, u.studentId].some(q)
    );

    /* group & sort */
    const online  = filtered
      .filter(u => u.online)
      .sort((a, b) => thColl.compare(a.name || a.email, b.name || b.email));

    const offline = filtered
      .filter(u => !u.online)
      .sort((a, b) => thColl.compare(a.name || a.email, b.name || b.email));

    return [...online, ...offline];
  })();

  const onlineCnt = list ? list.filter(u => u.online).length : 0;

  /* ---------- lock scroll เมื่อมีโมดัล ---------- */
  useEffect(() => {
    document.body.style.overflow = focus || zoom ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [focus, zoom]);

  /* ---------------- loading state ---------------- */
  if (!list) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4
                        border-blue-500 border-t-transparent" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* avatar zoom - FIXED */}
      {zoom && (
        <div
          onClick={() => setZoom(null)}
          className="cursor-zoom-out"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            padding: 0
          }}>
          <img
            src={zoom}
            alt="avatar-large"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '8px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          />
        </div>
      )}

      {/* header ---------------------------------------------------------- */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold">ผู้ใช้งานระบบ</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-500 rounded-full" />
                ออนไลน์ {onlineCnt}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-gray-400 rounded-full" />
                ออฟไลน์ {list.length - onlineCnt}
              </span>
              <span className="text-gray-500">รวม {list.length}</span>
            </div>
          </div>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาผู้ใช้…"
            className="border px-3 py-2 rounded-lg w-full sm:w-64
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* cards grid ------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {list.map(u => (
          <button
            key={u.uid}
            onClick={() => setFocus(u)}
            className="bg-white border border-gray-200 p-4 rounded-lg text-left hover:shadow transition"
          >
            <div className="flex items-start gap-3">
              <img
                src={u.photoURL}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm truncate">
                  {u.name || u.email}
                </h3>
                <p className="text-xs text-gray-500 truncate">@{u.id}</p>
              </div>
              <span
                className={`w-3 h-3 rounded-full ${
                  u.online ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            </div>
          </button>
        ))}
        {!list.length && (
          <p className="col-span-full py-12 text-center text-gray-500">
            ไม่พบผู้ใช้
          </p>
        )}
      </div>

      {/* detail modal - COMPLETELY FIXED NO WHITE SPACE */}
      {focus && (
        <div
          onClick={() => setFocus(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            margin: 0
          }}>
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-xl shadow-lg border
                       w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg
                       p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between mb-6">
              <h3 className="text-lg font-semibold">รายละเอียด</h3>
              <button
                onClick={() => setFocus(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 pb-4 border-b">
              <img
                src={focus.photoURL}
                alt=""
                onClick={() => setZoom(focus.photoURL)}
                className="w-24 h-24 rounded-full object-cover cursor-zoom-in"
              />
              <h4 className="font-medium">{focus.name || "ไม่ระบุ"}</h4>
              <p className="text-sm text-gray-500">@{focus.id}</p>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  focus.online
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {focus.online ? "ออนไลน์" : "ออฟไลน์"}
              </span>
            </div>

            <div className="space-y-4 mt-4 text-sm">
              <div>
                <p className="text-gray-500">อีเมล</p>
                <p className="break-all">{focus.email}</p>
              </div>
              {focus.studentId && (
                <div>
                  <p className="text-gray-500">รหัสนิสิต</p>
                  <p>{focus.studentId}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">UID</p>
                <p className="break-all text-xs font-mono">{focus.uid}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
