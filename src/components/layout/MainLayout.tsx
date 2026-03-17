import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import authService from "../../services/authService";

export default function MainLayout() {
  return (
    <div className="flex bg-slate-50 h-screen overflow-hidden">
      {/* Sidebar - Bỏ fixed, để nó nằm tự nhiên trong flex */}
      <Sidebar
        onAddPage={function (id: string, name: string): void {
          throw new Error("Function not implemented.");
        }}
      />

      {/* Nội dung chính - Chiếm phần còn lại */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div className="text-slate-500 text-[13px] font-medium">
            Hệ thống quản lý đào tạo /{" "}
            <span className="text-slate-900 font-bold tracking-tight">
              Bảng điều khiển
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-100 text-slate-700 rounded border border-slate-200 flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <span className="text-[13px] text-slate-600">
                Xin chào,{" "}
                <span className="font-bold text-slate-900">Admin</span>
              </span>
            </div>
            <button
              className="ml-4 text-[13px] font-bold text-red-600 hover:text-red-700 transition-colors"
              onClick={() => {
                authService.logout();
                window.location.href = "/login";
              }}
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Khu vực nội dung - Xóa max-w-7xl để FlexLayout bung lụa */}
        <div className="flex-1 overflow-hidden relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
