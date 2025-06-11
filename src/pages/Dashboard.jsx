import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <section className="container mx-auto p-6 animate-fade">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          แดชบอร์ดการลงคะแนน สวัสดี {user?.name}
        </h1>
      </header>

      <article className="prose max-w-none">
        <p>นี่คือพื้นที่สำหรับสร้างการโหวต แสดงผลลัพธ์ ฯลฯ</p>
      </article>

      <button
        onClick={logout}
        className="mt-8 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
      >
        ออกจากระบบ
      </button>
    </section>
  );
}
