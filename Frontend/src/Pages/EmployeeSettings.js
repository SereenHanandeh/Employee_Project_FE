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

/* =========================================================
   PASSWORD INPUT
   مهم جداً:
   يجب أن يكون خارج EmployeeSettings حتى لا يفقد الـ input
   التركيز عند كتابة كل حرف.
========================================================= */

function PasswordInput({
  label,
  name,
  value,
  placeholder,
  show,
  setShow,
  onChange,
}) {
  return (
    <div className="settings-field">
      <label>{label}</label>

      <div className="password-input-wrapper">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() => setShow((prev) => !prev)}
          aria-label={
            show
              ? "إخفاء كلمة المرور"
              : "إظهار كلمة المرور"
          }
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   EMPLOYEE SETTINGS
========================================================= */

export default function EmployeeSettings() {
  const nav = useNavigate();

  const [employee, setEmployee] = useState(null);

  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);

  const [savingPassword, setSavingPassword] = useState(false);

  /* =========================================================
     PROFILE
  ========================================================= */

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  /* =========================================================
     PASSWORD
  ========================================================= */

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

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const [notifications, setNotifications] = useState(
    localStorage.getItem("employeeNotifications") !== "false"
  );

  /* =========================================================
     THEME
  ========================================================= */

  const [theme, setTheme] = useState(
    localStorage.getItem("employeeTheme") || "light"
  );

  /* =========================================================
     LOAD EMPLOYEE
  ========================================================= */

  useEffect(() => {
    fetchEmployee();
  }, []);

  /* =========================================================
     APPLY SAVED THEME
  ========================================================= */

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /* =========================================================
     FETCH EMPLOYEE
  ========================================================= */

  const fetchEmployee = async () => {
    try {
      setLoading(true);

      const res = await API.get("/employees/me");

      const data = res.data;

      setEmployee(data);

      setProfile({
        name: data?.name || "",
        email: data?.email || "",
      });
    } catch (error) {
      console.error(
        "Settings Employee Error:",
        error
      );

      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("rememberEmail");

        nav("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PROFILE INPUT CHANGE
  ========================================================= */

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     UPDATE PROFILE
  ========================================================= */

  const updateProfile = async (e) => {
    e.preventDefault();

    const name = profile.name.trim();
    const email = profile.email.trim().toLowerCase();

    if (!name) {
      alert("يرجى إدخال الاسم");
      return;
    }

    if (name.length < 2) {
      alert("الاسم يجب أن يكون حرفين على الأقل");
      return;
    }

    if (!email) {
      alert("يرجى إدخال البريد الإلكتروني");
      return;
    }

    try {
      setSavingProfile(true);

      /*
       * مهم:
       * هذا هو الراوت الخاص بتعديل بيانات الموظف لنفسه
       */
      const res = await API.put(
        "/employees/me/update",
        {
          name,
          email,
        }
      );

      const updatedEmployee =
        res.data?.employee || res.data;

      setEmployee(updatedEmployee);

      setProfile({
        name: updatedEmployee?.name || name,
        email: updatedEmployee?.email || email,
      });

      alert("تم تحديث معلوماتك بنجاح");
    } catch (error) {
      console.error(
        "Update Profile Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "حدث خطأ أثناء تحديث المعلومات"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  /* =========================================================
     PASSWORD INPUT CHANGE
  ========================================================= */

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     CHANGE PASSWORD
  ========================================================= */

  const changePassword = async (e) => {
    e.preventDefault();

    const currentPassword =
      password.currentPassword;

    const newPassword =
      password.newPassword;

    const confirmPassword =
      password.confirmPassword;

    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!currentPassword) {
      alert("يرجى إدخال كلمة المرور الحالية");
      return;
    }

    if (!newPassword) {
      alert("يرجى إدخال كلمة المرور الجديدة");
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"
      );
      return;
    }

    if (!confirmPassword) {
      alert(
        "يرجى تأكيد كلمة المرور الجديدة"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(
        "كلمتا المرور الجديدتان غير متطابقتين"
      );
      return;
    }

    if (currentPassword === newPassword) {
      alert(
        "كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية"
      );
      return;
    }

    /* -----------------------------------------
       API
    ----------------------------------------- */

    try {
      setSavingPassword(true);

      await API.put(
        "/employees/me/password",
        {
          currentPassword,
          newPassword,
        }
      );

      /* -----------------------------------------
         CLEAR PASSWORD FIELDS
      ----------------------------------------- */

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

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

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const toggleNotifications = () => {
    const newValue = !notifications;

    setNotifications(newValue);

    localStorage.setItem(
      "employeeNotifications",
      String(newValue)
    );
  };

  /* =========================================================
     APPLY THEME
  ========================================================= */

  const applyTheme = (value) => {
    const root =
      document.documentElement;

    if (value === "dark") {
      root.classList.add("dark-mode");
    } else if (value === "light") {
      root.classList.remove("dark-mode");
    } else {
      /*
       * SYSTEM
       */

      const prefersDark =
        window.matchMedia &&
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

      if (prefersDark) {
        root.classList.add("dark-mode");
      } else {
        root.classList.remove("dark-mode");
      }
    }
  };

  /* =========================================================
     CHANGE THEME
  ========================================================= */

  const changeTheme = (value) => {
    setTheme(value);

    localStorage.setItem(
      "employeeTheme",
      value
    );

    applyTheme(value);
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rememberEmail");

    nav("/login");
  };

  /* =========================================================
     LOADING
  ========================================================= */

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

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="employee-settings-page"
      dir="rtl"
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="settings-header">
        <button
          type="button"
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

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main className="settings-container">

        {/* =================================================
            PROFILE BANNER
        ================================================= */}

        <section className="profile-banner">
          <div className="profile-avatar">
            {employee?.name ? (
              employee.name.charAt(0)
            ) : (
              <FaUser />
            )}
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

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

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
                    autoComplete="name"
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
                    autoComplete="email"
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
                      employee?.department ||
                      "غير محدد"
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
                      employee?.position ||
                      "غير محدد"
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

        {/* =================================================
            CHANGE PASSWORD
        ================================================= */}

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

              {/* CURRENT PASSWORD */}

              <PasswordInput
                label="كلمة المرور الحالية"
                name="currentPassword"
                value={
                  password.currentPassword
                }
                placeholder="أدخل كلمة المرور الحالية"
                show={showCurrentPassword}
                setShow={
                  setShowCurrentPassword
                }
                onChange={
                  handlePasswordChange
                }
              />

              {/* NEW PASSWORD */}

              <PasswordInput
                label="كلمة المرور الجديدة"
                name="newPassword"
                value={
                  password.newPassword
                }
                placeholder="6 أحرف على الأقل"
                show={showNewPassword}
                setShow={
                  setShowNewPassword
                }
                onChange={
                  handlePasswordChange
                }
              />

              {/* CONFIRM PASSWORD */}

              <PasswordInput
                label="تأكيد كلمة المرور الجديدة"
                name="confirmPassword"
                value={
                  password.confirmPassword
                }
                placeholder="أعد كتابة كلمة المرور"
                show={showConfirmPassword}
                setShow={
                  setShowConfirmPassword
                }
                onChange={
                  handlePasswordChange
                }
              />
            </div>

            {/* PASSWORD HINT */}

            <div className="password-hint">
              <FaInfoCircle />

              <span>
                يجب أن تحتوي كلمة المرور الجديدة
                على 6 أحرف على الأقل.
              </span>
            </div>

            {/* BUTTON */}

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

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

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
              onClick={
                toggleNotifications
              }
              aria-label="تفعيل الإشعارات"
            >
              <span />
            </button>
          </div>
        </section>

        {/* =================================================
            APPEARANCE
        ================================================= */}

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

            {/* LIGHT */}

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
                <FaCheckCircle
                  className="theme-check"
                />
              )}
            </button>

            {/* DARK */}

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
                <FaCheckCircle
                  className="theme-check"
                />
              )}
            </button>

            {/* SYSTEM */}

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
                <FaCheckCircle
                  className="theme-check"
                />
              )}
            </button>
          </div>
        </section>

        {/* =================================================
            SECURITY
        ================================================= */}

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

        {/* =================================================
            LOGOUT
        ================================================= */}

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

        {/* =================================================
            FOOTER
        ================================================= */}

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