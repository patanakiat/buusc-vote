export default function AdminControls({ config, updateConfig }) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg max-w-md mx-auto p-6 space-y-6">
  
        <div>
          <label className="block mb-2 text-sm font-medium">จำนวนผู้มีสิทธิ์ลงคะแนน</label>
          <input type="number" className="input input-bordered w-full"
                 value={config.totalParticipants}
                 onChange={e=>updateConfig({...config,totalParticipants:+e.target.value||0})}/>
        </div>
  
        <button onClick={()=>updateConfig({...config,isOpen:!config.isOpen})}
                className={`w-full py-2 rounded-lg text-white transition
                           ${config.isOpen?"bg-red-600 hover:bg-red-700"
                                           :"bg-green-600 hover:bg-green-700"}`}>
          {config.isOpen?"ปิดการลงคะแนน":"เปิดการลงคะแนน"}
        </button>
      </div>
    );
  }
  