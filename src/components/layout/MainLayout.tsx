import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import authService, { type UserMeResponse } from "../../services/authService";

export default function MainLayout({ user }: { user: UserMeResponse }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar user={user} onAddPage={() => {}} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header Tinh Gọn */}
        <header className="h-9 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-slate-400">Hệ thống quản lý đào tạo /</span>
            <span className="font-semibold text-blue-600">Bảng điều khiển</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-bold leading-none">
                  {user.fullName}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">
                  {user.isSystemAccount ? "Admin" : "Giảng viên"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-[11px]">
                {user.fullName.split(" ").pop()?.charAt(0)}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-[12px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-tight"
            >
              Thoát
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <section className="flex-1 overflow-auto bg-slate-50/50">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
