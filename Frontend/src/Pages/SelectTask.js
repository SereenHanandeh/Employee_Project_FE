import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/api";

import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaHourglassHalf,
  FaTimesCircle,
  FaListOl,
  FaTasks,
  FaTimes,
  FaUserFriends,
  FaPlus,
  FaTrash,
  FaUserCheck,
  FaLayerGroup,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

import "./SelectTask.css";

export default function SelectTask() {
  // =========================================================
  // STATES
  // =========================================================

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [activeStat, setActiveStat] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // =========================================================
  // ASSIGNMENT
  // =========================================================

  const [assigningTask, setAssigningTask] = useState(null);

  /*
    assignments structure:

    [
      {
        employee_id: 1,
        assignment_type: "task",
        stage_ids: []
      },
      {
        employee_id: 2,
        assignment_type: "stage",
        stage_ids: [10, 11]
      }
    ]
  */
  const [employeeAssignments, setEmployeeAssignments] = useState([]);

  const [employeeSearch, setEmployeeSearch] = useState("");

  const [expandedEmployee, setExpandedEmployee] = useState(null);

  // =========================================================
  // STAGE MODAL
  // =========================================================

  const [stageModal, setStageModal] = useState({
    open: false,
    task: null,
  });

  // =========================================================
  // MESSAGE MODAL
  // =========================================================

  const [messageModal, setMessageModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  // =========================================================
  // FORM
  // =========================================================

  const emptyStage = () => ({
    stage_id: null,
    title: "",
    description: "",
    due_date: "",
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
    stages: [emptyStage()],
  });

  // =========================================================
  // MESSAGE
  // =========================================================

  const showMessage = (type, title, message) => {
    setMessageModal({
      open: true,
      type,
      title,
      message,
    });
  };

  const closeMessage = () => {
    setMessageModal((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // =========================================================
  // EMPLOYEE HELPERS
  // =========================================================

  const getEmployeeId = useCallback((employee) => {
    if (!employee) return null;

    return employee.employee_id ?? employee.id ?? employee.user_id ?? null;
  }, []);

  const getEmployeeName = useCallback(
    (employeeId) => {
      if (
        employeeId === null ||
        employeeId === undefined ||
        employeeId === ""
      ) {
        return null;
      }

      const employee = employees.find(
        (item) => Number(getEmployeeId(item)) === Number(employeeId),
      );

      if (!employee) {
        return `موظف #${employeeId}`;
      }

      return (
        employee.name ||
        employee.full_name ||
        employee.username ||
        `موظف #${employeeId}`
      );
    },
    [employees, getEmployeeId],
  );

  // =========================================================
  // TASK EMPLOYEE IDS
  // =========================================================

  const getTaskEmployeeIds = useCallback(
    (task) => {
      if (!task) return [];

      if (Array.isArray(task.employee_ids)) {
        return [
          ...new Set(
            task.employee_ids
              .map(Number)
              .filter((id) => Number.isInteger(id) && id > 0),
          ),
        ];
      }

      if (Array.isArray(task.employees)) {
        return [
          ...new Set(
            task.employees
              .map((employee) => Number(getEmployeeId(employee)))
              .filter((id) => Number.isInteger(id) && id > 0),
          ),
        ];
      }

      if (
        task.employee_id !== null &&
        task.employee_id !== undefined &&
        task.employee_id !== ""
      ) {
        const id = Number(task.employee_id);

        if (Number.isInteger(id) && id > 0) {
          return [id];
        }
      }

      return [];
    },
    [getEmployeeId],
  );

  // =========================================================
  // TASK EMPLOYEES
  // =========================================================

  const getTaskEmployees = useCallback(
    (task) => {
      const ids = getTaskEmployeeIds(task);

      return ids.map((id) => {
        const employee = employees.find(
          (item) => Number(getEmployeeId(item)) === Number(id),
        );

        const taskEmployee = Array.isArray(task?.employees)
          ? task.employees.find(
              (item) => Number(getEmployeeId(item)) === Number(id),
            )
          : null;

        return (
          taskEmployee ||
          employee || {
            employee_id: id,
            name: `موظف #${id}`,
          }
        );
      });
    },
    [employees, getEmployeeId, getTaskEmployeeIds],
  );

  // =========================================================
  // TASK STAGES
  // =========================================================

  const getTaskStages = useCallback((task) => {
    if (!task || !Array.isArray(task.stages)) {
      return [];
    }

    return [...task.stages].sort(
      (a, b) => Number(a.stage_order || 0) - Number(b.stage_order || 0),
    );
  }, []);

  // =========================================================
  // STAGE ID
  // =========================================================

  const getStageId = useCallback((stage) => {
    if (!stage) return null;

    return stage.stage_id ?? stage.id ?? null;
  }, []);

  // =========================================================
  // STAGE COMPLETED
  // =========================================================

  const isStageCompleted = useCallback((stage) => {
    return (
      Number(stage?.completed) === 1 ||
      stage?.completed === true ||
      stage?.status === "completed"
    );
  }, []);

  // =========================================================
  // STAGE PROGRESS
  // =========================================================

  const getStageProgress = useCallback(
    (task) => {
      const stages = getTaskStages(task);

      const total = stages.length;

      const completed = stages.filter(isStageCompleted).length;

      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        total,
        completed,
        percentage,
      };
    },
    [getTaskStages, isStageCompleted],
  );

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "غير محدد";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "غير محدد";
    }

    return parsed.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =========================================================
  // FORMAT DATE INPUT
  // =========================================================

  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();

    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");

    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // EMPLOYEE TASK STATUS
  // =========================================================

  const getEmployeeTaskStatus = (employee) => {
    if (
      employee?.status === "completed" ||
      employee?.task_status === "completed"
    ) {
      return {
        text: "تم الإنجاز",
        className: "completed",
        icon: <FaCheckCircle />,
      };
    }

    return {
      text: "قيد التنفيذ",
      className: "pending",
      icon: <FaHourglassHalf />,
    };
  };

  // =========================================================
  // TASK OVERALL STATUS
  // =========================================================

  const getTaskOverallStatus = (task) => {
    const employeeIds = getTaskEmployeeIds(task);

    if (employeeIds.length === 0) {
      return {
        text: "متاحة للجميع",
        className: "unassigned",
        icon: <FaUserFriends />,
      };
    }

    const taskEmployees = getTaskEmployees(task);

    const completedCount = taskEmployees.filter(
      (employee) =>
        employee?.status === "completed" ||
        employee?.task_status === "completed",
    ).length;

    if (completedCount === taskEmployees.length && taskEmployees.length > 0) {
      return {
        text: "مكتملة",
        className: "completed",
        icon: <FaCheckCircle />,
      };
    }

    return {
      text: "قيد التنفيذ",
      className: "pending",
      icon: <FaHourglassHalf />,
    };
  };

  // =========================================================
  // GET EXISTING EMPLOYEE ASSIGNMENT
  // =========================================================

  const getExistingEmployeeAssignment = useCallback(
    (task, employeeId) => {
      const id = Number(employeeId);

      const possibleArrays = [
        task?.assignments,
        task?.employee_assignments,
        task?.employeeAssignments,
      ];

      for (const array of possibleArrays) {
        if (!Array.isArray(array)) continue;

        const found = array.find(
          (item) => Number(item.employee_id ?? item.id ?? item.user_id) === id,
        );

        if (found) {
          const type = found.assignment_type || found.type || "task";

          const stageIds = Array.isArray(found.stage_ids)
            ? found.stage_ids
                .map(Number)
                .filter((stageId) => Number.isInteger(stageId) && stageId > 0)
            : Array.isArray(found.stages)
              ? found.stages
                  .map((stage) => Number(getStageId(stage)))
                  .filter((stageId) => Number.isInteger(stageId) && stageId > 0)
              : [];

          return {
            employee_id: id,
            assignment_type: type === "stage" ? "stage" : "task",
            stage_ids: type === "stage" ? stageIds : [],
          };
        }
      }

      /*
        بعض الـ APIs قد ترجع assignment
        داخل employee نفسه.
      */

      const employee = Array.isArray(task?.employees)
        ? task.employees.find((item) => Number(getEmployeeId(item)) === id)
        : null;

      if (employee) {
        const type =
          employee.assignment_type || employee.assignmentType || "task";

        const stageIds = Array.isArray(employee.stage_ids)
          ? employee.stage_ids
              .map(Number)
              .filter((stageId) => Number.isInteger(stageId) && stageId > 0)
          : Array.isArray(employee.assigned_stage_ids)
            ? employee.assigned_stage_ids
                .map(Number)
                .filter((stageId) => Number.isInteger(stageId) && stageId > 0)
            : [];

        return {
          employee_id: id,
          assignment_type: type === "stage" ? "stage" : "task",
          stage_ids: type === "stage" ? stageIds : [],
        };
      }

      /*
        إذا لم يرسل الـ API تفاصيل التعيين،
        نعتبر الموظف الحالي مكلفًا بالمهمة كاملة.
      */

      return {
        employee_id: id,
        assignment_type: "task",
        stage_ids: [],
      };
    },
    [getEmployeeId, getStageId],
  );

  // =========================================================
  // OPEN STAGE MODAL
  // =========================================================

  const openStageModal = (task) => {
    if (!task) return;

    setStageModal({
      open: true,
      task,
    });
  };

  const closeStageModal = () => {
    setStageModal({
      open: false,
      task: null,
    });
  };

  // =========================================================
  // FETCH TASKS
  // =========================================================

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get("/tasks");

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.tasks)
          ? res.data.tasks
          : [];

      const normalizedTasks = data.map((task) => {
        let employeeIds = [];

        if (Array.isArray(task.employee_ids)) {
          employeeIds = task.employee_ids;
        } else if (Array.isArray(task.employees)) {
          employeeIds = task.employees
            .map((employee) => Number(getEmployeeId(employee)))
            .filter((id) => Number.isInteger(id) && id > 0);
        } else if (
          task.employee_id !== null &&
          task.employee_id !== undefined &&
          task.employee_id !== ""
        ) {
          const id = Number(task.employee_id);

          if (Number.isInteger(id) && id > 0) {
            employeeIds = [id];
          }
        }

        employeeIds = [
          ...new Set(
            employeeIds
              .map(Number)
              .filter((id) => Number.isInteger(id) && id > 0),
          ),
        ];

        return {
          ...task,

          employee_ids: employeeIds,

          employee_id: employeeIds.length > 0 ? employeeIds[0] : null,

          due_date: task.due_date || task.deadline || null,

          stages: Array.isArray(task.stages) ? task.stages : [],
        };
      });

      setTasks(normalizedTasks);
    } catch (error) {
      console.error("FETCH TASKS ERROR:", error);

      showMessage(
        "error",
        "خطأ",
        error?.response?.data?.message || "تعذر تحميل المهام.",
      );
    } finally {
      setLoading(false);
    }
  }, [getEmployeeId]);

  // =========================================================
  // FETCH EMPLOYEES
  // =========================================================

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await API.get("/tasks/employees");

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.employees)
          ? res.data.employees
          : [];

      setEmployees(data);
    } catch (error) {
      console.error("FETCH EMPLOYEES ERROR:", error);
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchTasks(), fetchEmployees()]);
    };

    loadData();
  }, [fetchTasks, fetchEmployees]);

  // =========================================================
  // FILTER TASKS
  // =========================================================

  const filteredTasks = useMemo(() => {
    const value = search.trim().toLowerCase();

    let result = tasks;

    // Statistics filter
    if (activeStat === "assigned") {
      result = result.filter((task) => getTaskEmployeeIds(task).length > 0);
    } else if (activeStat === "pending") {
      result = result.filter(
        (task) => getTaskOverallStatus(task).className === "pending",
      );
    } else if (activeStat === "completed") {
      result = result.filter(
        (task) => getTaskOverallStatus(task).className === "completed",
      );
    } else if (activeStat === "unassigned") {
      result = result.filter((task) => getTaskEmployeeIds(task).length === 0);
    }

    // Search filter
    if (!value) {
      return result;
    }

    return result.filter((task) => {
      const title = String(task.title || "").toLowerCase();

      const description = String(task.description || "").toLowerCase();

      const employeeNames = getTaskEmployees(task)
        .map(
          (employee) =>
            employee.name || employee.full_name || employee.username || "",
        )
        .join(" ")
        .toLowerCase();

      const stageNames = getTaskStages(task)
        .map((stage) => stage.title || stage.name || "")
        .join(" ")
        .toLowerCase();

      return (
        title.includes(value) ||
        description.includes(value) ||
        employeeNames.includes(value) ||
        stageNames.includes(value)
      );
    });
  }, [
    tasks,
    search,
    activeStat,
    getTaskEmployeeIds,
    getTaskOverallStatus,
    getTaskEmployees,
    getTaskStages,
  ]);

  const handleStatClick = (stat) => {
    setActiveStat((prev) => (prev === stat ? "all" : stat));
  };

  const activeStatLabel = {
    all: "كل المهام",
    assigned: "المهام المعينة",
    pending: "المهام قيد التنفيذ",
    completed: "المهام المكتملة",
    unassigned: "المهام المتاحة للجميع",
  }[activeStat];

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalTasks = tasks.length;

  const assignedTasks = tasks.filter(
    (task) => getTaskEmployeeIds(task).length > 0,
  ).length;

  const unassignedTasks = totalTasks - assignedTasks;

  const completedTasks = tasks.filter(
    (task) => getTaskOverallStatus(task).className === "completed",
  ).length;

  const pendingTasks = tasks.filter(
    (task) => getTaskOverallStatus(task).className === "pending",
  ).length;

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // STAGE CHANGE
  // =========================================================

  const handleStageChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,

      stages: prev.stages.map((stage, stageIndex) =>
        stageIndex === index
          ? {
              ...stage,
              [field]: value,
            }
          : stage,
      ),
    }));
  };

  // =========================================================
  // ADD STAGE
  // =========================================================

  const addStage = () => {
    setForm((prev) => ({
      ...prev,

      stages: [...prev.stages, emptyStage()],
    }));
  };

  // =========================================================
  // REMOVE STAGE
  // =========================================================

  const removeStage = (index) => {
    if (form.stages.length === 1) {
      showMessage(
        "warning",
        "لا يمكن حذف المرحلة",
        "يجب أن تحتوي المهمة على مرحلة واحدة على الأقل.",
      );

      return;
    }

    setForm((prev) => ({
      ...prev,

      stages: prev.stages.filter((_, stageIndex) => stageIndex !== index),
    }));
  };

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const openAddModal = () => {
    setEditingTask(null);

    setForm({
      title: "",
      description: "",
      due_date: "",
      stages: [emptyStage()],
    });

    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (task) => {
    setEditingTask(task);

    const taskStages = getTaskStages(task);

    setForm({
      title: task.title || "",

      description: task.description || "",

      due_date: formatDateForInput(task.due_date),

      stages:
        taskStages.length > 0
          ? taskStages.map((stage) => ({
              stage_id: getStageId(stage),

              title: stage.title || "",

              description: stage.description || "",

              due_date: formatDateForInput(stage.due_date),
            }))
          : [emptyStage()],
    });

    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingTask(null);

    setForm({
      title: "",
      description: "",
      due_date: "",
      stages: [emptyStage()],
    });
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateTaskForm = () => {
    const title = form.title.trim();

    if (!title) {
      showMessage("warning", "عنوان المهمة مطلوب", "يرجى إدخال عنوان المهمة.");

      return false;
    }

    if (!form.due_date) {
      showMessage(
        "warning",
        "تاريخ المهمة مطلوب",
        "يرجى تحديد تاريخ استحقاق المهمة.",
      );

      return false;
    }

    if (!Array.isArray(form.stages) || form.stages.length === 0) {
      showMessage(
        "warning",
        "المراحل مطلوبة",
        "يجب إضافة مرحلة واحدة على الأقل.",
      );

      return false;
    }

    for (let i = 0; i < form.stages.length; i++) {
      const stage = form.stages[i];

      if (!stage.title.trim()) {
        showMessage(
          "warning",
          `اسم المرحلة ${i + 1} مطلوب`,
          `يرجى إدخال اسم المرحلة رقم ${i + 1}.`,
        );

        return false;
      }

      if (!stage.due_date) {
        showMessage(
          "warning",
          `تاريخ المرحلة ${i + 1} مطلوب`,
          `يرجى تحديد تاريخ استحقاق المرحلة رقم ${i + 1}.`,
        );

        return false;
      }

      if (stage.due_date > form.due_date) {
        showMessage(
          "warning",
          "تاريخ المرحلة غير صحيح",
          `تاريخ المرحلة ${i + 1} لا يمكن أن يكون بعد تاريخ استحقاق المهمة.`,
        );

        return false;
      }
    }

    return true;
  };

  // =========================================================
  // SAVE TASK
  // =========================================================

  const saveTask = async (e) => {
    e?.preventDefault();

    if (saving) return;

    if (!validateTaskForm()) {
      return;
    }

    const taskData = {
      title: form.title.trim(),

      description: form.description.trim(),

      due_date: form.due_date,

      stages: form.stages.map((stage, index) => ({
        /*
              نرسل stage_id إذا كانت
              المرحلة موجودة مسبقًا.
              الـ controller القديم
              سيهملها أثناء الإنشاء.
            */
        ...(stage.stage_id
          ? {
              stage_id: Number(stage.stage_id),
            }
          : {}),

        title: stage.title.trim(),

        description: stage.description?.trim() || "",

        due_date: stage.due_date,

        stage_order: index + 1,
      })),
    };

    console.log("=================================");

    console.log("SAVE TASK PAYLOAD:", JSON.stringify(taskData, null, 2));

    console.log("=================================");

    try {
      setSaving(true);

      if (editingTask) {
        const res = await API.put(`/tasks/${editingTask.task_id}`, taskData);

        const updatedTask = res.data?.task || res.data;

        setTasks((prev) =>
          prev.map((task) => {
            if (Number(task.task_id) !== Number(editingTask.task_id)) {
              return task;
            }

            return {
              ...task,

              ...updatedTask,

              task_id: updatedTask?.task_id ?? task.task_id,

              due_date: updatedTask?.due_date ?? taskData.due_date,

              stages: updatedTask?.stages ?? taskData.stages ?? [],
            };
          }),
        );

        closeModal();

        showMessage(
          "success",
          "تم تعديل المهمة",
          "تم حفظ تعديلات المهمة والمراحل بنجاح.",
        );
      } else {
        const res = await API.post("/tasks", taskData);

        const newTask = res.data?.task || res.data;

        if (newTask) {
          setTasks((prev) => [
            {
              ...newTask,

              employee_ids: [],

              employee_id: null,

              due_date: newTask.due_date ?? taskData.due_date,

              stages: Array.isArray(res.data?.stages)
                ? res.data.stages
                : Array.isArray(newTask.stages)
                  ? newTask.stages
                  : taskData.stages,
            },

            ...prev,
          ]);
        }

        closeModal();

        showMessage(
          "success",
          "تمت إضافة المهمة",
          `تمت إضافة المهمة بنجاح مع ${taskData.stages.length} مرحلة.`,
        );
      }
    } catch (error) {
      console.error("SAVE TASK ERROR:", error);

      console.error("STATUS:", error?.response?.status);

      console.error("SERVER DATA:", error?.response?.data);

      showMessage(
        "error",
        "تعذر حفظ المهمة",
        error?.response?.data?.message || "حدث خطأ أثناء حفظ المهمة.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE TASK
  // =========================================================

  const deleteTask = async (task) => {
    if (!task?.task_id) return;

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف المهمة "${task.title}"؟`,
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      await API.delete(`/tasks/${task.task_id}`);

      setTasks((prev) =>
        prev.filter((item) => Number(item.task_id) !== Number(task.task_id)),
      );

      if (
        stageModal.task &&
        Number(stageModal.task.task_id) === Number(task.task_id)
      ) {
        closeStageModal();
      }

      showMessage("success", "تم حذف المهمة", "تم حذف المهمة بنجاح.");
    } catch (error) {
      console.error("DELETE TASK ERROR:", error);

      showMessage(
        "error",
        "تعذر حذف المهمة",
        error?.response?.data?.message || "حدث خطأ أثناء حذف المهمة.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // OPEN ASSIGN MODAL
  // =========================================================

  const openAssignModal = (task) => {
    if (!task) return;

    const currentEmployeeIds = getTaskEmployeeIds(task);

    const initialAssignments = currentEmployeeIds.map((employeeId) =>
      getExistingEmployeeAssignment(task, employeeId),
    );

    setAssigningTask(task);

    setEmployeeAssignments(initialAssignments);

    setEmployeeSearch("");

    setExpandedEmployee(
      initialAssignments.length > 0 ? initialAssignments[0].employee_id : null,
    );
  };

  // =========================================================
  // CLOSE ASSIGN MODAL
  // =========================================================

  const closeAssignModal = () => {
    if (saving) return;

    setAssigningTask(null);

    setEmployeeAssignments([]);

    setEmployeeSearch("");

    setExpandedEmployee(null);
  };

  // =========================================================
  // CHECK EMPLOYEE
  // =========================================================

  const isEmployeeSelected = (employeeId) => {
    return employeeAssignments.some(
      (item) => Number(item.employee_id) === Number(employeeId),
    );
  };

  // =========================================================
  // ADD EMPLOYEE
  // =========================================================

  const addEmployeeAssignment = (employeeId) => {
    const id = Number(employeeId);

    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    setEmployeeAssignments((prev) => {
      const exists = prev.some((item) => Number(item.employee_id) === id);

      if (exists) {
        return prev;
      }

      return [
        ...prev,
        {
          employee_id: id,
          assignment_type: "task",
          stage_ids: [],
        },
      ];
    });

    setExpandedEmployee(id);
  };

  // =========================================================
  // REMOVE EMPLOYEE
  // =========================================================

  const removeEmployeeAssignment = (employeeId) => {
    const id = Number(employeeId);

    setEmployeeAssignments((prev) =>
      prev.filter((item) => Number(item.employee_id) !== id),
    );

    setExpandedEmployee((prev) => (Number(prev) === id ? null : prev));
  };

  // =========================================================
  // TOGGLE EMPLOYEE
  // =========================================================

  const toggleEmployee = (employeeId) => {
    if (isEmployeeSelected(employeeId)) {
      removeEmployeeAssignment(employeeId);
    } else {
      addEmployeeAssignment(employeeId);
    }
  };

  // =========================================================
  // CHANGE ASSIGNMENT TYPE
  // =========================================================

  const changeAssignmentType = (employeeId, type) => {
    const id = Number(employeeId);

    setEmployeeAssignments((prev) =>
      prev.map((item) => {
        if (Number(item.employee_id) !== id) {
          return item;
        }

        return {
          ...item,

          assignment_type: type,

          /*
              المهمة كاملة لا تحتاج
              stage_ids.
            */
          stage_ids: type === "task" ? [] : item.stage_ids || [],
        };
      }),
    );
  };

  // =========================================================
  // TOGGLE EMPLOYEE STAGE
  // =========================================================

  const toggleEmployeeStage = (employeeId, stageId) => {
    const employeeIdNumber = Number(employeeId);

    const stageIdNumber = Number(stageId);

    if (!Number.isInteger(stageIdNumber) || stageIdNumber <= 0) {
      return;
    }

    setEmployeeAssignments((prev) =>
      prev.map((item) => {
        if (Number(item.employee_id) !== employeeIdNumber) {
          return item;
        }

        const currentStageIds = Array.isArray(item.stage_ids)
          ? item.stage_ids.map(Number)
          : [];

        const exists = currentStageIds.includes(stageIdNumber);

        const newStageIds = exists
          ? currentStageIds.filter((id) => id !== stageIdNumber)
          : [...currentStageIds, stageIdNumber];

        return {
          ...item,

          assignment_type: "stage",

          stage_ids: newStageIds,
        };
      }),
    );
  };

  // =========================================================
  // SELECT ALL STAGES FOR EMPLOYEE
  // =========================================================

  const selectAllStagesForEmployee = (employeeId) => {
    const stages = getTaskStages(assigningTask);

    const stageIds = stages
      .map((stage) => Number(getStageId(stage)))
      .filter((id) => Number.isInteger(id) && id > 0);

    setEmployeeAssignments((prev) =>
      prev.map((item) => {
        if (Number(item.employee_id) !== Number(employeeId)) {
          return item;
        }

        return {
          ...item,

          assignment_type: "stage",

          stage_ids: stageIds,
        };
      }),
    );
  };

  // =========================================================
  // CLEAR ALL STAGES FOR EMPLOYEE
  // =========================================================

  const clearStagesForEmployee = (employeeId) => {
    setEmployeeAssignments((prev) =>
      prev.map((item) => {
        if (Number(item.employee_id) !== Number(employeeId)) {
          return item;
        }

        return {
          ...item,

          assignment_type: "stage",

          stage_ids: [],
        };
      }),
    );
  };

  // =========================================================
  // SELECT ALL EMPLOYEES
  // =========================================================

  const selectAllEmployees = () => {
    const allIds = employees
      .map((employee) => Number(getEmployeeId(employee)))
      .filter((id) => Number.isInteger(id) && id > 0);

    setEmployeeAssignments(
      allIds.map((id) => {
        const existing = employeeAssignments.find(
          (item) => Number(item.employee_id) === id,
        );

        return (
          existing || {
            employee_id: id,
            assignment_type: "task",
            stage_ids: [],
          }
        );
      }),
    );
  };

  // =========================================================
  // CLEAR EMPLOYEES
  // =========================================================

  const clearSelectedEmployees = () => {
    setEmployeeAssignments([]);

    setExpandedEmployee(null);
  };

  // =========================================================
  // FILTER EMPLOYEES
  // =========================================================

  const filteredEmployees = useMemo(() => {
    const value = employeeSearch.trim().toLowerCase();

    if (!value) {
      return employees;
    }

    return employees.filter((employee) => {
      const id = String(getEmployeeId(employee) || "").toLowerCase();

      const name = String(
        employee.name || employee.full_name || employee.username || "",
      ).toLowerCase();

      const email = String(employee.email || "").toLowerCase();

      return (
        name.includes(value) || email.includes(value) || id.includes(value)
      );
    });
  }, [employees, employeeSearch, getEmployeeId]);

  // =========================================================
  // GET ASSIGNMENT TEXT
  // =========================================================

  const getAssignmentText = (assignment) => {
    if (assignment?.assignment_type === "task") {
      return "المهمة كاملة";
    }

    const count = Array.isArray(assignment?.stage_ids)
      ? assignment.stage_ids.length
      : 0;

    if (count === 0) {
      return "لم يتم اختيار مراحل";
    }

    return `${count} ${count === 1 ? "مرحلة" : "مراحل"} محددة`;
  };

  // =========================================================
  // VALIDATE ASSIGNMENTS
  // =========================================================

  const validateAssignments = () => {
    if (employeeAssignments.length === 0) {
      showMessage(
        "warning",
        "لم يتم اختيار موظفين",
        "يرجى اختيار موظف واحد على الأقل.",
      );

      return false;
    }

    for (const assignment of employeeAssignments) {
      if (assignment.assignment_type === "stage") {
        if (
          !Array.isArray(assignment.stage_ids) ||
          assignment.stage_ids.length === 0
        ) {
          const name = getEmployeeName(assignment.employee_id);

          showMessage(
            "warning",
            "لم يتم اختيار مرحلة",
            `يرجى اختيار مرحلة واحدة على الأقل للموظف ${name}.`,
          );

          setExpandedEmployee(assignment.employee_id);

          return false;
        }
      }
    }

    return true;
  };

  // =========================================================
  // ASSIGN TASK
  // =========================================================

  const assignTask = async () => {
    if (saving) return;

    if (!assigningTask) return;

    const taskId = Number(assigningTask.task_id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return;
    }

    if (!validateAssignments()) {
      return;
    }

    const assignments = employeeAssignments.map((assignment) => ({
      employee_id: Number(assignment.employee_id),

      assignment_type:
        assignment.assignment_type === "stage" ? "stage" : "task",

      stage_ids:
        assignment.assignment_type === "stage"
          ? [
              ...new Set(
                (assignment.stage_ids || [])
                  .map(Number)
                  .filter((id) => Number.isInteger(id) && id > 0),
              ),
            ]
          : [],
    }));

    console.log("=================================");

    console.log(
      "ASSIGN TASK PAYLOAD:",
      JSON.stringify(
        {
          task_id: taskId,
          assignments,
        },
        null,
        2,
      ),
    );

    console.log("=================================");

    try {
      setSaving(true);

      const res = await API.post("/tasks/assign", {
        task_id: taskId,
        assignments,
      });

      const employeeIds = assignments.map((item) => item.employee_id);

      /*
        نحتفظ بتفاصيل التعيين
        داخل الـ task حتى تظهر
        مباشرة في الواجهة.
      */

      const returnedEmployees = Array.isArray(res.data?.employees)
        ? res.data.employees
        : employeeIds.map((id) => {
            const employee = employees.find(
              (item) => Number(getEmployeeId(item)) === Number(id),
            );

            return (
              employee || {
                employee_id: id,

                name: `موظف #${id}`,

                status: "pending",
              }
            );
          });

      const normalizedEmployees = returnedEmployees.map((employee) => {
        const id = Number(getEmployeeId(employee));

        const assignment = assignments.find(
          (item) => Number(item.employee_id) === id,
        );

        return {
          ...employee,

          status: employee.status || "pending",

          assignment_type: assignment?.assignment_type || "task",

          stage_ids: assignment?.stage_ids || [],
        };
      });

      const updateTaskState = (task) => {
        if (Number(task.task_id) !== taskId) {
          return task;
        }

        return {
          ...task,

          employee_ids: employeeIds,

          employee_id: employeeIds.length > 0 ? employeeIds[0] : null,

          employees: normalizedEmployees,

          assignments: assignments,
        };
      };

      setTasks((prev) => prev.map(updateTaskState));

      setStageModal((prev) => {
        if (!prev.open || !prev.task || Number(prev.task.task_id) !== taskId) {
          return prev;
        }

        return {
          ...prev,

          task: updateTaskState(prev.task),
        };
      });

      closeAssignModal();

      const fullTaskCount = assignments.filter(
        (item) => item.assignment_type === "task",
      ).length;

      const stageCount = assignments.filter(
        (item) => item.assignment_type === "stage",
      ).length;

      showMessage(
        "success",
        "تم تحديث التعيين",
        `تم تعيين ${employeeIds.length} موظف بنجاح${
          fullTaskCount > 0 ? `، منهم ${fullTaskCount} للمهمة كاملة` : ""
        }${stageCount > 0 ? ` و${stageCount} لمراحل محددة` : ""}.`,
      );
    } catch (error) {
      console.error("ASSIGN TASK ERROR:", error);

      console.error("SERVER DATA:", error?.response?.data);

      showMessage(
        "error",
        "تعذر تعيين الموظفين",
        error?.response?.data?.message || "حدث خطأ أثناء تعيين الموظفين.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // STAGE ASSIGNED EMPLOYEES
  // =========================================================

  const getStageAssignedEmployees = (task, stageId) => {
    if (!task) return [];

    const assignments = Array.isArray(task.assignments)
      ? task.assignments
      : Array.isArray(task.employee_assignments)
        ? task.employee_assignments
        : Array.isArray(task.employeeAssignments)
          ? task.employeeAssignments
          : [];

    if (assignments.length === 0) {
      return [];
    }

    const ids = [];

    assignments.forEach((assignment) => {
      const employeeId = Number(assignment.employee_id ?? assignment.id);

      if (!Number.isInteger(employeeId)) {
        return;
      }

      const type = assignment.assignment_type || assignment.type || "task";

      if (type === "task") {
        ids.push(employeeId);

        return;
      }

      const stageIds = Array.isArray(assignment.stage_ids)
        ? assignment.stage_ids.map(Number)
        : [];

      if (stageIds.includes(Number(stageId))) {
        ids.push(employeeId);
      }
    });

    return [...new Set(ids)];
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="select-task-page" dir="rtl">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="page-header">
        <div>
          <h1>إدارة المهام</h1>

          <p>إنشاء المهام وإضافة مراحلها وتعيينها للموظفين</p>
        </div>

        <button
          className="add-task-btn"
          onClick={openAddModal}
          disabled={saving}
        >
          <span>＋</span>
          إضافة مهمة
        </button>
      </div>

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div className="task-stats">
        <div
          className={`stat-card ${
            activeStat === "all" ? "stat-card-active" : ""
          }`}
          role="button"
          tabIndex={0}
          onClick={() => handleStatClick("all")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleStatClick("all");
            }
          }}
          title="عرض جميع المهام"
        >
          <div className="stat-icon">📋</div>

          <div>
            <span>إجمالي المهام</span>

            <strong>{totalTasks}</strong>
          </div>
        </div>

        <div
          className={`stat-card ${
            activeStat === "assigned" ? "stat-card-active" : ""
          }`}
          role="button"
          tabIndex={0}
          onClick={() => handleStatClick("assigned")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleStatClick("assigned");
            }
          }}
          title="عرض المهام المعينة"
        >
          <div className="stat-icon">👥</div>

          <div>
            <span>المهام المعينة</span>

            <strong>{assignedTasks}</strong>
          </div>
        </div>

        <div
          className={`stat-card ${
            activeStat === "pending" ? "stat-card-active" : ""
          }`}
          role="button"
          tabIndex={0}
          onClick={() => handleStatClick("pending")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleStatClick("pending");
            }
          }}
          title="عرض المهام قيد التنفيذ"
        >
          <div className="stat-icon">⏳</div>

          <div>
            <span>قيد التنفيذ</span>

            <strong>{pendingTasks}</strong>
          </div>
        </div>

        <div
          className={`stat-card ${
            activeStat === "completed" ? "stat-card-active" : ""
          }`}
          role="button"
          tabIndex={0}
          onClick={() => handleStatClick("completed")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleStatClick("completed");
            }
          }}
          title="عرض المهام المكتملة"
        >
          <div className="stat-icon">✅</div>

          <div>
            <span>المهام المكتملة</span>

            <strong>{completedTasks}</strong>
          </div>
        </div>

        <div
          className={`stat-card ${
            activeStat === "unassigned" ? "stat-card-active" : ""
          }`}
          role="button"
          tabIndex={0}
          onClick={() => handleStatClick("unassigned")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleStatClick("unassigned");
            }
          }}
          title="عرض المهام المتاحة لجميع الموظفين"
        >
          <div className="stat-icon">🌐</div>

          <div>
            <span>متاحة للجميع</span>

            <strong>{unassignedTasks}</strong>
          </div>
        </div>
      </div>

      {activeStat !== "all" && (
        <div className="active-stat-filter">
          <div>
            <span>الفئة الحالية:</span>
            <strong>{activeStatLabel}</strong>
          </div>

          <button
            type="button"
            onClick={() => setActiveStat("all")}
            aria-label="إظهار جميع المهام"
          >
            عرض جميع المهام
            <FaTimes />
          </button>
        </div>
      )}

      {/* =====================================================
          SEARCH
      ====================================================== */}

      <div className="task-toolbar">
        <div className="task-search">
          <span>🔎</span>

          <input
            type="text"
            placeholder="ابحث عن مهمة أو موظف أو مرحلة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="clear-search"
            >
              ×
            </button>
          )}
        </div>

        <div className="results-count">
          عرض <strong>{filteredTasks.length}</strong> من {tasks.length} مهمة
        </div>
      </div>

      {/* =====================================================
          LOADING / EMPTY
      ====================================================== */}

      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>

          <p>جاري تحميل المهام...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>

          <h3>
            {search
              ? "لا توجد نتائج"
              : activeStat !== "all"
                ? `لا توجد ${activeStatLabel}`
                : "لا توجد مهام"}
          </h3>

          <p>
            {search
              ? "جرّب البحث باستخدام كلمة أخرى"
              : activeStat !== "all"
                ? "جرّبي اختيار إحصائية أخرى لعرض المهام"
                : "قم بإضافة أول مهمة من زر إضافة مهمة"}
          </p>

          {activeStat !== "all" ? (
            <button
              type="button"
              className="add-task-btn"
              onClick={() => setActiveStat("all")}
            >
              عرض جميع المهام
            </button>
          ) : (
            !search && (
              <button className="add-task-btn" onClick={openAddModal}>
                ＋ إضافة مهمة
              </button>
            )
          )}
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => {
            const taskEmployees = getTaskEmployees(task);

            const employeeCount = getTaskEmployeeIds(task).length;

            const isAssigned = employeeCount > 0;

            const overallStatus = getTaskOverallStatus(task);

            const stageProgress = getStageProgress(task);

            const hasStages = stageProgress.total > 0;

            return (
              <div
                className={`task-card ${
                  hasStages ? "task-card-clickable" : ""
                }`}
                key={task.task_id}
                role={hasStages ? "button" : undefined}
                tabIndex={hasStages ? 0 : undefined}
                onClick={() => {
                  if (hasStages) {
                    openStageModal(task);
                  }
                }}
                onKeyDown={(e) => {
                  if (hasStages && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();

                    openStageModal(task);
                  }
                }}
              >
                {/* CLICK HINT */}

                {hasStages && (
                  <div className="task-card-click-hint">
                    <FaListOl />

                    <span>اضغط لعرض المراحل</span>
                  </div>
                )}

                {/* HEADER */}

                <div className="task-card-header">
                  <div className="task-number">#{task.task_id}</div>

                  <div className="task-actions">
                    <button
                      type="button"
                      title="تعديل"
                      onClick={(e) => {
                        e.stopPropagation();

                        openEditModal(task);
                      }}
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      title="حذف"
                      onClick={(e) => {
                        e.stopPropagation();

                        deleteTask(task);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* BODY */}

                <div className="task-card-body">
                  <h3>{task.title}</h3>

                  {task.description ? (
                    <p className="task-description">{task.description}</p>
                  ) : (
                    <p className="task-description muted">لا يوجد وصف للمهمة</p>
                  )}

                  {/* STAGES SUMMARY */}

                  {hasStages && (
                    <div className="task-stages-summary">
                      <div className="stages-summary-header">
                        <div className="stages-summary-title">
                          <FaTasks />

                          <span>مراحل المهمة</span>
                        </div>

                        <strong>
                          {stageProgress.completed} / {stageProgress.total}
                        </strong>
                      </div>

                      <div className="stage-progress-track">
                        <div
                          className="stage-progress-fill"
                          style={{
                            width: `${stageProgress.percentage}%`,
                          }}
                        />
                      </div>

                      <div className="stage-progress-footer">
                        <span>{stageProgress.percentage}% مكتمل</span>

                        {stageProgress.completed === stageProgress.total && (
                          <span className="all-stages-done">
                            ✓ جميع المراحل مكتملة
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DATE + STATUS */}

                  <div className="task-meta">
                    <div className="task-due-date">
                      <FaCalendarAlt />

                      <div>
                        <span>تاريخ الاستحقاق</span>

                        <strong>{formatDate(task.due_date)}</strong>
                      </div>
                    </div>

                    <div
                      className={`task-overall-status ${overallStatus.className}`}
                    >
                      {overallStatus.icon}

                      <span>{overallStatus.text}</span>
                    </div>
                  </div>

                  {/* EMPLOYEES */}

                  <div className="task-employees-section">
                    <div className="section-title">
                      <span>👥</span>

                      <span>الموظفون</span>

                      <span
                        className={
                          isAssigned
                            ? "employee-count assigned"
                            : "employee-count"
                        }
                      >
                        {employeeCount}
                      </span>
                    </div>

                    {!isAssigned ? (
                      <div className="no-employees">
                        <span>🌐</span>

                        <span>المهمة متاحة لجميع الموظفين</span>
                      </div>
                    ) : (
                      <div className="assigned-employees">
                        {taskEmployees.map((employee, index) => {
                          const employeeId = getEmployeeId(employee);

                          const name =
                            employee.name ||
                            employee.full_name ||
                            employee.username ||
                            `موظف #${employeeId}`;

                          const employeeStatus =
                            getEmployeeTaskStatus(employee);

                          const assignmentType =
                            employee.assignment_type || "task";

                          return (
                            <div
                              className="employee-chip"
                              key={`${employeeId}-${index}`}
                            >
                              <span className="employee-avatar">
                                {name.charAt(0).toUpperCase()}
                              </span>

                              <span className="employee-name">{name}</span>

                              <span
                                className={`employee-assignment-badge ${
                                  assignmentType === "stage"
                                    ? "stage-assignment"
                                    : "task-assignment"
                                }`}
                              >
                                {assignmentType === "stage"
                                  ? "مراحل محددة"
                                  : "كاملة"}
                              </span>

                              <span
                                className={`employee-task-status ${employeeStatus.className}`}
                                title={employeeStatus.text}
                              >
                                {employeeStatus.icon}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* FOOTER */}

                <div className="task-card-footer">
                  <div
                    className={
                      isAssigned
                        ? "assignment-status assigned"
                        : "assignment-status"
                    }
                  >
                    <span>{isAssigned ? "✓" : "🌐"}</span>

                    {isAssigned
                      ? `${employeeCount} موظف معين`
                      : "متاحة لجميع الموظفين"}
                  </div>

                  <button
                    type="button"
                    className="assign-btn"
                    onClick={(e) => {
                      e.stopPropagation();

                      openAssignModal(task);
                    }}
                  >
                    👥 {isAssigned ? "تعديل التعيين" : "تعيين موظفين"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================
          STAGES POPUP
      ====================================================== */}

      {/* =========================================================
    STAGES POPUP
========================================================= */}

      {stageModal.open && stageModal.task && (
        <div
          className="modal-overlay stage-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeStageModal();
            }
          }}
        >
          <div className="stage-modal" onMouseDown={(e) => e.stopPropagation()}>
            {(() => {
              const task = stageModal.task;

              const stages = getTaskStages(task);
              const progress = getStageProgress(task);
              const taskEmployees = getTaskEmployees(task);

              return (
                <>
                  {/* =================================================
                HEADER
            ================================================= */}

                  <div className="stage-modal-header">
                    <div className="stage-modal-title-area">
                      <div className="stage-modal-main-icon">
                        <FaTasks />
                      </div>

                      <div className="stage-modal-title-content">
                        <div className="stage-modal-number">
                          المهمة #{task.task_id}
                        </div>

                        <h2>{task.title}</h2>

                        {task.description && <p>{task.description}</p>}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="stage-modal-close"
                      onClick={closeStageModal}
                      aria-label="إغلاق"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* =================================================
                SUMMARY CARDS
            ================================================= */}

                  <div className="stage-summary-grid">
                    <div className="stage-summary-card">
                      <div className="stage-summary-icon blue">
                        <FaListOl />
                      </div>

                      <div>
                        <span>إجمالي المراحل</span>

                        <strong>{progress.total}</strong>
                      </div>
                    </div>

                    <div className="stage-summary-card">
                      <div className="stage-summary-icon green">
                        <FaCheckCircle />
                      </div>

                      <div>
                        <span>المراحل المكتملة</span>

                        <strong>{progress.completed}</strong>
                      </div>
                    </div>

                    <div className="stage-summary-card">
                      <div className="stage-summary-icon orange">
                        <FaHourglassHalf />
                      </div>

                      <div>
                        <span>المراحل المتبقية</span>

                        <strong>
                          {Math.max(progress.total - progress.completed, 0)}
                        </strong>
                      </div>
                    </div>

                    <div className="stage-summary-card">
                      <div className="stage-summary-icon purple">
                        <FaUserFriends />
                      </div>

                      <div>
                        <span>الموظفون</span>

                        <strong>{taskEmployees.length}</strong>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                TASK INFORMATION
            ================================================= */}

                  <div className="stage-task-info">
                    <div className="stage-task-info-item">
                      <div className="stage-task-info-icon">
                        <FaCalendarAlt />
                      </div>

                      <div>
                        <span>تاريخ استحقاق المهمة</span>

                        <strong>{formatDate(task.due_date)}</strong>
                      </div>
                    </div>

                    <div className="stage-task-info-divider" />

                    <div className="stage-task-info-item">
                      <div className="stage-task-info-icon">
                        <FaUserFriends />
                      </div>

                      <div>
                        <span>حالة التعيين</span>

                        <strong>
                          {taskEmployees.length > 0
                            ? `${taskEmployees.length} موظف معين`
                            : "متاحة لجميع الموظفين"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                PROGRESS
            ================================================= */}

                  <div className="stage-progress-box">
                    <div className="stage-progress-top">
                      <div>
                        <h3>تقدم المهمة</h3>

                        <p>
                          {progress.completed} من {progress.total} مراحل مكتملة
                        </p>
                      </div>

                      <div className="stage-progress-percent">
                        {progress.percentage}%
                      </div>
                    </div>

                    <div className="stage-progress-track-large">
                      <div
                        className="stage-progress-fill-large"
                        style={{
                          width: `${progress.percentage}%`,
                        }}
                      />
                    </div>

                    <div className="stage-progress-status">
                      {progress.total > 0 &&
                      progress.completed === progress.total ? (
                        <span className="progress-complete">
                          <FaCheckCircle />
                          تم إنجاز جميع المراحل
                        </span>
                      ) : (
                        <span className="progress-pending">
                          <FaClock />
                          جاري تنفيذ مراحل المهمة
                        </span>
                      )}

                      <span>{progress.percentage}% مكتمل</span>
                    </div>
                  </div>

                  {/* =================================================
                STAGES TITLE
            ================================================= */}

                  <div className="stages-section-header">
                    <div className="stages-section-title">
                      <div className="stages-section-icon">
                        <FaListOl />
                      </div>

                      <div>
                        <h3>مراحل المهمة</h3>

                        <p>تفاصيل المراحل وحالة إنجاز كل مرحلة</p>
                      </div>
                    </div>

                    <div className="stages-count-badge">
                      {progress.total} مراحل
                    </div>
                  </div>

                  {/* =================================================
                STAGES LIST
            ================================================= */}

                  {stages.length === 0 ? (
                    <div className="no-stages-modern">
                      <div className="no-stages-modern-icon">
                        <FaListOl />
                      </div>

                      <h4>لا توجد مراحل</h4>

                      <p>لم تتم إضافة مراحل لهذه المهمة حتى الآن.</p>
                    </div>
                  ) : (
                    <div className="modern-stages-list">
                      {stages.map((stage, index) => {
                        const completed = isStageCompleted(stage);

                        const stageTitle =
                          stage.title || stage.name || `المرحلة ${index + 1}`;

                        return (
                          <div
                            key={stage.stage_id || stage.id || index}
                            className={`modern-stage-card ${
                              completed ? "stage-completed" : "stage-pending"
                            }`}
                          >
                            {/* TIMELINE */}

                            <div className="stage-timeline">
                              <div
                                className={`stage-timeline-dot ${
                                  completed ? "completed" : ""
                                }`}
                              >
                                {completed ? <FaCheckCircle /> : index + 1}
                              </div>

                              {index !== stages.length - 1 && (
                                <div
                                  className={`stage-timeline-line ${
                                    completed ? "completed" : ""
                                  }`}
                                />
                              )}
                            </div>

                            {/* CONTENT */}

                            <div className="modern-stage-content">
                              <div className="modern-stage-top">
                                <div>
                                  <span className="modern-stage-number">
                                    المرحلة {index + 1}
                                  </span>

                                  <h4>{stageTitle}</h4>
                                </div>

                                <span
                                  className={`modern-stage-status ${
                                    completed ? "completed" : "pending"
                                  }`}
                                >
                                  {completed ? (
                                    <>
                                      <FaCheckCircle />
                                      مكتملة
                                    </>
                                  ) : (
                                    <>
                                      <FaClock />
                                      قيد التنفيذ
                                    </>
                                  )}
                                </span>
                              </div>

                              {stage.description && (
                                <div className="modern-stage-description">
                                  {stage.description}
                                </div>
                              )}

                              <div className="modern-stage-footer">
                                {stage.due_date && (
                                  <div className="modern-stage-date">
                                    <FaCalendarAlt />

                                    <span>الاستحقاق</span>

                                    <strong>
                                      {formatDate(stage.due_date)}
                                    </strong>
                                  </div>
                                )}

                                <div className="modern-stage-order">
                                  المرحلة {index + 1} من {stages.length}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* =================================================
                FOOTER
            ================================================= */}

                  <div className="stage-modal-footer-modern">
                    <div className="stage-footer-status">
                      {progress.total > 0 &&
                      progress.completed === progress.total ? (
                        <>
                          <div className="footer-status-icon completed">
                            <FaCheckCircle />
                          </div>

                          <div>
                            <strong>المهمة مكتملة</strong>

                            <span>تم إنجاز جميع مراحل المهمة بنجاح</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="footer-status-icon pending">
                            <FaHourglassHalf />
                          </div>

                          <div>
                            <strong>المهمة قيد التنفيذ</strong>

                            <span>
                              متبقي{" "}
                              {Math.max(progress.total - progress.completed, 0)}{" "}
                              مرحلة
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      className="stage-modal-close-modern"
                      onClick={closeStageModal}
                    >
                      إغلاق
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* =====================================================
          ADD / EDIT TASK MODAL
      ====================================================== */}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="task-modal task-modal-large"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{editingTask ? "تعديل المهمة" : "إضافة مهمة جديدة"}</h2>

                <p>أدخل بيانات المهمة وأضف مراحلها</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={saveTask}>
              {/* TITLE */}

              <div className="form-group">
                <label>عنوان المهمة</label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="مثال: إعداد التقرير الشهري"
                  disabled={saving}
                  autoFocus
                />
              </div>

              {/* DESCRIPTION */}

              <div className="form-group">
                <label>وصف المهمة</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="اكتب وصف المهمة هنا..."
                  rows={4}
                  disabled={saving}
                />
              </div>

              {/* TASK DATE */}

              <div className="form-group">
                <label>تاريخ استحقاق المهمة</label>

                <div className="date-input-wrapper">
                  <FaCalendarAlt />

                  <input
                    type="date"
                    name="due_date"
                    value={form.due_date}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>

                <small className="form-help-text">
                  التاريخ النهائي الذي يجب إنجاز المهمة قبله.
                </small>
              </div>

              {/* STAGES */}

              <div className="stages-form-section">
                <div className="stages-form-header">
                  <div>
                    <h3>
                      <FaListOl />
                      مراحل المهمة
                    </h3>

                    <p>أضف المراحل التي يجب إنجازها لإكمال المهمة.</p>
                  </div>

                  <button
                    type="button"
                    className="add-stage-btn"
                    onClick={addStage}
                    disabled={saving}
                  >
                    <FaPlus />
                    إضافة مرحلة
                  </button>
                </div>

                <div className="stages-form-list">
                  {form.stages.map((stage, index) => (
                    <div
                      className="stage-form-card"
                      key={stage.stage_id || index}
                    >
                      <div className="stage-form-card-header">
                        <div className="stage-form-number">{index + 1}</div>

                        <div>
                          <strong>المرحلة {index + 1}</strong>

                          <span>بيانات المرحلة</span>
                        </div>

                        <button
                          type="button"
                          className="remove-stage-btn"
                          onClick={() => removeStage(index)}
                          disabled={saving || form.stages.length === 1}
                          title="حذف المرحلة"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <div className="stage-form-grid">
                        <div className="form-group">
                          <label>اسم المرحلة</label>

                          <input
                            type="text"
                            value={stage.title}
                            onChange={(e) =>
                              handleStageChange(index, "title", e.target.value)
                            }
                            placeholder="مثال: جمع البيانات"
                            disabled={saving}
                          />
                        </div>

                        <div className="form-group">
                          <label>تاريخ استحقاق المرحلة</label>

                          <div className="date-input-wrapper">
                            <FaCalendarAlt />

                            <input
                              type="date"
                              value={stage.due_date}
                              max={form.due_date || undefined}
                              onChange={(e) =>
                                handleStageChange(
                                  index,
                                  "due_date",
                                  e.target.value,
                                )
                              }
                              disabled={saving}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group stage-description-group">
                        <label>وصف المرحلة</label>

                        <textarea
                          value={stage.description}
                          onChange={(e) =>
                            handleStageChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="اكتب وصف المرحلة هنا..."
                          rows={3}
                          disabled={saving}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* INFO */}

              <div className="form-note">
                💡 بعد إنشاء المهمة يمكنك استخدام زر{" "}
                <strong>"تعيين موظفين"</strong> لتحديد ما إذا كان الموظف مسؤولًا
                عن المهمة كاملة أو عن مراحل محددة فقط.
                <br />
                🌐 إذا لم يتم تعيين أي موظف، تبقى المهمة متاحة لجميع الموظفين.
              </div>

              {/* ACTIONS */}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving || !form.title.trim() || !form.due_date}
                >
                  {saving
                    ? "جاري الحفظ..."
                    : editingTask
                      ? "حفظ التعديلات"
                      : "إضافة المهمة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          ASSIGN EMPLOYEES MODAL
      ====================================================== */}

      {assigningTask && (
        <div
          className="modal-overlay assign-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeAssignModal();
            }
          }}
        >
          <div
            className="assign-modal assign-modal-large"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* =================================================
          HEADER
      ================================================= */}

            <div className="assign-modal-header">
              <div className="assign-modal-header-main">
                <div className="assign-modal-header-icon">
                  <FaUserFriends />
                </div>

                <div>
                  <span className="assign-modal-label">تعيين الموظفين</span>

                  <h2>{assigningTask.title}</h2>

                  <p>حدد الموظفين ونطاق مسؤولية كل موظف</p>
                </div>
              </div>

              <button
                type="button"
                className="assign-modal-close"
                onClick={closeAssignModal}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            {/* =================================================
          SCROLLABLE BODY
      ================================================= */}

            <div className="assign-modal-body">
              {/* TASK INFORMATION */}

              <div className="assign-task-info">
                <div className="assign-info-item">
                  <div className="assign-info-icon calendar">
                    <FaCalendarAlt />
                  </div>

                  <div>
                    <span>تاريخ الاستحقاق</span>
                    <strong>{formatDate(assigningTask.due_date)}</strong>
                  </div>
                </div>

                <div className="assign-info-divider" />

                <div className="assign-info-item">
                  <div className="assign-info-icon stages">
                    <FaLayerGroup />
                  </div>

                  <div>
                    <span>مراحل المهمة</span>
                    <strong>{getTaskStages(assigningTask).length} مراحل</strong>
                  </div>
                </div>

                <div className="assign-info-divider" />

                <div className="assign-info-item">
                  <div className="assign-info-icon users">
                    <FaUserFriends />
                  </div>

                  <div>
                    <span>المختارون</span>
                    <strong>{employeeAssignments.length} موظف</strong>
                  </div>
                </div>
              </div>

              {/* HELP */}

              <div className="assignment-help-box">
                <div className="assignment-help-icon">
                  <FaUserCheck />
                </div>

                <div className="assignment-help-content">
                  <strong>حدد مسؤولية كل موظف</strong>

                  <p>
                    يمكنك تعيين الموظف على المهمة كاملة، أو تحديد مراحل معينة
                    فقط ليكون مسؤولًا عنها.
                  </p>
                </div>
              </div>

              {/* SEARCH + SELECT */}

              <div className="assign-controls">
                <div className="employee-search-box">
                  <span className="search-icon">⌕</span>

                  <input
                    type="text"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    placeholder="ابحث عن اسم الموظف أو البريد الإلكتروني..."
                    disabled={saving}
                  />

                  {employeeSearch && (
                    <button
                      type="button"
                      onClick={() => setEmployeeSearch("")}
                      disabled={saving}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                <div className="employees-actions">
                  <button
                    type="button"
                    className="select-all-btn"
                    onClick={selectAllEmployees}
                    disabled={saving || employees.length === 0}
                  >
                    <FaCheckCircle />
                    تحديد الكل
                  </button>

                  <button
                    type="button"
                    className="clear-all-btn"
                    onClick={clearSelectedEmployees}
                    disabled={saving || employeeAssignments.length === 0}
                  >
                    <FaTimes />
                    إلغاء الكل
                  </button>
                </div>
              </div>

              {/* LIST HEADER */}

              <div className="assignment-list-header">
                <div>
                  <h3>قائمة الموظفين</h3>
                  <span>{filteredEmployees.length} موظف</span>
                </div>

                <div className="assignment-selected-badge">
                  <FaUserCheck />
                  {employeeAssignments.length} مختار
                </div>
              </div>

              {/* EMPLOYEES LIST */}

              <div className="employees-check-list assignment-employees-list">
                {filteredEmployees.length === 0 ? (
                  <div className="no-employees-found">
                    <div className="no-employees-icon">🔍</div>

                    <strong>لا يوجد موظفون</strong>

                    <p>لا توجد نتائج مطابقة لبحثك</p>
                  </div>
                ) : (
                  filteredEmployees.map((employee) => {
                    const employeeId = getEmployeeId(employee);

                    if (employeeId === null || employeeId === undefined) {
                      return null;
                    }

                    const selected = isEmployeeSelected(employeeId);

                    const assignment = employeeAssignments.find(
                      (item) => Number(item.employee_id) === Number(employeeId),
                    );

                    const expanded =
                      Number(expandedEmployee) === Number(employeeId);

                    const name =
                      employee.name ||
                      employee.full_name ||
                      employee.username ||
                      `موظف #${employeeId}`;

                    const email = employee.email || "";

                    const stages = getTaskStages(assigningTask);

                    const selectedStageIds = Array.isArray(
                      assignment?.stage_ids,
                    )
                      ? assignment.stage_ids.map(Number)
                      : [];

                    return (
                      <div
                        key={employeeId}
                        className={`assignment-employee-card ${
                          selected ? "selected" : ""
                        } ${expanded ? "expanded" : ""}`}
                      >
                        {/* EMPLOYEE HEADER */}

                        <div
                          className="assignment-employee-header"
                          onClick={() => {
                            if (selected) {
                              setExpandedEmployee((prev) =>
                                Number(prev) === Number(employeeId)
                                  ? null
                                  : Number(employeeId),
                              );
                            } else {
                              addEmployeeAssignment(employeeId);
                            }
                          }}
                        >
                          <div className="assignment-employee-main">
                            <button
                              type="button"
                              className={`employee-select-checkbox ${
                                selected ? "checked" : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEmployee(employeeId);
                              }}
                              disabled={saving}
                            >
                              {selected && "✓"}
                            </button>

                            <div className="employee-check-avatar">
                              {name.charAt(0).toUpperCase()}
                            </div>

                            <div className="employee-check-info">
                              <span className="employee-check-name">
                                {name}
                              </span>

                              {email && (
                                <span className="employee-check-email">
                                  {email}
                                </span>
                              )}
                            </div>
                          </div>

                          {selected && (
                            <div className="assignment-employee-right">
                              <span
                                className={`assignment-type-summary ${
                                  assignment?.assignment_type === "stage"
                                    ? "stage-type"
                                    : "task-type"
                                }`}
                              >
                                {assignment?.assignment_type === "stage"
                                  ? getAssignmentText(assignment)
                                  : "المهمة كاملة"}
                              </span>

                              <button
                                type="button"
                                className="expand-assignment-btn"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setExpandedEmployee((prev) =>
                                    Number(prev) === Number(employeeId)
                                      ? null
                                      : Number(employeeId),
                                  );
                                }}
                              >
                                {expanded ? <FaChevronUp /> : <FaChevronDown />}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* ASSIGNMENT OPTIONS */}

                        {selected && expanded && (
                          <div className="employee-assignment-options">
                            {/* TYPE HEADER */}

                            <div className="assignment-type-title">
                              <div className="assignment-type-title-icon">
                                <FaUserCheck />
                              </div>

                              <div>
                                <strong>نوع التعيين</strong>
                                <span>حدد نطاق مسؤولية الموظف</span>
                              </div>
                            </div>

                            {/* FULL TASK */}

                            <button
                              type="button"
                              className={`assignment-type-option ${
                                assignment?.assignment_type === "task"
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                changeAssignmentType(employeeId, "task")
                              }
                              disabled={saving}
                            >
                              <div className="assignment-option-radio">
                                {assignment?.assignment_type === "task" && "✓"}
                              </div>

                              <div className="assignment-option-icon full">
                                <FaTasks />
                              </div>

                              <div className="assignment-option-content">
                                <strong>المهمة كاملة</strong>

                                <span>الموظف مسؤول عن جميع مراحل المهمة</span>
                              </div>
                            </button>

                            {/* SELECTED STAGES */}

                            <button
                              type="button"
                              className={`assignment-type-option ${
                                assignment?.assignment_type === "stage"
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                changeAssignmentType(employeeId, "stage")
                              }
                              disabled={saving}
                            >
                              <div className="assignment-option-radio">
                                {assignment?.assignment_type === "stage" && "✓"}
                              </div>

                              <div className="assignment-option-icon stages">
                                <FaListOl />
                              </div>

                              <div className="assignment-option-content">
                                <strong>مراحل محددة</strong>

                                <span>
                                  اختر فقط المراحل التي سيعمل عليها الموظف
                                </span>
                              </div>
                            </button>

                            {/* STAGE SELECTOR */}

                            {assignment?.assignment_type === "stage" && (
                              <div className="stage-selection-box">
                                <div className="stage-selection-header">
                                  <div>
                                    <strong>اختر المراحل</strong>

                                    <span>
                                      تم اختيار <b>{selectedStageIds.length}</b>{" "}
                                      من {stages.length}
                                    </span>
                                  </div>

                                  <div className="stage-selection-actions">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        selectAllStagesForEmployee(employeeId)
                                      }
                                      disabled={saving}
                                    >
                                      تحديد الكل
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        clearStagesForEmployee(employeeId)
                                      }
                                      disabled={saving}
                                    >
                                      إلغاء الكل
                                    </button>
                                  </div>
                                </div>

                                <div className="stage-selection-list">
                                  {stages.map((stage, index) => {
                                    const stageId = getStageId(stage);

                                    if (
                                      stageId === null ||
                                      stageId === undefined
                                    ) {
                                      return null;
                                    }

                                    const checked = selectedStageIds.includes(
                                      Number(stageId),
                                    );

                                    return (
                                      <label
                                        key={stageId}
                                        className={`stage-selection-item ${
                                          checked ? "selected" : ""
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() =>
                                            toggleEmployeeStage(
                                              employeeId,
                                              stageId,
                                            )
                                          }
                                          disabled={saving}
                                        />

                                        <span className="stage-selection-checkbox">
                                          {checked && "✓"}
                                        </span>

                                        <span className="stage-selection-number">
                                          {index + 1}
                                        </span>

                                        <span className="stage-selection-content">
                                          <strong>
                                            {stage.title ||
                                              stage.name ||
                                              `المرحلة ${index + 1}`}
                                          </strong>

                                          {stage.due_date && (
                                            <small>
                                              <FaCalendarAlt />
                                              {formatDate(stage.due_date)}
                                            </small>
                                          )}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* REMOVE */}

                            <button
                              type="button"
                              className="remove-assignment-btn"
                              onClick={() =>
                                removeEmployeeAssignment(employeeId)
                              }
                              disabled={saving}
                            >
                              <FaTimes />
                              إزالة الموظف من التعيين
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* =================================================
          FIXED FOOTER
      ================================================= */}

            <div className="assign-modal-footer">
              <div className="selected-footer-info">
                <div className="selected-footer-icon">
                  <FaUserCheck />
                </div>

                <div>
                  <span>الموظفون المختارون</span>

                  <strong>{employeeAssignments.length}</strong>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeAssignModal}
                  disabled={saving}
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  className="save-btn assign-save-btn"
                  onClick={assignTask}
                  disabled={saving || employeeAssignments.length === 0}
                >
                  {saving ? (
                    <>
                      <span className="assign-button-loader" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      حفظ التعيين
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MESSAGE MODAL
      ====================================================== */}

      {messageModal.open && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeMessage();
            }
          }}
        >
          <div
            className="message-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={`message-modal-icon ${messageModal.type}`}>
              {messageModal.type === "success"
                ? "✓"
                : messageModal.type === "error"
                  ? "!"
                  : "⚠"}
            </div>

            <h3>{messageModal.title}</h3>

            <p>{messageModal.message}</p>

            <button type="button" className="save-btn" onClick={closeMessage}>
              حسناً
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
