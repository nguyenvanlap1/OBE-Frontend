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
import SubDepartmentList from "../../features/department/SubDepartmentList";
import CourseList from "../../features/course/CourseList";
import CourseDetailForm from "../../features/course/CourseDetailForm";
import StudentList from "../../features/student/StudentList";
import SchoolYearList from "../../features/school_year_list/SchoolYearList";
import EducationProgramList from "../../features/education_program/EducationProgramList";
import EducationProgramDetailForm from "../../features/education_program/EducationProgramDetailForm";

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

  const onOpenDetail = <T extends { id: string }>(
    idTabset: string,
    nameTab: string,
    data: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any,
    // Thêm tham số này để xác định component cần render
    componentName: string = "detail_comp",
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
            config: { data, labels },
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
            config: { data, labels },
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
              onOpenDetail(idTabset, nameTab, data, labels);
            }}
          />
        );

      case "subdepartment_list":
        return (
          <SubDepartmentList
            onViewDetail={(idTabset, nameTab, data, labels) => {
              onOpenDetail(idTabset, nameTab, data, labels);
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

      case "student_list":
        return (
          <StudentList
            onViewDetail={(idTabset, nameTab, data, labels) => {
              // Mở form chi tiết sinh viên ở panel bên phải
              onOpenDetail(idTabset, nameTab, data, labels);
            }}
          />
        );

      case "school_year_list": // Thêm case này
        return (
          <SchoolYearList
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
          ></EducationProgramList>
        );

      case "course_detail_comp":
        // Component hiển thị riêng cho Course (có ma trận CO-CLO)
        return (
          <CourseDetailForm
            key={config.data}
            data={config.data}
            onSave={(updatedData) => {
              console.log("Saving Course:", updatedData);
            }}
          />
        );

      case "education_program_detail_comp":
        return <EducationProgramDetailForm data={config.data} />;

      case "detail_comp":
        // Mặc định dùng Form động cho các thực thể cơ bản
        return (
          <DynamicEntityForm
            data={config.data}
            fieldLabels={config.labels}
            onSave={(updatedData) => {
              console.log("Saving Generic Entity:", updatedData);
            }}
          />
        );

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
      <Layout model={layoutModel} factory={factory} />
    </div>
  );
};

export default App;
