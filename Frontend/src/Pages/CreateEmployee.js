import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

import {
  FaUserPlus,
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaBriefcase,
  FaLock,
  FaArrowRight,
  FaSave,
  FaSpinner,
} from "react-icons/fa";

import "./AddEmployee.css";

export default function CreateEmployee() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    department_id: "",
    position: "",
    password: "",
  });

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // جلب الأقسام الفعالة
  // =========================================================
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);

        const res = await API.get("/departments/active");

        setDepartments(res.data || []);
      } catch (err) {
        console.error("Fetch Departments Error:", err);

        alert(
          err?.response?.data?.message ||
            "حدث خطأ أثناء تحميل الأقسام"
        );
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // =========================================================
  // تغيير الحقول
  // =========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // حفظ الموظف
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("يرجى إدخال اسم الموظف");
      return;
    }

    if (!form.email.trim()) {
      alert("يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!form.department_id) {
      alert("يرجى اختيار القسم");
      return;
    }

    if (!form.position.trim()) {
      alert("يرجى إدخال المسمى الوظيفي");
      return;
    }

    if (!form.password.trim()) {
      alert("يرجى إدخال كلمة المرور");
      return;
    }

    if (form.password.trim().length < 6) {
      alert("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
      return;
    }

    try {
      setLoading(true);

      await API.post("/employees", {
        name: form.name.trim(),
        email: form.email.trim(),
        department_id: Number(form.department_id),
        position: form.position.trim(),
        password: form.password,
        role: "employee",
      });

      alert("تم إضافة الموظف بنجاح");

      nav("/admin-dashboard");
    } catch (err) {
      console.error("Add Employee Error:", err);

      alert(
        err?.response?.data?.message ||
          "حدث خطأ أثناء إضافة الموظف"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // رجوع
  // =========================================================
  const goBack = () => {
    if (!loading) {
      nav(-1);
    }
  };

  return (
    <div className="add-employee-page">
      {/* الخلفية الزخرفية */}
      <div className="add-employee-bg-circle circle-one" />
      <div className="add-employee-bg-circle circle-two" />

      <main className="add-employee-wrapper">
        {/* =================================================
            HEADER
        ================================================= */}
        <div className="add-employee-header">
          <div className="add-employee-breadcrumb">
            <span>لوحة التحكم</span>
            <b>/</b>
            <span>الموظفين</span>
            <b>/</b>
            <strong>إضافة موظف</strong>
          </div>

          <button
            type="button"
            className="add-employee-back"
            onClick={goBack}
            disabled={loading}
          >
            <FaArrowRight />
            <span>رجوع</span>
          </button>
        </div>

        {/* =================================================
            CARD
        ================================================= */}
        <section className="add-employee-card">
          {/* Card Header */}
          <div className="add-employee-card-header">
            <div className="add-employee-title-section">
              <div className="add-employee-icon">
                <FaUserPlus />
              </div>

              <div>
                <h1>إضافة موظف جديد</h1>

                <p>
                  أضف بيانات الموظف لإنشاء حساب جديد في النظام
                </p>
              </div>
            </div>

            <div className="employee-status">
              <span />
              حساب جديد
            </div>
          </div>

          {/* Divider */}
          <div className="add-employee-divider" />

          {/* =================================================
              FORM
          ================================================= */}
          <form
            className="add-employee-form"
            onSubmit={handleSubmit}
          >
            {/* =================================================
                BASIC INFORMATION
            ================================================= */}
            <div className="form-section">
              <div className="form-section-title">
                <span />
                المعلومات الأساسية
              </div>

              <div className="form-grid">
                {/* Name */}
                <div className="form-group">
                  <label htmlFor="name">
                    اسم الموظف
                    <span>*</span>
                  </label>

                  <div className="input-wrapper">
                    <FaUser />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="أدخل اسم الموظف"
                      autoComplete="name"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email">
                    البريد الإلكتروني
                    <span>*</span>
                  </label>

                  <div className="input-wrapper">
                    <FaEnvelope />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      autoComplete="email"
                      dir="ltr"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                JOB INFORMATION
            ================================================= */}
            <div className="form-section">
              <div className="form-section-title">
                <span />
                المعلومات الوظيفية
              </div>

              <div className="form-grid">
                {/* Department */}
                <div className="form-group">
                  <label htmlFor="department_id">
                    القسم
                    <span>*</span>
                  </label>

                  <div className="input-wrapper">
                    <FaBuilding />

                    <select
                      id="department_id"
                      name="department_id"
                      value={form.department_id}
                      onChange={handleChange}
                      disabled={
                        loading || loadingDepartments
                      }
                    >
                      <option value="">
                        {loadingDepartments
                          ? "جاري تحميل الأقسام..."
                          : departments.length === 0
                          ? "لا توجد أقسام متاحة"
                          : "اختر القسم"}
                      </option>

                      {departments.map((department) => (
                        <option
                          key={department.department_id}
                          value={department.department_id}
                        >
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!loadingDepartments &&
                    departments.length === 0 && (
                      <small className="field-warning">
                        لا توجد أقسام فعالة حاليًا. يرجى إضافة قسم
                        أولًا من صفحة الأقسام.
                      </small>
                    )}
                </div>

                {/* Position */}
                <div className="form-group">
                  <label htmlFor="position">
                    المسمى الوظيفي
                    <span>*</span>
                  </label>

                  <div className="input-wrapper">
                    <FaBriefcase />

                    <input
                      id="position"
                      name="position"
                      type="text"
                      value={form.position}
                      onChange={handleChange}
                      placeholder="مثال: موظف موارد بشرية"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                ACCOUNT INFORMATION
            ================================================= */}
            <div className="form-section">
              <div className="form-section-title">
                <span />
                معلومات الحساب
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  كلمة المرور
                  <span>*</span>
                </label>

                <div className="input-wrapper">
                  <FaLock />

                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="أدخل كلمة مرور الحساب"
                    autoComplete="new-password"
                    dir="ltr"
                    disabled={loading}
                  />
                </div>

                <small>
                  استخدم كلمة مرور قوية للحفاظ على أمان الحساب.
                  يجب أن تكون 6 أحرف على الأقل.
                </small>
              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}
            <div className="add-employee-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={goBack}
                disabled={loading}
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="save-button"
                disabled={
                  loading ||
                  loadingDepartments ||
                  departments.length === 0
                }
              >
                {loading ? (
                  <>
                    <FaSpinner className="button-spinner" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FaSave />
                    حفظ الموظف
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Footer */}
        <div className="add-employee-footer">
          جميع البيانات المدخلة محفوظة بشكل آمن داخل النظام
        </div>
      </main>
    </div>
  );
}