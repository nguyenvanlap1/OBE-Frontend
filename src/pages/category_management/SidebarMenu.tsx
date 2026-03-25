import {
  Users,
  GraduationCap,
  Table,
  Library,
  BookOpen,
  UserCheck,
  CalendarDays,
} from "lucide-react";
import SidebarItem from "./SidebarItem";

const SidebarMenu = ({
  onAddPage,
}: {
  onAddPage: (id: string, name: string) => void;
}) => {
  // Định nghĩa danh sách menu tại đây cho gọn
  const menuItems = [
    { id: "user_list", name: "Quản lý Người dùng", icon: Users },
    { id: "plo_matrix", name: "Ma trận CLO-PLO", icon: Table },
    {
      id: "department_list",
      name: "Quản lý trường, khoa",
      icon: GraduationCap,
    },
    { id: "subdepartment_list", name: "Quản lý khoa, bộ môn", icon: Library },
    { id: "course_list", name: "Quản lý Học phần", icon: BookOpen },
    { id: "student_list", name: "Quản lý sinh viên", icon: UserCheck },
    { id: "school_year_list", name: "Quản lý Niên khóa", icon: CalendarDays },
    {
      id: "education_program_list",
      name: "Quản lý chương trình đào tạo",
      icon: GraduationCap,
    },
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
