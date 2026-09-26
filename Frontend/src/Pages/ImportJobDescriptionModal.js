import { useRef, useState } from "react";
import API from "../api/api";
import {
  FaFileExcel,
  FaTimes,
  FaUpload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaSave,
} from "react-icons/fa";

export default function ImportJobDescriptionModal({ onClose, onImported }) {
  const fileRef = useRef(null);

  const [step, setStep] = useState("upload");
  const [rows, setRows] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [fileName, setFileName] = useState("");

  // =========================================================
  // رفع الملف وجلب المعاينة
  // =========================================================

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoadingPreview(true);

      const res = await API.post(
        "/employees/job-description/import/preview",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      setRows(res.data.rows || []);
      setAvailableEmployees(res.data.available_employees || []);
      setStep("preview");
    } catch (err) {
      console.error("Preview Job Description Import Error:", err);
      alert(err?.response?.data?.message || "حدث خطأ أثناء قراءة الملف");
    } finally {
      setLoadingPreview(false);
    }
  };

  // =========================================================
  // تعديل الموظف المطابق يدوياً
  // =========================================================

  const updateRowEmployee = (index, employeeId) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              matched_employee_id: employeeId ? Number(employeeId) : null,
            }
          : row,
      ),
    );
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================================================
  // تأكيد الاستيراد
  // =========================================================

  const handleConfirm = async () => {
    const validRows = rows.filter(
      (r) => r.matched_employee_id && r.points?.length > 0,
    );

    if (validRows.length === 0) {
      alert("لا يوجد أي صف مرتبط بموظف صالح وله نقاط وصف وظيفي");
      return;
    }

    const confirmed = window.confirm(
      `سيتم تحديث الوصف الوظيفي لـ ${validRows.length} موظف. هل تريد المتابعة؟`,
    );
    if (!confirmed) return;

    try {
      setConfirming(true);

      const payload = validRows.map((r) => ({
        employee_id: r.matched_employee_id,
        points: r.points,
      }));

      const res = await API.post("/employees/job-description/import/confirm", {
        items: payload,
      });

      alert(res.data.message || "تم الاستيراد بنجاح");

      onImported?.();
      onClose();
    } catch (err) {
      console.error("Confirm Job Description Import Error:", err);
      alert(err?.response?.data?.message || "حدث خطأ أثناء تنفيذ الاستيراد");
    } finally {
      setConfirming(false);
    }
  };

  const closeModal = () => {
    if (confirming) return;
    onClose();
  };

  return (
    <div
      className="jd-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="jd-modal" onClick={(e) => e.stopPropagation()}>
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="jd-modal-header">
          <h3>
            <FaFileExcel /> استيراد الوصف الوظيفي من إكسل
          </h3>

          <button
            className="jd-modal-close"
            onClick={closeModal}
            disabled={confirming}
          >
            <FaTimes />
          </button>
        </div>

        {/* ===================================================
            BODY
        =================================================== */}

        <div className="jd-modal-body">
          {step === "upload" && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ marginBottom: 16, color: "#4B5563" }}>
                يجب أن يحتوي ملف الإكسل على 3 أعمدة فقط: <strong>الاسم</strong>،{" "}
                <strong>البريد الإلكتروني</strong>، و
                <strong> المهام الموكلة</strong>. يمكن تكرار عدة صفوف لنفس
                الموظف (صف لكل نقطة).
              </p>

              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <button
                className="jd-export-btn"
                onClick={() => fileRef.current?.click()}
                disabled={loadingPreview}
              >
                {loadingPreview ? (
                  <>
                    <FaSpinner className="jd-spin" /> جاري القراءة...
                  </>
                ) : (
                  <>
                    <FaUpload /> اختر ملف إكسل
                  </>
                )}
              </button>

              {fileName && (
                <p style={{ marginTop: 8, color: "#6B7280" }}>{fileName}</p>
              )}
            </div>
          )}

          {step === "preview" && (
            <>
              <p style={{ marginBottom: 12 }}>
                عدد الموظفين: {rows.length} — تم ربطهم تلقائياً:{" "}
                {rows.filter((r) => r.matched_employee_id).length}
              </p>

              <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ textAlign: "right", padding: 8 }}>
                        الاسم بالملف
                      </th>
                      <th style={{ textAlign: "right", padding: 8 }}>البريد</th>
                      <th style={{ textAlign: "right", padding: 8 }}>
                        عدد النقاط
                      </th>
                      <th style={{ textAlign: "right", padding: 8 }}>
                        الموظف المطابق
                      </th>
                      <th style={{ textAlign: "right", padding: 8 }}>الحالة</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={index}
                        style={{ borderBottom: "1px solid #eee" }}
                      >
                        <td style={{ padding: 8 }}>{row.raw_name}</td>

                        <td style={{ padding: 8 }} dir="ltr">
                          {row.raw_email || "—"}
                        </td>

                        <td style={{ padding: 8 }}>
                          {row.points?.length || 0}
                        </td>

                        <td style={{ padding: 8 }}>
                          <select
                            value={row.matched_employee_id || ""}
                            onChange={(e) =>
                              updateRowEmployee(index, e.target.value)
                            }
                          >
                            <option value="">— اختر موظف —</option>
                            {availableEmployees.map((emp) => (
                              <option
                                key={emp.employee_id}
                                value={emp.employee_id}
                              >
                                {emp.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td style={{ padding: 8 }}>
                          {row.matched_employee_id ? (
                            <span style={{ color: "green" }}>
                              <FaCheckCircle /> مرتبط
                            </span>
                          ) : (
                            <span style={{ color: "#c0392b" }}>
                              <FaExclamationTriangle /> غير مرتبط
                            </span>
                          )}
                        </td>

                        <td style={{ padding: 8 }}>
                          <button
                            type="button"
                            onClick={() => removeRow(index)}
                            title="إزالة هذا الصف"
                          >
                            <FaTimes />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div
          className="jd-modal-footer"
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            padding: 16,
          }}
        >
          <button onClick={closeModal} disabled={confirming}>
            إلغاء
          </button>

          {step === "preview" && (
            <button onClick={handleConfirm} disabled={confirming}>
              {confirming ? (
                <>
                  <FaSpinner className="jd-spin" /> جاري الحفظ...
                </>
              ) : (
                <>
                  <FaSave /> تأكيد الاستيراد (
                  {rows.filter((r) => r.matched_employee_id).length})
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
