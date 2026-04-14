/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { InfiniteGrid } from "../../components/common/InfiniteGridProps";
import workflowCommonService from "./service/workflowCommonService";
import type { ProcessInstanceResponseDTO } from "./service/workflowCommonService";

interface WorkflowInvolvedListProps {
  onViewDetail?: (
    idTabset: string,
    nameTab: string,
    data: ProcessInstanceResponseDTO,
    labels: any,
  ) => void;
}

const WorkflowInvolvedList = ({ onViewDetail }: WorkflowInvolvedListProps) => {
  // 1. Định nghĩa các cột cho Grid
  const columnDefs = useMemo<ColDef<ProcessInstanceResponseDTO>[]>(
    () => [
      {
        field: "processName",
        headerName: "Tên quy trình",
        flex: 1.5,
        filter: "agTextColumnFilter",
        pinned: "left",
        cellClass: "font-bold text-blue-600",
      },
      {
        field: "taskName",
        headerName: "Nhiệm vụ hiện tại",
        flex: 1.2,
        filter: "agTextColumnFilter",
      },
      {
        field: "status",
        headerName: "Trạng thái",
        flex: 0.8,
        filter: "agTextColumnFilter",
        cellRenderer: (params: any) => {
          const status = params.value;
          const isDone = status === "Đã xong";
          return (
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium border ${
                isDone
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        field: "createTime",
        headerName: "Thời gian tạo",
        flex: 1,
        valueFormatter: (params) => {
          return params.value
            ? new Date(params.value).toLocaleString("vi-VN")
            : "---";
        },
      },
      {
        field: "isMyTask",
        headerName: "Vai trò",
        flex: 0.8,
        cellRenderer: (params: any) => {
          const isMyTask = params.value;
          return (
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium border ${
                isMyTask
                  ? "bg-orange-50 text-orange-700 border-orange-200"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              {isMyTask ? "Cần xử lý" : "Đang theo dõi"}
            </span>
          );
        },
      },
    ],
    [],
  );

  // Nhãn hiển thị khi xem chi tiết
  const workflowLabels = {
    processName: "Tên quy trình",
    taskName: "Bước hiện tại",
    status: "Trạng thái",
    createTime: "Ngày bắt đầu",
    processInstanceId: "Mã thực thể quy trình",
    processId: "Mã định nghĩa quy trình",
    taskId: "Mã nhiệm vụ hiện tại",
  };

  return (
    <InfiniteGrid<ProcessInstanceResponseDTO, any, any>
      columnDefs={columnDefs}
      fetchData={workflowCommonService.getMyInvolvedProcesses}
      onUpdate={undefined}
      onDelete={undefined}
      onViewDetail={(data) => {
        // Dùng id của instance để mở Tab
        onViewDetail?.("workflow-detail", data.id, data, workflowLabels);
      }}
      title={"Quy trình tôi tham gia"}
    />
  );
};

export default WorkflowInvolvedList;
