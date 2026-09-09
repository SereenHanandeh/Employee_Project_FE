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
FaChevronDown,
FaChevronUp,
FaListUl,
FaCheck,
FaCircle,
FaPercentage,
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

const initializedTaskNotificationsRef = useRef(false);
const initializedLeaveNotificationsRef = useRef(false);

// =====================================================
// STAGES MODAL
// =====================================================

const [selectedTask, setSelectedTask] = useState(null);
const [showStagesModal, setShowStagesModal] = useState(false);
const [updatingStageId, setUpdatingStageId] = useState(null);

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
// CLOSE NOTIFICATION DROPDOWN
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
const loadDashboard = async () => {
await fetchEmployee();
await fetchLeaves();
await fetchTasks();
};


loadDashboard();


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

  return [newNotification, ...prev].slice(0, 50);
});


};

// =====================================================
// NORMALIZE STATUS
// =====================================================

const normalizeStatus = (status) => {
return String(status || "")
.trim()
.toLowerCase();
};

// =====================================================
// CHECK TASK COMPLETED
// =====================================================

const isTaskCompletedStatus = (status) => {
const normalized = normalizeStatus(status);


return (
  normalized === "completed" ||
  normalized === "complete" ||
  normalized === "done" ||
  normalized === "finished" ||
  normalized === "منجز" ||
  normalized === "مكتمل"
);

};

// =====================================================
// CHECK LEAVE STATUS
// =====================================================

const normalizeLeaveStatus = (status) => {
const normalized = normalizeStatus(status);


if (
  normalized === "approved" ||
  normalized === "accept" ||
  normalized === "accepted" ||
  normalized === "مقبولة" ||
  normalized === "موافق"
) {
  return "approved";
}

if (
  normalized === "rejected" ||
  normalized === "reject" ||
  normalized === "مرفوضة" ||
  normalized === "مرفوض"
) {
  return "rejected";
}

return "pending";

};

// =====================================================
// TASK NOTIFICATION BY CURRENT STATUS
// =====================================================

const addCurrentTaskNotification = (task) => {
if (!task?.employee_task_id) {
return;
}


const taskId = task.employee_task_id;
const taskTitle = task.title || "مهمة";

if (isTaskCompletedStatus(task.status)) {
  addNotification({
    id: `task-completed-${taskId}`,
    type: "task-completed",
    title: "تم إنجاز المهمة",
    message: `تم إكمال جميع مراحل المهمة "${taskTitle}".`,
    referenceId: taskId,
  });
} else {
  addNotification({
    id: `task-new-${taskId}`,
    type: "task-new",
    title: "مهمة موكلة إليك",
    message: `لديك مهمة موكلة إليك: ${taskTitle}`,
    referenceId: taskId,
  });
}

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

  const isFirstCheck =
    !initializedTaskNotificationsRef.current;

  newTasks.forEach((task) => {
    if (!task?.employee_task_id) {
      return;
    }

    const taskId = String(task.employee_task_id);

    const currentCompleted = isTaskCompletedStatus(
      task.status
    );

    currentState[taskId] = {
      taskId: task.employee_task_id,
      taskTitle: task.title,
      status: task.status,
      selectedAt: task.selected_at || null,
    };

    // =================================================
    // أول تحميل
    // نعرض إشعارًا للمهمات الموجودة حاليًا
    // =================================================

    if (isFirstCheck) {
      addCurrentTaskNotification(task);
      return;
    }

    // =================================================
    // مهمة جديدة
    // =================================================

    if (!previousTasks[taskId]) {
      addCurrentTaskNotification(task);
      return;
    }

    const previousCompleted =
      isTaskCompletedStatus(
        previousTasks[taskId].status
      );

    // =================================================
    // المهمة أصبحت مكتملة
    // =================================================

    if (!previousCompleted && currentCompleted) {
      addNotification({
        id: `task-completed-${taskId}`,
        type: "task-completed",
        title: "تم إنجاز المهمة",
        message: `تم إكمال جميع مراحل المهمة "${task.title}".`,
        referenceId: task.employee_task_id,
      });
    }

    // =================================================
    // المهمة أعيد فتحها
    // =================================================

    if (previousCompleted && !currentCompleted) {
      addNotification({
        id: `task-reopened-${taskId}`,
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

  initializedTaskNotificationsRef.current = true;
} catch (error) {
  console.error(
    "Task Notification Error:",
    error
  );
}


};

// =====================================================
// LEAVE NOTIFICATION BY CURRENT STATUS
// =====================================================

const addCurrentLeaveNotification = (leave) => {
if (!leave?.leave_id) {
return;
}

const leaveId = leave.leave_id;
const leaveType = leave.type || "إجازة";

const status = normalizeLeaveStatus(
  leave.status
);

if (status === "approved") {
  addNotification({
    id: `leave-approved-${leaveId}`,
    type: "leave-approved",
    title: "تمت الموافقة على الإجازة",
    message: `تمت الموافقة على طلب إجازتك (${leaveType}).`,
    referenceId: leaveId,
  });

  return;
}

if (status === "rejected") {
  addNotification({
    id: `leave-rejected-${leaveId}`,
    type: "leave-rejected",
    title: "تم رفض الإجازة",
    message: `تم رفض طلب إجازتك (${leaveType}).`,
    referenceId: leaveId,
  });

  return;
}

addNotification({
  id: `leave-new-${leaveId}`,
  type: "leave-new",
  title: "طلب إجازة قيد المراجعة",
  message: `طلب إجازتك من نوع "${leaveType}" قيد المراجعة.`,
  referenceId: leaveId,
});


};

// =====================================================
// LEAVE NOTIFICATIONS
// =====================================================

const checkLeaveNotifications = (newLeaves) => {
try {
const storageKey =
"employeeLeavesNotificationState";


  const savedState = localStorage.getItem(
    storageKey
  );

  const previousLeaves = savedState
    ? JSON.parse(savedState)
    : {};

  const currentState = {};

  const isFirstCheck =
    !initializedLeaveNotificationsRef.current;

  newLeaves.forEach((leave) => {
    if (!leave?.leave_id) {
      return;
    }

    const leaveId = String(leave.leave_id);

    const currentStatus =
      normalizeLeaveStatus(leave.status);

    currentState[leaveId] = {
      leaveId: leave.leave_id,
      type: leave.type,
      status: leave.status,
    };

    // =================================================
    // أول تحميل
    // نعرض إشعار الحالة الحالية للإجازة
    // =================================================

    if (isFirstCheck) {
      addCurrentLeaveNotification(leave);
      return;
    }

    // =================================================
    // طلب إجازة جديد
    // =================================================

    if (!previousLeaves[leaveId]) {
      addCurrentLeaveNotification(leave);
      return;
    }

    const previousStatus =
      normalizeLeaveStatus(
        previousLeaves[leaveId].status
      );

    // =================================================
    // تمت الموافقة
    // =================================================

    if (
      previousStatus !== "approved" &&
      currentStatus === "approved"
    ) {
      addNotification({
        id: `leave-approved-${leaveId}`,
        type: "leave-approved",
        title: "تمت الموافقة على الإجازة",
        message: `تمت الموافقة على طلب إجازتك (${leave.type || "إجازة"}).`,
        referenceId: leave.leave_id,
      });
    }

    // =================================================
    // تم الرفض
    // =================================================

    if (
      previousStatus !== "rejected" &&
      currentStatus === "rejected"
    ) {
      addNotification({
        id: `leave-rejected-${leaveId}`,
        type: "leave-rejected",
        title: "تم رفض الإجازة",
        message: `تم رفض طلب إجازتك (${leave.type || "إجازة"}).`,
        referenceId: leave.leave_id,
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
    "Leave Notification Error:",
    error
  );
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

  // =================================================
  // تحديث المهمة المفتوحة داخل Popup
  // =================================================

  setSelectedTask((currentSelectedTask) => {
    if (!currentSelectedTask) {
      return null;
    }

    const updatedTask = newTasks.find(
      (task) =>
        task.employee_task_id ===
        currentSelectedTask.employee_task_id
    );

    return updatedTask || currentSelectedTask;
  });

  // =================================================
  // فحص الإشعارات
  // =================================================

  checkTaskNotifications(newTasks);

  // =================================================
  // نعيد البيانات حتى تستخدمها toggleStage
  // =================================================

  return newTasks;
} catch (err) {
  console.error("Tasks Error:", err);

  setTasks([]);

  return [];
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
if (!date) {
return "";
}

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

if (notification.type.startsWith("leave-")) {
  nav("/leave");
  return;
}

if (notification.type.startsWith("task-")) {
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
if (!date) {
return "-";
}


const parsedDate = new Date(date);

if (Number.isNaN(parsedDate.getTime())) {
  return "-";
}

return parsedDate.toLocaleDateString("ar-SA", {
  year: "numeric",
  month: "long",
  day: "numeric",
});


};

// =====================================================
// LEAVE STATUS
// =====================================================

const getStatus = (status) => {
const normalized = normalizeLeaveStatus(status);


switch (normalized) {
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
if (isTaskCompletedStatus(status)) {
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
// GET TASK STAGES
// =====================================================

const getTaskStages = (task) => {
if (!Array.isArray(task?.stages)) {
return [];
}


return [...task.stages].sort(
  (a, b) =>
    Number(a.stage_order || 0) -
    Number(b.stage_order || 0)
);


};

// =====================================================
// GET COMPLETED STAGES
// =====================================================

const getCompletedStages = (task) => {
const stages = getTaskStages(task);

return stages.filter(
  (stage) =>
    stage.completed === true ||
    stage.completed === 1 ||
    stage.completed === "1"
).length;


};

// =====================================================
// GET TOTAL STAGES
// =====================================================

const getTotalStages = (task) => {
return getTaskStages(task).length;
};

// =====================================================
// GET PROGRESS
// =====================================================

const getTaskProgress = (task) => {
const total = getTotalStages(task);


if (total === 0) {
  return 0;
}

const completed = getCompletedStages(task);

return Math.round((completed / total) * 100);


};

// =====================================================
// OPEN TASK STAGES
// =====================================================

const openTaskStages = (task) => {
setSelectedTask(task);
setShowStagesModal(true);
};

// =====================================================
// CLOSE TASK STAGES
// =====================================================

const closeTaskStages = () => {
if (updatingStageId) {
return;
}


setShowStagesModal(false);
setSelectedTask(null);


};

// =====================================================
// CHECK STAGE COMPLETED
// =====================================================

const isStageCompleted = (stage) => {
return (
stage.completed === true ||
stage.completed === 1 ||
stage.completed === "1"
);
};

// =====================================================
// COMPLETE / REOPEN STAGE
// =====================================================

const toggleStage = async (stage) => {
if (!selectedTask || !stage?.stage_id) {
return;
}


const stageId = stage.stage_id;

try {
  setUpdatingStageId(stageId);

  const wasCompleted =
    isStageCompleted(stage);

  const endpoint = wasCompleted
    ? `/tasks/stage/${stageId}/reopen`
    : `/tasks/stage/${stageId}/complete`;

  const response = await API.put(endpoint);

  // =================================================
  // البيانات القادمة من Backend
  // =================================================

  const updatedStagesFromResponse =
    response?.data?.stages;

  // =================================================
  // تحديث tasks محليًا
  // =================================================

  setTasks((prevTasks) =>
    prevTasks.map((task) => {
      if (
        task.employee_task_id !==
        selectedTask.employee_task_id
      ) {
        return task;
      }

      let updatedStages;

      if (
        Array.isArray(
          updatedStagesFromResponse
        )
      ) {
        updatedStages =
          updatedStagesFromResponse;
      } else {
        updatedStages = getTaskStages(
          task
        ).map((currentStage) =>
          currentStage.stage_id === stageId
            ? {
                ...currentStage,
                completed:
                  !wasCompleted,
                completed_at:
                  wasCompleted
                    ? null
                    : new Date().toISOString(),
              }
            : currentStage
        );
      }

      const completedCount =
        updatedStages.filter((item) =>
          isStageCompleted(item)
        ).length;

      const totalCount =
        updatedStages.length;

      const allCompleted =
        totalCount > 0 &&
        completedCount === totalCount;

      return {
        ...task,
        stages: updatedStages,
        completed_stages:
          completedCount,
        total_stages:
          totalCount,
        progress_percentage:
          totalCount > 0
            ? Math.round(
                (completedCount /
                  totalCount) *
                  100
              )
            : 0,
        status: allCompleted
          ? "completed"
          : "pending",
      };
    })
  );

  // =================================================
  // تحديث المهمة داخل Popup
  // =================================================

  setSelectedTask((currentTask) => {
    if (!currentTask) {
      return null;
    }

    let updatedStages;

    if (
      Array.isArray(
        updatedStagesFromResponse
      )
    ) {
      updatedStages =
        updatedStagesFromResponse;
    } else {
      updatedStages = getTaskStages(
        currentTask
      ).map((currentStage) =>
        currentStage.stage_id === stageId
          ? {
              ...currentStage,
              completed:
                !wasCompleted,
              completed_at:
                wasCompleted
                  ? null
                  : new Date().toISOString(),
            }
          : currentStage
      );
    }

    const completedCount =
      updatedStages.filter((item) =>
        isStageCompleted(item)
      ).length;

    const totalCount =
      updatedStages.length;

    const allCompleted =
      totalCount > 0 &&
      completedCount === totalCount;

    return {
      ...currentTask,
      stages: updatedStages,
      completed_stages:
        completedCount,
      total_stages:
        totalCount,
      progress_percentage:
        totalCount > 0
          ? Math.round(
              (completedCount /
                totalCount) *
                100
            )
          : 0,
      status: allCompleted
        ? "completed"
        : "pending",
    };
  });

  // =================================================
  // إعادة جلب المهام من Backend
  // =================================================

  const refreshedTasks =
    await fetchTasks();

  // =================================================
  // نستخدم البيانات الجديدة بدل tasks القديمة
  // =================================================

  const updatedTask =
    refreshedTasks.find(
      (task) =>
        task.employee_task_id ===
        selectedTask.employee_task_id
    ) || selectedTask;

  const totalStages =
    getTotalStages(updatedTask);

  const completedStages =
    getCompletedStages(updatedTask);

  const allCompleted =
    totalStages > 0 &&
    completedStages === totalStages;

  // =================================================
  // رسالة إكمال المهمة
  // =================================================

  if (
    !wasCompleted &&
    allCompleted
  ) {
    setMessageModal({
      open: true,
      type: "success",
      title: "تم إنجاز المهمة 🎉",
      message:
        "ممتاز! تم إكمال جميع مراحل المهمة بنجاح، وأصبحت المهمة مكتملة.",
    });
  } else if (wasCompleted) {
    setMessageModal({
      open: true,
      type: "success",
      title: "تمت إعادة فتح المرحلة",
      message:
        "تمت إعادة المرحلة إلى حالة قيد التنفيذ، ولذلك أصبحت المهمة قيد التنفيذ.",
    });
  } else {
    setMessageModal({
      open: true,
      type: "success",
      title: "تم إكمال المرحلة",
      message:
        "تم تسجيل المرحلة كمكتملة بنجاح.",
    });
  }
} catch (err) {
  console.error(
    "Toggle Stage Error:",
    err
  );

  setMessageModal({
    open: true,
    type: "error",
    title: "تعذر تحديث المرحلة",
    message:
      err?.response?.data?.message ||
      "حدث خطأ أثناء تحديث حالة المرحلة. حاول مرة أخرى.",
  });
} finally {
  setUpdatingStageId(null);
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
(task) =>
isTaskCompletedStatus(task.status)
).length;

const pendingTasks = tasks.filter(
(task) =>
!isTaskCompletedStatus(task.status)
).length;

// =====================================================
// RENDER
// =====================================================

return ( <div
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
                    {unreadNotifications >
                    0
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
                    ستظهر هنا التنبيهات
                    الجديدة الخاصة بك.
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
            اضغط على المهمة لعرض مراحلها وإنجازها
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
            لم يتم تعيين أي مهام لك من قبل
            المسؤول.
          </p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => {
            const isCompleted =
              isTaskCompletedStatus(
                task.status
              );

            const taskStatus =
              getTaskStatus(
                task.status
              );

            const totalStages =
              getTotalStages(task);

            const completedStages =
              getCompletedStages(task);

            const progress =
              getTaskProgress(task);

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
                onClick={() =>
                  openTaskStages(task)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    e.preventDefault();

                    openTaskStages(task);
                  }
                }}
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
                    {formatDate(
                      task.due_date
                    )}
                  </strong>
                </div>

                {/* STAGES SUMMARY */}

                <div className="task-stages-summary">
                  <div className="task-stages-summary-top">
                    <div>
                      <FaListUl />

                      <span>
                        مراحل المهمة
                      </span>
                    </div>

                    <strong>
                      {completedStages} /{" "}
                      {totalStages}
                    </strong>
                  </div>

                  <div className="task-progress">
                    <div
                      className="task-progress-fill"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <div className="task-progress-info">
                    <span>
                      {totalStages === 0
                        ? "لا توجد مراحل"
                        : progress === 100
                        ? "اكتملت جميع المراحل"
                        : `${progress}% مكتمل`}
                    </span>

                    <FaChevronLeft />
                  </div>
                </div>

                {/* FOOTER */}

                <div className="task-footer">
                  <div className="task-open-stages">
                    <FaClipboardCheck />

                    <span>
                      {isCompleted
                        ? "عرض المراحل المكتملة"
                        : "اضغط لعرض المراحل"}
                    </span>

                    <FaChevronLeft />
                  </div>
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
            }
          )}
        </div>
      )}
    </section>
  </main>

  {/* =====================================================
      TASK STAGES MODAL
  ===================================================== */}

  {showStagesModal &&
    selectedTask && (
      <div
        className="task-stages-modal-overlay"
        onClick={closeTaskStages}
      >
        <div
          className="task-stages-modal"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          {/* MODAL HEADER */}

          <div className="task-stages-modal-header">
            <div className="task-stages-modal-title">
              <div className="task-stages-modal-icon">
                {isTaskCompletedStatus(
                  selectedTask.status
                ) ? (
                  <FaCheckCircle />
                ) : (
                  <FaTasks />
                )}
              </div>

              <div>
                <span>
                  تفاصيل المهمة
                </span>

                <h2>
                  {selectedTask.title}
                </h2>
              </div>
            </div>

            <button
              type="button"
              className="task-stages-close"
              onClick={closeTaskStages}
              disabled={
                !!updatingStageId
              }
            >
              <FaTimes />
            </button>
          </div>

          {/* TASK DESCRIPTION */}

          {selectedTask.description && (
            <div className="task-stages-description">
              <span>
                وصف المهمة
              </span>

              <p>
                {
                  selectedTask.description
                }
              </p>
            </div>
          )}

          {/* PROGRESS */}

          <div className="task-stages-progress-box">
            <div className="task-stages-progress-header">
              <div>
                <FaPercentage />

                <span>
                  نسبة إنجاز المهمة
                </span>
              </div>

              <strong>
                {getTaskProgress(
                  selectedTask
                )}
                %
              </strong>
            </div>

            <div className="task-stages-progress-bar">
              <div
                className="task-stages-progress-fill"
                style={{
                  width: `${getTaskProgress(
                    selectedTask
                  )}%`,
                }}
              />
            </div>

            <div className="task-stages-progress-footer">
              <span>
                <FaCheckCircle />

                {getCompletedStages(
                  selectedTask
                )}{" "}
                من{" "}
                {getTotalStages(
                  selectedTask
                )} مراحل مكتملة
              </span>

              {selectedTask.due_date && (
                <span>
                  <FaCalendarAlt />

                  الاستحقاق:{" "}
                  {formatDate(
                    selectedTask.due_date
                  )}
                </span>
              )}
            </div>
          </div>

          {/* STAGES */}

          <div className="task-stages-list">
            <div className="task-stages-list-header">
              <div>
                <FaListUl />

                <h3>
                  مراحل المهمة
                </h3>
              </div>

              <span>
                {getTotalStages(
                  selectedTask
                )}{" "}
                مراحل
              </span>
            </div>

            {getTotalStages(
              selectedTask
            ) === 0 ? (
              <div className="no-stages">
                <FaExclamationTriangle />

                <h4>
                  لا توجد مراحل لهذه المهمة
                </h4>

                <p>
                  لم يتم إضافة مراحل لهذه
                  المهمة من المسؤول.
                </p>
              </div>
            ) : (
              getTaskStages(
                selectedTask
              ).map(
                (stage, index) => {
                  const completed =
                    isStageCompleted(
                      stage
                    );

                  const isUpdating =
                    updatingStageId ===
                    stage.stage_id;

                  return (
                    <div
                      key={
                        stage.stage_id
                      }
                      className={`task-stage-item ${
                        completed
                          ? "stage-completed"
                          : ""
                      }`}
                    >
                      {/* STAGE NUMBER / CHECK */}

                      <button
                        type="button"
                        className={`stage-checkbox ${
                          completed
                            ? "checked"
                            : ""
                        }`}
                        onClick={() =>
                          toggleStage(
                            stage
                          )
                        }
                        disabled={
                          !!updatingStageId
                        }
                        aria-label={
                          completed
                            ? "إعادة فتح المرحلة"
                            : "إكمال المرحلة"
                        }
                      >
                        {isUpdating ? (
                          <span className="stage-loading">
                            ...
                          </span>
                        ) : completed ? (
                          <FaCheck />
                        ) : (
                          <span>
                            {index + 1}
                          </span>
                        )}
                      </button>

                      {/* STAGE CONTENT */}

                      <div className="stage-content">
                        <div className="stage-title-row">
                          <h4>
                            {
                              stage.title
                            }
                          </h4>

                          {completed ? (
                            <span className="stage-status completed">
                              <FaCheckCircle />
                              مكتملة
                            </span>
                          ) : (
                            <span className="stage-status pending">
                              <FaCircle />
                              قيد التنفيذ
                            </span>
                          )}
                        </div>

                        {stage.description && (
                          <p>
                            {
                              stage.description
                            }
                          </p>
                        )}

                        <div className="stage-meta">
                          {stage.due_date && (
                            <span>
                              <FaCalendarAlt />

                              استحقاق المرحلة:{" "}
                              {formatDate(
                                stage.due_date
                              )}
                            </span>
                          )}

                          {stage.completed_at && (
                            <span>
                              <FaCheckCircle />

                              تم الإكمال:{" "}
                              {formatDate(
                                stage.completed_at
                              )}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className={`stage-action ${
                            completed
                              ? "reopen"
                              : "complete"
                          }`}
                          onClick={() =>
                            toggleStage(
                              stage
                            )
                          }
                          disabled={
                            !!updatingStageId
                          }
                        >
                          {isUpdating ? (
                            "جاري الحفظ..."
                          ) : completed ? (
                            <>
                              <FaUndo />
                              إعادة فتح المرحلة
                            </>
                          ) : (
                            <>
                              <FaCheckCircle />
                              تم إنجاز هذه المرحلة
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>

          {/* MODAL FOOTER */}

          <div className="task-stages-modal-footer">
            {getTaskProgress(
              selectedTask
            ) === 100 ? (
              <div className="all-stages-completed">
                <FaCheckCircle />

                <div>
                  <strong>
                    تم إكمال جميع المراحل 🎉
                  </strong>

                  <span>
                    المهمة مكتملة بالكامل.
                  </span>
                </div>
              </div>
            ) : (
              <div className="stages-required-message">
                <FaExclamationTriangle />

                <span>
                  يجب إكمال جميع المراحل حتى
                  تصبح المهمة مكتملة.
                </span>
              </div>
            )}

            <button
              type="button"
              className="task-stages-done-btn"
              onClick={
                closeTaskStages
              }
              disabled={
                !!updatingStageId
              }
            >
              إغلاق
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
