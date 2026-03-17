export default function HomePage() {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Trang chủ hệ thống OBE</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          Chương trình đào tạo
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          Chuẩn đầu ra (PLO/CLO)
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          Trạng thái phê duyệt
        </div>
      </div>
    </>
  );
}
