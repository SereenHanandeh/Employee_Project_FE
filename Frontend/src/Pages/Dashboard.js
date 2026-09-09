import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./AdminDashboard.css";

export default function Dashboard() {
  const nav = useNavigate();

  // =====================================================
  // STATS
  // =====================================================

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

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationsRef = useRef(null);

  const initializedLeaveNotificationsRef = useRef(false);
  const initializedTaskNotificationsRef = useRef(false);

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =====================================================
  // LOAD SAVED NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    try {
      const saved = localStorage.getItem("adminNotificationsList");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        }
      }
    } catch (error) {
      console.error("Load Admin Notifications Error:", error);
      setNotifications([]);
    }
  }, []);

  // =====================================================
  // SAVE NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "adminNotificationsList",
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error("Save Admin Notifications Error:", error);
    }
  }, [notifications]);

  // =====================================================
  // CLOSE NOTIFICATIONS WHEN CLICK OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // NORMALIZE STATUS
  // =====================================================

  const normalizeStatus = (status) => {
    if (status === null || status === undefined) {
      return "";
    }

    return String(status).trim().toLowerCase();
  };

  // =====================================================
  // IS TASK COMPLETED
  // =====================================================

  const isTaskCompleted = (employee, task) => {
    const status = normalizeStatus(
      employee?.status ??
        employee?.task_status ??
        task?.status ??
        task?.task_status
    );

    const completedStatuses = [
      "completed",
      "complete",
      "done",
      "finished",
      "success",
      "مكتملة",
      "مكتمل",
      "منجزة",
      "منجز",
      "منتهية",
      "منتهي",
    ];

    if (completedStatuses.includes(status)) {
      return true;
    }

    if (
      employee?.all_stages_completed === true ||
      employee?.allStagesCompleted === true ||
      employee?.stages_completed === true ||
      employee?.stagesCompleted === true
    ) {
      return true;
    }

    if (
      task?.all_stages_completed === true ||
      task?.allStagesCompleted === true ||
      task?.stages_completed === true ||
      task?.stagesCompleted === true
    ) {
      return true;
    }

    const totalStages = Number(
      employee?.total_stages ??
        employee?.totalStages ??
        task?.total_stages ??
        task?.totalStages ??
        0
    );

    const completedStages = Number(
      employee?.completed_stages ??
        employee?.completedStages ??
        task?.completed_stages ??
        task?.completedStages ??
        0
    );

    if (totalStages > 0 && completedStages >= totalStages) {
      return true;
    }

    return false;
  };

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  const fetchDashboardData = async () => {
    try {
      const results = await Promise.allSettled([
        API.get("/employees"),
        API.get("/departments/active"),
        API.get("/evaluations"),
        API.get("/leaves"),
        API.get("/tasks"),
      ]);

      const [
        empRes,
        deptRes,
        evalRes,
        leaveRes,
        taskRes,
      ] = results;

      // =====================================================
      // EMPLOYEES
      // =====================================================

      const employees =
        empRes.status === "fulfilled"
          ? Array.isArray(empRes.value.data)
            ? empRes.value.data
            : empRes.value.data?.employees || []
          : [];

      // =====================================================
      // DEPARTMENTS
      // =====================================================

      const departments =
        deptRes.status === "fulfilled"
          ? Array.isArray(deptRes.value.data)
            ? deptRes.value.data
            : deptRes.value.data?.departments || []
          : [];

      // =====================================================
      // EVALUATIONS
      // =====================================================

      const evaluationsData =
        evalRes.status === "fulfilled"
          ? Array.isArray(evalRes.value.data)
            ? evalRes.value.data
            : evalRes.value.data?.evaluations || []
          : [];

      // =====================================================
      // LEAVES
      // =====================================================

      const allLeaves =
        leaveRes.status === "fulfilled"
          ? Array.isArray(leaveRes.value.data)
            ? leaveRes.value.data
            : leaveRes.value.data?.leaves || []
          : [];

      // =====================================================
      // TASKS
      // =====================================================

      const allTasks =
        taskRes.status === "fulfilled"
          ? Array.isArray(taskRes.value.data)
            ? taskRes.value.data
            : taskRes.value.data?.tasks || []
          : [];

      // =====================================================
      // ERRORS
      // =====================================================

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

      // =====================================================
      // CHECK NOTIFICATIONS
      // =====================================================

      if (leaveRes.status === "fulfilled") {
        checkLeaveNotifications(allLeaves);
      }

      if (taskRes.status === "fulfilled") {
        checkTaskNotifications(allTasks);
      }

      // =====================================================
      // UPDATE STATS
      // =====================================================

      setStats({
        employees: employees.length,
        departments: departments.length,
        evaluations: evaluationsData.length,
        leaves: allLeaves.length,
        tasks: allTasks.length,
      });

      // =====================================================
      // LAST LEAVES
      // =====================================================

      setLeaves(
        [...allLeaves]
          .sort((a, b) => {
            const aId = Number(a.leave_id ?? a.id ?? 0);
            const bId = Number(b.leave_id ?? b.id ?? 0);

            return bId - aId;
          })
          .slice(0, 5)
      );

      // =====================================================
      // LAST EVALUATIONS
      // =====================================================

      setEvaluations(
        [...evaluationsData]
          .sort((a, b) => {
            const aId = Number(
              a.evaluation_id ?? a.id ?? 0
            );

            const bId = Number(
              b.evaluation_id ?? b.id ?? 0
            );

            return bId - aId;
          })
          .slice(0, 5)
      );

      // =====================================================
      // PENDING TASKS
      // =====================================================

      const pendingTasks = allTasks.filter((task) => {
        const employeesList = Array.isArray(task.employees)
          ? task.employees
          : [];

        if (employeesList.length === 0) {
          return !isTaskCompleted({}, task);
        }

        return employeesList.some(
          (employee) => !isTaskCompleted(employee, task)
        );
      });

      setTasks(pendingTasks.slice(0, 5));
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ADD NOTIFICATION
  // =====================================================

  const addNotification = ({
    id,
    type,
    title,
    message,
    referenceId = null,
  }) => {
    if (!id) {
      return;
    }

    setNotifications((prev) => {
      const exists = prev.some(
        (notification) => notification.id === id
      );

      if (exists) {
        return prev;
      }

      const newNotification = {
        id,
        type,
        title,
        message,
        referenceId,
        read: false,
        createdAt: new Date().toISOString(),
      };

      return [newNotification, ...prev].slice(0, 50);
    });
  };

  // =====================================================
  // CHECK NEW LEAVE REQUESTS
  // =====================================================

  const checkLeaveNotifications = (newLeaves) => {
    try {
      const storageKey = "adminLeavesNotificationState";

      const savedState = localStorage.getItem(storageKey);

      const previousLeaves = savedState
        ? JSON.parse(savedState)
        : {};

      const currentState = {};

      newLeaves.forEach((leave) => {
        const leaveId = String(
          leave.leave_id ?? leave.id ?? ""
        );

        if (!leaveId) {
          return;
        }

        const employeeName =
          leave.name ||
          leave.employeeName ||
          leave.employee?.name ||
          "موظف";

        const leaveType =
          leave.type ||
          leave.leave_type ||
          "إجازة";

        const status = normalizeStatus(leave.status);

        currentState[leaveId] = {
          leaveId,
          employeeId:
            leave.employee_id ??
            leave.employeeId,

          employeeName,
          type: leaveType,
          status,
        };

        // أول تحميل = حفظ الحالة فقط
        if (!initializedLeaveNotificationsRef.current) {
          return;
        }

        const previous = previousLeaves[leaveId];

        // طلب جديد
        if (!previous) {
          addNotification({
            id: `admin-leave-new-${leaveId}`,
            type: "leave-new",
            title: "طلب إجازة جديد",
            message: `الموظف ${employeeName} أرسل طلب إجازة جديد (${leaveType}).`,
            referenceId:
              leave.leave_id ?? leave.id,
          });

          return;
        }

        // =================================================
        // تغير الطلب إلى قيد الانتظار
        // =================================================

        const previousStatus = normalizeStatus(
          previous.status
        );

        const pendingStatuses = [
          "pending",
          "waiting",
          "قيد الانتظار",
          "معلق",
          "معلقة",
        ];

        if (
          !pendingStatuses.includes(previousStatus) &&
          pendingStatuses.includes(status)
        ) {
          addNotification({
            id: `admin-leave-pending-${leaveId}`,
            type: "leave-new",
            title: "طلب إجازة يحتاج مراجعة",
            message: `طلب إجازة الموظف ${employeeName} أصبح قيد الانتظار.`,
            referenceId:
              leave.leave_id ?? leave.id,
          });
        }
      });

      localStorage.setItem(
        storageKey,
        JSON.stringify(currentState)
      );

      initializedLeaveNotificationsRef.current = true;
    } catch (error) {
      console.error(
        "Admin Leave Notification Error:",
        error
      );
    }
  };

  // =====================================================
  // CHECK TASK COMPLETION
  // =====================================================

  const checkTaskNotifications = (newTasks) => {
    try {
      const storageKey =
        "adminTasksNotificationState";

      const savedState =
        localStorage.getItem(storageKey);

      const previousTasks = savedState
        ? JSON.parse(savedState)
        : {};

      const currentState = {};

      newTasks.forEach((task) => {
        const employees = Array.isArray(task.employees)
          ? task.employees
          : [];

        if (employees.length === 0) {
          return;
        }

        employees.forEach((employee) => {
          const employeeId =
            employee.employee_id ??
            employee.employeeId;

          if (!employeeId) {
            return;
          }

          const taskId =
            task.task_id ??
            task.id;

          if (!taskId) {
            return;
          }

          const stateId = `${taskId}-${employeeId}`;

          const employeeName =
            employee.name ||
            employee.employeeName ||
            "موظف";

          const taskTitle =
            task.title ||
            task.name ||
            "مهمة";

          const completed = isTaskCompleted(
            employee,
            task
          );

          currentState[stateId] = {
            taskId,
            employeeId,
            employeeName,
            taskTitle,
            status:
              employee.status ??
              employee.task_status ??
              "",
            completed,
          };

          // أول تحميل
          if (
            !initializedTaskNotificationsRef.current
          ) {
            return;
          }

          const previous =
            previousTasks[stateId];

          const previousCompleted =
            previous?.completed === true;

          // الموظف أنهى المهمة الآن
          if (
            !previousCompleted &&
            completed
          ) {
            addNotification({
              id: `admin-task-completed-${stateId}`,
              type: "task-completed",
              title: "تم إنهاء مهمة",
              message: `الموظف ${employeeName} أنهى المهمة "${taskTitle}".`,
              referenceId: taskId,
            });
          }
        });
      });

      localStorage.setItem(
        storageKey,
        JSON.stringify(currentState)
      );

      initializedTaskNotificationsRef.current = true;
    } catch (error) {
      console.error(
        "Admin Task Notification Error:",
        error
      );
    }
  };

  // =====================================================
  // NOTIFICATION COUNT
  // =====================================================

  const unreadNotifications =
    notifications.filter(
      (notification) => !notification.read
    ).length;

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markNotificationAsRead = (
    notificationId
  ) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  // =====================================================
  // DELETE NOTIFICATION
  // =====================================================

  const deleteNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter(
        (notification) =>
          notification.id !== notificationId
      )
    );
  };

  // =====================================================
  // CLEAR ALL
  // =====================================================

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatNotificationTime = (date) => {
    if (!date) {
      return "";
    }

    const notificationDate = new Date(date);

    if (
      Number.isNaN(
        notificationDate.getTime()
      )
    ) {
      return "";
    }

    const diff =
      Date.now() -
      notificationDate.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return "الآن";
    }

    if (minutes < 60) {
      return `منذ ${minutes} دقيقة`;
    }

    if (hours < 24) {
      return `منذ ${hours} ساعة`;
    }

    if (days < 7) {
      return `منذ ${days} يوم`;
    }

    return notificationDate.toLocaleDateString(
      "ar-SA"
    );
  };

  // =====================================================
  // ICON
  // =====================================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "leave-new":
        return "🏖️";

      case "task-completed":
        return "✓";

      default:
        return "🔔";
    }
  };

  // =====================================================
  // CLASS
  // =====================================================

  const getNotificationClass = (type) => {
    switch (type) {
      case "task-completed":
        return "success";

      case "leave-new":
        return "info";

      default:
        return "info";
    }
  };

  // =====================================================
  // CLICK NOTIFICATION
  // =====================================================

  const handleNotificationClick = (
    notification
  ) => {
    markNotificationAsRead(
      notification.id
    );

    setShowNotifications(false);

    if (
      notification.type === "leave-new"
    ) {
      nav("/leaves-list");
      return;
    }

    if (
      notification.type ===
      "task-completed"
    ) {
      nav("/tasks");
    }
  };

  // =====================================================
  // STAT CARDS
  // =====================================================

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

  // =====================================================
  // RETURN
  // =====================================================

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

          <h1>لوحة التحكم</h1>

          <p>
            أهلاً بك 👋 إليك نظرة شاملة على نظام إدارة الموظفين
          </p>

        </div>

        <div className="header-actions">

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <div
            className="notification-wrapper"
            ref={notificationsRef}
          >

            <button
              className={`notification-button ${
                unreadNotifications > 0
                  ? "has-notifications"
                  : ""
              }`}
              type="button"
              onClick={() =>
                setShowNotifications(
                  (prev) => !prev
                )
              }
              title="الإشعارات"
            >

              <span className="notification-icon">
                🔔
              </span>

              {unreadNotifications > 0 && (
                <span className="notification-badge">
                  {unreadNotifications > 99
                    ? "99+"
                    : unreadNotifications}
                </span>
              )}

            </button>

            {showNotifications && (

              <div className="admin-notifications-panel">

                {/* HEADER */}

                <div className="admin-notifications-header">

                  <div className="notifications-title-area">

                    <div className="notifications-title-icon">
                      🔔
                    </div>

                    <div>
                      <h3>الإشعارات</h3>

                      <span>
                        {unreadNotifications > 0
                          ? `${unreadNotifications} إشعار غير مقروء`
                          : notifications.length > 0
                          ? "جميع الإشعارات مقروءة"
                          : "لا توجد إشعارات جديدة"}
                      </span>
                    </div>

                  </div>

                  <div className="admin-notifications-actions">

                    {unreadNotifications > 0 && (
                      <button
                        type="button"
                        onClick={
                          markAllNotificationsAsRead
                        }
                        title="تحديد الكل كمقروء"
                        className="notification-action-button"
                      >
                        ✓✓
                      </button>
                    )}

                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={
                          clearAllNotifications
                        }
                        title="حذف جميع الإشعارات"
                        className="notification-action-button danger"
                      >
                        🗑
                      </button>
                    )}

                  </div>

                </div>

                {/* DIVIDER */}

                <div className="notifications-header-line"></div>

                {/* LIST */}

                <div className="admin-notifications-list">

                  {notifications.length === 0 ? (

                    <div className="admin-notifications-empty">

                      <div className="empty-notification-icon">
                        <span>🔔</span>
                      </div>

                      <strong>
                        لا توجد إشعارات
                      </strong>

                      <span>
                        ستظهر هنا طلبات الإجازات وإنجازات المهام
                      </span>

                    </div>

                  ) : (

                    notifications.map(
                      (notification) => (

                        <div
                          key={notification.id}
                          className={`admin-notification-item ${
                            notification.read
                              ? "read"
                              : "unread"
                          }`}
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                        >

                          {/* ICON */}

                          <div
                            className={`admin-notification-icon ${getNotificationClass(
                              notification.type
                            )}`}
                          >
                            {getNotificationIcon(
                              notification.type
                            )}
                          </div>

                          {/* CONTENT */}

                          <div className="admin-notification-content">

                            <div className="notification-content-top">

                              <strong>
                                {notification.title}
                              </strong>

                              {!notification.read && (
                                <span className="unread-dot"></span>
                              )}

                            </div>

                            <p>
                              {notification.message}
                            </p>

                            <div className="notification-time">
                              <span>◷</span>

                              {formatNotificationTime(
                                notification.createdAt
                              )}
                            </div>

                          </div>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="admin-notification-delete"
                            onClick={(event) => {
                              event.stopPropagation();

                              deleteNotification(
                                notification.id
                              );
                            }}
                            title="حذف الإشعار"
                          >
                            ×
                          </button>

                        </div>

                      )
                    )

                  )}

                </div>

                {/* FOOTER */}

                {notifications.length > 0 && (
                  <div className="notifications-footer">
                    <span>
                      يتم تحديث الإشعارات تلقائياً
                    </span>

                    <span className="footer-live-dot">
                      ●
                    </span>
                  </div>
                )}

              </div>

            )}

          </div>

          <div className="header-divider"></div>

          <div className="admin-profile">

            <div className="avatar">
              A
            </div>

            <div className="profile-info">
              <strong>Admin</strong>
              <span>مدير النظام</span>
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
                  {loading
                    ? "..."
                    : stats.employees}
                </strong>
              </div>

            </div>

            <div className="floating-card floating-card-two">

              <span>✓</span>

              <div>
                <small>المهام</small>

                <strong>
                  {loading
                    ? "..."
                    : stats.tasks}
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
                <h2>نظرة عامة</h2>

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
                    {loading
                      ? "..."
                      : card.value}
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

          {/* LEAVES */}

          <section className="dashboard-card">

            <div className="card-header">

              <div className="card-heading">

                <div className="card-icon leaves-icon">
                  🏖️
                </div>

                <div>
                  <h2>آخر الإجازات</h2>

                  <span>
                    أحدث طلبات الإجازات
                  </span>
                </div>

              </div>

              <button
                className="view-all-button"
                onClick={() =>
                  nav("/leaves-list")
                }
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

                leaves.map(
                  (leave, index) => {

                    const status =
                      normalizeStatus(
                        leave.status
                      );

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
                              leave.from_date ||
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
                  }
                )

              )}

            </div>

          </section>

          {/* EVALUATIONS */}

          <section className="dashboard-card">

            <div className="card-header">

              <div className="card-heading">

                <div className="card-icon evaluations-icon">
                  📊
                </div>

                <div>
                  <h2>آخر التقييمات</h2>

                  <span>
                    أحدث تقييمات الموظفين
                  </span>
                </div>

              </div>

              <button
                className="view-all-button"
                onClick={() =>
                  nav("/history")
                }
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
                          📅{" "}
                          {evaluation.date ||
                            evaluation.createdAt ||
                            evaluation.created_at ||
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
                            evaluation.percentage ||
                            "-"}
                        </strong>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </section>

          {/* TASKS */}

          <section className="dashboard-card">

            <div className="card-header">

              <div className="card-heading">

                <div className="card-icon tasks-icon">
                  📝
                </div>

                <div>
                  <h2>المهام المعلقة</h2>

                  <span>
                    المهام التي تحتاج متابعة
                  </span>
                </div>

              </div>

              <button
                className="view-all-button"
                onClick={() =>
                  nav("/tasks")
                }
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

                tasks.map(
                  (task, index) => (

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

                  )
                )

              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}
