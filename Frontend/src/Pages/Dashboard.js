import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./AdminDashboard.css";

export default function Dashboard() {
  const nav = useNavigate();

  const [stats, setStats] = useState({
    employees: 0,
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

      const [
        empRes,
        evalRes,
        leaveRes,
        taskRes,
      ] = await Promise.all([
        API.get("/employees"),
        API.get("/evaluations"),
        API.get("/leaves"),
        API.get("/tasks"),
      ]);

      const employees = empRes.data || [];
      const evaluations = evalRes.data || [];
      const allLeaves = leaveRes.data || [];
      const allTasks = taskRes.data || [];

      setStats({
        employees: employees.length,
        evaluations: evaluations.length,
        leaves: allLeaves.length,
        tasks: allTasks.length,
      });

      // آخر 5 إجازات
      setLeaves(
        [...allLeaves]
          .reverse()
          .slice(0, 5)
      );

      // آخر 5 تقييمات
      setEvaluations(
        [...evaluations]
          .reverse()
          .slice(0, 5)
      );

      // المهام غير المكتملة
      const pendingTasks = allTasks.filter(
        (task) =>
          task.status !== "completed" &&
          task.status !== "مكتملة"
      );

      setTasks(
        pendingTasks.slice(0, 5)
      );

    } catch (error) {
      console.error("Dashboard Error:", error);

      alert(
        error?.response?.data?.message ||
          "فشل تحميل بيانات لوحة التحكم"
      );
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "الموظفين",
      value: stats.employees,
      icon: "👨‍💼",
      color: "blue",
      path: "/employees",
    },
    {
      title: "التقييمات",
      value: stats.evaluations,
      icon: "📊",
      color: "orange",
      path: "/history",
    },
    {
      title: "الإجازات",
      value: stats.leaves,
      icon: "🏖️",
      color: "green",
      path: "/leaves-list",
    },
    {
      title: "المهام",
      value: stats.tasks,
      icon: "📝",
      color: "purple",
      path: "/tasks",
    },
  ];

  return (
    <div className="dashboard">

      {/* ================= HEADER ================= */}

      <header className="top-header">

        <div className="header-title">

          <span className="header-label">
            لوحة الإدارة
          </span>

          <h1>
            لوحة التحكم
          </h1>

          <p>
            أهلاً بك 👋 إليك ملخص نظام إدارة الموظفين
          </p>

        </div>

        <div className="header-actions">

          <button
            className="notification-button"
            onClick={() => nav("/leaves-list")}
            title="الإجازات"
          >
            🔔
          </button>

          <div className="admin-profile">

            <div className="avatar">
              A
            </div>

            <div>
              <strong>
                Admin
              </strong>

              <span>
                مدير النظام
              </span>
            </div>

          </div>

        </div>

      </header>

      {/* ================= CONTENT ================= */}

      <div className="content">

        {/* ================= WELCOME ================= */}

        <section className="welcome-card">

          <div className="welcome-content">

            <span className="welcome-label">
              مرحباً بك
            </span>

            <h2>
              نظام إدارة الموظفين 👋
            </h2>

            <p>
              يمكنك من هنا متابعة الموظفين والإجازات
              والتقييمات والمهام بسهولة.
            </p>

          </div>

          <div className="welcome-icon">
            📈
          </div>

        </section>

        {/* ================= STATS ================= */}

        <section className="stats-section">

          <div className="section-header">

            <div>
              <h2>
                نظرة عامة
              </h2>

              <p>
                إحصائيات النظام
              </p>
            </div>

          </div>

          <div className="stats-grid">

            {statCards.map((card) => (

              <div
                key={card.title}
                className={`stat-card ${card.color}`}
                onClick={() => nav(card.path)}
              >

                <div className="stat-top">

                  <div className="stat-icon">
                    {card.icon}
                  </div>

                  <span className="stat-arrow">
                    ←
                  </span>

                </div>

                <div className="stat-number">
                  {loading
                    ? "..."
                    : card.value}
                </div>

                <div className="stat-title">
                  {card.title}
                </div>

                <div className="stat-link">
                  عرض التفاصيل
                </div>

              </div>

            ))}

          </div>

        </section>

        {/* ================= THREE COLUMNS ================= */}

        <div className="dashboard-grid">

          {/* ================= LEAVES ================= */}

          <section className="dashboard-card">

            <div className="card-header">

              <div>
                <h2>
                  آخر الإجازات
                </h2>

                <span>
                  أحدث طلبات الإجازات
                </span>
              </div>

              <button
                onClick={() =>
                  nav("/leaves-list")
                }
              >
                عرض الكل
              </button>

            </div>

            <div className="list">

              {leaves.length === 0 ? (

                <div className="empty">
                  لا توجد إجازات حالياً
                </div>

              ) : (

                leaves.map((leave, index) => {

                  const status =
                    leave.status;

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

          {/* ================= EVALUATIONS ================= */}

          <section className="dashboard-card">

            <div className="card-header">

              <div>
                <h2>
                  آخر التقييمات
                </h2>

                <span>
                  أحدث تقييمات الموظفين
                </span>
              </div>

              <button
                onClick={() =>
                  nav("/history")
                }
              >
                عرض الكل
              </button>

            </div>

            <div className="list">

              {evaluations.length === 0 ? (

                <div className="empty">
                  لا توجد تقييمات حالياً
                </div>

              ) : (

                evaluations.map(
                  (evaluation, index) => (

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
                          {evaluation.date ||
                            evaluation.createdAt ||
                            "تقييم حديث"}
                        </span>

                      </div>

                      <div className="rating">
                        ⭐{" "}
                        {evaluation.rating ||
                          evaluation.score ||
                          "-"}
                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </section>

          {/* ================= TASKS ================= */}

          <section className="dashboard-card">

            <div className="card-header">

              <div>
                <h2>
                  المهام المعلقة
                </h2>

                <span>
                  المهام التي تحتاج متابعة
                </span>
              </div>

              <button
                onClick={() =>
                  nav("/tasks")
                }
              >
                عرض الكل
              </button>

            </div>

            <div className="list">

              {tasks.length === 0 ? (

                <div className="empty success">
                  🎉 لا توجد مهام معلقة
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
                        {task.employeeName ||
                          task.employee?.name ||
                          "غير محدد"}
                      </span>

                    </div>

                    <span className="task-priority">

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

      </div>

    </div>
  );
}