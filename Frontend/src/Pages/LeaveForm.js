import { useEffect, useMemo, useState } from "react";
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
  FaUmbrellaBeach,
  FaHeartbeat,
  FaBolt,
  FaMoneyBillWave,
  FaEllipsisH,
  FaPaperclip,
  FaExclamationTriangle,
  FaClock,
  FaBriefcase,
} from "react-icons/fa";

import "./leaveForm.css";

export default function LeaveForm() {
  const nav = useNavigate();

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

  // Past date confirmation
  const [showPastDateConfirm, setShowPastDateConfirm] = useState(false);
  const [pendingFromDate, setPendingFromDate] = useState("");
  const [previousFromDate, setPreviousFromDate] = useState("");
  const [previousToDate, setPreviousToDate] = useState("");

  const leaveTypes = [
    {
      value: "سنوية",
      label: "إجازة سنوية",
      description: "إجازة الراحة السنوية",
      icon: FaUmbrellaBeach,
    },
    {
      value: "مرضية",
      label: "إجازة مرضية",
      description: "إجازة لأسباب صحية",
      icon: FaHeartbeat,
    },
    {
      value: "اضطرارية",
      label: "إجازة اضطرارية",
      description: "ظرف طارئ أو عاجل",
      icon: FaBolt,
    },
    {
      value: "بدون راتب",
      label: "بدون راتب",
      description: "إجازة غير مدفوعة",
      icon: FaMoneyBillWave,
    },
    {
      value: "أخرى",
      label: "نوع آخر",
      description: "إجازة من نوع مختلف",
      icon: FaEllipsisH,
    },
  ];

  // =========================================================
  // Fetch employee data
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
      console.error("Error loading employees:", error);
      alert("حدث خطأ أثناء تحميل بيانات الموظفين");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // Date helpers
  // =========================================================

  const isPastDate = (dateValue) => {
    if (!dateValue) return false;

    const selectedDate = new Date(`${dateValue}T00:00:00`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate < today;
  };

  const handleFromDateChange = (e) => {
    const value = e.target.value;

    if (!value) {
      setFrom("");
      return;
    }

    if (isPastDate(value)) {
      setPreviousFromDate(from);
      setPreviousToDate(to);

      setPendingFromDate(value);
      setShowPastDateConfirm(true);

      return;
    }

    setFrom(value);

    if (to && new Date(to) < new Date(value)) {
      setTo("");
    }
  };

  const confirmPastDate = () => {
    if (!pendingFromDate) {
      setShowPastDateConfirm(false);
      return;
    }

    setFrom(pendingFromDate);

    if (to && new Date(to) < new Date(pendingFromDate)) {
      setTo("");
    }

    setPendingFromDate("");
    setPreviousFromDate("");
    setPreviousToDate("");
    setShowPastDateConfirm(false);
  };

  const cancelPastDate = () => {
    setFrom(previousFromDate);
    setTo(previousToDate);

    setPendingFromDate("");
    setPreviousFromDate("");
    setPreviousToDate("");
    setShowPastDateConfirm(false);
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;

    if (!value) {
      setTo("");
      return;
    }

    if (from && new Date(value) < new Date(from)) {
      alert("تاريخ النهاية يجب أن يكون بعد أو مساويًا لتاريخ البداية");
      return;
    }

    setTo(value);
  };

  // =========================================================
  // Calculate days
  // =========================================================

  const calculateDays = () => {
    if (!from || !to) return 0;

    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T00:00:00`);

    const difference = end.getTime() - start.getTime();

    if (difference < 0) return 0;

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  };

  const days = calculateDays();

  // =========================================================
  // Date formatting
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(`${dateValue}T00:00:00`);

    return date.toLocaleDateString("ar-SA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =========================================================
  // File handling
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
      alert("نوع الملف غير مدعوم. يسمح فقط بـ JPG و PNG و WEBP و PDF");

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
      setPreview(URL.createObjectURL(selectedFile));
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

  const formatFileSize = (size) => {
    if (!size) return "";

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // =========================================================
  // Selected employee
  // =========================================================

  const selectedEmployee = useMemo(() => {
    return employees.find(
      (emp) => String(emp.id ?? emp.employee_id) === String(employeeId),
    );
  }, [employees, employeeId]);

  const employeeName =
    selectedEmployee?.name ||
    selectedEmployee?.full_name ||
    selectedEmployee?.employee_name ||
    "";

  const employeeJob =
    selectedEmployee?.job_title ||
    selectedEmployee?.position ||
    selectedEmployee?.job ||
    "";

  const employeeDepartment =
    selectedEmployee?.department_name || selectedEmployee?.department || "";

  // =========================================================
  // Save
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
      alert("تاريخ النهاية يجب أن يكون بعد أو مساويًا لتاريخ البداية");
      return;
    }

    if (days <= 0) {
      alert("عدد أيام الإجازة غير صحيح");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      // إذا كان Admin نرسل employee_id
      if (isAdmin) {
        formData.append("employee_id", employeeId);
      }

      formData.append("type", type);

      // مهم جدًا:
      // الـ Backend ينتظر from_date و to_date
      formData.append("from_date", from);
      formData.append("to_date", to);

      formData.append("notes", notes.trim());

      if (file) {
        formData.append("file", file);
      }

      // للتأكد من البيانات التي يتم إرسالها
      console.log("========== LEAVE FORM DATA ==========");

      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      console.log("=====================================");

      const response = await API.post("/leaves", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Leave created successfully:", response.data);

      alert("تم إرسال طلب الإجازة بنجاح");

      nav("/leaves-list");
    } catch (error) {
      console.error("Save leave error:", error);

      console.error("Server response:", error?.response?.data);

      const message =
        error?.response?.data?.message || "حدث خطأ أثناء حفظ طلب الإجازة";

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // Reset
  // =========================================================

  const resetForm = () => {
    setType("سنوية");
    setFrom("");
    setTo("");
    setNotes("");
    removeFile();

    if (!isAdmin && me) {
      setEmployeeId(me?.employee_id || me?.id || "");
    } else {
      setEmployeeId("");
    }
  };

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div className="leave-loading">
        <div className="leave-loading-card">
          <div className="leave-spinner"></div>
          <h3>جاري تحميل النموذج</h3>
          <p>يرجى الانتظار لحظات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-page">
      {/* =====================================================
          Background decorations
      ====================================================== */}

      <div className="leave-bg-shape leave-bg-shape-1"></div>
      <div className="leave-bg-shape leave-bg-shape-2"></div>
      <div className="leave-bg-shape leave-bg-shape-3"></div>

      <div className="leave-container">
        {/* =====================================================
            Header
        ====================================================== */}

        <header className="leave-header">
          <div className="leave-header-main">
            <div className="leave-header-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <div className="leave-breadcrumb">
                لوحة التحكم
                <FaChevronLeft />
                طلبات الإجازات
                <FaChevronLeft />
                طلب جديد
              </div>

              <h1>إنشاء طلب إجازة</h1>

              <p>قم بتعبئة البيانات التالية لإرسال طلب الإجازة</p>
            </div>
          </div>

          <button
            type="button"
            className="leave-back-btn"
            onClick={() => nav("/leaves-list")}
          >
            <FaChevronLeft />
            <span>العودة للطلبات</span>
          </button>
        </header>

        {/* =====================================================
            Progress
        ====================================================== */}

        <div className="leave-progress">
          <div className="progress-line"></div>

          <div className="progress-step active">
            <div className="progress-number">01</div>

            <div>
              <strong>بيانات الإجازة</strong>
              <span>المعلومات الأساسية</span>
            </div>
          </div>

          <div className="progress-step">
            <div className="progress-number">02</div>

            <div>
              <strong>المراجعة</strong>
              <span>تأكد من البيانات</span>
            </div>
          </div>

          <div className="progress-step">
            <div className="progress-number">03</div>

            <div>
              <strong>الإرسال</strong>
              <span>إرسال الطلب</span>
            </div>
          </div>
        </div>

        {/* =====================================================
            Main form
        ====================================================== */}

        <main className="leave-form-layout">
          <div className="leave-form-main">
            {/* =================================================
                Employee section
            ================================================== */}

            <section className="leave-section">
              <div className="section-heading">
                <div className="section-icon blue">
                  <FaUser />
                </div>

                <div>
                  <h2>بيانات الموظف</h2>
                  <p>حدد الموظف الذي سيتم تسجيل الإجازة له</p>
                </div>

                <span className="section-badge">01</span>
              </div>

              <div className="section-content">
                {isAdmin ? (
                  <div className="field-group">
                    <label>
                      الموظف
                      <span>*</span>
                    </label>

                    <div className="select-wrapper">
                      <FaUser className="field-icon" />

                      <select
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                      >
                        <option value="">اختر الموظف</option>

                        {employees.map((emp) => {
                          const id = emp.id ?? emp.employee_id;

                          const name =
                            emp.name ||
                            emp.full_name ||
                            emp.employee_name ||
                            "موظف";

                          return (
                            <option key={id} value={id}>
                              {name}
                            </option>
                          );
                        })}
                      </select>

                      <span className="select-arrow">
                        <FaChevronLeft />
                      </span>
                    </div>

                    {selectedEmployee && (
                      <div className="employee-mini-card">
                        <div className="employee-avatar">
                          <FaUser />
                        </div>

                        <div className="employee-mini-info">
                          <strong>{employeeName}</strong>

                          <div>
                            {employeeJob && <span>{employeeJob}</span>}

                            {employeeDepartment && (
                              <span>{employeeDepartment}</span>
                            )}
                          </div>
                        </div>

                        <FaCheckCircle className="employee-check" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="employee-profile-card">
                    <div className="profile-avatar">
                      <FaUser />
                    </div>

                    <div className="profile-info">
                      <span>الموظف</span>

                      <strong>
                        {me?.name ||
                          me?.full_name ||
                          me?.employee_name ||
                          "الموظف الحالي"}
                      </strong>

                      <small>{me?.job_title || me?.position || "موظف"}</small>
                    </div>

                    <div className="profile-status">
                      <FaCheckCircle />
                      بياناتك الحالية
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                Leave type
            ================================================== */}

            <section className="leave-section">
              <div className="section-heading">
                <div className="section-icon purple">
                  <FaBriefcase />
                </div>

                <div>
                  <h2>نوع الإجازة</h2>
                  <p>اختر نوع الإجازة المناسب للطلب</p>
                </div>

                <span className="section-badge">02</span>
              </div>

              <div className="section-content">
                <div className="leave-types-grid">
                  {leaveTypes.map((item) => {
                    const Icon = item.icon;

                    const selected = type === item.value;

                    return (
                      <button
                        type="button"
                        key={item.value}
                        className={`leave-type-card ${
                          selected ? "selected" : ""
                        }`}
                        onClick={() => setType(item.value)}
                      >
                        <div className="leave-type-icon">
                          <Icon />
                        </div>

                        <div className="leave-type-text">
                          <strong>{item.label}</strong>

                          <span>{item.description}</span>
                        </div>

                        <div className="leave-type-check">
                          {selected && <FaCheckCircle />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* =================================================
                Dates
            ================================================== */}

            <section className="leave-section">
              <div className="section-heading">
                <div className="section-icon orange">
                  <FaCalendarAlt />
                </div>

                <div>
                  <h2>مدة الإجازة</h2>
                  <p>حدد تاريخ بداية ونهاية الإجازة</p>
                </div>

                <span className="section-badge">03</span>
              </div>

              <div className="section-content">
                <div className="dates-grid">
                  <div className="date-field">
                    <label>
                      تاريخ البداية
                      <span>*</span>
                    </label>

                    <div className="date-input-wrapper">
                      <div className="date-icon">
                        <FaCalendarAlt />
                      </div>

                      <input
                        type="date"
                        value={from}
                        onChange={handleFromDateChange}
                      />
                    </div>

                    {from && (
                      <div className="date-readable">
                        <FaClock />
                        {formatDate(from)}
                      </div>
                    )}
                  </div>

                  <div className="date-connector">
                    <span></span>
                    <FaChevronLeft />
                    <span></span>
                  </div>

                  <div className="date-field">
                    <label>
                      تاريخ النهاية
                      <span>*</span>
                    </label>

                    <div className="date-input-wrapper">
                      <div className="date-icon">
                        <FaCalendarAlt />
                      </div>

                      <input
                        type="date"
                        value={to}
                        min={from || undefined}
                        onChange={handleToDateChange}
                      />
                    </div>

                    {to && (
                      <div className="date-readable">
                        <FaClock />
                        {formatDate(to)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Days summary */}

                <div className={`days-summary ${days > 0 ? "has-days" : ""}`}>
                  <div className="days-summary-icon">
                    <FaCalendarAlt />
                  </div>

                  <div className="days-summary-text">
                    <span>مدة الإجازة</span>

                    <strong>
                      {days > 0
                        ? `${days} ${days === 1 ? "يوم" : "أيام"}`
                        : "—"}
                    </strong>
                  </div>

                  {days > 0 && (
                    <div className="days-summary-message">
                      تم احتساب المدة تلقائيًا
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* =================================================
                Attachment
            ================================================== */}

            <section className="leave-section">
              <div className="section-heading">
                <div className="section-icon green">
                  <FaPaperclip />
                </div>

                <div>
                  <h2>المرفق</h2>
                  <p>يمكنك إرفاق مستند داعم لطلب الإجازة</p>
                </div>

                <span className="optional-badge">اختياري</span>
              </div>

              <div className="section-content">
                {!file ? (
                  <label htmlFor="leave-file" className="upload-area">
                    <input
                      id="leave-file"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={handleFileChange}
                    />

                    <div className="upload-icon">
                      <FaCloudUploadAlt />
                    </div>

                    <div className="upload-content">
                      <strong>اسحب الملف هنا أو اضغط للاختيار</strong>

                      <span>JPG, PNG, WEBP أو PDF</span>

                      <small>الحد الأقصى لحجم الملف 5 ميجابايت</small>
                    </div>

                    <div className="upload-button">اختيار ملف</div>
                  </label>
                ) : (
                  <div className="file-preview-card">
                    {preview ? (
                      <div className="file-image-preview">
                        <img src={preview} alt="معاينة المرفق" />
                      </div>
                    ) : (
                      <div className="file-pdf-icon">
                        <FaFileAlt />
                      </div>
                    )}

                    <div className="file-info">
                      <strong>{file.name}</strong>

                      <span>{formatFileSize(file.size)}</span>

                      <div className="file-success">
                        <FaCheckCircle />
                        تم إرفاق الملف بنجاح
                      </div>
                    </div>

                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={removeFile}
                      title="حذف المرفق"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                Notes
            ================================================== */}

            <section className="leave-section">
              <div className="section-heading">
                <div className="section-icon teal">
                  <FaStickyNote />
                </div>

                <div>
                  <h2>الملاحظات</h2>
                  <p>أضف أي معلومات أو ملاحظات إضافية</p>
                </div>

                <span className="optional-badge">اختياري</span>
              </div>

              <div className="section-content">
                <div className="notes-wrapper">
                  <FaStickyNote className="notes-icon" />

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="اكتب ملاحظاتك هنا..."
                    maxLength={1000}
                  />

                  <div className="notes-counter">{notes.length} / 1000</div>
                </div>
              </div>
            </section>
          </div>

          {/* ===================================================
              Side summary
          ==================================================== */}

          <aside className="leave-sidebar">
            <div className="summary-card">
              <div className="summary-header">
                <div className="summary-header-icon">
                  <FaFileAlt />
                </div>

                <div>
                  <span>ملخص الطلب</span>
                  <strong>طلب إجازة جديد</strong>
                </div>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-item">
                <span>الموظف</span>

                <strong>
                  {isAdmin
                    ? employeeName || "لم يتم الاختيار"
                    : me?.name || me?.full_name || "الموظف الحالي"}
                </strong>
              </div>

              <div className="summary-item">
                <span>نوع الإجازة</span>

                <strong>{type}</strong>
              </div>

              <div className="summary-item">
                <span>من</span>

                <strong>{from || "لم يتم التحديد"}</strong>
              </div>

              <div className="summary-item">
                <span>إلى</span>

                <strong>{to || "لم يتم التحديد"}</strong>
              </div>

              <div className="summary-days">
                <div>
                  <span>إجمالي المدة</span>
                  <small>يتم الحساب تلقائيًا</small>
                </div>

                <strong>
                  {days}
                  <small>{days === 1 ? "يوم" : "أيام"}</small>
                </strong>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FaExclamationTriangle />
              </div>

              <div>
                <strong>تنبيه مهم</strong>

                <p>
                  تأكد من صحة جميع البيانات قبل إرسال الطلب، وسيتم تحويله
                  للمراجعة حسب نظام المؤسسة.
                </p>
              </div>
            </div>
          </aside>
        </main>

        {/* =====================================================
            Footer actions
        ====================================================== */}

        <div className="leave-actions">
          <button
            type="button"
            className="action-cancel"
            onClick={() => nav("/leaves-list")}
            disabled={saving}
          >
            <FaTimes />
            إلغاء
          </button>

          <button
            type="button"
            className="action-reset"
            onClick={resetForm}
            disabled={saving}
          >
            إعادة تعيين
          </button>

          <button
            type="button"
            className="action-save"
            onClick={saveLeave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="button-spinner"></span>
                جاري الإرسال...
              </>
            ) : (
              <>
                <FaSave />
                إرسال طلب الإجازة
              </>
            )}
          </button>
        </div>

        <div className="leave-footer-note">
          <FaCheckCircle />
          جميع البيانات المدخلة محفوظة بشكل آمن
        </div>
      </div>

      {/* =======================================================
          Past date modal
      ======================================================== */}

      {showPastDateConfirm && (
        <div className="past-date-overlay" onClick={cancelPastDate}>
          <div className="past-date-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-line"></div>

            <button
              type="button"
              className="modal-close"
              onClick={cancelPastDate}
            >
              <FaTimes />
            </button>

            <div className="modal-warning-icon">
              <FaExclamationTriangle />
            </div>

            <span className="modal-label">تنبيه التاريخ</span>

            <h3>التاريخ المختار سابق لليوم</h3>

            <p className="modal-description">
              لقد اخترت تاريخ بداية يقع قبل تاريخ اليوم. هل تريد الاستمرار بهذا
              التاريخ؟
            </p>

            <div className="selected-past-date">
              <div className="selected-date-icon">
                <FaCalendarAlt />
              </div>

              <div>
                <span>التاريخ المختار</span>
                <strong>{formatDate(pendingFromDate)}</strong>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={cancelPastDate}
              >
                <FaTimes />
                إلغاء
              </button>

              <button
                type="button"
                className="modal-confirm"
                onClick={confirmPastDate}
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
