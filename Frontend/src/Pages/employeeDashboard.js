import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import {
  FaCalendarAlt,
  FaClipboardList,
  FaSignOutAlt,
  FaPlus,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaTasks,
  FaCog,
  FaChevronLeft,
} from "react-icons/fa";

import "./employeeDashboard.css";

export default function EmployeeDashboard() {
  const nav = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    fetchEmployee();
    fetchLeaves();
    fetchTasks();
  }, []);

  // =========================================================
  // GET EMPLOYEE
  // =========================================================

  const fetchEmployee = async () => {
    try {
      setLoadingEmployee(true);

      const res = await API.get("/employees/me");

      setEmployee(res.data);
    } catch (err) {
      console.error("Employee Error:", err);

      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        nav("/login");
      }
    } finally {
      setLoadingEmployee(false);
    }
  };

  // =========================================================
  // GET LEAVES
  // =========================================================

  const fetchLeaves = async () => {
    try {
      setLoadingLeaves(true);

      const res = await API.get("/leaves/my-leaves");

      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Leaves Error:", err);
      setLeaves([]);
    } finally {
      setLoadingLeaves(false);
    }
  };

  // =========================================================
  // GET TASKS
  // =========================================================

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);

      const res = await API.get("/tasks");

      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Tasks Error:", err);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rememberEmail");

    nav("/login");
  };

  // =========================================================
  // DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =========================================================
  // LEAVE STATUS
  // =========================================================

  const getStatus = (status) => {
    switch (status) {
      case "approved":
        return {
          text: "مقبولة",
          icon: <FaCheckCircle />,
          className: "approved",
        };

      case "rejected":
        return {
          text: "مرفوضة",
          icon: <FaTimesCircle />,
          className: "rejected",
        };

      default:
        return {
          text: "قيد المراجعة",
          icon: <FaHourglassHalf />,
          className: "pending",
        };
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="employee-dashboard" dir="rtl">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="employee-sidebar">

        {/* BRAND */}

        <div className="brand">
          <div className="brand-icon">
            <FaTasks />
          </div>

          <div>
            <h2>HR System</h2>
            <span>نظام إدارة الموظفين</span>
          </div>
        </div>

        {/* MENU */}

        <div className="sidebar-menu">

          {/* DASHBOARD */}

          <button
            className="sidebar-btn active"
            onClick={() => nav("/employee")}
          >
            <FaClipboardList />

            <span>لوحة التحكم</span>
          </button>

          {/* LEAVE */}

          <button
            className="sidebar-btn"
            onClick={() => nav("/leave")}
          >
            <FaCalendarAlt />

            <span>طلب إجازة</span>
          </button>

          {/* SETTINGS */}

          <button
            className="sidebar-btn"
            onClick={() => nav("/employee/settings")}
          >
            <FaCog />

            <span>الإعدادات</span>

            <FaChevronLeft className="sidebar-arrow" />
          </button>

        </div>

        {/* USER */}

        <div className="sidebar-user">

          <div className="user-avatar">
            {employee?.name
              ? employee.name.charAt(0)
              : <FaUser />}
          </div>

          <div className="user-info">

            <span>مرحباً</span>

            <strong>
              {loadingEmployee
                ? "جاري التحميل..."
                : employee?.name || "الموظف"}
            </strong>

          </div>

        </div>

        {/* LOGOUT */}

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <FaSignOutAlt />

          <span>تسجيل الخروج</span>
        </button>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="employee-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <span className="welcome-small">
              لوحة الموظف
            </span>

            <h1>
              أهلاً بك،{" "}
              {employee?.name || "موظفنا العزيز"} 👋
            </h1>

            <p>
              تابع مهامك وإجازاتك من مكان واحد.
            </p>

          </div>

          <button
            className="header-leave-btn"
            onClick={() => nav("/leave")}
          >
            <FaPlus />

            طلب إجازة
          </button>

        </header>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <section className="statistics">

          <div className="stat-card blue">

            <div className="stat-icon">
              <FaTasks />
            </div>

            <div>
              <span>المهام الموكلة</span>

              <strong>
                {loadingTasks
                  ? "..."
                  : tasks.length}
              </strong>
            </div>

          </div>

          <div className="stat-card purple">

            <div className="stat-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <span>طلبات الإجازة</span>

              <strong>
                {loadingLeaves
                  ? "..."
                  : leaves.length}
              </strong>
            </div>

          </div>

          <div className="stat-card green">

            <div className="stat-icon">
              <FaCheckCircle />
            </div>

            <div>
              <span>الإجازات المقبولة</span>

              <strong>
                {
                  leaves.filter(
                    (leave) =>
                      leave.status === "approved"
                  ).length
                }
              </strong>
            </div>

          </div>

          <div className="stat-card orange">

            <div className="stat-icon">
              <FaHourglassHalf />
            </div>

            <div>
              <span>قيد المراجعة</span>

              <strong>
                {
                  leaves.filter(
                    (leave) =>
                      leave.status === "pending"
                  ).length
                }
              </strong>
            </div>

          </div>

        </section>

        {/* =====================================================
            TASKS
        ===================================================== */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>
                <FaTasks />
                المهام الموكلة إليك
              </h2>

              <p>
                المهام التي قام المسؤول بتعيينها لك
              </p>
            </div>

            <span className="count-badge">
              {tasks.length} مهمة
            </span>

          </div>

          {loadingTasks ? (

            <div className="empty-state">
              جاري تحميل المهام...
            </div>

          ) : tasks.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                <FaTasks />
              </div>

              <h3>
                لا توجد مهام حالياً
              </h3>

              <p>
                لم يتم تعيين أي مهام لك من قبل المسؤول.
              </p>

            </div>

          ) : (

            <div className="tasks-grid">

              {tasks.map((task) => (

                <div
                  className="task-card"
                  key={task.employee_task_id}
                >

                  <div className="task-top">

                    <div className="task-icon">
                      <FaClipboardList />
                    </div>

                    <span className="task-status">
                      مهمة موكلة
                    </span>

                  </div>

                  <h3>
                    {task.title}
                  </h3>

                  <p>
                    {task.description ||
                      "لا يوجد وصف لهذه المهمة."}
                  </p>

                  <div className="task-footer">

                    <span>
                      <FaCheckCircle />
                      معينة لك
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* =====================================================
            LEAVES
        ===================================================== */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                <FaCalendarAlt />
                إجازاتي
              </h2>

              <p>
                جميع طلبات الإجازة الخاصة بك
              </p>

            </div>

            <button
              className="small-action"
              onClick={() => nav("/leave")}
            >
              <FaPlus />
              طلب جديد
            </button>

          </div>

          {loadingLeaves ? (

            <div className="empty-state">
              جاري تحميل الإجازات...
            </div>

          ) : leaves.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                <FaCalendarAlt />
              </div>

              <h3>
                لا توجد إجازات
              </h3>

              <p>
                لم تقم بتقديم أي طلب إجازة حتى الآن.
              </p>

              <button
                className="empty-button"
                onClick={() => nav("/leave")}
              >
                <FaPlus />
                تقديم طلب إجازة
              </button>

            </div>

          ) : (

            <div className="leaves-list">

              {leaves.map((leave, index) => {

                const status =
                  getStatus(leave.status);

                return (

                  <div
                    className="leave-card"
                    key={leave.id || index}
                  >

                    <div className="leave-icon">
                      <FaCalendarAlt />
                    </div>

                    <div className="leave-info">

                      <h3>
                        {leave.type || "إجازة"}
                      </h3>

                      <div className="leave-date">

                        <span>
                          {formatDate(
                            leave.from_date
                          )}
                        </span>

                        <span className="arrow">
                          →
                        </span>

                        <span>
                          {formatDate(
                            leave.to_date
                          )}
                        </span>

                      </div>

                      <div className="leave-days">

                        <FaClock />

                        {leave.days || 0} أيام

                      </div>

                    </div>

                    <div
                      className={`leave-status ${status.className}`}
                    >
                      {status.icon}

                      {status.text}
                    </div>

                  </div>

                );

              })}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}