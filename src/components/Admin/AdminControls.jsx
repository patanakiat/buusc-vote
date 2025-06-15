export default function AdminControls({ config, updateConfig }) {
  return (
    /* card ตรงกลาง – ไม่มี scale/transition */
    <div className="flex items-center justify-center w-full px-4 sm:px-0">
      <div className="bg-white border border-gray-200 rounded-lg
                      w-full max-w-sm sm:max-w-md md:max-w-lg
                      p-6 space-y-6">

        {/* จำนวนผู้มีสิทธิ์ลงคะแนน */}
        <div>
          <label className="block mb-2 text-sm font-medium">
            จำนวนผู้มีสิทธิ์ลงคะแนน
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={config.totalParticipants}
            onChange={e =>
              updateConfig({
                ...config,
                totalParticipants: +e.target.value || 0
              })
            }
          />
        </div>

        {/* ปุ่มเปิด/ปิด ลงคะแนน – ไม่มีคลาส transition */}
        <button
          onClick={() => updateConfig({ ...config, isOpen: !config.isOpen })}
          className={`w-full py-2 rounded-lg text-white
                      ${config.isOpen
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"}`}
        >
          {config.isOpen ? "ปิดการลงคะแนน" : "เปิดการลงคะแนน"}
        </button>
      </div>
    </div>
  );
}
