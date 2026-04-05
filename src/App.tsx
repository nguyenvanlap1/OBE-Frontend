import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import authService, { type UserMeResponse } from "./services/authService";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/login/LoginPage";
import HomePage from "./pages/dashboard/HomePage";
import UserManagementPage from "./pages/user_management/UserManagementPage";
import CategoryManagement from "./pages/category_management/CategoryManagement";
import RealPermissionTree from "./pages/permision/RealPermissionTree";
import DepartmentPage from "./features/department/DepartmentList";
import { ToastContainer } from "react-toastify";
import SubDepartmentPage from "./features/sub_department/SubDepartmentList";
import ProfilePage from "./pages/profile_page/ProfilePage";

export default function App() {
  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API /me để kiểm tra login từ Cookie
    authService
      .getCurrentUser()
      .then((res) => {
        setUser(res.data); // Lưu username, roles vào state
        console.log(res);
      })
      .catch(() => {
        setUser(null); // Nếu lỗi (401), coi như chưa login
      })
      .finally(() => {
        setLoading(false); // Kết thúc quá trình check
      });
  }, []);

  if (loading) return <div>Đang kiểm tra đăng nhập...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Nếu có user thì cho vào, không thì đá về login */}
        <Route
          element={
            user ? <MainLayout user={user} /> : <Navigate to="/login" replace />
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/users" element={<UserManagementPage />}></Route>
          <Route path="/permission" element={<RealPermissionTree />}></Route>
          <Route path="/department" element={<DepartmentPage />}></Route>
          <Route path="/sub-department" element={<SubDepartmentPage />}></Route>
          <Route
            path="/category-management"
            element={<CategoryManagement />}
          ></Route>{" "}
          <Route path="/profile" element={<ProfilePage user={user} />}></Route>
          {/* Các route con khác */}
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
}
