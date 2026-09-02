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
  // STATE
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
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    fetchData();
  }, []);

  // =========================================================
  // CLEAN PREVIEW URL
  // =========================================================

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // =========================================================
  // FETCH USER DATA
  // =========================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await API.get("/employees/me");
      const user = res.data;

      setMe(user);

      // =======================================================
      // ADMIN
      // =======================================================

      if (user.role === "admin") {
        setIsAdmin(true);

        const empRes = await API.get("/employees/active");

        setEmployees(
          Array.isArray(empRes.data)
            ? empRes.data
            : []
        );

        return;
      }

      // =======================================================
      // EMPLOYEE
      // =======================================================

      setIsAdmin(false);

      const currentEmployeeId =
        user.employee_id || user.id;

      if (currentEmployeeId) {
        setEmployeeId(
          String(currentEmployeeId)
        );
      } else {
        alert("تعذر تحديد رقم الموظف");
      }
    } catch (err) {
      console.error(
        "FETCH DATA ERROR:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.message ||
          "فشل جلب بيانات المستخدم"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FILE SELECT
  // =========================================================

  const handleFileChange = (e) => {
    const selectedFile =
      e.target.files?.[0];

    if (!selectedFile) return;

    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      alert(
        "حجم الملف يجب ألا يتجاوز 5 ميجابايت"
      );

      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert(
        "يسمح فقط برفع JPG أو PNG أو WEBP أو PDF"
      );

      e.target.value = "";
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);

    if (
      selectedFile.type.startsWith("image/")
    ) {
      const fileUrl =
        URL.createObjectURL(selectedFile);

      setPreview(fileUrl);
    } else {
      setPreview("");
    }
  };

  // =========================================================
  // REMOVE FILE
  // =========================================================

  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview("");

    const input =
      document.getElementById(
        "leave-file"
      );

    if (input) {
      input.value = "";
    }
  };

  // =========================================================
  // CALCULATE DAYS
  // =========================================================

  const calculateDays = () => {
    if (!from || !to) return 0;

    const start = new Date(
      `${from}T00:00:00`
    );

    const end = new Date(
      `${to}T00:00:00`
    );

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return 0;
    }

    if (end < start) {
      return 0;
    }

    const difference =
      end.getTime() - start.getTime();

    return (
      Math.floor(
        difference /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const days = calculateDays();

  // =========================================================
  // SAVE LEAVE
  // =========================================================

  const saveLeave = async () => {
    if (isAdmin && !employeeId) {
      alert("يرجى اختيار الموظف");
      return;
    }

    if (!isAdmin && !employeeId) {
      alert(
        "تعذر تحديد الموظف الحالي"
      );
      return;
    }

    if (!type) {
      alert("يرجى اختيار نوع الإجازة");
      return;
    }

    if (!from || !to) {
      alert(
        "يرجى تحديد تاريخ بداية ونهاية الإجازة"
      );
      return;
    }

    if (
      new Date(to) <
      new Date(from)
    ) {
      alert(
        "تاريخ نهاية الإجازة غير صحيح"
      );
      return;
    }

    if (days <= 0) {
      alert("مدة الإجازة غير صحيحة");
      return;
    }

    try {
      setSaving(true);

      const formData =
        new FormData();

      // Admin only
      if (isAdmin) {
        formData.append(
          "employee_id",
          employeeId
        );
      }

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

      if (notes.trim()) {
        formData.append(
          "notes",
          notes.trim()
        );
      }

      if (file) {
        formData.append(
          "attachment",
          file
        );
      }

      const response =
        await API.post(
          "/leaves",
          formData
        );

      console.log(
        "LEAVE CREATED:",
        response.data
      );

      alert(
        "تم تقديم طلب الإجازة بنجاح ✅"
      );

      setEmployeeId("");
      setType("سنوية");
      setFrom("");
      setTo("");
      setNotes("");

      removeFile();

      nav("/leaves-list");
    } catch (err) {
      console.error(
        "SAVE LEAVE ERROR:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.message ||
          "حدث خطأ أثناء حفظ طلب الإجازة"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        className="leave-page"
        dir="rtl"
      >
        <div className="leave-loading">
          <div className="loading-spinner"></div>

          <p>
            جاري تحميل البيانات...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="leave-page"
      dir="rtl"
    >
      <div className="leave-container">

        {/* =================================================
            TOP HEADER
        ================================================= */}

        <div className="leave-topbar">

          <button
            className="leave-back"
            onClick={() => nav(-1)}
            disabled={saving}
          >
            <FaChevronLeft />
            العودة
          </button>

          <div className="leave-title-area">

            <div className="leave-title-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <div className="leave-breadcrumb">
                إدارة الإجازات
                <span>/</span>
                طلب جديد
              </div>

              <h1>
                تقديم طلب إجازة
              </h1>

              <p>
                قم بتعبئة البيانات التالية لإرسال طلب الإجازة
              </p>
            </div>

          </div>

        </div>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <div className="leave-progress">

          <div className="progress-step active">
            <div className="progress-number">
              1
            </div>

            <div>
              <strong>
                بيانات الطلب
              </strong>

              <span>
                تفاصيل الإجازة
              </span>
            </div>
          </div>

          <div className="progress-line"></div>

          <div
            className={`progress-step ${
              days > 0
                ? "active"
                : ""
            }`}
          >
            <div className="progress-number">
              2
            </div>

            <div>
              <strong>
                المدة
              </strong>

              <span>
                تاريخ الإجازة
              </span>
            </div>
          </div>

          <div className="progress-line"></div>

          <div
            className={`progress-step ${
              file
                ? "active"
                : ""
            }`}
          >
            <div className="progress-number">
              3
            </div>

            <div>
              <strong>
                المرفق
              </strong>

              <span>
                المستندات
              </span>
            </div>
          </div>

        </div>

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <div className="leave-card">

          {/* =================================================
              SECTION 1 - EMPLOYEE
          ================================================= */}

          <section className="leave-section">

            <div className="section-heading">

              <div className="section-icon blue">
                <FaUser />
              </div>

              <div>
                <h2>
                  بيانات الموظف
                </h2>

                <p>
                  حدد الموظف صاحب طلب الإجازة
                </p>
              </div>

            </div>

            <div className="section-content">

              {isAdmin ? (
                <div className="field full-width">

                  <label>
                    الموظف
                    <span>*</span>
                  </label>

                  <div className="modern-input">

                    <FaUser />

                    <select
                      value={employeeId}
                      onChange={(e) =>
                        setEmployeeId(
                          e.target.value
                        )
                      }
                      disabled={saving}
                    >
                      <option value="">
                        اختر الموظف من القائمة
                      </option>

                      {employees.map(
                        (emp) => (
                          <option
                            key={
                              emp.employee_id
                            }
                            value={
                              emp.employee_id
                            }
                          >
                            {emp.name}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                  <small>
                    اختر الموظف الذي سيتم تسجيل الإجازة باسمه
                  </small>

                </div>
              ) : (
                <div className="employee-profile">

                  <div className="profile-avatar">
                    {me?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "م"}
                  </div>

                  <div className="profile-info">

                    <span>
                      الموظف الحالي
                    </span>

                    <strong>
                      {me?.name ||
                        "الموظف"}
                    </strong>

                  </div>

                  <div className="profile-check">
                    <FaCheckCircle />
                  </div>

                </div>
              )}

            </div>

          </section>

          {/* =================================================
              SECTION 2 - LEAVE TYPE
          ================================================= */}

          <section className="leave-section">

            <div className="section-heading">

              <div className="section-icon purple">
                <FaFileAlt />
              </div>

              <div>
                <h2>
                  نوع الإجازة
                </h2>

                <p>
                  اختر نوع الإجازة المطلوب
                </p>
              </div>

            </div>

            <div className="section-content">

              <div className="field full-width">

                <label>
                  نوع الإجازة
                  <span>*</span>
                </label>

                <div className="leave-types">

                  <button
                    type="button"
                    className={
                      type === "سنوية"
                        ? "leave-type active"
                        : "leave-type"
                    }
                    onClick={() =>
                      setType("سنوية")
                    }
                    disabled={saving}
                  >
                    <span className="type-icon">
                      📅
                    </span>

                    <span>
                      <strong>
                        إجازة سنوية
                      </strong>

                      <small>
                        الإجازة السنوية الاعتيادية
                      </small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={
                      type === "مرضية"
                        ? "leave-type active"
                        : "leave-type"
                    }
                    onClick={() =>
                      setType("مرضية")
                    }
                    disabled={saving}
                  >
                    <span className="type-icon">
                      🩺
                    </span>

                    <span>
                      <strong>
                        إجازة مرضية
                      </strong>

                      <small>
                        لأسباب صحية
                      </small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={
                      type === "طارئة"
                        ? "leave-type active"
                        : "leave-type"
                    }
                    onClick={() =>
                      setType("طارئة")
                    }
                    disabled={saving}
                  >
                    <span className="type-icon">
                      ⚡
                    </span>

                    <span>
                      <strong>
                        إجازة طارئة
                      </strong>

                      <small>
                        للظروف الطارئة
                      </small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={
                      type === "بدون راتب"
                        ? "leave-type active"
                        : "leave-type"
                    }
                    onClick={() =>
                      setType(
                        "بدون راتب"
                      )
                    }
                    disabled={saving}
                  >
                    <span className="type-icon">
                      💼
                    </span>

                    <span>
                      <strong>
                        بدون راتب
                      </strong>

                      <small>
                        إجازة غير مدفوعة
                      </small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={
                      type === "استثنائية"
                        ? "leave-type active"
                        : "leave-type"
                    }
                    onClick={() =>
                      setType(
                        "استثنائية"
                      )
                    }
                    disabled={saving}
                  >
                    <span className="type-icon">
                      ⭐
                    </span>

                    <span>
                      <strong>
                        إجازة استثنائية
                      </strong>

                      <small>
                        حالات استثنائية
                      </small>
                    </span>
                  </button>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              SECTION 3 - DATES
          ================================================= */}

          <section className="leave-section">

            <div className="section-heading">

              <div className="section-icon green">
                <FaCalendarAlt />
              </div>

              <div>
                <h2>
                  مدة الإجازة
                </h2>

                <p>
                  حدد تاريخ بداية ونهاية الإجازة
                </p>
              </div>

            </div>

            <div className="section-content">

              <div className="date-fields">

                <div className="field">

                  <label>
                    تاريخ البداية
                    <span>*</span>
                  </label>

                  <div className="modern-input">

                    <FaCalendarAlt />

                    <input
                      type="date"
                      value={from}
                      onChange={(e) => {
                        const value =
                          e.target.value;

                        setFrom(value);

                        if (
                          to &&
                          new Date(to) <
                            new Date(
                              value
                            )
                        ) {
                          setTo("");
                        }
                      }}
                      disabled={saving}
                    />

                  </div>

                </div>

                <div className="date-arrow">
                  ←
                </div>

                <div className="field">

                  <label>
                    تاريخ النهاية
                    <span>*</span>
                  </label>

                  <div className="modern-input">

                    <FaCalendarAlt />

                    <input
                      type="date"
                      value={to}
                      min={
                        from ||
                        undefined
                      }
                      onChange={(e) =>
                        setTo(
                          e.target.value
                        )
                      }
                      disabled={
                        saving ||
                        !from
                      }
                    />

                  </div>

                </div>

              </div>

              {days > 0 && (
                <div className="days-summary">

                  <div className="days-summary-icon">
                    <FaCalendarAlt />
                  </div>

                  <div>
                    <span>
                      إجمالي مدة الإجازة
                    </span>

                    <strong>
                      {days}
                      <small>
                        {days === 1
                          ? " يوم"
                          : " أيام"}
                      </small>
                    </strong>
                  </div>

                  <div className="days-check">
                    <FaCheckCircle />
                    المدة صحيحة
                  </div>

                </div>
              )}

            </div>

          </section>

          {/* =================================================
              SECTION 4 - ATTACHMENT
          ================================================= */}

          <section className="leave-section">

            <div className="section-heading">

              <div className="section-icon orange">
                <FaCloudUploadAlt />
              </div>

              <div>
                <h2>
                  المرفق
                </h2>

                <p>
                  أرفق المستند الداعم لطلب الإجازة
                </p>
              </div>

            </div>

            <div className="section-content">

              {!file ? (
                <label
                  className="upload-area"
                  htmlFor="leave-file"
                >

                  <input
                    id="leave-file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    onChange={
                      handleFileChange
                    }
                    hidden
                    disabled={saving}
                  />

                  <div className="upload-icon">
                    <FaCloudUploadAlt />
                  </div>

                  <strong>
                    اسحب الملف هنا أو اضغط للاختيار
                  </strong>

                  <span>
                    يمكنك رفع صورة أو ملف PDF
                  </span>

                  <small>
                    JPG · PNG · WEBP · PDF
                    <b>
                      الحد الأقصى 5MB
                    </b>
                  </small>

                </label>
              ) : (
                <div className="uploaded-file">

                  <div className="uploaded-preview">

                    {preview ? (
                      <img
                        src={preview}
                        alt="معاينة المرفق"
                      />
                    ) : (
                      <div className="uploaded-pdf">
                        <FaFileAlt />
                        <span>
                          PDF
                        </span>
                      </div>
                    )}

                  </div>

                  <div className="uploaded-info">

                    <strong
                      title={file.name}
                    >
                      {file.name}
                    </strong>

                    <span>
                      {(
                        file.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </span>

                    <small>
                      تم اختيار المرفق بنجاح
                    </small>

                  </div>

                  <button
                    type="button"
                    className="remove-upload"
                    onClick={
                      removeFile
                    }
                    disabled={saving}
                    title="إزالة المرفق"
                  >
                    <FaTimes />
                  </button>

                </div>
              )}

            </div>

          </section>

          {/* =================================================
              SECTION 5 - NOTES
          ================================================= */}

          <section className="leave-section">

            <div className="section-heading">

              <div className="section-icon gray">
                <FaStickyNote />
              </div>

              <div>
                <h2>
                  الملاحظات
                </h2>

                <p>
                  أضف أي معلومات أو ملاحظات إضافية
                </p>
              </div>

            </div>

            <div className="section-content">

              <div className="field full-width">

                <label>
                  ملاحظات إضافية
                </label>

                <div className="textarea-wrapper">

                  <FaStickyNote />

                  <textarea
                    placeholder="اكتب ملاحظاتك هنا..."
                    value={notes}
                    onChange={(e) =>
                      setNotes(
                        e.target.value
                      )
                    }
                    maxLength={500}
                    disabled={saving}
                  />

                </div>

                <div className="characters-count">
                  {notes.length} / 500
                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              FOOTER ACTIONS
          ================================================= */}

          <div className="leave-footer">

            <div className="footer-note">
              <FaCheckCircle />

              <span>
                تأكد من صحة البيانات قبل إرسال الطلب
              </span>
            </div>

            <div className="footer-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  nav(-1)
                }
                disabled={saving}
              >
                إلغاء
              </button>

              <button
                type="button"
                className="save-button"
                onClick={saveLeave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="button-spinner"></span>
                    جاري إرسال الطلب...
                  </>
                ) : (
                  <>
                    <FaSave />
                    إرسال طلب الإجازة
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
