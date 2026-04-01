import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import thêm Link
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  UserCircle,
} from "lucide-react";
import type { UserMeResponse } from "../../services/authService";

interface NavItem {
  label: string;
  id: string; // Dùng ID để match với onAddPage của bạn
  icon: React.ElementType;
  path: string;
}

interface SidebarProps {
  onAddPage: (id: string, name: string) => void;
  user: UserMeResponse | null; // Thêm prop user
}

export default function Sidebar({ onAddPage, user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const menuItems: NavItem[] = [
    {
      label: "Bảng điều khiển",
      id: "dashboard",
      icon: LayoutDashboard,
      path: "/category-management",
    },
    {
      label: user?.fullName || "Tài khoản",
      id: "profile",
      icon: UserCircle,
      path: "/profile",
    },
    {
      label: "Cài đặt",
      id: "settings",
      icon: Settings,
      path: "",
    },
  ];

  return (
    <div
      className={`h-screen bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-800 ${
        isCollapsed ? "w-14" : "w-40" // Giảm w-16 -> w-14 và w-64 -> w-56
      }`}
    >
      {/* Header & Toggle Button */}
      <div className="h-14 flex items-center px-2 border-b border-slate-800 bg-slate-950/50">
        {!isCollapsed && (
          <span className="text-[14px] font-black tracking-tighter text-white uppercase opacity-80">
            OBE <span className="text-blue-500">{user?.fullName}</span>
          </span>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1 rounded-md hover:bg-slate-800 transition-colors text-slate-500 hover:text-white ${
            // Nếu mở rộng thì đẩy sang phải (ml-auto), nếu thu nhỏ thì căn giữa (mx-auto)
            isCollapsed ? "mx-auto" : "ml-auto"
          }`}
        >
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-3 px-1.5 space-y-0.5">
        {" "}
        {/* Giảm px và space-y */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onAddPage(item.id, item.label)}
              className={`w-full flex items-center rounded-md transition-all group relative py-2 ${
                // Khi thu nhỏ: justify-center và bỏ px. Khi mở rộng: justify-start và px-2
                isCollapsed ? "justify-center" : "justify-start px-2.5"
              } ${
                isActive
                  ? "bg-slate-800 text-white shadow-sm"
                  : "hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Icon size={18} className="min-w-[18px]" />

              {!isCollapsed && (
                <span className="ml-2.5 text-[13px] font-medium truncate">
                  {item.label}
                </span>
              )}

              {/* Tooltip hiện lên khi hover lúc thu nhỏ (tùy chọn thêm cho chuyên nghiệp) */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-1.5 border-t border-slate-800">
        <button className="flex items-center w-full px-2 py-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all group">
          <LogOut size={18} className="min-w-[18px]" />
          {!isCollapsed && (
            <span className="ml-2.5 text-[13px] font-medium">Đăng xuất</span>
          )}
        </button>
      </div>
    </div>
  );
}
