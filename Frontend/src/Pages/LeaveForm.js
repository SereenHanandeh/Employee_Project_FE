import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import {
  FaCalendarAlt,
  FaUser,
  FaFileAlt,
  FaUpload,
  FaPaperPlane,
  FaArrowRight,
  FaTimes,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

import "./leaveForm.css";

export default function LeaveForm() {
  const nav = useNavigate();

  // =========================
  // STATE
  // =========================

  const [employees, setEmployees] = useState([]);
  const [me, setMe] = useState(null);

  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState("سنوية");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [notes, setNotes] = useState("");

  const [attachment, setAttachment] = useState(null);
  const [preview, setPreview] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // =========================
  // LOAD USER
  // =========================

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/employees/me");

      const user = res.data;

      setMe(user);

      if (user.role === "admin") {
        setIsAdmin(true);

        const empRes = await API.get("/employees");

        setEmployees(
          Array.isArray(empRes.data)
            ? empRes.data
            : []
        );
      } else {
        setIsAdmin(false);

        setEmployeeId(
          user.employee_id ||
          user.id ||
          ""
        );
      }

    } catch (err) {
      console.error("Load User Error:", err);

      setError(
        err.response?.data?.message ||
        "تعذر تحميل بيانات المستخدم"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FILE
  // =========================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setAttachment(null);
      setPreview("");
      return;
    }

    // السماح بالصور فقط
    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار صورة فقط");
      e.target.value = "";
      return;
    }

    // 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError("حجم الصورة يجب ألا يتجاوز 5 ميجابايت");
      e.target.value = "";
      return;
    }

    setError("");
    setAttachment(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const removeFile = () => {
    setAttachment(null);
    setPreview("");

    const input =
      document.getElementById("leaveAttachment");

    if (input) {
      input.value = "";
    }
  };

  // =========================
  // CALCULATE DAYS
  // =========================

  const calculateDays = () => {
    if (!from || !to) {
      return 0;
    }

    const start = new Date(from);
    const end = new Date(to);

    if (end < start) {
      return 0;
    }

    const difference =
      end.getTime() - start.getTime();

    return (
      Math.floor(
        difference / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const days = calculateDays();

  // =========================
  // SUBMIT
  // =========================

  const saveLeave = async (e) => {
    e.preventDefault();

    setError("");

    // Validation
    if (!employeeId) {
      setError("يرجى اختيار الموظف");
      return;
    }

    if (!type) {
      setError("يرجى اختيار نوع الإجازة");
      return;
    }

    if (!from || !to) {
      setError("يرجى تحديد تاريخ بداية ونهاية الإجازة");
      return;
    }

    if (new Date(to) < new Date(from)) {
      setError(
        "تاريخ نهاية الإجازة يجب أن يكون بعد تاريخ البداية"
      );
      return;
    }

    if (days <= 0) {
      setError("عدد أيام الإجازة غير صحيح");
      return;
    }

    try {
      setSaving(true);

      // =========================
      // FormData
      // =========================

      const formData = new FormData();

      formData.append(
        "employee_id",
        employeeId
      );

      formData.append(
        "type",
        type
      );

      formData.append(
        "from_date",
        from
      );

      formData.append(
        "to_date",
        to
      );

      formData.append(
        "notes",
        notes.trim()
      );

      formData.append(
        "days",
        days
      );

      if (attachment) {
        formData.append(
          "attachment",
          attachment
        );
      }

      // مهم:
      // لا نضع Content-Type يدويًا
      // Axios سيضع multipart/form-data
      await API.post(
        "/leaves",
        formData
      );

      alert("تم تقديم طلب الإجازة بنجاح ✅");

      nav(
        isAdmin
          ? "/leaves-list"
          : "/employee"
      );

    } catch (err) {
      console.error(
        "Save Leave Error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
        "حدث خطأ أثناء حفظ طلب الإجازة"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div
        className="leave-page"
        dir="rtl"
      >
        <div className="leave-loading">
          <div className="loading-spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div
      className="leave-page"
      dir="rtl"
    >
      <div className="leave-wrapper">

        {/* =========================
            HEADER
        ========================= */}

        <div className="leave-header">

          <button
            className="back-button"
            onClick={() => nav(-1)}
            type="button"
          >
            <FaArrowRight />
            العودة
          </button>

          <div className="header-title">

            <div className="header-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <span>
                نظام إدارة الموظفين
              </span>

              <h1>
                تقديم طلب إجازة
              </h1>
            </div>

          </div>

        </div>

        {/* =========================
            FORM CARD
        ========================= */}

        <form
          className="leave-card"
          onSubmit={saveLeave}
        >

          {/* INTRO */}

          <div className="form-intro">

            <div className="intro-icon">
              <FaPaperPlane />
            </div>

            <div>
              <h2>
                طلب إجازة جديد
              </h2>

              <p>
                أدخل بيانات الإجازة المطلوبة ثم قم بإرسال الطلب للمراجعة.
              </p>
            </div>

          </div>

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="form-error">
              <FaTimes />
              <span>{error}</span>
            </div>
          )}

          {/* =========================
              EMPLOYEE
          ========================= */}

          <div className="form-section">

            <div className="section-title">
              <FaUser />
              <span>بيانات الموظف</span>
            </div>

            {isAdmin ? (

              <div className="field">

                <label>
                  الموظف
                  <span>*</span>
                </label>

                <div className="input-wrapper">

                  <FaUser />

                  <select
                    value={employeeId}
                    onChange={(e) =>
                      setEmployeeId(e.target.value)
                    }
                  >
                    <option value="">
                      اختر الموظف
                    </option>

                    {employees.map((emp) => (
                      <option
                        key={
                          emp.employee_id ||
                          emp.id
                        }
                        value={
                          emp.employee_id ||
                          emp.id
                        }
                      >
                        {emp.name}
                      </option>
                    ))}
                  </select>

                </div>

              </div>

            ) : (

              <div className="employee-profile">

                <div className="employee-avatar">
                  <FaUser />
                </div>

                <div>
                  <span>
                    الموظف
                  </span>

                  <strong>
                    {me?.name || "الموظف"}
                  </strong>
                </div>

                <FaCheckCircle className="profile-check" />

              </div>

            )}

          </div>

          {/* =========================
              LEAVE INFO
          ========================= */}

          <div className="form-section">

            <div className="section-title">
              <FaFileAlt />
              <span>بيانات الإجازة</span>
            </div>

            <div className="form-grid">

              {/* TYPE */}

              <div className="field">

                <label>
                  نوع الإجازة
                  <span>*</span>
                </label>

                <div className="input-wrapper">

                  <FaFileAlt />

                  <select
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value)
                    }
                  >
                    <option value="سنوية">
                      سنوية
                    </option>

                    <option value="مرضية">
                      مرضية
                    </option>

                    <option value="طارئة">
                      طارئة
                    </option>

                    <option value="بدون راتب">
                      بدون راتب
                    </option>

                    <option value="استثنائية">
                      استثنائية
                    </option>
                  </select>

                </div>

              </div>

              {/* DAYS */}

              <div className="days-display">

                <div className="days-icon">
                  <FaClock />
                </div>

                <div>
                  <span>
                    مدة الإجازة
                  </span>

                  <strong>
                    {days}
                    <small> أيام</small>
                  </strong>
                </div>

              </div>

            </div>

            {/* DATES */}

            <div className="date-grid">

              <div className="field">

                <label>
                  من تاريخ
                  <span>*</span>
                </label>

                <div className="input-wrapper">

                  <FaCalendarAlt />

                  <input
                    type="date"
                    value={from}
                    onChange={(e) => {
                      setFrom(e.target.value);

                      if (
                        to &&
                        new Date(e.target.value) >
                          new Date(to)
                      ) {
                        setTo("");
                      }
                    }}
                  />

                </div>

              </div>

              <div className="date-arrow">
                →
              </div>

              <div className="field">

                <label>
                  إلى تاريخ
                  <span>*</span>
                </label>

                <div className="input-wrapper">

                  <FaCalendarAlt />

                  <input
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(e) =>
                      setTo(e.target.value)
                    }
                  />

                </div>

              </div>

            </div>

          </div>

          {/* =========================
              NOTES
          ========================= */}

          <div className="form-section">

            <div className="section-title">
              <FaFileAlt />
              <span>ملاحظات</span>
            </div>

            <div className="field">

              <label>
                ملاحظات إضافية
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                placeholder="اكتب أي ملاحظات تريد إضافتها إلى طلب الإجازة..."
                rows="4"
              />

            </div>

          </div>

          {/* =========================
              ATTACHMENT
          ========================= */}

          <div className="form-section">

            <div className="section-title">
              <FaUpload />
              <span>المرفق</span>
            </div>

            <label
              htmlFor="leaveAttachment"
              className={`upload-box ${
                attachment ? "has-file" : ""
              }`}
            >

              {!attachment ? (

                <>
                  <div className="upload-icon">
                    <FaUpload />
                  </div>

                  <h3>
                    إرفاق صورة للإجازة
                  </h3>

                  <p>
                    اضغط لاختيار صورة من جهازك
                  </p>

                  <span>
                    PNG, JPG, JPEG — الحد الأقصى 5MB
                  </span>
                </>

              ) : (

                <>
                  <div className="preview-container">

                    <img
                      src={preview}
                      alt="معاينة المرفق"
                    />

                    <button
                      type="button"
                      className="remove-file"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFile();
                      }}
                    >
                      <FaTimes />
                    </button>

                  </div>

                  <div className="file-info">

                    <strong>
                      {attachment.name}
                    </strong>

                    <span>
                      {(
                        attachment.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </span>

                  </div>
                </>

              )}

            </label>

            <input
              id="leaveAttachment"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileChange}
              hidden
            />

          </div>

          {/* =========================
              BUTTONS
          ========================= */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() => nav(-1)}
              disabled={saving}
            >
              <FaTimes />
              إلغاء
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="button-spinner"></div>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  إرسال طلب الإجازة
                </>
              )}
            </button>

          </div>

          {/* FOOTER */}

          <div className="form-footer">
            <FaCheckCircle />
            سيتم إرسال الطلب إلى المسؤول للمراجعة
          </div>

        </form>

      </div>
    </div>
  );
}