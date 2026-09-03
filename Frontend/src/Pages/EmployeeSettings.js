import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import {
  FaArrowRight,
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaBriefcase,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBell,
  FaMoon,
  FaSun,
  FaDesktop,
  FaShieldAlt,
  FaSignOutAlt,
  FaSave,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";

import "./employeeSettings.css";

export default function EmployeeSettings() {
  const nav = useNavigate();

  const [employee, setEmployee] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [notifications, setNotifications] = useState(
    localStorage.getItem("employeeNotifications") !==
      "false"
  );

  const [theme, setTheme] = useState(
    localStorage.getItem("employeeTheme") || "light"
  );

  // =========================================================
  // LOAD EMPLOYEE
  // =========================================================

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      setLoading(true);

      const res = await API.get("/employees/me");

      setEmployee(res.data);

      setProfile({
        name: res.data?.name || "",
        email: res.data?.email || "",
      });
    } catch (error) {
      console.error("Settings Employee Error:", error);

      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        nav("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // PROFILE CHANGE
  // =========================================================

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // UPDATE PROFILE
  // =========================================================

  const updateProfile = async (e) => {
    e.preventDefault();

    if (!profile.name.trim()) {
      alert("يرجى إدخال الاسم");
      return;
    }

    if (!profile.email.trim()) {
      alert("يرجى إدخال البريد الإلكتروني");
      return;
    }

    try {
      setSavingProfile(true);

      const res = await API.put(
        "/employees/me",
        {
          name: profile.name,
          email: profile.email,
        }
      );

      setEmployee(res.data.employee);

      setProfile({
        name: res.data.employee.name,
        email: res.data.employee.email,
      });

      alert("تم تحديث معلوماتك بنجاح");
    } catch (error) {
      console.error("Update Profile Error:", error);

      alert(
        error?.response?.data?.message ||
          "حدث خطأ أثناء تحديث المعلومات"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================================================
  // PASSWORD CHANGE
  // =========================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const changePassword = async (e) => {
    e.preventDefault();

    if (!password.currentPassword) {
      alert("يرجى إدخال كلمة المرور الحالية");
      return;
    }

    if (!password.newPassword) {
      alert("يرجى إدخال كلمة المرور الجديدة");
      return;
    }

    if (password.newPassword.length < 6) {
      alert(
        "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"
      );
      return;
    }

    if (
      password.newPassword !==
      password.confirmPassword
    ) {
      alert("كلمتا المرور الجديدتان غير متطابقتين");
      return;
    }

    if (
      password.currentPassword ===
      password.newPassword
    ) {
      alert(
        "كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية"
      );
      return;
    }

    try {
      setSavingPassword(true);

      await API.put(
        "/employees/me/password",
        {
          currentPassword:
            password.currentPassword,

          newPassword:
            password.newPassword,
        }
      );

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      alert(
        "تم تغيير كلمة المرور بنجاح"
      );
    } catch (error) {
      console.error(
        "Change Password Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "حدث خطأ أثناء تغيير كلمة المرور"
      );
    } finally {
      setSavingPassword(false);
    }
  };

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const toggleNotifications = () => {
    const newValue = !notifications;

    setNotifications(newValue);

    localStorage.setItem(
      "employeeNotifications",
      String(newValue)
    );
  };

  // =========================================================
  // THEME
  // =========================================================

  const changeTheme = (value) => {
    setTheme(value);

    localStorage.setItem(
      "employeeTheme",
      value
    );

    if (value === "dark") {
      document.documentElement.classList.add(
        "dark-mode"
      );
    } else {
      document.documentElement.classList.remove(
        "dark-mode"
      );
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rememberEmail");

    nav("/login");
  };

  // =========================================================
  // PASSWORD FIELD
  // =========================================================

  const PasswordInput = ({
    label,
    name,
    value,
    placeholder,
    show,
    setShow,
  }) => {
    return (
      <div className="settings-field">

        <label>
          {label}
        </label>

        <div className="password-input-wrapper">

          <input
            type={show ? "text" : "password"}
            name={name}
            value={value}
            onChange={handlePasswordChange}
            placeholder={placeholder}
            autoComplete="new-password"
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShow((prev) => !prev)
            }
            aria-label={
              show
                ? "إخفاء كلمة المرور"
                : "إظهار كلمة المرور"
            }
          >
            {show ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </button>

        </div>

      </div>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        className="employee-settings-page"
        dir="rtl"
      >
        <div className="settings-loading">
          <div className="settings-spinner" />

          <h3>
            جاري تحميل الإعدادات...
          </h3>

          <p>
            يرجى الانتظار قليلاً
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
      className="employee-settings-page"
      dir="rtl"
    >

      {/* HEADER */}

      <header className="settings-header">

        <button
          className="back-button"
          onClick={() => nav("/employee")}
        >
          <FaArrowRight />

          العودة للوحة التحكم
        </button>

        <div className="settings-title">

          <div className="settings-title-icon">
            <FaShieldAlt />
          </div>

          <div>

            <span>
              حساب الموظف
            </span>

            <h1>
              الإعدادات
            </h1>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <main className="settings-container">

        {/* PROFILE HEADER */}

        <section className="profile-banner">

          <div className="profile-avatar">

            {employee?.name
              ? employee.name.charAt(0)
              : <FaUser />}

          </div>

          <div className="profile-banner-info">

            <span>
              الموظف
            </span>

            <h2>
              {employee?.name || "الموظف"}
            </h2>

            <p>
              {employee?.position ||
                "موظف في النظام"}
            </p>

          </div>

          <div className="profile-status">
            <FaCheckCircle />
            الحساب نشط
          </div>

        </section>

        {/* ===================================================
            PERSONAL INFORMATION
        =================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon blue">
              <FaUser />
            </div>

            <div>

              <h2>
                المعلومات الشخصية
              </h2>

              <p>
                قم بتحديث بياناتك الشخصية الأساسية
              </p>

            </div>

          </div>

          <form
            className="settings-form"
            onSubmit={updateProfile}
          >

            <div className="settings-grid">

              {/* NAME */}

              <div className="settings-field">

                <label>
                  الاسم الكامل
                </label>

                <div className="input-with-icon">

                  <FaUser />

                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="أدخل اسمك"
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div className="settings-field">

                <label>
                  البريد الإلكتروني
                </label>

                <div className="input-with-icon">

                  <FaEnvelope />

                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="example@email.com"
                  />

                </div>

              </div>

              {/* DEPARTMENT */}

              <div className="settings-field">

                <label>
                  القسم
                </label>

                <div className="input-with-icon readonly">

                  <FaBuilding />

                  <input
                    type="text"
                    value={
                      employee?.department || "غير محدد"
                    }
                    readOnly
                  />

                </div>

                <small>
                  يتم تعديل القسم من قبل الإدارة
                </small>

              </div>

              {/* POSITION */}

              <div className="settings-field">

                <label>
                  المنصب الوظيفي
                </label>

                <div className="input-with-icon readonly">

                  <FaBriefcase />

                  <input
                    type="text"
                    value={
                      employee?.position || "غير محدد"
                    }
                    readOnly
                  />

                </div>

                <small>
                  يتم تعديل المنصب من قبل الإدارة
                </small>

              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-save-button"
                disabled={savingProfile}
              >
                <FaSave />

                {savingProfile
                  ? "جاري الحفظ..."
                  : "حفظ التغييرات"}
              </button>

            </div>

          </form>

        </section>

        {/* ===================================================
            PASSWORD
        =================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon purple">
              <FaLock />
            </div>

            <div>

              <h2>
                تغيير كلمة المرور
              </h2>

              <p>
                حافظ على أمان حسابك باستخدام كلمة مرور قوية
              </p>

            </div>

          </div>

          <form
            className="settings-form"
            onSubmit={changePassword}
          >

            <div className="password-grid">

              <PasswordInput
                label="كلمة المرور الحالية"
                name="currentPassword"
                value={password.currentPassword}
                placeholder="أدخل كلمة المرور الحالية"
                show={showCurrentPassword}
                setShow={setShowCurrentPassword}
              />

              <PasswordInput
                label="كلمة المرور الجديدة"
                name="newPassword"
                value={password.newPassword}
                placeholder="6 أحرف على الأقل"
                show={showNewPassword}
                setShow={setShowNewPassword}
              />

              <PasswordInput
                label="تأكيد كلمة المرور الجديدة"
                name="confirmPassword"
                value={password.confirmPassword}
                placeholder="أعد كتابة كلمة المرور"
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
              />

            </div>

            <div className="password-hint">

              <FaInfoCircle />

              <span>
                يجب أن تحتوي كلمة المرور الجديدة
                على 6 أحرف على الأقل.
              </span>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="password-save-button"
                disabled={savingPassword}
              >
                <FaLock />

                {savingPassword
                  ? "جاري التغيير..."
                  : "تغيير كلمة المرور"}
              </button>

            </div>

          </form>

        </section>

        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon orange">
              <FaBell />
            </div>

            <div>

              <h2>
                الإشعارات
              </h2>

              <p>
                تحكم في تفضيلات الإشعارات الخاصة بك
              </p>

            </div>

          </div>

          <div className="setting-row">

            <div className="setting-row-info">

              <div className="setting-row-icon">
                <FaBell />
              </div>

              <div>

                <strong>
                  إشعارات النظام
                </strong>

                <span>
                  استقبال تنبيهات حول الإجازات والمهام
                </span>

              </div>

            </div>

            <button
              type="button"
              className={`toggle-switch ${
                notifications
                  ? "active"
                  : ""
              }`}
              onClick={toggleNotifications}
              aria-label="تفعيل الإشعارات"
            >
              <span />
            </button>

          </div>

        </section>

        {/* ===================================================
            APPEARANCE
        =================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon green">
              <FaSun />
            </div>

            <div>

              <h2>
                المظهر
              </h2>

              <p>
                اختر المظهر المناسب لك
              </p>

            </div>

          </div>

          <div className="theme-options">

            <button
              type="button"
              className={`theme-option ${
                theme === "light"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                changeTheme("light")
              }
            >

              <FaSun />

              <span>
                فاتح
              </span>

              {theme === "light" && (
                <FaCheckCircle className="theme-check" />
              )}

            </button>

            <button
              type="button"
              className={`theme-option ${
                theme === "dark"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                changeTheme("dark")
              }
            >

              <FaMoon />

              <span>
                داكن
              </span>

              {theme === "dark" && (
                <FaCheckCircle className="theme-check" />
              )}

            </button>

            <button
              type="button"
              className={`theme-option ${
                theme === "system"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                changeTheme("system")
              }
            >

              <FaDesktop />

              <span>
                تلقائي
              </span>

              {theme === "system" && (
                <FaCheckCircle className="theme-check" />
              )}

            </button>

          </div>

        </section>

        {/* ===================================================
            SECURITY
        =================================================== */}

        <section className="settings-card security-card">

          <div className="settings-card-header">

            <div className="settings-section-icon red">
              <FaShieldAlt />
            </div>

            <div>

              <h2>
                الأمان
              </h2>

              <p>
                إدارة أمان حسابك
              </p>

            </div>

          </div>

          <div className="security-info">

            <div className="security-item">

              <FaShieldAlt />

              <div>
                <strong>
                  حساب محمي
                </strong>

                <span>
                  بيانات حسابك محمية ولا يمكن للموظف
                  الوصول إلى بيانات موظفين آخرين.
                </span>
              </div>

            </div>

            <div className="security-item">

              <FaLock />

              <div>
                <strong>
                  كلمة المرور
                </strong>

                <span>
                  يتم تخزين كلمات المرور بشكل مشفر.
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <section className="logout-card">

          <div>

            <h3>
              تسجيل الخروج
            </h3>

            <p>
              سيتم إنهاء جلسة تسجيل الدخول الحالية.
            </p>

          </div>

          <button
            type="button"
            onClick={logout}
          >
            <FaSignOutAlt />

            تسجيل الخروج
          </button>

        </section>

        {/* FOOTER */}

        <div className="settings-footer">
          <FaShieldAlt />

          <span>
            نظام إدارة الموظفين HR System
          </span>

          <span>
            •
          </span>

          <span>
            حسابك محمي
          </span>
        </div>

      </main>

    </div>
  );
}