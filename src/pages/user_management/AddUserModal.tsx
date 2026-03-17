import React, { useState } from "react";
import lecturerService from "../../services/lecturerService";
import type { AxiosError } from "axios";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void; // callback để reload list
}

export default function AddUserModal({
  isOpen,
  onClose,
  onCreated,
}: AddUserModalProps) {
  const [form, setForm] = useState({
    id: "",
    fullName: "",
    gender: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await lecturerService.create(form);
      onCreated?.(); // reload danh sách nếu có
      onClose();
      setForm({ id: "", fullName: "", gender: "", password: "" });
    } catch (err) {
      console.error("Create lecturer failed:", err);
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[400px] p-6">
        <h2 className="text-xl font-bold mb-4">Thêm giảng viên</h2>

        <div className="space-y-3">
          <input
            name="id"
            value={form.id}
            onChange={handleChange}
            type="text"
            placeholder="Mã giảng viên"
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            type="text"
            placeholder="Họ tên"
            className="w-full border rounded-lg px-3 py-2"
          />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Mật khẩu"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex justify-end mt-5 gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
