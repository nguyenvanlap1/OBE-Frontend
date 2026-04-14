import { useState, useEffect } from "react";
import { Save, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

// Import Services

// Import Components cũ của bạn (Giữ nguyên các component này)
import UniversalTable from "../../components/common/UniversalTable";
import MappingMatrix2 from "../../components/common/MappingMatrix2";

// Import Types
import type { CourseVersionResponseDetail } from "../../services/courseVersionService";
import updateCourseWorkflowService from "./service/updateCourseWorkflowService";
import type { ApiResponse } from "../../services/api";

interface CourseWorkflowInputFormProps {
  taskId: string;
  onSuccess?: () => void; // Callback để đóng modal hoặc chuyển trang sau khi xong
}

const CourseWorkflowInputForm = ({
  taskId,
  onSuccess,
}: CourseWorkflowInputFormProps) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CourseVersionResponseDetail | null>(
    null,
  );

  // 1. Fetch dữ liệu Snapshot từ Workflow khi Component mount
  useEffect(() => {
    const fetchWorkflowData = async () => {
      try {
        setLoading(true);
        const response =
          await updateCourseWorkflowService.getDataByTaskId(taskId);
        console.log(response);
        if (response.data && response.data.courseData) {
          // Lấy dữ liệu học phần từ biến quy trình "courseData"
          setFormData(response.data.courseData);
        } else {
          toast.error("Không tìm thấy dữ liệu học phần trong Task này.");
        }
      } catch (error) {
        const err = error as AxiosError<ApiResponse<null>>;
        toast.error(err.response?.data?.message || "Lỗi khi tải dữ liệu Task");
      } finally {
        setLoading(false);
      }
    };

    if (taskId) fetchWorkflowData();
  }, [taskId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: string, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  // 2. Logic xử lý Hoàn thành Task (Complete Task)
  const handleComplete = async () => {
    if (!formData) return;

    try {
      setSubmitting(true);

      // Bước chuẩn bị dữ liệu (Sanitize) trước khi đóng gói vào biến Workflow
      const sanitizedCos = formData.cos.map((item) => ({
        ...item,
        id: String(item.id).startsWith("temp") ? null : item.id,
      }));

      const sanitizedClos = formData.clos.map((item) => ({
        ...item,
        id: String(item.id).startsWith("temp") ? null : item.id,
      }));

      // Mapping Logic (Tương tự code cũ của bạn)
      const coCloMappingsForWorkflow = formData.coCloMappings
        .map((m) => {
          const clo = formData.clos.find(
            (p) => String(p.id) === String(m.cloId),
          );
          const co = formData.cos.find((p) => String(p.id) === String(m.coId));
          return {
            cloCode: clo?.cloCode || "",
            coCode: co?.coCode || "",
            weight: m.weight,
          };
        })
        .filter((m) => m.cloCode && m.coCode);

      // Payload cuối cùng gửi vào Biến Quy Trình (Process Variables)
      const finalCourseSnapshot = {
        ...formData,
        cos: sanitizedCos,
        clos: sanitizedClos,
        coCloMappings: coCloMappingsForWorkflow,
      };

      // Gửi lệnh Complete Task
      await updateCourseWorkflowService.completeTask(taskId, {
        courseData: finalCourseSnapshot, // Cập nhật snapshot mới nhất vào Workflow
        action: "SUBMIT", // Biến điều hướng để Gateway biết là đã xong
        lastModifiedBy: "admin", // Lưu vết người sửa
      });

      toast.success("Đã hoàn thành nhập liệu và gửi đi duyệt!");
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium">
          Đang tải nội dung học phần từ quy trình...
        </p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-10 text-center text-red-500 flex flex-col items-center gap-2">
        <AlertCircle size={40} />
        <p>Không có dữ liệu hợp lệ cho Task này.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-lg border border-slate-200 my-6">
      {/* Action Header */}
      <div className="flex justify-between items-center mb-10 border-b pb-6 sticky top-0 bg-white z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Nhiệm vụ: Nhập liệu học phần
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Task ID: <span className="font-mono">{taskId}</span>
          </p>
        </div>
        <button
          onClick={handleComplete}
          disabled={submitting}
          className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-slate-300 transition-all shadow-lg shadow-green-100"
        >
          {submitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          HOÀN THÀNH VÀ GỬI DUYỆT
        </button>
      </div>

      {/* Main Form Content */}
      <div className="space-y-12">
        {/* 1. Thông tin chung */}
        <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <h3 className="font-bold text-lg mb-4 text-blue-700">
            1. Thông tin cơ bản
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Tên học phần
              </label>
              <input
                className="w-full border-b-2 border-slate-200 focus:border-blue-500 outline-none p-2 bg-transparent font-bold text-lg"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Mã học phần
              </label>
              <input
                className="w-full border-b-2 border-slate-200 focus:border-blue-500 outline-none p-2 bg-transparent"
                value={formData.courseId}
                readOnly // Thường mã học phần trong workflow sẽ không đổi
              />
            </div>
          </div>
        </section>

        {/* 2. Các bảng dữ liệu (Tái sử dụng UniversalTable của bạn) */}
        <UniversalTable
          title="2. Mục tiêu học phần (CO)"
          data={formData.cos}
          keys={["coCode", "content"]}
          columnNames={["Mã CO", "Nội dung mục tiêu"]}
          isEditing={true}
          onDataChange={(newData) => handleChange("cos", newData)}
        />

        <UniversalTable
          title="3. Chuẩn đầu ra (CLO)"
          data={formData.clos}
          keys={["cloCode", "content"]}
          columnNames={["Mã CLO", "Nội dung chuẩn đầu ra"]}
          isEditing={true}
          onDataChange={(newData) => handleChange("clos", newData)}
        />

        {/* 3. Các ma trận mapping */}
        <div className="space-y-10 bg-white border border-slate-100 p-6 rounded-xl">
          <MappingMatrix2
            title="4. Ma trận CO - CLO"
            rows={formData.clos.map((p) => ({ id: p.id, code: p.cloCode }))}
            cols={formData.cos.map((p) => ({ id: p.id, code: p.coCode }))}
            mappings={formData.coCloMappings.map((m) => ({
              rowId: m.cloId,
              colId: m.coId,
              weight: m.weight,
            }))}
            labels={{ row: "CLO", col: "CO" }}
            isEditing={true}
            onMappingChange={(newMappings) => {
              const apiFormat = newMappings.map((m) => ({
                cloId: m.rowId,
                coId: m.colId,
                weight: m.weight,
                cloCode: "",
                coCode: "",
              }));
              handleChange("coCloMappings", apiFormat);
            }}
          />
        </div>
      </div>

      <div className="mt-12 text-center text-slate-400 text-sm italic">
        * Lưu ý: Khi nhấn hoàn thành, dữ liệu sẽ được chuyển đến cấp quản lý để
        duyệt.
      </div>
    </div>
  );
};

export default CourseWorkflowInputForm;
