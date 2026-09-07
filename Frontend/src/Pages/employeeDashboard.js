import { useEffect, useRef, useState } from "react";
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
  FaBell,
  FaTrash,
  FaCheckDouble,
  FaTimes,
  FaCalendarCheck,
  FaClipboardCheck,
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

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationsRef = useRef(null);
  const initializedNotificationsRef = useRef(false);

  // =====================================================
  // TASK MODAL
  // =====================================================

  const [taskModal, setTaskModal] = useState({
    open: false,
    type: "confirm",
    taskId: null,
    title: "",
    message: "",
  });

  const [completingTaskId, setCompletingTaskId] = useState(null);

  // =====================================================
  // SUCCESS / ERROR MODAL
  // =====================================================

  const [messageModal, setMessageModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem(
        "employeeNotificationsList"
      );

      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);

        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        }
      }
    } catch (error) {
      console.error("Load Notifications Error:", error);
      setNotifications([]);
    }
  }, []);

  // =====================================================
  // SAVE NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "employeeNotificationsList",
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error("Save Notifications Error:", error);
    }
  }, [notifications]);

  // =====================================================
  // CLOSE NOTIFICATION DROPDOWN WHEN CLICKING OUTSIDE
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
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchEmployee();
    fetchLeaves();
    fetchTasks();
  }, []);

  // =====================================================
  // GET EMPLOYEE
  // =====================================================

  const fetchEmployee = async () => {
    try {
      setLoadingEmployee(true);

      const res = await API.get("/employees/me");

      setEmployee(res.data);
    } catch (err) {
      console.error("Employee Error:", err);

      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("rememberEmail");

        nav("/login");
      }
    } finally {
      setLoadingEmployee(false);
    }
  };

  // =====================================================
  // GET LEAVES
  // =====================================================

  const fetchLeaves = async () => {
    try {
      setLoadingLeaves(true);

      const res = await API.get("/leaves/my-leaves");

      const newLeaves = Array.isArray(res.data)
        ? res.data
        : [];

      setLeaves(newLeaves);

      checkLeaveNotifications(newLeaves);
    } catch (err) {
      console.error("Leaves Error:", err);
      setLeaves([]);
    } finally {
      setLoadingLeaves(false);
    }
  };

  // =====================================================
  // GET TASKS
  // =====================================================

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);

      const res = await API.get("/tasks");

      const newTasks = Array.isArray(res.data)
        ? res.data
        : [];

      setTasks(newTasks);

      checkTaskNotifications(newTasks);
    } catch (err) {
      console.error("Tasks Error:", err);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // =====================================================
  // POLLING
  // =====================================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTasks();
      fetchLeaves();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

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

      return [
        newNotification,
        ...prev,
      ].slice(0, 50);
    });
  };

  // =====================================================
  // TASK NOTIFICATIONS
  // =====================================================

  const checkTaskNotifications = (newTasks) => {
    try {
      const storageKey = "employeeTasksNotificationState";

      const savedState = localStorage.getItem(storageKey);

      const previousTasks = savedState
        ? JSON.parse(savedState)
        : {};

      const currentState = {};

      newTasks.forEach((task) => {
        const taskId = String(
          task.employee_task_id
        );

        currentState[taskId] = {
          taskId: task.employee_task_id,
          taskTitle: task.title,
          status: task.status,
          selectedAt: task.selected_at || null,
        };

        // ---------------------------------------------
        // أول تحميل
        // لا نريد إزعاج الموظف بإشعارات لكل المهام القديمة
        // ---------------------------------------------

        if (!initializedNotificationsRef.current) {
          return;
        }

        // ---------------------------------------------
        // NEW TASK
        // ---------------------------------------------

        if (!previousTasks[taskId]) {
          addNotification({
            id: `task-new-${task.employee_task_id}`,
            type: "task-new",
            title: "مهمة جديدة",
            message: `تم تعيين مهمة جديدة لك: ${task.title}`,
            referenceId: task.employee_task_id,
          });

          return;
        }

        // ---------------------------------------------
        // TASK COMPLETED
        // ---------------------------------------------

        if (
          previousTasks[taskId].status !== "completed" &&
          task.status === "completed"
        ) {
          addNotification({
            id: `task-completed-${task.employee_task_id}-${Date.now()}`,
            type: "task-completed",
            title: "تم إنجاز المهمة",
            message: `تم تسجيل المهمة "${task.title}" كمهمة منجزة.`,
            referenceId: task.employee_task_id,
          });
        }

        // ---------------------------------------------
        // TASK REOPENED
        // ---------------------------------------------

        if (
          previousTasks[taskId].status === "completed" &&
          task.status !== "completed"
        ) {
          addNotification({
            id: `task-reopened-${task.employee_task_id}-${Date.now()}`,
            type: "task-reopened",
            title: "تم إعادة فتح المهمة",
            message: `تمت إعادة المهمة "${task.title}" إلى حالة قيد التنفيذ.`,
            referenceId: task.employee_task_id,
          });
        }
      });

      localStorage.setItem(
        storageKey,
        JSON.stringify(currentState)
      );

      initializedNotificationsRef.current = true;
    } catch (error) {
      console.error(
        "Task Notification Error:",
        error
      );
    }
  };

  // =====================================================
  // LEAVE NOTIFICATIONS
  // =====================================================

  const checkLeaveNotifications = (newLeaves) => {
    try {
      const storageKey = "employeeLeavesNotificationState";

      const savedState = localStorage.getItem(storageKey);

      const previousLeaves = savedState
        ? JSON.parse(savedState)
        : {};

      const currentState = {};

      newLeaves.forEach((leave) => {
        const leaveId = String(leave.leave_id);

        currentState[leaveId] = {
          leaveId: leave.leave_id,
          type: leave.type,
          status: leave.status,
        };

        // ---------------------------------------------
        // أول تحميل
        // ---------------------------------------------

        if (!initializedNotificationsRef.current) {
          return;
        }

        // ---------------------------------------------
        // NEW LEAVE
        // ---------------------------------------------

        if (!previousLeaves[leaveId]) {
          addNotification({
            id: `leave-new-${leave.leave_id}`,
            type: "leave-new",
            title: "طلب إجازة جديد",
            message: `تم تسجيل طلب إجازة من نوع "${leave.type}".`,
            referenceId: leave.leave_id,
          });

          return;
        }

        // ---------------------------------------------
        // APPROVED
        // ---------------------------------------------

        if (
          previousLeaves[leaveId].status !== "approved" &&
          leave.status === "approved"
        ) {
          addNotification({
            id: `leave-approved-${leave.leave_id}-${Date.now()}`,
            type: "leave-approved",
            title: "تمت الموافقة على الإجازة",
            message: `تمت الموافقة على طلب إجازتك (${leave.type}).`,
            referenceId: leave.leave_id,
          });
        }

        // ---------------------------------------------
        // REJECTED
        // ---------------------------------------------

        if (
          previousLeaves[leaveId].status !== "rejected" &&
          leave.status === "rejected"
        ) {
          addNotification({
            id: `leave-rejected-${leave.leave_id}-${Date.now()}`,
            type: "leave-rejected",
            title: "تم رفض الإجازة",
            message: `تم رفض طلب إجازتك (${leave.type}).`,
            referenceId: leave.leave_id,
          });
        }
      });

      localStorage.setItem(
        storageKey,
        JSON.stringify(currentState)
      );
    } catch (error) {
      console.error(
        "Leave Notification Error:",
        error
      );
    }
  };

  // =====================================================
  // UNREAD COUNT
  // =====================================================

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  ).length;

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markNotificationAsRead = (notificationId) => {
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
  // CLEAR ALL NOTIFICATIONS
  // =====================================================

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // =====================================================
  // NOTIFICATION TIME
  // =====================================================

  const formatNotificationTime = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    const diff =
      Date.now() - notificationDate.getTime();

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
  // NOTIFICATION ICON
  // =====================================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task-new":
        return <FaClipboardList />;

      case "task-completed":
        return <FaCheckCircle />;

      case "task-reopened":
        return <FaUndo />;

      case "leave-approved":
        return <FaCalendarCheck />;

      case "leave-rejected":
        return <FaTimesCircle />;

      case "leave-new":
        return <FaCalendarAlt />;

      default:
        return <FaBell />;
    }
  };

  // =====================================================
  // NOTIFICATION CLASS
  // =====================================================

  const getNotificationClass = (type) => {
    switch (type) {
      case "task-completed":
      case "leave-approved":
        return "success";

      case "task-reopened":
        return "warning";

      case "leave-rejected":
        return "danger";

      case "task-new":
      case "leave-new":
      default:
        return "info";
    }
  };

  // =====================================================
  // OPEN NOTIFICATION
  // =====================================================

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);

    setShowNotifications(false);

    if (
      notification.type.startsWith("leave-")
    ) {
      nav("/leave");
      return;
    }

    if (
      notification.type.startsWith("task-")
    ) {
      nav("/employee");
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rememberEmail");

    nav("/login");
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "ar-SA",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  // =====================================================
  // LEAVE STATUS
  // =====================================================

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

  // =====================================================
  // TASK STATUS
  // =====================================================

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

  // =====================================================
  // OPEN COMPLETE MODAL
  // =====================================================

  const openCompleteTaskModal = (taskId) => {
    const selectedTask = tasks.find(
      (task) =>
        task.employee_task_id === taskId
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

  // =====================================================
  // OPEN REOPEN MODAL
  // =====================================================

  const openReopenTaskModal = (taskId) => {
    const selectedTask = tasks.find(
      (task) =>
        task.employee_task_id === taskId
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

  // =====================================================
  // CLOSE TASK MODAL
  // =====================================================

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

  // =====================================================
  // COMPLETE TASK
  // =====================================================

  const completeTask = async () => {
    const taskId = taskModal.taskId;

    if (!taskId) return;

    const selectedTask = tasks.find(
      (task) =>
        task.employee_task_id === taskId
    );

    try {
      setCompletingTaskId(taskId);

      await API.put(
        `/tasks/${taskId}/complete`
      );

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

      // تحديث الحالة المخزنة حتى لا يتكرر الإشعار
      try {
        const storageKey =
          "employeeTasksNotificationState";

        const saved =
          localStorage.getItem(storageKey);

        const state = saved
          ? JSON.parse(saved)
          : {};

        if (state[String(taskId)]) {
          state[String(taskId)].status =
            "completed";

          localStorage.setItem(
            storageKey,
            JSON.stringify(state)
          );
        }
      } catch (storageError) {
        console.error(
          "Task State Storage Error:",
          storageError
        );
      }

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
        message:
          "تم تسجيل المهمة كمهمة منجزة بنجاح.",
      });

      if (selectedTask) {
        addNotification({
          id: `manual-task-completed-${taskId}-${Date.now()}`,
          type: "task-completed",
          title: "تم إنجاز المهمة",
          message: `تم تسجيل المهمة "${selectedTask.title}" كمهمة منجزة.`,
          referenceId: taskId,
        });
      }
    } catch (err) {
      console.error(
        "Complete Task Error:",
        err
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

  // =====================================================
  // REOPEN TASK
  // =====================================================

  const reopenTask = async () => {
    const taskId = taskModal.taskId;

    if (!taskId) return;

    const selectedTask = tasks.find(
      (task) =>
        task.employee_task_id === taskId
    );

    try {
      setCompletingTaskId(taskId);

      await API.put(
        `/tasks/${taskId}/reopen`
      );

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

      // تحديث الحالة المخزنة
      try {
        const storageKey =
          "employeeTasksNotificationState";

        const saved =
          localStorage.getItem(storageKey);

        const state = saved
          ? JSON.parse(saved)
          : {};

        if (state[String(taskId)]) {
          state[String(taskId)].status =
            "pending";

          localStorage.setItem(
            storageKey,
            JSON.stringify(state)
          );
        }
      } catch (storageError) {
        console.error(
          "Task State Storage Error:",
          storageError
        );
      }

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
        message:
          "تمت إعادة المهمة إلى حالة قيد التنفيذ.",
      });

      if (selectedTask) {
        addNotification({
          id: `manual-task-reopened-${taskId}-${Date.now()}`,
          type: "task-reopened",
          title: "تم إعادة فتح المهمة",
          message: `تمت إعادة المهمة "${selectedTask.title}" إلى حالة قيد التنفيذ.`,
          referenceId: taskId,
        });
      }
    } catch (err) {
      console.error(
        "Reopen Task Error:",
        err
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

  // =====================================================
  // CLOSE MESSAGE MODAL
  // =====================================================

  const closeMessageModal = () => {
    setMessageModal({
      open: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  // =====================================================
  // TASK COUNTS
  // =====================================================

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status !== "completed"
  ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="employee-dashboard"
      dir="rtl"
    >
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
          <button
            className="sidebar-btn active"
            onClick={() =>
              nav("/employee")
            }
          >
            <FaClipboardList />
            <span>لوحة التحكم</span>
          </button>

          <button
            className="sidebar-btn"
            onClick={() =>
              nav("/leave")
            }
          >
            <FaCalendarAlt />
            <span>طلب إجازة</span>
          </button>

          <button
            className="sidebar-btn"
            onClick={() =>
              nav("/employee/settings")
            }
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
                : employee?.name ||
                  "الموظف"}
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
              {employee?.name ||
                "موظفنا العزيز"}{" "}
              👋
            </h1>

            <p>
              تابع مهامك وإجازاتك من مكان واحد.
            </p>
          </div>

          {/* HEADER ACTIONS */}

          <div className="header-actions">
            {/* NOTIFICATIONS */}

            <div
              className="notification-wrapper"
              ref={notificationsRef}
            >
              <button
                type="button"
                className={`notification-button ${
                  unreadNotifications > 0
                    ? "has-unread"
                    : ""
                }`}
                onClick={() =>
                  setShowNotifications(
                    (prev) => !prev
                  )
                }
                aria-label="الإشعارات"
              >
                <FaBell />

                {unreadNotifications > 0 && (
                  <span className="notification-badge">
                    {unreadNotifications > 99
                      ? "99+"
                      : unreadNotifications}
                  </span>
                )}
              </button>

              {/* NOTIFICATION PANEL */}

              {showNotifications && (
                <div className="notifications-panel">
                  <div className="notifications-header">
                    <div>
                      <h3>الإشعارات</h3>

                      <span>
                        {unreadNotifications > 0
                          ? `${unreadNotifications} غير مقروءة`
                          : "جميع الإشعارات مقروءة"}
                      </span>
                    </div>

                    <div className="notifications-header-actions">
                      {unreadNotifications >
                        0 && (
                        <button
                          type="button"
                          title="تحديد الكل كمقروء"
                          onClick={
                            markAllNotificationsAsRead
                          }
                        >
                          <FaCheckDouble />
                        </button>
                      )}

                      {notifications.length >
                        0 && (
                        <button
                          type="button"
                          title="حذف جميع الإشعارات"
                          onClick={
                            clearAllNotifications
                          }
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>

                  {notifications.length ===
                  0 ? (
                    <div className="notifications-empty">
                      <div className="notifications-empty-icon">
                        <FaBell />
                      </div>

                      <h4>
                        لا توجد إشعارات
                      </h4>

                      <p>
                        ستظهر هنا التنبيهات الجديدة
                        الخاصة بك.
                      </p>
                    </div>
                  ) : (
                    <div className="notifications-list">
                      {notifications.map(
                        (notification) => (
                          <div
                            key={
                              notification.id
                            }
                            className={`notification-item ${
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
                            <div
                              className={`notification-item-icon ${getNotificationClass(
                                notification.type
                              )}`}
                            >
                              {getNotificationIcon(
                                notification.type
                              )}
                            </div>

                            <div className="notification-content">
                              <div className="notification-title-row">
                                <strong>
                                  {
                                    notification.title
                                  }
                                </strong>

                                {!notification.read && (
                                  <span className="unread-dot" />
                                )}
                              </div>

                              <p>
                                {
                                  notification.message
                                }
                              </p>

                              <span className="notification-time">
                                {formatNotificationTime(
                                  notification.createdAt
                                )}
                              </span>
                            </div>

                            <button
                              type="button"
                              className="notification-delete"
                              title="حذف الإشعار"
                              onClick={(e) => {
                                e.stopPropagation();

                                deleteNotification(
                                  notification.id
                                );
                              }}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* LEAVE BUTTON */}

            <button
              className="header-leave-btn"
              onClick={() =>
                nav("/leave")
              }
            >
              <FaPlus />
              طلب إجازة
            </button>
          </div>
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
                {loadingTasks
                  ? "..."
                  : tasks.length}
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
                {loadingLeaves
                  ? "..."
                  : leaves.length}
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
                {loadingTasks
                  ? "..."
                  : completedTasks}
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
                {loadingTasks
                  ? "..."
                  : pendingTasks}
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
                  task.status ===
                  "completed";

                const taskStatus =
                  getTaskStatus(
                    task.status
                  );

                return (
                  <div
                    className={`task-card ${
                      isCompleted
                        ? "task-completed"
                        : ""
                    }`}
                    key={
                      task.employee_task_id
                    }
                  >
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

                    <h3>
                      {task.title}
                    </h3>

                    <p>
                      {task.description ||
                        "لا يوجد وصف لهذه المهمة."}
                    </p>

                    <div className="task-date">
                      <FaCalendarAlt />

                      <span>
                        تاريخ الاستحقاق:
                      </span>

                      <strong>
                        {formatDate(
                          task.due_date
                        )}
                      </strong>
                    </div>

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
              onClick={() =>
                nav("/leave")
              }
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
                onClick={() =>
                  nav("/leave")
                }
              >
                <FaPlus />
                تقديم طلب إجازة
              </button>
            </div>
          ) : (
            <div className="leaves-list">
              {leaves.map(
                (leave, index) => {
                  const status =
                    getStatus(
                      leave.status
                    );

                  return (
                    <div
                      className="leave-card"
                      key={
                        leave.leave_id ||
                        index
                      }
                    >
                      <div className="leave-icon">
                        <FaCalendarAlt />
                      </div>

                      <div className="leave-info">
                        <h3>
                          {leave.type ||
                            "إجازة"}
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

                          {leave.days ||
                            0}{" "}
                          أيام
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
                }
              )}
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
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              className={`task-confirm-icon ${
                taskModal.type ===
                "complete"
                  ? "success"
                  : "warning"
              }`}
            >
              {taskModal.type ===
              "complete" ? (
                <FaCheckCircle />
              ) : (
                <FaUndo />
              )}
            </div>

            <h3>
              {taskModal.title}
            </h3>

            <p>
              {taskModal.message}
            </p>

            <div className="task-confirm-actions">
              <button
                type="button"
                className="task-modal-cancel"
                onClick={closeTaskModal}
                disabled={
                  !!completingTaskId
                }
              >
                إلغاء
              </button>

              <button
                type="button"
                className={`task-modal-confirm ${
                  taskModal.type ===
                  "complete"
                    ? "complete"
                    : "reopen"
                }`}
                onClick={
                  taskModal.type ===
                  "complete"
                    ? completeTask
                    : reopenTask
                }
                disabled={
                  !!completingTaskId
                }
              >
                {completingTaskId ? (
                  "جاري الحفظ..."
                ) : taskModal.type ===
                  "complete" ? (
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
          onClick={
            closeMessageModal
          }
        >
          <div
            className="task-message-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              className={`task-message-icon ${messageModal.type}`}
            >
              {messageModal.type ===
              "success" ? (
                <FaCheckCircle />
              ) : (
                <FaExclamationTriangle />
              )}
            </div>

            <h3>
              {messageModal.title}
            </h3>

            <p>
              {messageModal.message}
            </p>

            <button
              type="button"
              className="task-message-button"
              onClick={
                closeMessageModal
              }
            >
              حسناً
            </button>
          </div>
        </div>
      )}
    </div>
  );
}