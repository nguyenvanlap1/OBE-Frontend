import { useEffect, useState } from "react";
import {
  Save,
  Edit2,
  ShieldAlert,
  Key,
  Plus,
  Trash2,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import accountService from "../../services/accountService";
import type {
  AccountCreateRequest,
  AccountResponseDetail,
  AccountRoleSubDepartmentResponse,
  AccountRoleSubDepartmentRequest,
} from "../../services/accountService";
import type { RoleResponse } from "../../services/roleService";
import roleService from "../../services/roleService";
import DepartmentSubDepartmentSelect from "../../components/common/DepartmentSubDepartmentSelect";

// Giả sử các service này trả về danh sách để chọn
// import roleService from "../../services/roleService";
// import subDepartmentService from "../../services/subDepartmentService";

interface AccountDetailFormProps {
  data: AccountResponseDetail;
  onSuccess?: () => void; // Callback để load lại danh sách sau khi lưu
}

const AccountDetailForm = ({ data, onSuccess }: AccountDetailFormProps) => {
  // --- States ---
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(data.id?.startsWith("new_") || false);
  const [newPassword, setNewPassword] = useState("");

  // Dữ liệu Form chính
  const [formData, setFormData] = useState<AccountResponseDetail>(() => ({
    ...data,
    accountRoleSubDepartmentResponses:
      data.accountRoleSubDepartmentResponses || [],
  }));

  // Dữ liệu danh mục (Mockup - Bạn nên fetch từ API trong useEffect)
  // 1. Khai báo State rỗng
  const [availableRoles, setAvailableRoles] = useState<RoleResponse[]>([]);

  // 2. Gọi hàm search trong useEffect
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // Gọi API search với filter rỗng và page lớn để lấy hết các quyền
        const response = await roleService.search(
          { page: 0, size: 100 }, // Pageable: lấy 100 cái cho chắc
          {}, // Filter: để rỗng để lấy tất cả
        );

        if (response.data?.content) {
          setAvailableRoles(response.data.content);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách Role:", error);
      }
    };

    fetchRoles();
  }, []);

  // --- Handlers cho Thông tin cơ bản ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: keyof AccountResponseDetail, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // --- Handlers cho Danh sách Quyền (Dynamic List) ---
  const addRoleAssignment = () => {
    const newItem: AccountRoleSubDepartmentResponse = {
      accountId: formData.username,
      roleId: "",
      roleName: "",
      subDepartmentId: "",
      subDepartmentName: "",
      departmentId: "",
      departmentName: "",
    };
    setFormData((prev) => ({
      ...prev,
      accountRoleSubDepartmentResponses: [
        ...prev.accountRoleSubDepartmentResponses,
        newItem,
      ],
    }));
  };

  const removeRoleAssignment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      accountRoleSubDepartmentResponses:
        prev.accountRoleSubDepartmentResponses.filter((_, i) => i !== index),
    }));
  };

  const updateAssignment = (index: number, key: "roleId", value: string) => {
    const newList = [...formData.accountRoleSubDepartmentResponses];
    const item = { ...newList[index], [key]: value };

    if (key === "roleId")
      item.roleName = availableRoles.find((r) => r.id === value)?.name || "";

    newList[index] = item;
    setFormData((prev) => ({
      ...prev,
      accountRoleSubDepartmentResponses: newList,
    }));
  };

  // Hàm mới để xử lý cập nhật từ Component con
  const handleUnitChange = (index: number, deptId: string, subId: string) => {
    const newList = [...formData.accountRoleSubDepartmentResponses];
    newList[index] = {
      ...newList[index],
      departmentId: deptId,
      subDepartmentId: subId,
    };
    setFormData((prev) => ({
      ...prev,
      accountRoleSubDepartmentResponses: newList,
    }));
  };

  // --- Logic Lưu Dữ Liệu ---
  const handleSave = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    try {
      // Chuyển đổi sang định dạng Request của Backend
      const roleRequests: AccountRoleSubDepartmentRequest[] =
        formData.accountRoleSubDepartmentResponses
          .filter((r) => r.roleId && r.subDepartmentId) // Chỉ lấy các dòng đã chọn đủ thông tin
          .map((r) => ({
            accountId: formData.username,
            roleId: r.roleId,
            subDepartmentId: r.subDepartmentId,
          }));

      if (isNew) {
        // 1. Tạo mới tài khoản
        const createPayload: AccountCreateRequest = {
          username: formData.username,
          password: newPassword || "123456",
          enabled: formData.enabled,
          accountRoleSubDepartmentResponses: roleRequests,
        };
        await accountService.create(createPayload);
        toast.success("Tạo tài khoản mới thành công!");
      } else {
        // 2. Cập nhật chi tiết & phân quyền
        await accountService.updateDetail({
          username: formData.username,
          enabled: formData.enabled,
          accountRoleSubDepartmentResponses: roleRequests,
        });

        // 3. Nếu có nhập mật khẩu mới thì cập nhật riêng
        if (newPassword.trim()) {
          await accountService.changePasswordByAdmin({
            username: formData.username,
            password: newPassword,
          });
          toast.info("Đã cập nhật mật khẩu hệ thống");
        }
        toast.success("Lưu thay đổi thành công!");
      }

      setIsEditing(false);
      setIsNew(false);
      setNewPassword("");
      onSuccess?.(); // Gọi callback để refresh danh sách bên ngoài
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.response?.data?.message || "Lỗi thao tác dữ liệu");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white min-h-[600px] shadow-lg text-slate-900 border border-slate-200 rounded-xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>

      {/* Control Buttons */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase">
            {formData.isSystemAccount ? (
              <ShieldAlert className="text-red-600" />
            ) : (
              <User className="text-blue-600" />
            )}
            Hồ sơ tài khoản
          </h2>
          <p className="text-slate-400 text-sm mt-1 italic">
            Quản lý định danh và phân quyền hệ thống OBE
          </p>
        </div>

        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({ ...data });
              }}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          )}
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
              isEditing
                ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {isEditing ? (
              <>
                <Save size={16} /> Lưu dữ liệu
              </>
            ) : (
              <>
                <Edit2 size={16} /> Chỉnh sửa
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-12">
        {/* Section 1: Định danh */}
        <section>
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-blue-600"></span> 01. Thông tin định
            danh
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ml-10">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">
                Tên đăng nhập (Username)
              </label>
              {isNew && isEditing ? (
                <input
                  className="w-full border-b-2 border-blue-100 focus:border-blue-600 outline-none py-2 font-bold text-lg transition-all"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  placeholder="Ví dụ: 200101..."
                />
              ) : (
                <p className="text-lg font-bold text-slate-700 py-2">
                  {formData.username}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">
                Chủ tài khoản
              </label>
              <p className="text-lg font-medium text-slate-600 py-2 italic border-b border-dashed border-slate-200">
                {formData.fullName || "Chưa định danh chủ sở hữu"}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Bảo mật & Trạng thái */}
        <section>
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-blue-600"></span> 02. Bảo mật &
            Trạng thái
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ml-10">
            {/* Trạng thái */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400 uppercase">
                Trạng thái hệ thống
              </label>
              <div className="flex items-center gap-4 py-1">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => handleChange("enabled", true)}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold border transition-all ${formData.enabled ? "bg-green-50 border-green-500 text-green-700" : "bg-white border-slate-200 text-slate-400"}`}
                    >
                      Hoạt động
                    </button>
                    <button
                      onClick={() => handleChange("enabled", false)}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold border transition-all ${!formData.enabled ? "bg-red-50 border-red-500 text-red-700" : "bg-white border-slate-200 text-slate-400"}`}
                    >
                      Khóa
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-4 py-1 rounded-full text-[10px] font-black ${formData.enabled ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                  >
                    {formData.enabled ? "ACTIVE" : "DISABLED"}
                  </span>
                )}
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                <Key size={12} /> {isNew ? "Mật khẩu khởi tạo" : "Đổi mật khẩu"}
              </label>

              {isEditing ? (
                <input
                  type="password"
                  autoComplete="new-password" // Quan trọng: Báo đây là mật khẩu mới
                  className="w-full border-b-2 border-orange-100 focus:border-orange-500 outline-none py-2 transition-all bg-orange-50/30 px-2 rounded-t"
                  value={newPassword} // Liên kết chặt chẽ với State đã được reset ở trên
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={
                    isNew ? "Nhập mật khẩu..." : "Để trống nếu không đổi..."
                  }
                />
              ) : (
                <p className="py-2 text-slate-300 tracking-widest font-black">
                  ••••••••
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Phân quyền động */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-[2px] bg-blue-600"></span> 03. Vai trò &
              Đơn vị quản lý
            </h3>
            {isEditing && (
              <button
                onClick={addRoleAssignment}
                className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1"
              >
                <Plus size={12} /> THÊM QUYỀN
              </button>
            )}
          </div>

          <div className="ml-10 space-y-3">
            {formData.accountRoleSubDepartmentResponses.length === 0 && (
              <p className="text-slate-400 italic text-sm py-4 border border-dashed border-slate-200 rounded-lg text-center">
                Tài khoản này hiện chưa được gán vai trò quản lý nào.
              </p>
            )}

            {formData.accountRoleSubDepartmentResponses.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-6 p-6 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group items-start"
              >
                {/* 1. Chọn Vai trò (Vẫn giữ lại vì nó độc lập với Khoa/Bộ môn) */}
                <div className="w-full md:w-1/4 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase">
                      Vai trò
                    </span>
                  </div>
                  {isEditing ? (
                    <select
                      value={item.roleId}
                      onChange={(e) =>
                        updateAssignment(index, "roleId", e.target.value)
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">-- Chọn vai trò --</option>
                      {availableRoles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm font-bold text-slate-700">
                      {item.roleName}
                    </span>
                  )}
                </div>

                {/* 2. Component tái sử dụng: Chọn Khoa & Bộ môn */}
                <div className="flex-1 w-full">
                  <DepartmentSubDepartmentSelect
                    isEditing={isEditing}
                    selectedDepartmentId={item.departmentId}
                    selectedSubDepartmentId={item.subDepartmentId}
                    onDepartmentChange={(deptId) =>
                      handleUnitChange(index, deptId, "")
                    } // Reset bộ môn khi đổi khoa
                    onSubDepartmentChange={(subId) =>
                      handleUnitChange(index, item.departmentId, subId)
                    }
                  />
                </div>

                {/* 3. Nút Xóa */}
                {isEditing && (
                  <button
                    onClick={() => removeRoleAssignment(index)}
                    className="p-2 mt-6 text-red-400 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Info */}
      <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
        <span>OBE System v3.0 - Workflow Authorization</span>
        <span>Secure Identification Protocol</span>
      </div>
    </div>
  );
};

export default AccountDetailForm;
