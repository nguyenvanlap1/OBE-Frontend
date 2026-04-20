import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Target,
  Award,
  FileText,
  Info,
} from "lucide-react";
import type {
  CourseGradeSummary,
  PloSummary,
  PoSummary,
  StudentAcademicResultResponse,
} from "../../services/studentAcademicService";
import studentAcademicService from "../../services/studentAcademicService";

interface Props {
  studentId: string;
  programId: string;
}

const StudentAcademicResult = ({ studentId, programId }: Props) => {
  const [data, setData] = useState<StudentAcademicResultResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await studentAcademicService.getStudentResult(
          studentId,
          programId,
        );
        setData(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId, programId]);

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (!data)
    return (
      <div className="p-10 text-center text-red-500">
        Không tìm thấy dữ liệu.
      </div>
    );

  const summary = data.educationProgramSummary;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-blue-800 uppercase">
          {summary.name}
        </h1>
        <p className="text-gray-600 italic">
          Mã chương trình: {summary.id} | Sinh viên: {data.id}
        </p>
      </header>

      {/* --- PHẦN 1: PO -> PLO (Sử dụng ploSummaries đã map) --- */}
      <section className="mb-10">
        <h2 className="flex items-center text-xl font-semibold mb-4 text-gray-700">
          <Target className="mr-2" /> Mục tiêu đào tạo (PO) & Chuẩn đầu ra (PLO)
        </h2>
        <div className="space-y-4">
          {summary.pos.map((po) => (
            <PoAccordion key={po.id} po={po} />
          ))}
        </div>
      </section>

      {/* --- PHẦN: PLO -> CO -> CLO --- */}
      <section className="mb-10">
        <h2 className="flex items-center text-xl font-semibold mb-4 text-gray-700">
          <Award className="mr-2" /> Chuẩn đầu ra chương trình (PLO) chi tiết
        </h2>
        <div className="space-y-4">
          {summary.plos.map((plo) => (
            <PloAccordion key={plo.id} plo={plo} />
          ))}
        </div>
      </section>

      {/* --- PHẦN 2: HỌC PHẦN -> CO -> CLO -> ASSESSMENT --- */}
      <section>
        <h2 className="flex items-center text-xl font-semibold mb-4 text-gray-700">
          <BookOpen className="mr-2" /> Chi tiết học phần & Kết quả thành phần
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {summary.courses.map((course) => (
            <CourseCard key={course.courseId} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
};

// --- Sub-Components ---

const PoAccordion = ({ po }: { po: PoSummary }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-blue-50 transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shrink-0">
            {po.poCode}
          </span>
          <span className="font-medium text-gray-800">{po.content}</span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              Điểm đạt
            </p>
            <p
              className={`font-bold ${po.score >= 5 ? "text-green-600" : "text-red-500"}`}
            >
              {po.score.toFixed(2)}
            </p>
          </div>
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-gray-50 border-t space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase ml-4">
            Đóng góp bởi các PLO:
          </p>
          {po.ploSummaries?.map((plo) => (
            <div
              key={plo.id}
              className="ml-8 flex items-center justify-between border-l-2 border-blue-200 pl-4 py-1"
            >
              <div className="text-sm">
                <span className="font-bold text-blue-700">{plo.ploCode}:</span>{" "}
                {plo.content}
              </div>
              <span className="font-semibold text-gray-600 text-sm shrink-0 ml-4">
                {plo.score.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PloAccordion = ({ plo }: { plo: PloSummary }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow-sm border-l-4 border-l-orange-400">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-orange-50 transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold shrink-0">
            {plo.ploCode}
          </span>
          <span className="font-medium text-gray-800">{plo.content}</span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              Điểm PLO
            </p>
            <p className="font-bold text-orange-600">{plo.score.toFixed(2)}</p>
          </div>
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-orange-50/30 border-t space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase ml-4 tracking-widest">
            Dựa trên các mục tiêu học phần (CO & CLO):
          </p>

          <div className="space-y-3 ml-4">
            {plo.coSummaries?.map((co) => (
              <div
                key={co.id}
                className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded">
                      {co.courseId} - {co.coCode}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    Điểm: {co.score.toFixed(2)}
                  </span>
                </div>

                {/* Hiển thị danh sách CLO đóng góp cho CO này (cũng chính là đóng góp cho PLO này) */}
                <div className="flex flex-wrap gap-2 mt-2 border-t pt-2 border-dashed border-orange-100">
                  {co.cloSummaries?.map((clo) => (
                    <div
                      key={clo.id}
                      className="group relative flex items-center gap-1 bg-gray-50 hover:bg-orange-100 px-2 py-1 rounded text-[11px] text-gray-600 border transition-all"
                      title={clo.content}
                    >
                      <span className="font-bold text-orange-600">
                        {clo.cloCode}
                      </span>
                      <span className="w-[1px] h-3 bg-gray-300 mx-1"></span>
                      <span className="font-semibold">
                        {clo.score.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {(!plo.coSummaries || plo.coSummaries.length === 0) && (
              <p className="text-sm text-gray-400 italic ml-4">
                Chưa có dữ liệu học phần đóng góp cho PLO này.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CloAccordion = ({
  clo,
  course,
}: {
  clo: any;
  course: CourseGradeSummary;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow-sm border-l-4 border-l-green-400">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-green-50 transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold shrink-0">
            {clo.cloCode}
          </span>
          <span className="font-medium text-gray-800">{clo.content}</span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              Điểm CLO
            </p>
            <p
              className={`font-bold ${clo.score >= 5 ? "text-green-600" : "text-red-500"}`}
            >
              {clo.score.toFixed(2)}
            </p>
          </div>
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-green-50/30 border-t space-y-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase ml-4 tracking-widest">
            Chi tiết điểm từ các thành phần đánh giá:
          </p>
          <div className="space-y-2 ml-4">
            {course.assessmentSummaries
              .filter((asm) => clo.assessmentIds?.includes(asm.id))
              .map((asm) => (
                <div
                  key={asm.id}
                  className="flex justify-between items-center bg-white p-2 rounded border border-green-100 shadow-sm"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {asm.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      Trọng số: {(asm.weight * 100).toFixed(0)}%
                    </span>
                    <span className="font-bold text-blue-600 text-sm">
                      {asm.score ?? "-"}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ course }: { course: CourseGradeSummary }) => {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="bg-white border rounded-xl shadow-md overflow-hidden">
      <div className="p-5 flex flex-wrap justify-between items-center bg-white border-b">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {course.courseId} - {course.courseName}
            </h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
              Kết quả học tập
            </span>
          </div>
        </div>
        <div className="flex gap-8 items-center mt-2 sm:mt-0">
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Score
            </p>
            <p className="text-xl font-black text-blue-700">
              {course.finalScore ?? "N/A"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Grade
            </p>
            <p className="text-xl font-black text-orange-500">
              {course.letterGrade}
            </p>
          </div>
          <button
            onClick={() => setShowDetail(!showDetail)}
            className={`p-2 rounded-full transition-all ${showDetail ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      {showDetail && (
        <div className="p-5 bg-white space-y-8 animate-in slide-in-from-top-2 duration-300">
          {/* Mapping CO -> CLO (Sử dụng cloSummaries đã map trong CO) */}
          <div>
            <h4 className="flex items-center text-xs font-bold text-blue-800 mb-4 border-b pb-1 uppercase tracking-wider">
              <Award size={14} className="mr-2" /> Mục tiêu (CO) & Chuẩn đầu ra
              (CLO)
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {course.cos.map((co) => (
                <div
                  key={co.id}
                  className="bg-blue-50/40 p-4 rounded-xl border border-blue-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-sm">
                      {co.coCode}
                    </span>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded shadow-sm border border-blue-100">
                      Điểm: {co.score.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 font-medium leading-relaxed">
                    {co.content}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {co.cloSummaries?.map((clo) => (
                      <div
                        key={clo.id}
                        className="bg-white/80 p-2.5 rounded-lg border border-white shadow-sm flex justify-between items-center"
                      >
                        <div className="text-[13px] text-gray-600 truncate mr-2">
                          <span className="font-bold text-blue-600 mr-2">
                            {clo.cloCode}
                          </span>
                          {clo.content}
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {clo.score.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* PHẦN MỚI: HIỂN THỊ CLO CHI TIẾT */}
          <div>
            <h4 className="flex items-center text-xs font-bold text-green-800 mb-4 border-b pb-1 uppercase tracking-wider">
              <Target size={14} className="mr-2" /> Chi tiết chuẩn đầu ra học
              phần (CLO)
            </h4>
            <div className="space-y-3">
              {course.clos.map((clo) => (
                <CloAccordion key={clo.id} clo={clo} course={course} />
              ))}
            </div>
          </div>
          {/* Chi tiết Assessment (Sử dụng assessmentSummaries đã map trong CLO nếu cần hiển thị theo nhánh) */}
          <div>
            <h4 className="flex items-center text-xs font-bold text-green-800 mb-4 border-b pb-1 uppercase tracking-wider">
              <FileText size={14} className="mr-2" /> Bảng điểm thành phần
              (Assessments)
            </h4>
            <div className="overflow-hidden border rounded-xl shadow-sm">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-left border-b">
                    <th className="p-3 font-bold uppercase text-[10px] tracking-widest">
                      Tên cột điểm
                    </th>
                    <th className="p-3 font-bold uppercase text-[10px] tracking-widest text-center">
                      Trọng số
                    </th>
                    <th className="p-3 font-bold uppercase text-[10px] tracking-widest text-center">
                      Điểm số
                    </th>
                    <th className="p-3 font-bold uppercase text-[10px] tracking-widest">
                      Chuẩn đạt (CLO)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {course.assessmentSummaries.map((asm) => (
                    <tr
                      key={asm.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="p-3 font-semibold text-gray-700">
                        {asm.name}
                      </td>
                      <td className="p-3 text-center text-gray-500 font-medium">
                        {(asm.weight * 100).toFixed(0)}%
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-black text-base ${asm.score ? "text-blue-600" : "text-gray-300"}`}
                        >
                          {asm.score ?? "-"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {course.clos
                            .filter((clo) =>
                              clo.assessmentIds?.includes(asm.id),
                            )
                            .map((clo) => (
                              <span
                                key={clo.id}
                                className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 font-bold uppercase"
                              >
                                {clo.cloCode}
                              </span>
                            ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAcademicResult;
