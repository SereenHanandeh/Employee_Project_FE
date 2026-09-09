import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import "./AdminDashboard.css";

export default function Dashboard() {
  const nav = useNavigate();

  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    evaluations: 0,
    leaves: 0,
    tasks: 0,
  });

  const [leaves, setLeaves] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        API.get("/employees"),
        API.get("/departments/active"),
        API.get("/evaluations"),
        API.get("/leaves"),
        API.get("/tasks"),
      ]);

      const [empRes, deptRes, evalRes, leaveRes, taskRes] = results;

      const employees =
        empRes.status === "fulfilled"
          ? Array.isArray(empRes.value.data)
            ? empRes.value.data
            : empRes.value.data?.employees || []
          : [];

      const departments =
        deptRes.status === "fulfilled"
          ? Array.isArray(deptRes.value.data)
            ? deptRes.value.data
            : deptRes.value.data?.departments || []
          : [];

      const evaluations =
        evalRes.status === "fulfilled"
          ? Array.isArray(evalRes.value.data)
            ? evalRes.value.data
            : evalRes.value.data?.evaluations || []
          : [];

      const allLeaves =
        leaveRes.status === "fulfilled"
          ? Array.isArray(leaveRes.value.data)
            ? leaveRes.value.data
            : leaveRes.value.data?.leaves || []
          : [];

      const allTasks =
        taskRes.status === "fulfilled"
          ? Array.isArray(taskRes.value.data)
            ? taskRes.value.data
            : taskRes.value.data?.tasks || []
          : [];

      if (empRes.status === "rejected") {
        console.error(
          "Employees Error:",
          empRes.reason?.response?.data || empRes.reason
        );
      }

      if (deptRes.status === "rejected") {
        console.error(
          "Departments Error:",
          deptRes.reason?.response?.data || deptRes.reason
        );
      }

      if (evalRes.status === "rejected") {
        console.error(
          "Evaluations Error:",
          evalRes.reason?.response?.data || evalRes.reason
        );
      }

      if (leaveRes.status === "rejected") {
        console.error(
          "Leaves Error:",
          leaveRes.reason?.response?.data || leaveRes.reason
        );
      }

      if (taskRes.status === "rejected") {
        console.error(
          "Tasks Error:",
          taskRes.reason?.response?.data || taskRes.reason
        );
      }

      setStats({
        employees: employees.length,
        departments: departments.length,
        evaluations: evaluations.length,
        leaves: allLeaves.length,
        tasks: allTasks.length,
      });

      setLeaves([...allLeaves].reverse().slice(0, 5));

      setEvaluations([...evaluations].reverse().slice(0, 5));

      const pendingTasks = allTasks.filter(
        (task) =>
          task.status !== "completed" &&
          task.status !== "مكتملة"
      );

      setTasks(pendingTasks.slice(0, 5));
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "الموظفين",
      subtitle: "إجمالي الموظفين",
      value: stats.employees,
      icon: "👨‍💼",
      color: "blue",
      path: "/employees",
    },
    {
      title: "الأقسام",
      subtitle: "الأقسام النشطة",
      value: stats.departments,
      icon: "🏢",
      color: "cyan",
      path: "/departments",
    },
    {
      title: "التقييمات",
      subtitle: "إجمالي التقييمات",
      value: stats.evaluations,
      icon: "📊",
      color: "orange",
      path: "/history",
    },
    {
      title: "الإجازات",
      subtitle: "طلبات الإجازات",
      value: stats.leaves,
      icon: "🏖️",
      color: "green",
      path: "/leaves-list",
    },
    {
      title: "المهام",
      subtitle: "إجمالي المهام",
      value: stats.tasks,
      icon: "📝",
      color: "purple",
      path: "/tasks",
    },
  ];

  return (
    <div className="dashboard" dir="rtl">

      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <header className="top-header">

        <div className="header-title">

          <div className="header-title-top">
            <span className="header-label">
              لوحة الإدارة
            </span>

            <span className="online-indicator">
              <span></span>
              النظام يعمل
            </span>
          </div>

          <h1>
            لوحة التحكم
          </h1>

          <p>
            أهلاً بك 👋 إليك نظرة شاملة على نظام إدارة الموظفين
          </p>

        </div>

        <div className="header-actions">

          <button
            className="notification-button"
            onClick={() => nav("/leaves-list")}
            title="الإجازات"
          >
            <span className="notification-icon">
              🔔
            </span>

            {stats.leaves > 0 && (
              <span className="notification-badge">
                {stats.leaves > 99 ? "99+" : stats.leaves}
              </span>
            )}
          </button>

          <div className="header-divider"></div>

          <div className="admin-profile">

            <div className="avatar">
              A
            </div>

            <div className="profile-info">
              <strong>
                Admin
              </strong>

              <span>
                مدير النظام
              </span>
            </div>

            <span className="profile-arrow">
             ⌄
            </span>

          </div>

        </div>

      </header>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="content">

        {/* =====================================================
            WELCOME
        ===================================================== */}

        <section className="welcome-card">

          <div className="welcome-decoration decoration-one"></div>
          <div className="welcome-decoration decoration-two"></div>

          <div className="welcome-content">

            <div className="welcome-label">
              <span className="welcome-label-icon">
                ✨
              </span>

              مرحباً بك في لوحة الإدارة
            </div>

            <h2>
              نظام إدارة الموظفين
            </h2>

            <p>
              تابع أداء فريقك، وأدر الإجازات والتقييمات والمهام
              من مكان واحد وبكل سهولة.
            </p>

            <div className="welcome-actions">

              <button
                className="primary-welcome-button"
                onClick={() => nav("/employees")}
              >
                <span>👨‍💼</span>
                إدارة الموظفين
                <b>←</b>
              </button>

              <button
                className="secondary-welcome-button"
                onClick={() => nav("/tasks")}
              >
                متابعة المهام
              </button>

            </div>

          </div>

          <div className="welcome-visual">

            <div className="visual-glow"></div>

            <div className="visual-circle circle-large">
              <span>📊</span>
            </div>

            <div className="floating-card floating-card-one">
              <span>👥</span>
              <div>
                <small>الموظفين</small>
                <strong>
                  {loading ? "..." : stats.employees}
                </strong>
              </div>
            </div>

            <div className="floating-card floating-card-two">
              <span>✓</span>
              <div>
                <small>المهام</small>
                <strong>
                  {loading ? "..." : stats.tasks}
                </strong>
              </div>
            </div>

          </div>

        </section>


        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="stats-section">

          <div className="section-header">

            <div className="section-heading">

              <div className="section-icon">
                ◈
              </div>

              <div>
                <h2>
                  نظرة عامة
                </h2>

                <p>
                  ملخص سريع لأهم بيانات النظام
                </p>
              </div>

            </div>

            <span className="section-count">
              5 مؤشرات رئيسية
            </span>

          </div>


          <div className="stats-grid">

            {statCards.map((card) => (

              <button
                key={card.title}
                type="button"
                className={`stat-card ${card.color}`}
                onClick={() => nav(card.path)}
              >

                <div className="stat-card-glow"></div>

                <div className="stat-top">

                  <div className="stat-icon">
                    {card.icon}
                  </div>

                  <span className="stat-arrow">
                    ←
                  </span>

                </div>

                <div className="stat-content">

                  <span className="stat-subtitle">
                    {card.subtitle}
                  </span>

                  <div className="stat-number">
                    {loading ? "..." : card.value}
                  </div>

                  <div className="stat-title">
                    {card.title}
                  </div>

                </div>

                <div className="stat-footer">

                  <span>
                    عرض التفاصيل
                  </span>

                  <span className="footer-arrow">
                    ←
                  </span>

                </div>

              </button>

            ))}

          </div>

        </section>


        {/* =====================================================
            THREE DASHBOARD CARDS
        ===================================================== */}

        <div className="dashboard-grid">


          {/* =================================================
              LEAVES
          ================================================= */}

          <section className="dashboard-card">

            <div className="card-header">

              <div className="card-heading">

                <div className="card-icon leaves-icon">
                  🏖️
                </div>

                <div>
                  <h2>
                    آخر الإجازات
                  </h2>

                  <span>
                    أحدث طلبات الإجازات
                  </span>
                </div>

              </div>

              <button
                className="view-all-button"
                onClick={() => nav("/leaves-list")}
              >
                عرض الكل
                <span>←</span>
              </button>

            </div>


            <div className="list">

              {leaves.length === 0 ? (

                <div className="empty">
                  <div className="empty-icon">
                    🏖️
                  </div>

                  <strong>
                    لا توجد إجازات حالياً
                  </strong>

                  <span>
                    ستظهر طلبات الإجازات هنا
                  </span>
                </div>

              ) : (

                leaves.map((leave, index) => {

                  const status = leave.status;

                  const isApproved =
                    status === "approved" ||
                    status === "مقبولة";

                  const isRejected =
                    status === "rejected" ||
                    status === "مرفوضة";

                  return (

                    <div
                      className="list-item"
                      key={
                        leave.id ||
                        leave.leave_id ||
                        index
                      }
                    >

                      <div className="item-avatar leave-avatar">
                        🏖️
                      </div>

                      <div className="item-info">

                        <strong>
                          {leave.employeeName ||
                            leave.employee?.name ||
                            leave.name ||
                            "موظف"}
                        </strong>

                        <span>
                          <span className="mini-calendar">
                            📅
                          </span>

                          {leave.startDate ||
                            leave.from ||
                            "تاريخ غير محدد"}
                        </span>

                      </div>

                      <span
                        className={`status ${
                          isApproved
                            ? "approved"
                            : isRejected
                            ? "rejected"
                            : "pending"
                        }`}
                      >
                        <span className="status-dot"></span>

                        {isApproved
                          ? "مقبولة"
                          : isRejected
                          ? "مرفوضة"
                          : "قيد الانتظار"}
                      </span>

                    </div>

                  );
                })

              )}

            </div>

          </section>


          {/* =================================================
              EVALUATIONS
          ================================================= */}

          <section className="dashboard-card">

            <div className="card-header">

              <div className="card-heading">

                <div className="card-icon evaluations-icon">
                  📊
                </div>

                <div>
                  <h2>
                    آخر التقييمات
                  </h2>

                  <span>
                    أحدث تقييمات الموظفين
                  </span>
                </div>

              </div>

              <button
                className="view-all-button"
                onClick={() => nav("/history")}
              >
                عرض الكل
                <span>←</span>
              </button>

            </div>


            <div className="list">

              {evaluations.length === 0 ? (

                <div className="empty">

                  <div className="empty-icon">
                    📊
                  </div>

                  <strong>
                    لا توجد تقييمات حالياً
                  </strong>

                  <span>
                    ستظهر التقييمات الجديدة هنا
                  </span>

                </div>

              ) : (

                evaluations.map((evaluation, index) => (

                  <div
                    className="list-item"
                    key={
                      evaluation.id ||
                      evaluation.evaluation_id ||
                      index
                    }
                  >

                    <div className="item-avatar evaluation-avatar">
                      📊
                    </div>

                    <div className="item-info">

                      <strong>
                        {evaluation.employeeName ||
                          evaluation.employee?.name ||
                          evaluation.name ||
                          "موظف"}
                      </strong>

                      <span>
                        📅{" "}
                        {evaluation.date ||
                          evaluation.createdAt ||
                          "تقييم حديث"}
                      </span>

                    </div>

                    <div className="rating">

                      <span className="rating-star">
                        ★
                      </span>

                      <strong>
                        {evaluation.rating ||
                          evaluation.score ||
                          "-"}
                      </strong>

                    </div>

                  </div>

                ))

              )}

            </div>

          </section>


          {/* =================================================
              TASKS
          ================================================= */}

          <section className="dashboard-card">

            <div className="card-header">

              <div className="card-heading">

                <div className="card-icon tasks-icon">
                  📝
                </div>

                <div>
                  <h2>
                    المهام المعلقة
                  </h2>

                  <span>
                    المهام التي تحتاج متابعة
                  </span>
                </div>

              </div>

              <button
                className="view-all-button"
                onClick={() => nav("/tasks")}
              >
                عرض الكل
                <span>←</span>
              </button>

            </div>


            <div className="list">

              {tasks.length === 0 ? (

                <div className="empty success">

                  <div className="empty-icon success-icon">
                    ✓
                  </div>

                  <strong>
                    لا توجد مهام معلقة
                  </strong>

                  <span>
                    جميع المهام محدثة حالياً 🎉
                  </span>

                </div>

              ) : (

                tasks.map((task, index) => (

                  <div
                    className="task-item"
                    key={
                      task.task_id ||
                      task.id ||
                      index
                    }
                  >

                    <div className="task-check">
                      ○
                    </div>

                    <div className="item-info">

                      <strong>
                        {task.title ||
                          task.name ||
                          "مهمة بدون اسم"}
                      </strong>

                      <span>
                        👤{" "}
                        {task.employeeName ||
                          task.employee?.name ||
                          "غير محدد"}
                      </span>

                    </div>

                    <span
                      className={`task-priority ${
                        task.priority === "high"
                          ? "priority-high"
                          : task.priority === "low"
                          ? "priority-low"
                          : "priority-medium"
                      }`}
                    >

                      <span className="priority-dot"></span>

                      {task.priority === "high"
                        ? "عالية"
                        : task.priority === "low"
                        ? "منخفضة"
                        : "متوسطة"}

                    </span>

                  </div>

                ))

              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}