import React, { useState } from "react";
import { Key, Shield, Briefcase, Database, Lock } from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";

// --- Interfaces (Đã tích hợp từ code của bạn) ---
export interface PermissionResponse {
  id: string;
  name: string;
  scope: string;
  description: string;
}

export interface UserAssignmentDTO {
  departmentId: string;
  departmentName: string;
  subDepartmentId: string;
  subDepartmentName: string;
  roleId: string;
  roleName: string;
  permissions: PermissionResponse[];
}

export interface UserMeResponse {
  username: string;
  fullName: string;
  isSystemAccount: boolean;
  assignments: UserAssignmentDTO[];
}

export default function ProfilePage({ user }: { user: UserMeResponse | null }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (!user)
    return (
      <div className="p-8 text-slate-500 text-center animate-pulse">
        Đang tải dữ liệu hệ thống...
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* 1. Header Profile */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-black shadow-lg ring-4 ring-blue-500/20">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {user.fullName}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-slate-400 text-xs font-mono bg-slate-800 px-2 py-1 rounded">
                @{user.username}
              </span>
              {user.isSystemAccount && (
                <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                  SYSTEM
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Key size={14} /> ĐỔI MẬT KHẨU
          </button>
        </div>
      </div>

      {/* 2. Danh sách Assignments */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Database size={16} className="text-blue-500" />
            Phân quyền đơn vị ({user.assignments.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {user.assignments.map((as, idx) => (
            <div
              key={`${as.roleId}-${idx}`}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Thông tin tổ chức (Department & Role) */}
              <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <Briefcase size={12} /> Khoa / Phòng ban
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {as.departmentName}
                  </p>
                  <p className="text-[10px] text-blue-600 font-mono">
                    ID: {as.departmentId}
                  </p>
                </div>

                <div className="space-y-1 border-l border-slate-200 md:pl-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <Shield size={12} /> Bộ môn / Tổ
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {as.subDepartmentName}
                  </p>
                  <p className="text-[10px] text-blue-600 font-mono">
                    ID: {as.subDepartmentId}
                  </p>
                </div>

                <div className="space-y-1 border-l border-slate-200 md:pl-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <Lock size={12} /> Vai trò (Role)
                  </p>
                  <p className="text-sm font-bold text-indigo-600">
                    {as.roleName}
                  </p>
                  <p className="text-[10px] text-blue-600 font-mono">
                    ID: {as.roleId}
                  </p>
                </div>
              </div>

              {/* Danh sách Permissions cụ thể */}
              <div className="p-6">
                <p className="text-[11px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                  Quyền hạn chi tiết
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {as.permissions.map((p) => (
                    <div
                      key={p.id}
                      className="group p-3 rounded-2xl border border-slate-100 bg-slate-50/30 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-default"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                          {p.name}
                        </span>
                        <span className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-500 shadow-sm">
                          {p.scope}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 italic leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Modal đổi mật khẩu */}
      {showPasswordModal && (
        <ChangePasswordModal
          username={user.username}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}
