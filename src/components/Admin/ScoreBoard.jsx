import buuLogo from "../../img/buu.png";

export default function ScoreBoard({ stats, totalParticipants }) {
  const notVoted = totalParticipants - stats.total;

  /* one row – desktop sizes untouched (`lg:`) */
  const Row = ({ label, value }) => (
    <div className="flex items-center gap-6 sm:gap-8 md:gap-12 lg:gap-24">
      {/* label – original 5xl kept at lg, smaller below */}
      <span className="flex-1 text-right font-bold
                       text-base sm:text-2xl md:text-3xl lg:text-5xl
                       leading-tight whitespace-nowrap">
        {label}
      </span>

      {/* number box – original 64×24 at lg, smaller below */}
      <div className="flex-shrink-0 rounded-lg bg-gray-500 border-2 border-gray-600
                      w-24 h-12 sm:w-32 sm:h-14 md:w-40 md:h-16 lg:w-64 lg:h-24
                      flex items-center justify-center">
        <span className="text-white font-bold
                         text-2xl sm:text-3xl md:text-4xl lg:text-7xl">
          {value}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex justify-center w-full">

      {/* scale wrapper – identical design, only scaled down on narrow screens */}
      <div className="
        transform origin-top
        scale-[0.80]    /* <640  */
        sm:scale-[0.85] /* 640–767 */
        md:scale-[0.90] /* 768–1023 */
        lg:scale-[0.95] /* 1024–1279 */
        xl:scale-100">  {/* 1280+ */}

        <div className="bg-white border-2 border-gray-400 rounded-lg overflow-hidden
                        max-w-7xl w-full">

          {/* header */}
          <div className="bg-black text-white py-6 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold">
              ผลการลงคะแนนเสียง
            </h2>
          </div>

          {/* body */}
          <div className="bg-gray-200 p-6 lg:p-12 flex items-center gap-6 lg:gap-12">

            {/* logo */}
            <img
              src={buuLogo}
              alt="BUU"
              className="w-32 h-32 sm:w-40 sm:h-40 lg:w-72 lg:h-72
                         object-contain flex-shrink-0 ml-0 lg:ml-12" />

            {/* table */}
            <div className="flex-1 space-y-4 sm:space-y-6 lg:space-y-8 min-w-0">
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
