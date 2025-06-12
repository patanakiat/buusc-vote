/*  src/components/Admin/ScoreBoard.jsx
    – ลดสเกลทั้งบอร์ดให้พอดีความสูงจอ (0.60) และขยับข้อความออกห่างกล่อง
      ใช้ gap-20  พร้อมยกบอร์ดขึ้น (-mt-20)  */

      import buuLogo from "../../img/buu.png";

      export default function ScoreBoard({ stats, totalParticipants }) {
        const notVoted = totalParticipants - stats.total;
      
        /* แถวเดียวของข้อมูล */
        const Row = ({ label, value }) => (
          <div className="flex items-center gap-24">      {/* ข้อความห่างกล่องมากขึ้น */}
            <span className="flex-1 text-right font-bold text-5xl">{label}</span>
            <div className="w-64 h-24 bg-gray-500 border-2 border-gray-600 rounded-lg
                            flex items-center justify-center">
              <span className="text-white text-7xl font-bold">{value}</span>
            </div>
          </div>
        );
      
        return (
          /* ย่อบอร์ดทั้งชุดลง 60 % เพื่อไม่ต้องเลื่อนจอ */
          <div className="scale-[0.80] md:scale-[0.90]">
            <div className="w-full flex justify-center">
              {/* ยกขึ้น 80 px */}
              <div className="bg-white border-2 border-gray-400 rounded-lg overflow-hidden
                              max-w-7xl w-full -mt-10">
                {/* ส่วนหัว */}
                <div className="bg-black text-white py-6 text-center">
                  <h2 className="text-3xl font-bold">ผลการลงคะแนนเสียง</h2>
                </div>
      
                {/* ส่วนเนื้อหา */}
                <div className="bg-gray-200 p-12 flex items-center gap-4">
                  {/* โลโก้ใหญ่  */}
                  <img
                    src={buuLogo}
                    alt="BUU"
                    className="w-72 h-72 object-contain flex-shrink-0 ml-12"
                  />
      
                  {/* ตารางผลคะแนน */}
                  <div className="flex-12 space-y-8">
                    <Row label="จำนวนผู้ลงมติ"   value={totalParticipants} />
                    <Row label="เห็นชอบ"        value={stats.เห็นชอบ} />
                    <Row label="ไม่เห็นชอบ"     value={stats.ไม่เห็นชอบ} />
                    <Row label="งดออกเสียง"     value={stats.งดออกเสียง} />
                    <Row label="ไม่ลงคะแนนเสียง" value={notVoted} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      