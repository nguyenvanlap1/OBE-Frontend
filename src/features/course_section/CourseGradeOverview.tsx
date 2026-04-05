import React, { useCallback, useEffect, useState } from "react";
import courseSectionService, {
  type CourseSectionGradeResponse,
} from "./courseSectionService";
import GradeTableAgGrid from "./GradeTableAgGrid";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../../services/api";
import { toast } from "react-toastify";

interface Props {
  courseSectionId: string; // Nhận ID để tự fetch
}

const CourseGradeOverview: React.FC<Props> = ({ courseSectionId }) => {
  const [data, setData] = useState<CourseSectionGradeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Tách hàm fetch ra để có thể tái sử dụng (Refresh)
  const fetchGradeData = useCallback(
    async (isSilent = false) => {
      if (!courseSectionId) return;

      // Nếu không phải "silent refresh" (làm mới ngầm), thì mới hiện loading toàn trang
      if (!isSilent) setLoading(true);

      try {
        const response = await courseSectionService.getGrade(courseSectionId);

        if (response.status === 200) {
          setData(response.data);
          toast(response.message);
          setError(null);
        } else {
          const msg = response.message || "Không thể tải dữ liệu";
          setError(msg);
          toast.error(msg);
        }
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse<null>>;
        const msg = axiosError.message || "Có lỗi xảy ra khi tải dữ liệu";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [courseSectionId],
  ); // Dependency chỉ phụ thuộc vào ID
  useEffect(() => {
    if (courseSectionId) {
      fetchGradeData();
    }
  }, [courseSectionId, fetchGradeData]);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">
        Đang tải cấu hình điểm...
      </div>
    );
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!data) return null;

  // Tính tổng trọng số
  const totalWeight = data.assessmentResponses.reduce(
    (sum, item) => sum + item.weight,
    0,
  );

  return (
    <div className="p-6 bg-white shadow-md rounded-lg border border-gray-200">
      {/* 1. Header: Thông tin chung */}
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-blue-700">
          Thông tin lớp học phần
        </h2>
        <p className="text-gray-600 mt-1">
          Mã lớp: <span className="font-semibold text-gray-900">{data.id}</span>
        </p>
      </div>

      {/* 2. Cấu trúc khung điểm (Assessment Structure) */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Cấu trúc khung điểm (Assessments)
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              Math.abs(totalWeight - 1) < 0.001
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            Tổng trọng số: {(totalWeight * 100).toFixed(0)}%
          </span>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tên cột điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quy định
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Trọng số
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.assessmentResponses.map((item) => (
                <tr
                  key={item.assessmentCode}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{item.assessmentCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                      {item.regulation}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                    {(item.weight * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Section Assessment Mapping */}
      <div className="bg-gray-50 p-4 rounded-md border border-dashed border-gray-300">
        <h4 className="text-sm font-medium text-gray-700 italic">
          * Hệ thống đã xác nhận {data.sectionAssessmentResponses.length} thành
          phần điểm thực tế cho lớp này.
        </h4>
        <GradeTableAgGrid data={data} onRefresh={fetchGradeData} />
      </div>
    </div>
  );
};

export default CourseGradeOverview;
