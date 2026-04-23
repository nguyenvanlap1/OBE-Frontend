import { useState } from "react";
import {
  Layout,
  Model,
  TabNode,
  type IJsonModel,
  Actions,
  DockLocation,
} from "flexlayout-react";
import "flexlayout-react/style/light.css";
import SidebarMenu from "./SidebarMenu";
import Introduction from "./Introduction";
import DepartmentList from "../../features/department/DepartmentList";
import DynamicEntityForm from "../../components/common/DynamicEntityForm";
import SubDepartmentList from "../../features/sub_department/SubDepartmentList";
import CourseList from "../../features/course/CourseList";
import CourseDetailForm from "../../features/course/CourseDetailForm";
import SchoolYearList from "../../features/school_year/SchoolYearList";
import EducationProgramList from "../../features/education_program/EducationProgramList";
import EducationProgramDetailForm from "../../features/education_program/EducationProgramDetailForm";
import StudentClassList from "../../features/student_class_list/StudentClassList";
import StudentClassDetailForm from "../../features/student_class_list/StudentClassDetailForm";
import StudentDetailForm from "../../features/student/StudentDetailForm";
import StudentList from "../../features/student/StudentList";
import SemesterList from "../../features/semester/SemesterList";
import CourseSectionList from "../../features/course_section/CourseSectionList";
import CourseSectionDetailForm from "../../features/course_section/CourseSectionDetailForm";
import LecturerList from "../../features/lecture/LecturerList";
import LecturerDetailForm from "../../features/lecture/LecturerDetailForm";
import AccountList from "../../features/account/AccountList";
import AccountDetailForm from "../../features/account/AccountDetailForm";
import PermissionTree from "../../features/permision/PermissionTree";
import RoleList from "../../features/role/RoleList";
import RoleDetailForm from "../../features/role/RoleDetailForm";
import DepartmentDetailForm from "../../features/department/DepartmentDetailForm";
import SubDepartmentDetailForm from "../../features/sub_department/SubDepartmentDetailForm";
import CourseVersionWorkflowDetail from "../../features/camunda_task/CourseVersionWorkflowDetail";
import WorkflowInvolvedList from "../../features/camunda_task/WorkflowInvolvedList";
import OBEDashboard from "../../features/statistics/OBEDashboard";

const initialJson: IJsonModel = {
  global: {
    tabEnablePopout: true,
    tabSetEnableMaximize: true,
  },
  borders: [
    {
      type: "border",
      location: "left",
      size: 280,
      show: true,
      children: [
        {
          type: "tab",
          id: "navigation_menu",
          name: "Danh mục quản lý",
          component: "sidebar_menu",
          enableClose: false,
          enableDrag: false,
        },
      ],
    },
  ],
  layout: {
    type: "row",
    children: [
      {
        type: "tabset",
        id: "main_tabset_container",
        weight: 50,
        children: [
          {
            type: "tab",
            id: "introduction_tab",
            name: "Giới thiệu",
            component: "intro_comp", // Component chào mừng ban đầu
            enableClose: false,
          },
        ],
      },
    ],
  },
};

const App = () => {
  const [layoutModel] = useState(Model.fromJson(initialJson));
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick((t) => t + 1);

  const closeAllTabsInGroup = (tabsetId: string) => {
    const tabset = layoutModel.getNodeById(tabsetId);

    if (tabset && tabset.getChildren()) {
      const children = [...tabset.getChildren()];

      children.forEach((node) => {
        // 1. Kiểm tra nếu node là một Tab (thay vì tabset con hoặc row)
        // 2. Ép kiểu về TabNode để truy cập isEnableClose()
        if (node instanceof TabNode) {
          if (node.isEnableClose()) {
            layoutModel.doAction(Actions.deleteTab(node.getId()));
          }
        }
      });

      forceUpdate();
    }
  };

  // Cập nhật: Hàm xử lý khi click menu để mở trang tương ứng
  const onAddPage = (id: string, name: string) => {
    const existingTab = layoutModel.getNodeById(id);
    if (existingTab) {
      layoutModel.doAction(Actions.selectTab(id));
      forceUpdate();
      return;
    }

    // Nếu tab chưa mở, thêm vào Tabset chính
    layoutModel.doAction(
      Actions.addNode(
        {
          type: "tab",
          id: id,
          name: name,
          component: id,
        },
        "main_tabset_container",
        DockLocation.CENTER,
        -1,
      ),
    );
    forceUpdate();
  };

  const onOpenDetail = <T extends { id: string | number }>(
    idTabset: string,
    nameTab: string,
    data: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
    // Thêm tham số này để xác định component cần render
    componentName: string = "detail_comp",
    onSave?: (data: T) => void,
  ) => {
    const tabId = `detail_${idTabset}_${data.id}`;
    const RIGHT_PANEL_ID = `detail_panel_right_${idTabset}`;

    const existingTab = layoutModel.getNodeById(tabId);
    if (existingTab) {
      layoutModel.doAction(Actions.selectTab(tabId));
      forceUpdate();
      return;
    }

    const rightPanel = layoutModel.getNodeById(RIGHT_PANEL_ID);
    if (rightPanel) {
      layoutModel.doAction(
        Actions.addNode(
          {
            type: "tab",
            id: tabId,
            name: `Chi tiết: ${nameTab}`,
            component: componentName,
            config: { data, labels, onSave },
          },
          RIGHT_PANEL_ID,
          DockLocation.CENTER,
          -1,
        ),
      );
    } else {
      layoutModel.doAction(
        Actions.addNode(
          {
            type: "tab",
            id: tabId,
            name: `Chi tiết: ${nameTab}`,
            component: componentName,
            config: { data, labels, onSave },
          },
          "main_tabset_container",
          DockLocation.RIGHT,
          0.5,
        ),
      );
      setTimeout(() => {
        const newTab = layoutModel.getNodeById(tabId);
        if (newTab && newTab.getParent()) {
          newTab.getParent()!.setId(RIGHT_PANEL_ID);
          forceUpdate();
        }
      }, 0);
    }
    forceUpdate();
  };

  const factory = (node: TabNode) => {
    const component = node.getComponent();
    const config = node.getConfig() || {};

    switch (component) {
      case "sidebar_menu":
        return (
          <div className="h-full w-full bg-slate-50 border-r border-gray-200">
            <SidebarMenu onAddPage={onAddPage} />
          </div>
        );

      case "intro_comp":
        return <Introduction />;

      case "department_list":
        return (
          <DepartmentList
            onViewDetail={(idTabset, nameTab, data, labels) => {
              onOpenDetail(
                idTabset,
                nameTab,
                data,
                labels,
                "department_detail_comp",
              );
            }}
            onCreate={() => {
              const newDepartment = { id: `new_${Date.now()}` };
              onOpenDetail(
                "department",
                "Khoa mới",
                newDepartment,
                {},
                "department_detail_comp",
              );
            }}
          />
        );

      case "subdepartment_list":
        return (
          <SubDepartmentList
            onViewDetail={(idTabset, nameTab, data, labels) => {
              onOpenDetail(
                idTabset,
                nameTab,
                data,
                labels,
                "sub_department_detail_comp",
              );
            }}
            onCreate={function (): void {
              const newSubDepartment = { id: `new_${Date.now()}` };
              onOpenDetail(
                "subdepartment",
                "Bộ môn mới",
                newSubDepartment,
                {},
                "sub_department_detail_comp",
              );
            }}
          />
        );

      case "student_class_list":
        return (
          <StudentClassList
            onViewDetail={(idTabset, nameTab, data, labels) => {
              onOpenDetail(
                idTabset,
                nameTab,
                data,
                labels,
                "student_class_detail_comp",
              );
            }}
            onCreate={() => {
              const newStudentClass = { id: `new_${Date.now()}` };
              onOpenDetail(
                "studentClass",
                "Lớp sinh viên mới",
                newStudentClass,
                {},
                "student_class_detail_comp",
              );
            }}
          />
        );

      case "lecturer_list":
        return (
          <LecturerList
            onViewDetail={(idTabset, nameTab, data, labels) => {
              onOpenDetail(
                idTabset,
                nameTab,
                data,
                labels,
                "lecturer_detail_comp",
              );
            }}
            onCreate={() => {
              const newStudentClass = { id: `new_${Date.now()}` };
              onOpenDetail(
                "lecturer",
                "Giảng viên mới viên mới",
                newStudentClass,
                {},
                "lecturer_detail_comp",
              );
            }}
          />
        );

      case "student_list":
        return (
          <StudentList
            onViewDetail={(idTabset, nameTab, data, labels) => {
              onOpenDetail(
                idTabset,
                nameTab,
                data,
                labels,
                "student_detail_comp", // Component hiển thị chi tiết
              );
            }}
            // SỬA TẠI ĐÂY: Thêm () => { } để bao bọc logic
            onCreate={() => {
              const newStudent = { id: `new_${Date.now()}` };
              onOpenDetail(
                "student",
                "Sinh viên mới",
                newStudent,
                {},
                "student_detail_comp",
              );
            }}
          />
        );

      case "course_section_list":
        return (
          <CourseSectionList
            onViewDetail={(idTabset, nameTab, data, labels) => {
              onOpenDetail(
                idTabset,
                nameTab,
                data,
                labels,
                "course_section_detail_comp", // Component hiển thị chi tiết
              );
            }}
            onCreate={function (): void {
              const courseSection = { id: `new_${Date.now()}` };
              onOpenDetail(
                "courseSection",
                "Lớp học phần mới",
                courseSection,
                {},
                "course_section_detail_comp",
              );
            }}
          />
        );

      case "course_list":
        return (
          <CourseList
            onViewDetail={(idTabset, nameTab, data) => {
              onOpenDetail(idTabset, nameTab, data, {}, "course_detail_comp");
            }}
            // Sửa lại ở đây: Bọc trong arrow function
            onCreate={() => {
              const newCourse = { id: `new_${Date.now()}` }; // Cần ID để FlexLayout không trùng Tab
              onOpenDetail(
                "course",
                "Học phần mới",
                newCourse,
                {},
                "course_detail_comp",
              );
            }}
          />
        );

      case "school_year_list": // Thêm case này
        return <SchoolYearList />;

      case "semester_list":
        return (
          <SemesterList
            onViewDetail={(idTabset, nameTab, data, labels) => {
              onOpenDetail(idTabset, nameTab, data, labels);
            }}
          />
        );

      case "education_program_list":
        return (
          <EducationProgramList
            onViewDetail={(idTabset, nametab, data, labels) => {
              onOpenDetail(
                idTabset,
                nametab,
                data,
                labels,
                "education_program_detail_comp",
              );
            }}
            onCreate={function (): void {
              const educationProgram = { id: `new_${Date.now()}` };
              onOpenDetail(
                "education_program",
                "chương trình đào tạo mới",
                educationProgram,
                {},
                "education_program_detail_comp",
              );
            }}
          ></EducationProgramList>
        );

      case "account_list":
        return (
          <AccountList
            onViewDetail={(idTabset, nametab, data, labels) => {
              onOpenDetail(
                idTabset,
                nametab,
                data,
                labels,
                "account_detail_comp",
              );
            }}
            onCreate={() => {
              const newAcount = { id: `new_${Date.now()}` };
              onOpenDetail(
                "account",
                "Tài khoảng mới",
                newAcount,
                {},
                "account_detail_comp",
              );
            }}
          ></AccountList>
        );

      case "role_list":
        return (
          <RoleList
            onViewDetail={(idTabset, nametab, data, labels) => {
              onOpenDetail(idTabset, nametab, data, labels, "role_detail_comp");
            }}
            onCreate={() => {
              const newAcount = { id: `new_${Date.now()}` };
              onOpenDetail(
                "role",
                "Vai trò mới",
                newAcount,
                {},
                "role_detail_comp",
              );
            }}
          />
        );

      case "permission_list":
        return <PermissionTree />;
      //-----detail comp ------

      case "department_detail_comp":
        return <DepartmentDetailForm data={config.data} />;

      case "sub_department_detail_comp":
        return <SubDepartmentDetailForm data={config.data} />;

      case "course_detail_comp":
        // Component hiển thị riêng cho Course (có ma trận CO-CLO)
        return (
          <CourseDetailForm
            key={config.data}
            data={config.data}
            onSave={(updatedData) => {
              if (config.onSave) {
                config.onSave(config.data);
              }
              console.log("Saving Course:", updatedData);
            }}
          />
        );

      case "education_program_detail_comp":
        return <EducationProgramDetailForm data={config.data} />;

      case "student_class_detail_comp":
        return <StudentClassDetailForm data={config.data} />;

      case "course_section_detail_comp":
        return <CourseSectionDetailForm data={config.data} />;

      case "lecturer_detail_comp":
        return <LecturerDetailForm data={config.data} />;

      case "student_detail_comp":
        return <StudentDetailForm data={config.data} />;

      case "role_detail_comp":
        return <RoleDetailForm data={config.data} />;

      case "account_detail_comp":
        return <AccountDetailForm data={config.data} />;

      case "detail_comp":
        return (
          <DynamicEntityForm
            data={config.data}
            fieldLabels={config.labels}
            onSave={(updatedData) => {
              // Sử dụng optional chaining để an toàn hơn
              config.onSave?.(updatedData);
              console.log("Saved data:", updatedData);
            }}
          />
        );

      // ----- Workflow Section -----
      case "course_version_workflow_list":
        return (
          <WorkflowInvolvedList
            onViewDetail={(idTabset, nameTab, data) => {
              onOpenDetail(
                idTabset,
                nameTab,
                data,
                {},
                "course_version_workflow_detail_comp",
              );
            }}
          />
        );

      case "course_version_workflow_detail_comp":
        return <CourseVersionWorkflowDetail data={config.data} />;

      case "statistics_obe":
        return <OBEDashboard />;

      default:
        return (
          <div className="p-4 text-slate-400 italic">
            Component {component} không tồn tại.
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full relative border-t border-gray-200">
      <Layout
        model={layoutModel}
        factory={factory}
        onRenderTabSet={(node, renderValues) => {
          // Chỉ hiện nút này trên Tabset cụ thể, ví dụ các tab chi tiết
          if (node.getId().startsWith("detail_panel_right")) {
            renderValues.buttons.push(
              <button
                key="close-all-btn"
                title="Đóng tất cả tab trong nhóm này"
                style={{
                  marginLeft: "5px",
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                }}
                onClick={() => closeAllTabsInGroup(node.getId())}
              >
                ✕
              </button>,
            );
          }
        }}
      />
    </div>
  );
};

export default App;
