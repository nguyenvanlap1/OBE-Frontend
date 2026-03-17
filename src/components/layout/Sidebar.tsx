import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Target,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";

interface NavItem {
  label: string;
  id: string; // Dùng ID để match với onAddPage của bạn
  icon: React.ElementType;
}

interface SidebarProps {
  onAddPage: (id: string, name: string) => void;
}

export default function Sidebar({ onAddPage }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems: NavItem[] = [
    { label: "Bảng điều khiển", id: "dashboard", icon: LayoutDashboard },
    { label: "Quản lý khoa", id: "department_list", icon: Users },
    { label: "Chuẩn đầu ra (CLO)", id: "clo_list", icon: Target },
    { label: "Học phần", id: "course_list", icon: BookOpen },
    { label: "Cài đặt", id: "settings", icon: Settings },
  ];

  return (
    <div
      className={`h-screen bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-800 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header & Toggle Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/50">
        {!isCollapsed && (
          <span className="text-sm font-bold tracking-widest text-white uppercase">
            OBE <span className="text-blue-500">Admin</span>
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onAddPage(item.id, item.label)}
              className="w-full flex items-center px-3 py-2.5 rounded-md transition-all group hover:bg-slate-800 hover:text-white relative"
              title={isCollapsed ? item.label : ""}
            >
              <Icon size={20} className="min-w-[20px]" />
              {!isCollapsed && (
                <span className="ml-3 text-[13.5px] font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
              {/* Tooltip nhỏ khi thu gọn - tùy chọn */}
              {isCollapsed && (
                <div className="absolute left-14 bg-slate-800 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-2 border-t border-slate-800">
        <button className="flex items-center w-full px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all group">
          <LogOut size={20} className="min-w-[20px]" />
          {!isCollapsed && (
            <span className="ml-3 text-[13.5px] font-medium">Đăng xuất</span>
          )}
        </button>
      </div>
    </div>
  );
}
