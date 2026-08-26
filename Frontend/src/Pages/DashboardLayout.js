import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const nav = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("employee");

    nav("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="dashboard-layout">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">

        {/* LOGO */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            HR
          </div>

          <div>
            <h2>HR System</h2>
            <span>إدارة الموظفين</span>
          </div>
        </div>

        {/* MENU */}
        <div className="sidebar-menu">

          <div className="menu-title">
            الرئيسية
          </div>

          <button
            className={`menu-item ${
              isActive("/admin-dashboard") ? "active" : ""
            }`}
            onClick={() => nav("/admin-dashboard")}
          >
            <span>🏠</span>
            <span>لوحة التحكم</span>
          </button>

          <div className="menu-title">
            إدارة الموظفين
          </div>

          <button
            className={`menu-item ${
              isActive("/employees") ? "active" : ""
            }`}
            onClick={() => nav("/employees")}
          >
            <span>👨‍💼</span>
            <span>الموظفين</span>
          </button>

          <button
            className={`menu-item ${
              isActive("/add-employee") ? "active" : ""
            }`}
            onClick={() => nav("/add-employee")}
          >
            <span>➕</span>
            <span>إضافة موظف</span>
          </button>

          <div className="menu-title">
            الإدارة
          </div>

          <button
            className={`menu-item ${
              isActive("/leaves-list") ? "active" : ""
            }`}
            onClick={() => nav("/leaves-list")}
          >
            <span>🏖️</span>
            <span>الإجازات</span>
          </button>

          <button
            className={`menu-item ${
              isActive("/history") ? "active" : ""
            }`}
            onClick={() => nav("/history")}
          >
            <span>📊</span>
            <span>التقييمات</span>
          </button>

          <button
            className={`menu-item ${
              isActive("/tasks") ? "active" : ""
            }`}
            onClick={() => nav("/tasks")}
          >
            <span>📋</span>
            <span>المهام</span>
          </button>

          <button
            className={`menu-item ${
              isActive("/add-task") ? "active" : ""
            }`}
            onClick={() => nav("/add-task")}
          >
            <span>➕</span>
            <span>إضافة مهمة</span>
          </button>

        </div>

        {/* LOGOUT */}
        <div className="sidebar-bottom">
          <button
            className="menu-item logout"
            onClick={handleLogout}
          >
            <span>🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>

      </aside>

      {/* ================= PAGE CONTENT ================= */}
      <main className="layout-content">
        <Outlet />
      </main>

    </div>
  );
}