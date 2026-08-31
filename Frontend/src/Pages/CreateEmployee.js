
import { useState } from "react";
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
    department: "",
    position: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

    if (!form.department.trim()) {
      alert("يرجى إدخال القسم");
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

    try {
      setLoading(true);

      await API.post("/employees", {
        ...form,
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

            {/* Section */}

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

                  <label htmlFor="department">
                    القسم
                    <span>*</span>
                  </label>

                  <div className="input-wrapper">

                    <FaBuilding />

                    <input
                      id="department"
                      name="department"
                      type="text"
                      value={form.department}
                      onChange={handleChange}
                      placeholder="مثال: الموارد البشرية"
                    />

                  </div>

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
                  />

                </div>

                <small>
                  استخدم كلمة مرور قوية للحفاظ على أمان الحساب.
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
                disabled={loading}
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

