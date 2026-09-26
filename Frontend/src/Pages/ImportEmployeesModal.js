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

export default function ImportEmployeesModal({ onClose, onImported }) {
  const fileRef = useRef(null);

  const [step, setStep] = useState("upload");
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoadingPreview(true);

      const res = await API.post("/employees/import/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setRows(res.data.rows || []);
      setDepartments(res.data.available_departments || []);
      setStep("preview");
    } catch (err) {
      console.error("Preview Import Error:", err);
      alert(err?.response?.data?.message || "حدث خطأ أثناء قراءة الملف");
    } finally {
      setLoadingPreview(false);
    }
  };

  const updateRow = (index, patch) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        const updated = { ...row, ...patch };
        const errors = [];

        if (!updated.raw_name?.trim()) errors.push("الاسم مفقود");
        if (!updated.raw_email?.trim()) errors.push("البريد الإلكتروني مفقود");
        if (!updated.department_id) errors.push("القسم مفقود");

        updated.errors = errors;
        updated.valid = errors.length === 0;

        return updated;
      }),
    );
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    const validRows = rows.filter((r) => r.valid);

    if (validRows.length === 0) {
      alert("لا يوجد أي صف صالح للاستيراد");
      return;
    }

    const confirmed = window.confirm(
      `سيتم إضافة ${validRows.length} موظف. هل تريد المتابعة؟`,
    );
    if (!confirmed) return;

    try {
      setConfirming(true);

      const payload = validRows.map((r) => ({
        name: r.raw_name,
        email: r.raw_email,
        department_id: r.department_id,
        position: r.position,
        role: r.role,
        password: r.password,
      }));

      const res = await API.post("/employees/import/confirm", {
        employees: payload,
      });

      alert(res.data.message || "تم الاستيراد بنجاح");

      onImported?.(res.data.created || []);
      onClose();
    } catch (err) {
      console.error("Confirm Import Error:", err);
      alert(err?.response?.data?.message || "حدث خطأ أثناء تنفيذ الاستيراد");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div
      className="employees-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !confirming) onClose();
      }}
    >
      <div className="employees-modal edit-modal">
        <div className="employees-modal-header">
          <div className="employees-modal-heading">
            <div className="employees-modal-icon edit">
              <FaFileExcel />
            </div>
            <div>
              <h2>استيراد موظفين من إكسل</h2>
              <p>
                أعمدة الملف: الاسم، البريد الإلكتروني، القسم، المسمى الوظيفي،
                كلمة المرور (اختياري)
              </p>
            </div>
          </div>

          <button
            className="employees-modal-close"
            onClick={onClose}
            disabled={confirming}
          >
            <FaTimes />
          </button>
        </div>

        <div
          className="employees-form"
          style={{ maxHeight: "60vh", overflowY: "auto" }}
        >
          {step === "upload" && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <button
                className="employees-btn employees-btn-primary"
                onClick={() => fileRef.current?.click()}
                disabled={loadingPreview}
              >
                {loadingPreview ? (
                  <>
                    <FaSpinner className="employees-spin" /> جاري القراءة...
                  </>
                ) : (
                  <>
                    <FaUpload /> اختر ملف إكسل
                  </>
                )}
              </button>

              {fileName && <p style={{ marginTop: 8 }}>{fileName}</p>}
            </div>
          )}

          {step === "preview" && (
            <>
              <p style={{ marginBottom: 8, color: "#c0392b", fontSize: 13 }}>
                ⚠️ الموظفون الذين لم يتم تحديد كلمة مرور لهم في الملف سيحصلون
                على كلمة المرور الافتراضية <strong>123456</strong>. يُنصح
                بإبلاغهم بتغييرها فور تسجيل الدخول.
              </p>

              <p style={{ marginBottom: 12 }}>
                عدد الصفوف: {rows.length} — صالح:{" "}
                {rows.filter((r) => r.valid).length} — به مشاكل:{" "}
                {rows.filter((r) => !r.valid).length}
              </p>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>البريد</th>
                    <th>القسم</th>
                    <th>المسمى</th>
                    <th>كلمة المرور</th>
                    <th>الحالة</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                      <td>
                        <input
                          value={row.raw_name}
                          onChange={(e) =>
                            updateRow(index, { raw_name: e.target.value })
                          }
                        />
                      </td>

                      <td>
                        <input
                          value={row.raw_email}
                          onChange={(e) =>
                            updateRow(index, { raw_email: e.target.value })
                          }
                          dir="ltr"
                        />
                      </td>

                      <td>
                        <select
                          value={row.department_id || ""}
                          onChange={(e) =>
                            updateRow(index, {
                              department_id: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })
                          }
                        >
                          <option value="">اختر القسم</option>
                          {departments.map((d) => (
                            <option
                              key={d.department_id}
                              value={d.department_id}
                            >
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <input
                          value={row.position || ""}
                          onChange={(e) =>
                            updateRow(index, { position: e.target.value })
                          }
                        />
                      </td>

                      <td>
                        <input
                          value={row.password}
                          onChange={(e) =>
                            updateRow(index, { password: e.target.value })
                          }
                          dir="ltr"
                        />
                      </td>

                      <td>
                        {row.valid ? (
                          <span style={{ color: "green" }}>
                            <FaCheckCircle /> صالح
                          </span>
                        ) : (
                          <span
                            style={{ color: "#c0392b" }}
                            title={row.errors.join(" - ")}
                          >
                            <FaExclamationTriangle /> {row.errors[0]}
                          </span>
                        )}
                      </td>

                      <td>
                        <button onClick={() => removeRow(index)}>
                          <FaTimes />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="employees-modal-footer">
          <button
            className="employees-cancel"
            onClick={onClose}
            disabled={confirming}
          >
            إلغاء
          </button>

          {step === "preview" && (
            <button
              className="employees-save"
              onClick={handleConfirm}
              disabled={confirming}
            >
              {confirming ? (
                <>
                  <FaSpinner className="employees-spin" /> جاري الإضافة...
                </>
              ) : (
                <>
                  <FaSave /> تأكيد الاستيراد (
                  {rows.filter((r) => r.valid).length})
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
