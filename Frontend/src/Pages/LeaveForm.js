
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import {
  FaCalendarAlt,
  FaUser,
  FaFileAlt,
  FaCloudUploadAlt,
  FaTimes,
  FaSave,
  FaStickyNote,
  FaChevronLeft,
  FaCheckCircle,
} from "react-icons/fa";

import "./leaveForm.css";

export default function LeaveForm() {
  const nav = useNavigate();

  // =========================================================
  // State
  // =========================================================

  const [employees, setEmployees] = useState([]);
  const [me, setMe] = useState(null);

  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState("سنوية");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [notes, setNotes] = useState("");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // Past Date Confirmation
  // =========================================================

  const [showPastDateConfirm, setShowPastDateConfirm] = useState(false);
  const [pendingFromDate, setPendingFromDate] = useState("");

  // =========================================================
  // Fetch Data
  // =========================================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const meRes = await API.get("/employees/me");
      const user = meRes.data;

      setMe(user);

      const admin =
        user?.role === "admin" ||
        user?.role_name === "admin" ||
        user?.is_admin === true;

      setIsAdmin(admin);

      if (admin) {
        const empRes = await API.get("/employees/active");

        const list = Array.isArray(empRes.data)
          ? empRes.data
          : empRes.data?.employees || [];

        setEmployees(list);
      } else {
        setEmployeeId(user?.employee_id || user?.id || "");
      }
    } catch (error) {
      console.error("Error fetching data:", error);

      alert(
        error?.response?.data?.message ||
          "حدث خطأ أثناء تحميل البيانات"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // File Handling
  // =========================================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("يسمح فقط برفع ملفات JPG أو PNG أو WEBP أو PDF");
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      alert("حجم الملف يجب ألا يتجاوز 5 ميجابايت");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    } else {
      setPreview("");
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview("");

    const input = document.getElementById("leave-file");

    if (input) {
      input.value = "";
    }
  };

  // =========================================================
  // Date Helpers
  // =========================================================

  const isPastDate = (dateValue) => {
    if (!dateValue) return false;

    const selectedDate = new Date(`${dateValue}T00:00:00`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate < today;
  };

  // =========================================================
  // Start Date Change
  // =========================================================

  const handleFromDateChange = (e) => {
    const value = e.target.value;

    if (!value) {
      setFrom("");
      return;
    }

    // إذا كان التاريخ قبل اليوم
    if (isPastDate(value)) {
      setPendingFromDate(value);
      setShowPastDateConfirm(true);
      return;
    }

    setFrom(value);

    // إذا أصبح تاريخ النهاية قبل البداية
    if (to && new Date(to) < new Date(value)) {
      setTo("");
    }
  };

  // =========================================================
  // Confirm Past Date
  // =========================================================

  const confirmPastDate = () => {
    if (!pendingFromDate) {
      setShowPastDateConfirm(false);
      return;
    }

    setFrom(pendingFromDate);

    // إذا كان تاريخ النهاية قبل تاريخ البداية الجديدة
    if (
      to &&
      new Date(to) < new Date(pendingFromDate)
    ) {
      setTo("");
    }

    setPendingFromDate("");
    setShowPastDateConfirm(false);
  };

  // =========================================================
  // Cancel Past Date
  // =========================================================

  const cancelPastDate = () => {
    setPendingFromDate("");
    setShowPastDateConfirm(false);

    setFrom("");
    setTo("");
  };

  // =========================================================
  // Calculate Days
  // =========================================================

  const calculateDays = () => {
    if (!from || !to) return 0;

    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T00:00:00`);

    const difference =
      end.getTime() - start.getTime();

    if (difference < 0) return 0;

    return (
      Math.floor(
        difference / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const days = calculateDays();

  // =========================================================
  // Save Leave
  // =========================================================

  const saveLeave = async () => {
    if (!employeeId) {
      alert("يرجى اختيار الموظف");
      return;
    }

    if (!type) {
      alert("يرجى اختيار نوع الإجازة");
      return;
    }

    if (!from) {
      alert("يرجى اختيار تاريخ بداية الإجازة");
      return;
    }

    if (!to) {
      alert("يرجى اختيار تاريخ نهاية الإجازة");
      return;
    }

    if (new Date(to) < new Date(from)) {
      alert(
        "تاريخ نهاية الإجازة لا يمكن أن يكون قبل تاريخ البداية"
      );
      return;
    }

    if (days <= 0) {
      alert("عدد أيام الإجازة غير صحيح");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      // بالنسبة للأدمن نرسل الموظف المختار
      if (isAdmin) {
        formData.append("employee_id", employeeId);
      }

      formData.append("type", type);
      formData.append("from", from);
      formData.append("to", to);
      formData.append("notes", notes || "");

      if (file) {
        formData.append("file", file);
      }

      await API.post("/leaves", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("تم تقديم طلب الإجازة بنجاح");

      // Reset
      setType("سنوية");
      setFrom("");
      setTo("");
      setNotes("");
      setFile(null);
      setPreview("");

      const input = document.getElementById("leave-file");

      if (input) {
        input.value = "";
      }

      nav("/leaves-list");
    } catch (error) {
      console.error("Error saving leave:", error);

      alert(
        error?.response?.data?.message ||
          "حدث خطأ أثناء حفظ طلب الإجازة"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div className="leave-loading" dir="rtl">
        <div className="leave-loading-spinner"></div>
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="leave-page" dir="rtl">
      <div className="leave-container">

        {/* =====================================================
            Header
        ====================================================== */}

        <div className="leave-header">
          <div className="leave-header-info">
            <div className="leave-header-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <h1>طلب إجازة</h1>
              <p>
                قم بتعبئة البيانات التالية لتقديم طلب الإجازة
              </p>
            </div>
          </div>

          <button
            type="button"
            className="back-btn"
            onClick={() => nav("/leaves-list")}
          >
            <FaChevronLeft />
            العودة
          </button>
        </div>

        {/* =====================================================
            Progress
        ====================================================== */}

        <div className="leave-progress">
          <div className="progress-step active">
            <span>1</span>
            <p>بيانات الإجازة</p>
          </div>

          <div className="progress-line"></div>

          <div className="progress-step">
            <span>2</span>
            <p>المراجعة</p>
          </div>

          <div className="progress-line"></div>

          <div className="progress-step">
            <span>3</span>
            <p>الإرسال</p>
          </div>
        </div>

        {/* =====================================================
            Main Card
        ====================================================== */}

        <div className="leave-card">

          {/* ===================================================
              Employee
          ==================================================== */}

          <section className="leave-section">
            <div className="section-title">
              <div className="section-icon">
                <FaUser />
              </div>

              <div>
                <h2>بيانات الموظف</h2>
                <p>حدد الموظف صاحب طلب الإجازة</p>
              </div>
            </div>

            <div className="form-group">
              <label>
                الموظف
                <span className="required">*</span>
              </label>

              {isAdmin ? (
                <select
                  value={employeeId}
                  onChange={(e) =>
                    setEmployeeId(e.target.value)
                  }
                  disabled={saving}
                >
                  <option value="">
                    اختر الموظف
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={
                        employee.id ||
                        employee.employee_id
                      }
                      value={
                        employee.id ||
                        employee.employee_id
                      }
                    >
                      {employee.name ||
                        employee.full_name ||
                        employee.employee_name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="employee-display">
                  <FaUser />

                  <div>
                    <strong>
                      {me?.name ||
                        me?.full_name ||
                        me?.employee_name ||
                        "الموظف"}
                    </strong>

                    {me?.job_title && (
                      <span>{me.job_title}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ===================================================
              Leave Type
          ==================================================== */}

          <section className="leave-section">
            <div className="section-title">
              <div className="section-icon">
                <FaFileAlt />
              </div>

              <div>
                <h2>نوع الإجازة</h2>
                <p>اختر نوع الإجازة المطلوب</p>
              </div>
            </div>

            <div className="form-group">
              <label>
                نوع الإجازة
                <span className="required">*</span>
              </label>

              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value)
                }
                disabled={saving}
              >
                <option value="سنوية">
                  إجازة سنوية
                </option>

                <option value="مرضية">
                  إجازة مرضية
                </option>

                <option value="اضطرارية">
                  إجازة اضطرارية
                </option>

                <option value="بدون راتب">
                  إجازة بدون راتب
                </option>

                <option value="أخرى">
                  أخرى
                </option>
              </select>
            </div>
          </section>

          {/* ===================================================
              Dates
          ==================================================== */}

          <section className="leave-section">
            <div className="section-title">
              <div className="section-icon">
                <FaCalendarAlt />
              </div>

              <div>
                <h2>مدة الإجازة</h2>
                <p>
                  حدد تاريخ بداية ونهاية الإجازة
                </p>
              </div>
            </div>

            <div className="date-grid">

              {/* From */}

              <div className="form-group">
                <label>
                  من تاريخ
                  <span className="required">*</span>
                </label>

                <div className="date-input-wrapper">
                  <FaCalendarAlt />

                  <input
                    type="date"
                    value={from}
                    onChange={handleFromDateChange}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* To */}

              <div className="form-group">
                <label>
                  إلى تاريخ
                  <span className="required">*</span>
                </label>

                <div className="date-input-wrapper">
                  <FaCalendarAlt />

                  <input
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(e) =>
                      setTo(e.target.value)
                    }
                    disabled={saving || !from}
                  />
                </div>
              </div>
            </div>

            {/* Days Counter */}

            {days > 0 && (
              <div className="days-summary">
                <div className="days-summary-icon">
                  <FaCheckCircle />
                </div>

                <div>
                  <span>مدة الإجازة</span>
                  <strong>
                    {days}{" "}
                    {days === 1
                      ? "يوم"
                      : "أيام"}
                  </strong>
                </div>
              </div>
            )}
          </section>

          {/* ===================================================
              Attachment
          ==================================================== */}

          <section className="leave-section">
            <div className="section-title">
              <div className="section-icon">
                <FaCloudUploadAlt />
              </div>

              <div>
                <h2>المرفق</h2>
                <p>
                  يمكنك إرفاق مستند مؤيد لطلب الإجازة
                </p>
              </div>
            </div>

            {!file ? (
              <label
                htmlFor="leave-file"
                className="upload-box"
              >
                <div className="upload-icon">
                  <FaCloudUploadAlt />
                </div>

                <div className="upload-text">
                  <strong>
                    اضغط لاختيار ملف
                  </strong>

                  <span>
                    JPG, PNG, WEBP أو PDF
                    <br />
                    الحد الأقصى 5 ميجابايت
                  </span>
                </div>

                <input
                  id="leave-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileChange}
                  disabled={saving}
                />
              </label>
            ) : (
              <div className="file-preview">

                <div className="file-preview-info">

                  {preview ? (
                    <img
                      src={preview}
                      alt="معاينة المرفق"
                      className="file-image-preview"
                    />
                  ) : (
                    <div className="pdf-preview">
                      <FaFileAlt />
                    </div>
                  )}

                  <div>
                    <strong>
                      {file.name}
                    </strong>

                    <span>
                      {(
                        file.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={removeFile}
                  disabled={saving}
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </section>

          {/* ===================================================
              Notes
          ==================================================== */}

          <section className="leave-section">
            <div className="section-title">
              <div className="section-icon">
                <FaStickyNote />
              </div>

              <div>
                <h2>ملاحظات</h2>
                <p>
                  أضف أي ملاحظات أو تفاصيل إضافية
                </p>
              </div>
            </div>

            <div className="form-group">
              <label>
                الملاحظات
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                placeholder="اكتب ملاحظاتك هنا..."
                rows={5}
                disabled={saving}
              />
            </div>
          </section>

          {/* ===================================================
              Footer Actions
          ==================================================== */}

          <div className="leave-footer">
            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                nav("/leaves-list")
              }
              disabled={saving}
            >
              <FaTimes />
              إلغاء
            </button>

            <button
              type="button"
              className="save-btn"
              onClick={saveLeave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="button-spinner"></span>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <FaSave />
                  تقديم طلب الإجازة
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* =======================================================
          Past Date Confirmation Modal
      ======================================================== */}

      {showPastDateConfirm && (
        <div
          className="past-date-overlay"
          onClick={cancelPastDate}
        >
          <div
            className="past-date-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
            dir="rtl"
          >
            {/* Icon */}

            <div className="past-date-icon">
              <span>!</span>
            </div>

            {/* Content */}

            <div className="past-date-content">
              <h3>
                تنبيه بشأن تاريخ الإجازة
              </h3>

              <p>
                التاريخ الذي اخترته يسبق تاريخ اليوم.
              </p>

              <div className="past-date-value">
                <FaCalendarAlt />

                <span>
                  {pendingFromDate
                    ? new Date(
                        `${pendingFromDate}T00:00:00`
                      ).toLocaleDateString(
                        "ar-SA",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : ""}
                </span>
              </div>

              <p className="past-date-question">
                هل تريد الاستمرار بهذا التاريخ؟
              </p>
            </div>

            {/* Actions */}

            <div className="past-date-actions">
              <button
                type="button"
                className="past-date-cancel"
                onClick={cancelPastDate}
                disabled={saving}
              >
                <FaTimes />
                إلغاء
              </button>

              <button
                type="button"
                className="past-date-confirm"
                onClick={confirmPastDate}
                disabled={saving}
              >
                <FaCheckCircle />
                نعم، أريد الاستمرار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

