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
  FaExclamationTriangle,
  FaUndo,
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

  // =========================================================
  // TASK MODAL
  // =========================================================

  const [taskModal, setTaskModal] = useState({
    open: false,
    type: "confirm",
    taskId: null,
    title: "",
    message: "",
  });

  const [completingTaskId, setCompletingTaskId] = useState(null);

  // =========================================================
  // SUCCESS / ERROR MODAL
  // =========================================================

  const [messageModal, setMessageModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  // =========================================================
  // LOAD DATA
  // =========================================================

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
  // TASK STATUS
  // =========================================================

  const getTaskStatus = (status) => {
    if (status === "completed") {
      return {
        text: "تم الإنجاز",
        icon: <FaCheckCircle />,
        className: "completed",
      };
    }

    return {
      text: "قيد التنفيذ",
      icon: <FaHourglassHalf />,
      className: "pending",
    };
  };

  // =========================================================
  // OPEN COMPLETE MODAL
  // =========================================================

  const openCompleteTaskModal = (taskId) => {
    const selectedTask = tasks.find(
      (task) => task.employee_task_id === taskId
    );

    if (!selectedTask) return;

    setTaskModal({
      open: true,
      type: "complete",
      taskId,
      title: "إنهاء المهمة",
      message: `هل أنت متأكد من أنك أنجزت المهمة "${selectedTask.title}"؟`,
    });
  };

  // =========================================================
  // OPEN REOPEN MODAL
  // =========================================================

  const openReopenTaskModal = (taskId) => {
    const selectedTask = tasks.find(
      (task) => task.employee_task_id === taskId
    );

    if (!selectedTask) return;

    setTaskModal({
      open: true,
      type: "reopen",
      taskId,
      title: "إعادة فتح المهمة",
      message: `هل تريد إعادة المهمة "${selectedTask.title}" إلى حالة قيد التنفيذ؟`,
    });
  };

  // =========================================================
  // CLOSE TASK MODAL
  // =========================================================

  const closeTaskModal = () => {
    if (completingTaskId) return;

    setTaskModal({
      open: false,
      type: "confirm",
      taskId: null,
      title: "",
      message: "",
    });
  };

  // =========================================================
  // COMPLETE TASK
  // =========================================================

  const completeTask = async () => {
    const taskId = taskModal.taskId;

    if (!taskId) return;

    try {
      setCompletingTaskId(taskId);

      await API.put(`/tasks/${taskId}/complete`);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.employee_task_id === taskId
            ? {
                ...task,
                status: "completed",
              }
            : task
        )
      );

      setTaskModal({
        open: false,
        type: "confirm",
        taskId: null,
        title: "",
        message: "",
      });

      setMessageModal({
        open: true,
        type: "success",
        title: "تم إنجاز المهمة",
        message: "تم تسجيل المهمة كمهمة منجزة بنجاح.",
      });
    } catch (err) {
      console.error("Complete Task Error:", err);

      setTaskModal({
        open: false,
        type: "confirm",
        taskId: null,
        title: "",
        message: "",
      });

      setMessageModal({
        open: true,
        type: "error",
        title: "تعذر إنهاء المهمة",
        message:
          err?.response?.data?.message ||
          "حدث خطأ أثناء تسجيل المهمة كمكتملة. حاول مرة أخرى.",
      });
    } finally {
      setCompletingTaskId(null);
    }
  };

  // =========================================================
  // REOPEN TASK
  // =========================================================

  const reopenTask = async () => {
    const taskId = taskModal.taskId;

    if (!taskId) return;

    try {
      setCompletingTaskId(taskId);

      await API.put(`/tasks/${taskId}/reopen`);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.employee_task_id === taskId
            ? {
                ...task,
                status: "pending",
              }
            : task
        )
      );

      setTaskModal({
        open: false,
        type: "confirm",
        taskId: null,
        title: "",
        message: "",
      });

      setMessageModal({
        open: true,
        type: "success",
        title: "تمت إعادة فتح المهمة",
        message: "تمت إعادة المهمة إلى حالة قيد التنفيذ.",
      });
    } catch (err) {
      console.error("Reopen Task Error:", err);

      setTaskModal({
        open: false,
        type: "confirm",
        taskId: null,
        title: "",
        message: "",
      });

      setMessageModal({
        open: true,
        type: "error",
        title: "تعذر إعادة فتح المهمة",
        message:
          err?.response?.data?.message ||
          "حدث خطأ أثناء إعادة فتح المهمة. حاول مرة أخرى.",
      });
    } finally {
      setCompletingTaskId(null);
    }
  };

  // =========================================================
  // CLOSE MESSAGE MODAL
  // =========================================================

  const closeMessageModal = () => {
    setMessageModal({
      open: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  // =========================================================
  // TASK COUNTS
  // =========================================================

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status !== "completed"
  ).length;

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
            {employee?.name ? (
              employee.name.charAt(0)
            ) : (
              <FaUser />
            )}
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
          {/* TOTAL TASKS */}

          <div className="stat-card blue">
            <div className="stat-icon">
              <FaTasks />
            </div>

            <div>
              <span>المهام الموكلة</span>

              <strong>
                {loadingTasks ? "..." : tasks.length}
              </strong>
            </div>
          </div>

          {/* LEAVES */}

          <div className="stat-card purple">
            <div className="stat-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <span>طلبات الإجازة</span>

              <strong>
                {loadingLeaves ? "..." : leaves.length}
              </strong>
            </div>
          </div>

          {/* COMPLETED TASKS */}

          <div className="stat-card green">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>

            <div>
              <span>المهام المنجزة</span>

              <strong>
                {loadingTasks ? "..." : completedTasks}
              </strong>
            </div>
          </div>

          {/* PENDING TASKS */}

          <div className="stat-card orange">
            <div className="stat-icon">
              <FaHourglassHalf />
            </div>

            <div>
              <span>مهام قيد التنفيذ</span>

              <strong>
                {loadingTasks ? "..." : pendingTasks}
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
              {tasks.map((task) => {
                const isCompleted =
                  task.status === "completed";

                const taskStatus =
                  getTaskStatus(task.status);

                return (
                  <div
                    className={`task-card ${
                      isCompleted ? "task-completed" : ""
                    }`}
                    key={task.employee_task_id}
                  >
                    {/* TASK TOP */}

                    <div className="task-top">
                      <div className="task-icon">
                        {isCompleted ? (
                          <FaCheckCircle />
                        ) : (
                          <FaClipboardList />
                        )}
                      </div>

                      <span
                        className={`task-status ${taskStatus.className}`}
                      >
                        {taskStatus.icon}
                        {taskStatus.text}
                      </span>
                    </div>

                    {/* TITLE */}

                    <h3>{task.title}</h3>

                    {/* DESCRIPTION */}

                    <p>
                      {task.description ||
                        "لا يوجد وصف لهذه المهمة."}
                    </p>

                    {/* DUE DATE */}

                    <div className="task-date">
                      <FaCalendarAlt />

                      <span>
                        تاريخ الاستحقاق:
                      </span>

                      <strong>
                        {formatDate(task.due_date)}
                      </strong>
                    </div>

                    {/* TASK FOOTER */}

                    <div className="task-footer">
                      {isCompleted ? (
                        <div className="task-completed-actions">
                          <span className="completed-text">
                            <FaCheckCircle />
                            تم إنهاء المهمة
                          </span>

                          <button
                            type="button"
                            className="reopen-task-btn"
                            onClick={() =>
                              openReopenTaskModal(
                                task.employee_task_id
                              )
                            }
                            disabled={
                              completingTaskId ===
                              task.employee_task_id
                            }
                          >
                            <FaUndo />
                            إعادة فتح
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="complete-task-btn"
                          onClick={() =>
                            openCompleteTaskModal(
                              task.employee_task_id
                            )
                          }
                          disabled={
                            completingTaskId ===
                            task.employee_task_id
                          }
                        >
                          <FaCheckCircle />

                          {completingTaskId ===
                          task.employee_task_id
                            ? "جاري الحفظ..."
                            : "إنهاء المهمة"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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

      {/* =====================================================
          TASK CONFIRMATION MODAL
      ===================================================== */}

      {taskModal.open && (
        <div
          className="task-confirm-modal-overlay"
          onClick={closeTaskModal}
        >
          <div
            className="task-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`task-confirm-icon ${
                taskModal.type === "complete"
                  ? "success"
                  : "warning"
              }`}
            >
              {taskModal.type === "complete" ? (
                <FaCheckCircle />
              ) : (
                <FaUndo />
              )}
            </div>

            <h3>{taskModal.title}</h3>

            <p>{taskModal.message}</p>

            <div className="task-confirm-actions">
              <button
                type="button"
                className="task-modal-cancel"
                onClick={closeTaskModal}
                disabled={!!completingTaskId}
              >
                إلغاء
              </button>

              <button
                type="button"
                className={`task-modal-confirm ${
                  taskModal.type === "complete"
                    ? "complete"
                    : "reopen"
                }`}
                onClick={
                  taskModal.type === "complete"
                    ? completeTask
                    : reopenTask
                }
                disabled={!!completingTaskId}
              >
                {completingTaskId ? (
                  "جاري الحفظ..."
                ) : taskModal.type === "complete" ? (
                  <>
                    <FaCheckCircle />
                    نعم، تم إنجازها
                  </>
                ) : (
                  <>
                    <FaUndo />
                    نعم، إعادة فتح
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS / ERROR MESSAGE MODAL
      ===================================================== */}

      {messageModal.open && (
        <div
          className="task-message-modal-overlay"
          onClick={closeMessageModal}
        >
          <div
            className="task-message-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`task-message-icon ${
                messageModal.type
              }`}
            >
              {messageModal.type === "success" ? (
                <FaCheckCircle />
              ) : (
                <FaExclamationTriangle />
              )}
            </div>

            <h3>{messageModal.title}</h3>

            <p>{messageModal.message}</p>

            <button
              type="button"
              className="task-message-button"
              onClick={closeMessageModal}
            >
              حسناً
            </button>
          </div>
        </div>
      )}
    </div>
  );
}