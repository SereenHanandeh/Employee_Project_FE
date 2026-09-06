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
  // MESSAGE MODAL
  // =========================================================

  const [messageModal, setMessageModal] = useState(null);

  const showMessage = ({ type = "info", title = "تنبيه", message = "" }) => {
    setMessageModal({
      type,
      title,
      message,
    });
  };

  const closeMessageModal = () => {
    setMessageModal(null);
  };

  // =========================================================
  // PAST DATE CONFIRMATION
  // =========================================================

  const [showPastDateConfirm, setShowPastDateConfirm] = useState(false);

  const [pendingFromDate, setPendingFromDate] = useState("");
  const [previousFromDate, setPreviousFromDate] = useState("");
  const [previousToDate, setPreviousToDate] = useState("");

  // =========================================================
  // LEAVE TYPES
  // =========================================================

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
  // YEARS
  // =========================================================

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);
  }, []);

  // =========================================================
  // FETCH EMPLOYEE DATA
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
        const currentEmployeeId = user?.employee_id || user?.id || "";

        setEmployeeId(String(currentEmployeeId));
      }
    } catch (error) {
      console.error("Error loading employees:", error);

      const message =
        error?.response?.data?.message || "حدث خطأ أثناء تحميل بيانات الموظفين";

      showMessage({
        type: "error",
        title: "حدث خطأ",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CHANGE LEAVE TYPE
  // =========================================================

  const handleLeaveTypeChange = (newType) => {
    setType(newType);

    // إذا اختار السنوية
    if (newType === "سنوية") {
      // تنظيف التواريخ القديمة حتى يختار السنة
      setFrom("");
      setTo("");
      return;
    }

    // إذا انتقل من السنوية إلى نوع آخر
    // نمسح تواريخ السنة السابقة
    setFrom("");
    setTo("");
  };

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const isPastDate = (dateValue) => {
    if (!dateValue) return false;

    const selectedDate = new Date(`${dateValue}T00:00:00`);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return selectedDate < today;
  };

  // =========================================================
  // NORMAL DATE
  // =========================================================

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

  // =========================================================
  // ANNUAL YEAR CHANGE
  // =========================================================

  const handleAnnualYearChange = (e) => {
    const year = e.target.value;

    if (!year) {
      setFrom("");
      setTo("");
      return;
    }

    // السنة كاملة
    setFrom(`${year}-01-01`);
    setTo(`${year}-12-31`);
  };

  // =========================================================
  // NORMAL END DATE
  // =========================================================

  const handleToDateChange = (e) => {
    const value = e.target.value;

    if (!value) {
      setTo("");
      return;
    }

    if (from && new Date(value) < new Date(from)) {
      showMessage({
        type: "warning",
        title: "التاريخ غير صحيح",
        message: "تاريخ النهاية يجب أن يكون بعد أو مساويًا لتاريخ البداية.",
      });

      return;
    }

    setTo(value);
  };

  // =========================================================
  // PAST DATE CONFIRM
  // =========================================================

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

  // =========================================================
  // CALCULATE DAYS
  // Backend calculates the final value.
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
  // DATE FORMATTING
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
  // FILE HANDLING
  // =========================================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    // Validate type
    if (!allowedTypes.includes(selectedFile.type)) {
      showMessage({
        type: "warning",
        title: "نوع الملف غير مدعوم",
        message: "يسمح فقط برفع JPG و PNG و WEBP و PDF.",
      });

      e.target.value = "";

      return;
    }

    // Validate size
    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      showMessage({
        type: "warning",
        title: "حجم الملف كبير",
        message: "حجم الملف يجب ألا يتجاوز 5 ميجابايت.",
      });

      e.target.value = "";

      return;
    }

    // Clean old preview
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    // Save file
    setFile(selectedFile);

    // Image preview
    if (selectedFile.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(selectedFile);

      setPreview(objectUrl);
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

    const input = document.getElementById("leave-file");

    if (input) {
      input.value = "";
    }
  };

  // =========================================================
  // CLEANUP PREVIEW
  // =========================================================

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // =========================================================
  // FORMAT FILE SIZE
  // =========================================================

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
  // SELECTED EMPLOYEE
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
// SAVE LEAVE
// =========================================================
const saveLeave = async () => {
  // Employee
  if (!employeeId) {
    showMessage({
      type: "warning",
      title: "الموظف مطلوب",
      message: "يرجى اختيار الموظف.",
    });
    return;
  }

  // Type
  if (!type) {
    showMessage({
      type: "warning",
      title: "نوع الإجازة مطلوب",
      message: "يرجى اختيار نوع الإجازة.",
    });
    return;
  }

  // From
  if (!from) {
    showMessage({
      type: "warning",
      title: "تاريخ البداية مطلوب",
      message: "يرجى اختيار تاريخ بداية الإجازة.",
    });
    return;
  }

  // To
  if (!to) {
    showMessage({
      type: "warning",
      title: "تاريخ النهاية مطلوب",
      message: "يرجى اختيار تاريخ نهاية الإجازة.",
    });
    return;
  }

  // Date validation
  if (new Date(to) < new Date(from)) {
    showMessage({
      type: "warning",
      title: "التاريخ غير صحيح",
      message:
        "تاريخ النهاية يجب أن يكون بعد أو مساويًا لتاريخ البداية.",
    });
    return;
  }

  // Days validation
  if (days <= 0) {
    showMessage({
      type: "warning",
      title: "مدة الإجازة غير صحيحة",
      message: "عدد أيام الإجازة غير صحيح.",
    });
    return;
  }

  // =========================================================
  // LEAVE BALANCE VALIDATION
  // =========================================================
  if (days > 30) {
    showMessage({
      type: "warning",
      title: "رصيد الإجازة غير كافٍ",
      message:
        "رصيد الإجازة المتاح لك هو 30 يومًا فقط، ولا يمكن تسجيل إجازة تتجاوز هذا الرصيد.",
    });
    return;
  }

  // File validation
  if (file) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      showMessage({
        type: "warning",
        title: "نوع الملف غير مدعوم",
        message:
          "يسمح فقط برفع JPG و PNG و WEBP و PDF.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage({
        type: "warning",
        title: "حجم الملف كبير",
        message:
          "حجم الملف يجب ألا يتجاوز 5 ميجابايت.",
      });
      return;
    }
  }

  try {
    setSaving(true);

    const formData = new FormData();

    // Admin sends employee_id
    if (isAdmin) {
      formData.append(
        "employee_id",
        String(employeeId)
      );
    }

    // Leave data
    formData.append("type", type.trim());
    formData.append("from_date", from);
    formData.append("to_date", to);
    formData.append("notes", notes.trim());

    // Attachment
    if (file) {
      formData.append("attachment", file);
    }

    const response = await API.post(
      "/leaves",
      formData
    );

    console.log(
      "Leave created successfully:",
      response.data
    );

    showMessage({
      type: "success",
      title: "تم إرسال الطلب",
      message:
        "تم إرسال طلب الإجازة بنجاح وسيتم تحويله للمراجعة.",
    });

    setTimeout(() => {
      nav("/leaves-list");
    }, 1500);
  } catch (error) {
    console.error("Save leave error:", error);

    const message =
      error?.response?.data?.message ||
      "حدث خطأ أثناء حفظ طلب الإجازة";

    showMessage({
      type: "error",
      title: "فشل إرسال الطلب",
      message,
    });
  } finally {
    setSaving(false);
  }
};

  // =========================================================
  // RESET
  // =========================================================

  const resetForm = () => {
    setType("سنوية");

    setFrom("");
    setTo("");

    setNotes("");

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview("");

    const input = document.getElementById("leave-file");

    if (input) {
      input.value = "";
    }

    if (!isAdmin && me) {
      setEmployeeId(String(me?.employee_id || me?.id || ""));
    } else {
      setEmployeeId("");
    }
  };

  // =========================================================
  // LOADING
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

  // =========================================================
  // UI
  // =========================================================

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
            Main
        ====================================================== */}

        <main className="leave-form-layout">
          <div className="leave-form-main">
            {/* =================================================
                Employee
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
                Leave Type
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
                        onClick={() => handleLeaveTypeChange(item.value)}
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

                  <p>
                    {type === "سنوية"
                      ? "اختر سنة الإجازة"
                      : "حدد تاريخ بداية ونهاية الإجازة"}
                  </p>
                </div>

                <span className="section-badge">03</span>
              </div>

              <div className="section-content">
                <div className="dates-grid">
                  {/* ================================
                      START
                  ================================= */}

                  <div className="date-field">
                    <label>
                      {type === "سنوية" ? "سنة الإجازة" : "تاريخ البداية"}

                      <span>*</span>
                    </label>

                    <div className="date-input-wrapper">
                      <div className="date-icon">
                        <FaCalendarAlt />
                      </div>

                      {type === "سنوية" ? (
                        <select
                          value={from ? from.slice(0, 4) : ""}
                          onChange={handleAnnualYearChange}
                        >
                          <option value="">اختر السنة</option>

                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="date"
                          value={from}
                          onChange={handleFromDateChange}
                        />
                      )}
                    </div>

                    {from && (
                      <div className="date-readable">
                        <FaClock />

                        {type === "سنوية"
                          ? `سنة ${from.slice(0, 4)}`
                          : formatDate(from)}
                      </div>
                    )}
                  </div>

                  {/* ================================
                      CONNECTOR
                  ================================= */}

                  <div className="date-connector">
                    <span></span>

                    <FaChevronLeft />

                    <span></span>
                  </div>

                  {/* ================================
                      END
                  ================================= */}

                  <div className="date-field">
                    <label>
                      {type === "سنوية" ? "سنة النهاية" : "تاريخ النهاية"}

                      <span>*</span>
                    </label>

                    <div className="date-input-wrapper">
                      <div className="date-icon">
                        <FaCalendarAlt />
                      </div>

                      {type === "سنوية" ? (
                        <select
                          value={to ? to.slice(0, 4) : ""}
                          onChange={(e) => {
                            const year = e.target.value;

                            if (!year) {
                              setTo("");
                              return;
                            }

                            if (
                              from &&
                              Number(year) < Number(from.slice(0, 4))
                            ) {
                              showMessage({
                                type: "warning",
                                title: "السنة غير صحيحة",
                                message:
                                  "سنة النهاية يجب أن تكون بعد أو مساوية لسنة البداية.",
                              });

                              return;
                            }

                            setTo(`${year}-12-31`);
                          }}
                        >
                          <option value="">اختر السنة</option>

                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="date"
                          value={to}
                          min={from || undefined}
                          onChange={handleToDateChange}
                        />
                      )}
                    </div>

                    {to && (
                      <div className="date-readable">
                        <FaClock />

                        {type === "سنوية"
                          ? `سنة ${to.slice(0, 4)}`
                          : formatDate(to)}
                      </div>
                    )}
                  </div>
                </div>

                {/* =================================================
                    Days summary
                ================================================== */}

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
                      {type === "سنوية"
                        ? "تم تحديد السنة كاملة"
                        : "تم احتساب المدة تلقائيًا"}
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
              SIDE SUMMARY
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

                <strong>
                  {type === "سنوية" && from
                    ? `01/01/${from.slice(0, 4)}`
                    : from || "لم يتم التحديد"}
                </strong>
              </div>

              <div className="summary-item">
                <span>إلى</span>

                <strong>
                  {type === "سنوية" && to
                    ? `31/12/${to.slice(0, 4)}`
                    : to || "لم يتم التحديد"}
                </strong>
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
            Footer Actions
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
          Past Date Modal
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

      {/* =======================================================
          MESSAGE MODAL
      ======================================================== */}

      {messageModal && (
        <div className="message-overlay" onClick={closeMessageModal}>
          <div
            className={`message-modal ${messageModal.type}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="message-icon">
              {messageModal.type === "success" && <FaCheckCircle />}

              {messageModal.type === "error" && <FaTimes />}

              {messageModal.type === "warning" && <FaExclamationTriangle />}

              {messageModal.type === "info" && <FaFileAlt />}
            </div>

            <h3>{messageModal.title}</h3>

            <p>{messageModal.message}</p>

            <button
              type="button"
              className={`message-button ${messageModal.type}`}
              onClick={closeMessageModal}
            >
              حسنًا
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
