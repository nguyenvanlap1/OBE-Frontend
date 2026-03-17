import { useState } from "react";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Logic gọi API để ở đây giúp bạn linh hoạt hơn
  const fetchUsers = async () => {
    setIsLoading(true);
    const res = await userService.getAll();
    setUsers(res.result);
    setIsLoading(false);
  };

  return (
    <BaseManagementPage
      title="Quản lý người dùng"
      description="Quản lý giảng viên và sinh viên"
      columns={userColumns}
      data={users}
      loading={isLoading}
      renderAddModal={(isOpen, onClose) => (
        <AddUserModal
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={fetchUsers}
        />
      )}
    />
  );
}
