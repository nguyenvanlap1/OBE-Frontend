import type { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  name: string;
  icon: LucideIcon;
  onClick: () => void;
}

const SidebarItem = ({ name, icon: Icon, onClick }: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-2.5 text-left rounded-md transition-all 
                 text-sm font-medium text-gray-700 
                 hover:bg-indigo-50 hover:text-indigo-600 
                 group border border-transparent hover:border-indigo-100 shrink-0"
    >
      <Icon
        size={18}
        className="text-gray-400 group-hover:text-indigo-500 transition-colors"
      />
      <span className="truncate">{name}</span>
    </button>
  );
};

export default SidebarItem;
