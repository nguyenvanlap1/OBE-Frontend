import { MousePointer2, Columns, Maximize2, Layers } from "lucide-react";

const Introduction = () => {
  const instructions = [
    {
      title: "Điều hướng danh mục",
      desc: "Sử dụng Menu bên trái để mở các chức năng chính. Mỗi chức năng sẽ mở ra một Tab mới trong vùng làm việc.",
      icon: MousePointer2,
    },
    {
      title: "Quản lý đa nhiệm",
      desc: "Bạn có thể nắm giữ tiêu đề Tab và kéo thả để chia màn hình (trái/phải/trên/dưới) giúp so sánh dữ liệu dễ dàng.",
      icon: Columns,
    },
    {
      title: "Tối ưu không gian",
      desc: "Nhấn đúp chuột vào tiêu đề Tab hoặc sử dụng nút Phóng to để tập trung làm việc trên một màn hình duy nhất.",
      icon: Maximize2,
    },
    {
      title: "Làm việc song song",
      desc: "Hệ thống cho phép mở đồng thời danh sách và nhiều chi tiết cùng lúc mà không làm mất trạng thái dữ liệu.",
      icon: Layers,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-slate-50 p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wide">
            Hướng dẫn thao tác hệ thống
          </h1>
          <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {instructions.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex gap-5 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group">
                <div className="shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <p className="text-sm text-amber-800 font-medium">
            Lưu ý: Mọi thay đổi về vị trí các Tab sẽ được hệ thống ghi nhớ tự động trong phiên làm việc hiện tại.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Introduction;