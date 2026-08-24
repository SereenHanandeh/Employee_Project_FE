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
  FaArrowRight,
  FaNotesMedical,
} from "react-icons/fa";

import "./leaveForm.css";

export default function LeaveForm() {
  const nav = useNavigate();

  // =============================
  // STATE
  // =============================

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

  // =============================
  // LOAD DATA
  // =============================

  useEffect(() => {
    fetchData();
  }, []);

  // =============================
  // CLEAN IMAGE PREVIEW
  // =============================

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // =============================
  // FETCH USER DATA
  // =============================

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await API.get("/employees/me");

      const user = res.data;

      setMe(user);

      // =============================
      // ADMIN
      // =============================

      if (user.role === "admin") {
        setIsAdmin(true);

        const empRes = await API.get("/employees");

        setEmployees(
          Array.isArray(empRes.data)
            ? empRes.data
            : []
        );

        return;
      }

      // =============================
      // EMPLOYEE
      // =============================

      setIsAdmin(false);

      if (user.employee_id) {
        setEmployeeId(user.employee_id);
      }
    } catch (err) {
      console.error(
        "FETCH DATA ERROR:",
        err.response?.data || err
      );

      // =============================
      // FALLBACK ADMIN
      // =============================

      if (err.response?.status === 404) {
        try {
          setIsAdmin(true);

          const empRes = await API.get("/employees");

          setEmployees(
            Array.isArray(empRes.data)
              ? empRes.data
              : []
          );
        } catch (error) {
          console.error(
            "FETCH EMPLOYEES ERROR:",
            error.response?.data || error
          );

          alert("فشل تحميل الموظفين");
        }
      } else {
        alert(
          err.response?.data?.message ||
            "فشل جلب بيانات المستخدم"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // FILE SELECT
  // =============================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    // =============================
    // MAX SIZE 5MB
    // =============================

    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      alert(
        "حجم الملف يجب ألا يتجاوز 5 ميجابايت"
      );

      e.target.value = "";
      return;
    }

    // =============================
    // ALLOWED TYPES
    // =============================

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert(
        "يسمح فقط بصور JPG و PNG أو ملف PDF"
      );

      e.target.value = "";
      return;
    }

    // =============================
    // REMOVE OLD PREVIEW
    // =============================

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    // =============================
    // SAVE FILE
    // =============================

    setFile(selectedFile);

    // =============================
    // IMAGE PREVIEW
    // =============================

    if (selectedFile.type.startsWith("image/")) {
      const imageUrl =
        URL.createObjectURL(selectedFile);

      setPreview(imageUrl);
    } else {
      setPreview("");
    }
  };

  // =============================
  // REMOVE FILE
  // =============================

  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview("");

    const input =
      document.getElementById("leave-file");

    if (input) {
      input.value = "";
    }
  };

  // =============================
  // CALCULATE DAYS
  // =============================

  const calculateDays = () => {
    if (!from || !to) {
      return 0;
    }

    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T00:00:00`);

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
        difference / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const days = calculateDays();

  // =============================
  // SAVE LEAVE
  // =============================

  const saveLeave = async () => {
    // =============================
    // EMPLOYEE
    // =============================

    if (isAdmin && !employeeId) {
      alert("يرجى اختيار الموظف");
      return;
    }

    // =============================
    // TYPE
    // =============================

    if (!type) {
      alert("يرجى اختيار نوع الإجازة");
      return;
    }

    // =============================
    // DATES
    // =============================

    if (!from || !to) {
      alert("يرجى تحديد تاريخ الإجازة");
      return;
    }

    if (new Date(to) < new Date(from)) {
      alert(
        "تاريخ نهاية الإجازة غير صحيح"
      );
      return;
    }

    // =============================
    // DAYS
    // =============================

    if (days <= 0) {
      alert("مدة الإجازة غير صحيحة");
      return;
    }

    try {
      setSaving(true);

      // =============================
      // FORM DATA
      // =============================

      const formData = new FormData();

      // =============================
      // ADMIN
      // =============================

      // فقط الـAdmin يرسل employee_id
      //
      // الموظف العادي يتم تحديده
      // من req.user في Backend
      // =============================

      if (isAdmin) {
        formData.append(
          "employee_id",
          employeeId
        );
      }

      // =============================
      // LEAVE DATA
      // =============================

      formData.append("type", type);
      formData.append(
        "from_date",
        from
      );
      formData.append(
        "to_date",
        to
      );

      // لا حاجة لإرسال days
      // Backend يحسبها بنفسه

      // =============================
      // NOTES
      // =============================

      if (notes.trim()) {
        formData.append(
          "notes",
          notes.trim()
        );
      }

      // =============================
      // ATTACHMENT
      // =============================

      if (file) {
        formData.append(
          "attachment",
          file
        );
      }

      // =============================
      // SEND REQUEST
      // =============================

      const response = await API.post(
        "/leaves",
        formData
      );

      console.log(
        "LEAVE CREATED:",
        response.data
      );

      // =============================
      // SUCCESS
      // =============================

      alert(
        "تم تقديم طلب الإجازة بنجاح ✅"
      );

      // =============================
      // RESET
      // =============================

      setEmployeeId("");
      setType("سنوية");
      setFrom("");
      setTo("");
      setNotes("");

      removeFile();

      // =============================
      // NAVIGATE
      // =============================

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

  // =============================
  // LOADING
  // =============================

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

  // =============================
  // UI
  // =============================

  return (
    <div
      className="leave-page"
      dir="rtl"
    >
      <div className="leave-container">

        {/* ============================= */}
        {/* HEADER */}
        {/* ============================= */}

        <div className="leave-header">

          <button
            type="button"
            className="back-button"
            onClick={() => nav(-1)}
            disabled={saving}
          >
            <FaArrowRight />
          </button>

          <div className="header-icon">
            <FaCalendarAlt />
          </div>

          <div>
            <h1>
              طلب إجازة
            </h1>

            <p>
              قم بتعبئة بيانات الإجازة
              وإرسال الطلب
            </p>
          </div>

        </div>

        {/* ============================= */}
        {/* FORM CARD */}
        {/* ============================= */}

        <div className="leave-card">

          {/* ============================= */}
          {/* EMPLOYEE */}
          {/* ============================= */}

          <div className="form-section">

            <div className="section-title">

              <div className="section-icon">
                <FaUser />
              </div>

              <div>
                <h2>
                  بيانات الموظف
                </h2>

                <span>
                  الموظف الذي سيقدم طلب
                  الإجازة
                </span>
              </div>

            </div>

            {/* ============================= */}
            {/* ADMIN */}
            {/* ============================= */}

            {isAdmin ? (

              <div className="form-group">

                <label>
                  اسم الموظف
                  <span>*</span>
                </label>

                <div className="input-wrapper">

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
                      اختر الموظف
                    </option>

                    {employees.map(
                      (emp) => (
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
                      )
                    )}

                  </select>

                </div>

              </div>

            ) : (

              /* ============================= */
              /* EMPLOYEE */
              /* ============================= */

              <div className="employee-display">

                <div className="employee-avatar">
                  <FaUser />
                </div>

                <div>

                  <span>
                    الموظف
                  </span>

                  <strong>
                    {me?.name ||
                      "الموظف"}
                  </strong>

                </div>

              </div>

            )}

          </div>

          {/* ============================= */}
          {/* LEAVE INFORMATION */}
          {/* ============================= */}

          <div className="form-section">

            <div className="section-title">

              <div className="section-icon blue">
                <FaCalendarAlt />
              </div>

              <div>

                <h2>
                  تفاصيل الإجازة
                </h2>

                <span>
                  حدد نوع الإجازة ومدتها
                </span>

              </div>

            </div>

            {/* ============================= */}
            {/* TYPE */}
            {/* ============================= */}

            <div className="form-group">

              <label>
                نوع الإجازة
                <span>*</span>
              </label>

              <div className="input-wrapper">

                <FaCalendarAlt />

                <select
                  value={type}
                  onChange={(e) =>
                    setType(
                      e.target.value
                    )
                  }
                  disabled={saving}
                >

                  <option value="سنوية">
                    إجازة سنوية
                  </option>

                  <option value="مرضية">
                    إجازة مرضية
                  </option>

                  <option value="طارئة">
                    إجازة طارئة
                  </option>

                  <option value="بدون راتب">
                    إجازة بدون راتب
                  </option>

                  <option value="استثنائية">
                    إجازة استثنائية
                  </option>

                </select>

              </div>

            </div>

            {/* ============================= */}
            {/* DATES */}
            {/* ============================= */}

            <div className="date-grid">

              <div className="form-group">

                <label>
                  من تاريخ
                  <span>*</span>
                </label>

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
                        new Date(value)
                    ) {
                      setTo("");
                    }
                  }}
                  disabled={saving}
                />

              </div>

              <div className="form-group">

                <label>
                  إلى تاريخ
                  <span>*</span>
                </label>

                <input
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) =>
                    setTo(
                      e.target.value
                    )
                  }
                  disabled={
                    saving || !from
                  }
                />

              </div>

            </div>

            {/* ============================= */}
            {/* DAYS */}
            {/* ============================= */}

            {days > 0 && (

              <div className="days-result">

                <FaCalendarAlt />

                <div>

                  <span>
                    مدة الإجازة
                  </span>

                  <strong>
                    {days}{" "}

                    {days === 1
                      ? "يوم"
                      : "أيام"}
                  </strong>

                </div>

              </div>

            )}

          </div>

          {/* ============================= */}
          {/* ATTACHMENT */}
          {/* ============================= */}

          <div className="form-section">

            <div className="section-title">

              <div className="section-icon purple">
                <FaFileAlt />
              </div>

              <div>

                <h2>
                  المرفق
                </h2>

                <span>
                  يمكنك إرفاق صورة أو تقرير
                  أو مستند للإجازة
                </span>

              </div>

            </div>

            {/* ============================= */}
            {/* NO FILE */}
            {/* ============================= */}

            {!file ? (

              <label
                className="upload-box"
                htmlFor="leave-file"
              >

                <input
                  id="leave-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  onChange={
                    handleFileChange
                  }
                  hidden
                  disabled={saving}
                />

                <div className="upload-icon">
                  <FaCloudUploadAlt />
                </div>

                <h3>
                  اضغط لاختيار ملف
                </h3>

                <p>
                  JPG أو PNG أو PDF
                </p>

                <small>
                  الحد الأقصى لحجم الملف
                  5MB
                </small>

              </label>

            ) : (

              /* ============================= */
              /* FILE PREVIEW */
              /* ============================= */

              <div className="file-preview">

                {/* IMAGE */}

                {preview ? (

                  <div className="image-preview">

                    <img
                      src={preview}
                      alt="معاينة المرفق"
                    />

                  </div>

                ) : (

                  /* PDF */

                  <div className="pdf-preview">

                    <FaFileAlt />

                    <span>
                      PDF
                    </span>

                  </div>

                )}

                {/* FILE DETAILS */}

                <div className="file-details">

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

                </div>

                {/* REMOVE */}

                <button
                  type="button"
                  className="remove-file"
                  onClick={
                    removeFile
                  }
                  disabled={saving}
                  title="إزالة الملف"
                >
                  <FaTimes />
                </button>

              </div>

            )}

          </div>

          {/* ============================= */}
          {/* NOTES */}
          {/* ============================= */}

          <div className="form-section">

            <div className="section-title">

              <div className="section-icon orange">
                <FaNotesMedical />
              </div>

              <div>

                <h2>
                  ملاحظات
                </h2>

                <span>
                  أضف أي معلومات إضافية
                  إن وجدت
                </span>

              </div>

            </div>

            <div className="form-group">

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

              <div className="characters-count">
                {notes.length}/500
              </div>

            </div>

          </div>

          {/* ============================= */}
          {/* ACTIONS */}
          {/* ============================= */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() => nav(-1)}
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

        </div>

      </div>
    </div>
  );
}