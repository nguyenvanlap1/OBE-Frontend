import {
  Users,
  GraduationCap,
  Library,
  BookOpen,
  UserCheck,
  CalendarDays,
  Calendar,
  Presentation,
  UserCog,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  BarChart3,
} from "lucide-react";
import SidebarItem from "./SidebarItem";

const SidebarMenu = ({
  onAddPage,
}: {
  onAddPage: (id: string, name: string) => void;
}) => {
  // Định nghĩa danh sách menu tại đây cho gọn
  const menuItems = [
    {
      id: "department_list",
      name: "Quản lý trường, khoa",
      icon: GraduationCap,
    },
    { id: "subdepartment_list", name: "Quản lý khoa, bộ môn", icon: Library },
    { id: "course_list", name: "Quản lý Học phần", icon: BookOpen },
    {
      id: "course_section_list",
      name: "Quản lý Lớp học phần",
      icon: Presentation,
    },
    {
      id: "lecturer_list",
      name: "Quản lý Giảng viên",
      icon: UserCog,
    },
    { id: "student_list", name: "Quản lý sinh viên", icon: UserCheck },
    {
      id: "student_class_list",
      name: "Quản lý Lớp sinh viên",
      icon: Users, // Hoặc School từ lucide-react
    },
    { id: "school_year_list", name: "Quản lý Niên khóa", icon: CalendarDays },
    // --- BỔ SUNG HỌC KỲ TẠI ĐÂY ---
    { id: "semester_list", name: "Quản lý Học kỳ", icon: Calendar },
    {
      id: "education_program_list",
      name: "Quản lý chương trình đào tạo",
      icon: GraduationCap,
    },
    {
      id: "account_list",
      name: "Quản lý Tài khoản",
      icon: ShieldCheck,
    },
    // --- BỔ SUNG QUẢN LÝ PHÂN QUYỀN TẠI ĐÂY ---
    {
      id: "role_list",
      name: "Quản lý Vai trò",
      icon: KeyRound,
    },
    {
      id: "permission_list",
      name: "Danh mục Quyền",
      icon: Fingerprint,
    },
    {
      id: "statistics_obe",
      name: "Thống kê OBE",
      icon: BarChart3,
    },
    // {
    //   id: "course_version_workflow_list",
    //   name: "Nhiệm vụ của tôi",
    //   icon: GitPullRequest,
    // },
  ];

  return (
    <div
      className="flex flex-col p-2 gap-1 h-full overflow-y-auto"
      style={{ overscrollBehavior: "contain" }}
    >
      {menuItems.map((item) => (
        <SidebarItem
          key={item.id}
          name={item.name}
          icon={item.icon}
          onClick={() => onAddPage(item.id, item.name)}
        />
      ))}
    </div>
  );
};

export default SidebarMenu;
