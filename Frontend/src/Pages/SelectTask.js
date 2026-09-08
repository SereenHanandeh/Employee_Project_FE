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

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // مهمة التعيين الحالية
  const [assigningTask, setAssigningTask] = useState(null);

  // الموظفون المختارون للمهمة
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // البحث داخل الموظفين
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Popup المراحل
  const [stageModal, setStageModal] = useState({
    open: false,
    task: null,
  });

  // رسالة الخطأ/النجاح
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
  // MESSAGE MODAL
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

    return (
      employee.employee_id ??
      employee.id ??
      employee.user_id ??
      null
    );
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
        (item) =>
          Number(getEmployeeId(item)) === Number(employeeId)
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
    [employees, getEmployeeId]
  );

  // =========================================================
  // GET TASK EMPLOYEE IDS
  // =========================================================

  const getTaskEmployeeIds = useCallback(
    (task) => {
      if (!task) return [];

      // الشكل الجديد
      if (Array.isArray(task.employee_ids)) {
        return [
          ...new Set(
            task.employee_ids
              .map(Number)
              .filter(
                (id) =>
                  Number.isInteger(id) && id > 0
              )
          ),
        ];
      }

      // employees array
      if (Array.isArray(task.employees)) {
        return [
          ...new Set(
            task.employees
              .map((employee) =>
                Number(getEmployeeId(employee))
              )
              .filter(
                (id) =>
                  Number.isInteger(id) && id > 0
              )
          ),
        ];
      }

      // النظام القديم
      if (
        task.employee_id !== null &&
        task.employee_id !== undefined &&
        task.employee_id !== ""
      ) {
        const id = Number(task.employee_id);

        if (
          Number.isInteger(id) &&
          id > 0
        ) {
          return [id];
        }
      }

      return [];
    },
    [getEmployeeId]
  );

  // =========================================================
  // GET TASK EMPLOYEES
  // =========================================================

  const getTaskEmployees = useCallback(
    (task) => {
      const ids = getTaskEmployeeIds(task);

      return ids.map((id) => {
        const employee = employees.find(
          (item) =>
            Number(getEmployeeId(item)) === Number(id)
        );

        const taskEmployee = Array.isArray(
          task?.employees
        )
          ? task.employees.find(
              (item) =>
                Number(getEmployeeId(item)) ===
                Number(id)
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
    [
      employees,
      getEmployeeId,
      getTaskEmployeeIds,
    ]
  );

  // =========================================================
  // GET TASK STAGES
  // =========================================================

  const getTaskStages = useCallback((task) => {
    if (!task || !Array.isArray(task.stages)) {
      return [];
    }

    return [...task.stages].sort(
      (a, b) =>
        Number(a.stage_order || 0) -
        Number(b.stage_order || 0)
    );
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

      const completed = stages.filter(
        isStageCompleted
      ).length;

      const percentage =
        total > 0
          ? Math.round((completed / total) * 100)
          : 0;

      return {
        total,
        completed,
        percentage,
      };
    },
    [getTaskStages, isStageCompleted]
  );

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "غير محدد";

    return new Date(date).toLocaleDateString(
      "ar-SA",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
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

    const month = String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      parsedDate.getDate()
    ).padStart(2, "0");

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
        employee?.task_status === "completed"
    ).length;

    if (
      completedCount === taskEmployees.length &&
      taskEmployees.length > 0
    ) {
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
  // STAGE MODAL
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
        } else if (
          Array.isArray(task.employees)
        ) {
          employeeIds = task.employees
            .map((employee) =>
              Number(getEmployeeId(employee))
            )
            .filter(
              (id) =>
                Number.isInteger(id) && id > 0
            );
        } else if (
          task.employee_id !== null &&
          task.employee_id !== undefined &&
          task.employee_id !== ""
        ) {
          const id = Number(task.employee_id);

          if (
            Number.isInteger(id) &&
            id > 0
          ) {
            employeeIds = [id];
          }
        }

        employeeIds = [
          ...new Set(
            employeeIds
              .map(Number)
              .filter(
                (id) =>
                  Number.isInteger(id) && id > 0
              )
          ),
        ];

        return {
          ...task,

          employee_ids: employeeIds,

          employee_id:
            employeeIds.length > 0
              ? employeeIds[0]
              : null,

          due_date:
            task.due_date ||
            task.deadline ||
            null,

          stages: Array.isArray(task.stages)
            ? task.stages
            : [],
        };
      });

      setTasks(normalizedTasks);
    } catch (error) {
      console.error(
        "FETCH TASKS ERROR:",
        error
      );

      showMessage(
        "error",
        "خطأ",
        error?.response?.data?.message ||
          "تعذر تحميل المهام."
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
      const res = await API.get(
        "/tasks/employees"
      );

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.employees)
        ? res.data.employees
        : [];

      setEmployees(data);
    } catch (error) {
      console.error(
        "FETCH EMPLOYEES ERROR:",
        error
      );
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchTasks(),
        fetchEmployees(),
      ]);
    };

    loadData();
  }, [fetchTasks, fetchEmployees]);

  // =========================================================
  // FILTER TASKS
  // =========================================================

  const filteredTasks = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return tasks;
    }

    return tasks.filter((task) => {
      const title = String(
        task.title || ""
      ).toLowerCase();

      const description = String(
        task.description || ""
      ).toLowerCase();

      const employeeNames =
        getTaskEmployees(task)
          .map(
            (employee) =>
              employee.name ||
              employee.full_name ||
              employee.username ||
              ""
          )
          .join(" ")
          .toLowerCase();

      const stageNames =
        getTaskStages(task)
          .map(
            (stage) =>
              stage.title ||
              stage.name ||
              ""
          )
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
    getTaskEmployees,
    getTaskStages,
  ]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalTasks = tasks.length;

  const assignedTasks = tasks.filter(
    (task) =>
      getTaskEmployeeIds(task).length > 0
  ).length;

  const unassignedTasks =
    totalTasks - assignedTasks;

  const completedTasks = tasks.filter(
    (task) =>
      getTaskOverallStatus(task)
        .className === "completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) =>
      getTaskOverallStatus(task)
        .className === "pending"
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

  const handleStageChange = (
    index,
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,

      stages: prev.stages.map(
        (stage, stageIndex) =>
          stageIndex === index
            ? {
                ...stage,
                [field]: value,
              }
            : stage
      ),
    }));
  };

  // =========================================================
  // ADD STAGE
  // =========================================================

  const addStage = () => {
    setForm((prev) => ({
      ...prev,

      stages: [
        ...prev.stages,
        emptyStage(),
      ],
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
        "يجب أن تحتوي المهمة على مرحلة واحدة على الأقل."
      );

      return;
    }

    setForm((prev) => ({
      ...prev,

      stages: prev.stages.filter(
        (_, stageIndex) =>
          stageIndex !== index
      ),
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

    const taskStages =
      getTaskStages(task);

    setForm({
      title: task.title || "",
      description: task.description || "",

      due_date:
        formatDateForInput(
          task.due_date
        ),

      stages:
        taskStages.length > 0
          ? taskStages.map((stage) => ({
              title: stage.title || "",
              description:
                stage.description || "",
              due_date:
                formatDateForInput(
                  stage.due_date
                ),
            }))
          : [emptyStage()],
    });

    setShowModal(true);
  };

  // =========================================================
  // CLOSE ADD / EDIT MODAL
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
      showMessage(
        "warning",
        "عنوان المهمة مطلوب",
        "يرجى إدخال عنوان المهمة."
      );

      return false;
    }

    if (!form.due_date) {
      showMessage(
        "warning",
        "تاريخ المهمة مطلوب",
        "يرجى تحديد تاريخ استحقاق المهمة."
      );

      return false;
    }

    if (
      !Array.isArray(form.stages) ||
      form.stages.length === 0
    ) {
      showMessage(
        "warning",
        "المراحل مطلوبة",
        "يجب إضافة مرحلة واحدة على الأقل."
      );

      return false;
    }

    for (
      let i = 0;
      i < form.stages.length;
      i++
    ) {
      const stage = form.stages[i];

      if (!stage.title.trim()) {
        showMessage(
          "warning",
          `اسم المرحلة ${i + 1} مطلوب`,
          `يرجى إدخال اسم المرحلة رقم ${
            i + 1
          }.`
        );

        return false;
      }

      if (!stage.due_date) {
        showMessage(
          "warning",
          `تاريخ المرحلة ${i + 1} مطلوب`,
          `يرجى تحديد تاريخ استحقاق المرحلة رقم ${
            i + 1
          }.`
        );

        return false;
      }

      if (
        stage.due_date >
        form.due_date
      ) {
        showMessage(
          "warning",
          "تاريخ المرحلة غير صحيح",
          `تاريخ المرحلة ${
            i + 1
          } لا يمكن أن يكون بعد تاريخ استحقاق المهمة.`
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

      description:
        form.description.trim(),

      due_date: form.due_date,

      stages: form.stages.map(
        (stage, index) => ({
          title: stage.title.trim(),

          description:
            stage.description?.trim() || "",

          due_date: stage.due_date,

          stage_order: index + 1,
        })
      ),
    };

    console.log(
      "================================="
    );

    console.log(
      "SAVE TASK PAYLOAD:",
      JSON.stringify(
        taskData,
        null,
        2
      )
    );

    console.log(
      "================================="
    );

    try {
      setSaving(true);

      if (editingTask) {
        // ===================================================
        // UPDATE
        // ===================================================

        const res = await API.put(
          `/tasks/${editingTask.task_id}`,
          taskData
        );

        const updatedTask =
          res.data?.task || res.data;

        setTasks((prev) =>
          prev.map((task) => {
            if (
              Number(task.task_id) !==
              Number(
                editingTask.task_id
              )
            ) {
              return task;
            }

            return {
              ...task,

              ...updatedTask,

              task_id:
                updatedTask?.task_id ??
                task.task_id,

              due_date:
                updatedTask?.due_date ??
                taskData.due_date,

              stages:
                updatedTask?.stages ??
                taskData.stages ??
                [],
            };
          })
        );

        closeModal();

        showMessage(
          "success",
          "تم تعديل المهمة",
          "تم حفظ تعديلات المهمة والمراحل بنجاح."
        );
      } else {
        // ===================================================
        // CREATE
        // ===================================================

        const res = await API.post(
          "/tasks",
          taskData
        );

        const newTask =
          res.data?.task || res.data;

        if (newTask) {
          setTasks((prev) => [
            {
              ...newTask,

              employee_ids: [],

              employee_id: null,

              due_date:
                newTask.due_date ??
                taskData.due_date,

              stages:
                Array.isArray(
                  res.data?.stages
                )
                  ? res.data.stages
                  : Array.isArray(
                      newTask.stages
                    )
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
          `تمت إضافة المهمة بنجاح مع ${taskData.stages.length} مرحلة.`
        );
      }
    } catch (error) {
      console.error(
        "SAVE TASK ERROR:",
        error
      );

      console.error(
        "STATUS:",
        error?.response?.status
      );

      console.error(
        "SERVER DATA:",
        error?.response?.data
      );

      showMessage(
        "error",
        "تعذر حفظ المهمة",
        error?.response?.data?.message ||
          "حدث خطأ أثناء حفظ المهمة."
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

    const confirmed =
      window.confirm(
        `هل أنت متأكد من حذف المهمة "${task.title}"؟`
      );

    if (!confirmed) return;

    try {
      setSaving(true);

      await API.delete(
        `/tasks/${task.task_id}`
      );

      setTasks((prev) =>
        prev.filter(
          (item) =>
            Number(item.task_id) !==
            Number(task.task_id)
        )
      );

      if (
        stageModal.task &&
        Number(
          stageModal.task.task_id
        ) === Number(task.task_id)
      ) {
        closeStageModal();
      }

      showMessage(
        "success",
        "تم حذف المهمة",
        "تم حذف المهمة بنجاح."
      );
    } catch (error) {
      console.error(
        "DELETE TASK ERROR:",
        error
      );

      showMessage(
        "error",
        "تعذر حذف المهمة",
        error?.response?.data?.message ||
          "حدث خطأ أثناء حذف المهمة."
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

    const currentEmployeeIds =
      getTaskEmployeeIds(task);

    setAssigningTask(task);

    setSelectedEmployees(
      currentEmployeeIds.map(String)
    );

    setEmployeeSearch("");
  };

  // =========================================================
  // CLOSE ASSIGN MODAL
  // =========================================================

  const closeAssignModal = () => {
    if (saving) return;

    setAssigningTask(null);
    setSelectedEmployees([]);
    setEmployeeSearch("");
  };

  // =========================================================
  // TOGGLE EMPLOYEE
  // =========================================================

  const toggleEmployee = (employeeId) => {
    const id = String(employeeId);

    setSelectedEmployees((prev) => {
      if (prev.includes(id)) {
        return prev.filter(
          (item) => item !== id
        );
      }

      return [...prev, id];
    });
  };

  // =========================================================
  // SELECT ALL EMPLOYEES
  // =========================================================

  const selectAllEmployees = () => {
    const allIds = employees
      .map((employee) =>
        getEmployeeId(employee)
      )
      .filter(
        (id) =>
          id !== null &&
          id !== undefined
      )
      .map(String);

    setSelectedEmployees(allIds);
  };

  // =========================================================
  // CLEAR EMPLOYEES
  // =========================================================

  const clearSelectedEmployees = () => {
    setSelectedEmployees([]);
  };

  // =========================================================
  // FILTER EMPLOYEES
  // =========================================================

  const filteredEmployees = useMemo(() => {
    const value = employeeSearch
      .trim()
      .toLowerCase();

    if (!value) {
      return employees;
    }

    return employees.filter(
      (employee) => {
        const id = String(
          getEmployeeId(employee) || ""
        ).toLowerCase();

        const name = String(
          employee.name ||
            employee.full_name ||
            employee.username ||
            ""
        ).toLowerCase();

        const email = String(
          employee.email || ""
        ).toLowerCase();

        return (
          name.includes(value) ||
          email.includes(value) ||
          id.includes(value)
        );
      }
    );
  }, [
    employees,
    employeeSearch,
    getEmployeeId,
  ]);

  // =========================================================
  // ASSIGN TASK
  // =========================================================

  const assignTask = async () => {
    if (saving) return;

    if (!assigningTask) return;

    const taskId = Number(
      assigningTask.task_id
    );

    const employeeIds = [
      ...new Set(
        selectedEmployees
          .map(Number)
          .filter(
            (id) =>
              Number.isInteger(id) &&
              id > 0
          )
      ),
    ];

    if (
      !Number.isInteger(taskId) ||
      taskId <= 0
    ) {
      return;
    }

    if (employeeIds.length === 0) {
      showMessage(
        "warning",
        "لم يتم اختيار موظفين",
        "يرجى اختيار موظف واحد على الأقل."
      );

      return;
    }

    try {
      setSaving(true);

      const res = await API.post(
        "/tasks/assign",
        {
          employee_ids: employeeIds,
          task_id: taskId,
        }
      );

      const returnedEmployees =
        Array.isArray(
          res.data?.employees
        )
          ? res.data.employees
          : employeeIds.map((id) => {
              const employee =
                employees.find(
                  (item) =>
                    Number(
                      getEmployeeId(item)
                    ) === Number(id)
                );

              return (
                employee || {
                  employee_id: id,
                  name: `موظف #${id}`,
                  status: "pending",
                }
              );
            });

      const normalizedEmployees =
        returnedEmployees.map(
          (employee) => ({
            ...employee,

            status:
              employee.status ||
              "pending",
          })
        );

      setTasks((prev) =>
        prev.map((task) => {
          if (
            Number(task.task_id) !==
            taskId
          ) {
            return task;
          }

          return {
            ...task,

            employee_ids:
              employeeIds,

            employee_id:
              employeeIds.length > 0
                ? employeeIds[0]
                : null,

            employees:
              normalizedEmployees,
          };
        })
      );

      setStageModal((prev) => {
        if (
          !prev.open ||
          !prev.task ||
          Number(
            prev.task.task_id
          ) !== taskId
        ) {
          return prev;
        }

        return {
          ...prev,

          task: {
            ...prev.task,

            employee_ids:
              employeeIds,

            employee_id:
              employeeIds.length > 0
                ? employeeIds[0]
                : null,

            employees:
              normalizedEmployees,
          },
        };
      });

      closeAssignModal();

      showMessage(
        "success",
        "تم تعيين الموظفين",
        `تم تعيين المهمة لـ ${employeeIds.length} موظف بنجاح.`
      );
    } catch (error) {
      console.error(
        "ASSIGN TASK ERROR:",
        error
      );

      console.error(
        "SERVER DATA:",
        error?.response?.data
      );

      showMessage(
        "error",
        "تعذر تعيين الموظفين",
        error?.response?.data?.message ||
          "حدث خطأ أثناء تعيين الموظفين."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="select-task-page"
      dir="rtl"
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="page-header">
        <div>
          <h1>إدارة المهام</h1>

          <p>
            إنشاء المهام وإضافة مراحلها
            وتعيينها للموظفين
          </p>
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
        <div className="stat-card">
          <div className="stat-icon">
            📋
          </div>

          <div>
            <span>إجمالي المهام</span>
            <strong>{totalTasks}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            👥
          </div>

          <div>
            <span>المهام المعينة</span>
            <strong>{assignedTasks}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            ⏳
          </div>

          <div>
            <span>قيد التنفيذ</span>
            <strong>{pendingTasks}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            ✅
          </div>

          <div>
            <span>المهام المكتملة</span>
            <strong>{completedTasks}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            🌐
          </div>

          <div>
            <span>متاحة للجميع</span>
            <strong>{unassignedTasks}</strong>
          </div>
        </div>
      </div>

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
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="clear-search"
            >
              ×
            </button>
          )}
        </div>

        <div className="results-count">
          عرض{" "}
          <strong>
            {filteredTasks.length}
          </strong>{" "}
          من {tasks.length} مهمة
        </div>
      </div>

      {/* =====================================================
          LOADING / EMPTY
      ====================================================== */}

      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>

          <p>
            جاري تحميل المهام...
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            📋
          </div>

          <h3>
            {search
              ? "لا توجد نتائج"
              : "لا توجد مهام"}
          </h3>

          <p>
            {search
              ? "جرّب البحث باستخدام كلمة أخرى"
              : "قم بإضافة أول مهمة من زر إضافة مهمة"}
          </p>

          {!search && (
            <button
              className="add-task-btn"
              onClick={openAddModal}
            >
              ＋ إضافة مهمة
            </button>
          )}
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => {
            const taskEmployees =
              getTaskEmployees(task);

            const employeeCount =
              getTaskEmployeeIds(task)
                .length;

            const isAssigned =
              employeeCount > 0;

            const overallStatus =
              getTaskOverallStatus(task);

            const stageProgress =
              getStageProgress(task);

            const hasStages =
              stageProgress.total > 0;

            return (
              <div
                className={`task-card ${
                  hasStages
                    ? "task-card-clickable"
                    : ""
                }`}
                key={task.task_id}
                role={
                  hasStages
                    ? "button"
                    : undefined
                }
                tabIndex={
                  hasStages ? 0 : undefined
                }
                onClick={() => {
                  if (hasStages) {
                    openStageModal(task);
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    hasStages &&
                    (e.key === "Enter" ||
                      e.key === " ")
                  ) {
                    e.preventDefault();

                    openStageModal(task);
                  }
                }}
              >
                {/* CLICK HINT */}

                {hasStages && (
                  <div className="task-card-click-hint">
                    <FaListOl />

                    <span>
                      اضغط لعرض المراحل
                    </span>
                  </div>
                )}

                {/* CARD HEADER */}

                <div className="task-card-header">
                  <div className="task-number">
                    #{task.task_id}
                  </div>

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
                    <p className="task-description">
                      {task.description}
                    </p>
                  ) : (
                    <p className="task-description muted">
                      لا يوجد وصف للمهمة
                    </p>
                  )}

                  {/* STAGES SUMMARY */}

                  {hasStages && (
                    <div className="task-stages-summary">
                      <div className="stages-summary-header">
                        <div className="stages-summary-title">
                          <FaTasks />

                          <span>
                            مراحل المهمة
                          </span>
                        </div>

                        <strong>
                          {
                            stageProgress.completed
                          }
                          {" / "}
                          {
                            stageProgress.total
                          }
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
                        <span>
                          {
                            stageProgress.percentage
                          }
                          % مكتمل
                        </span>

                        {stageProgress.completed ===
                          stageProgress.total && (
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
                        <span>
                          تاريخ الاستحقاق
                        </span>

                        <strong>
                          {formatDate(
                            task.due_date
                          )}
                        </strong>
                      </div>
                    </div>

                    <div
                      className={`task-overall-status ${overallStatus.className}`}
                    >
                      {
                        overallStatus.icon
                      }

                      <span>
                        {
                          overallStatus.text
                        }
                      </span>
                    </div>
                  </div>

                  {/* EMPLOYEES */}

                  <div className="task-employees-section">
                    <div className="section-title">
                      <span>👥</span>

                      <span>
                        الموظفون
                      </span>

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

                        <span>
                          المهمة متاحة لجميع الموظفين
                        </span>
                      </div>
                    ) : (
                      <div className="assigned-employees">
                        {taskEmployees.map(
                          (
                            employee,
                            index
                          ) => {
                            const employeeId =
                              getEmployeeId(
                                employee
                              );

                            const name =
                              employee.name ||
                              employee.full_name ||
                              employee.username ||
                              `موظف #${employeeId}`;

                            const employeeStatus =
                              getEmployeeTaskStatus(
                                employee
                              );

                            return (
                              <div
                                className="employee-chip"
                                key={`${employeeId}-${index}`}
                              >
                                <span className="employee-avatar">
                                  {name
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </span>

                                <span className="employee-name">
                                  {name}
                                </span>

                                <span
                                  className={`employee-task-status ${employeeStatus.className}`}
                                  title={
                                    employeeStatus.text
                                  }
                                >
                                  {
                                    employeeStatus.icon
                                  }

                                  {
                                    employeeStatus.text
                                  }
                                </span>
                              </div>
                            );
                          }
                        )}
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
                    <span>
                      {isAssigned
                        ? "✓"
                        : "🌐"}
                    </span>

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
                    👥{" "}
                    {isAssigned
                      ? "تعديل الموظفين"
                      : "تعيين موظفين"}
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

      {stageModal.open &&
        stageModal.task && (
          <div
            className="modal-overlay stage-modal-overlay"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                closeStageModal();
              }
            }}
          >
            <div
              className="stage-modal"
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >
              {(() => {
                const task =
                  stageModal.task;

                const stages =
                  getTaskStages(task);

                const progress =
                  getStageProgress(task);

                const taskEmployees =
                  getTaskEmployees(task);

                return (
                  <>
                    {/* HEADER */}

                    <div className="stage-modal-header">
                      <div className="stage-modal-title-area">
                        <div className="stage-modal-icon">
                          <FaTasks />
                        </div>

                        <div>
                          <span className="stage-modal-task-number">
                            المهمة #
                            {task.task_id}
                          </span>

                          <h2>
                            {task.title}
                          </h2>

                          {task.description && (
                            <p>
                              {
                                task.description
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="stage-modal-close"
                        onClick={
                          closeStageModal
                        }
                        aria-label="إغلاق"
                      >
                        <FaTimes />
                      </button>
                    </div>

                    {/* INFORMATION */}

                    <div className="stage-modal-info">
                      <div className="stage-info-item">
                        <FaCalendarAlt />

                        <div>
                          <span>
                            تاريخ الاستحقاق
                          </span>

                          <strong>
                            {formatDate(
                              task.due_date
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="stage-info-item">
                        <FaUserFriends />

                        <div>
                          <span>
                            الموظفون
                          </span>

                          <strong>
                            {
                              taskEmployees.length
                            }
                          </strong>
                        </div>
                      </div>

                      <div className="stage-info-item">
                        <FaListOl />

                        <div>
                          <span>
                            المراحل
                          </span>

                          <strong>
                            {
                              progress.completed
                            }
                            {" / "}
                            {
                              progress.total
                            }
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* PROGRESS */}

                    <div className="stage-modal-progress">
                      <div className="stage-modal-progress-header">
                        <div>
                          <strong>
                            تقدم المهمة
                          </strong>

                          <span>
                            {
                              progress.completed
                            }{" "}
                            من{" "}
                            {
                              progress.total
                            }{" "}
                            مراحل مكتملة
                          </span>
                        </div>

                        <strong className="stage-modal-percentage">
                          {
                            progress.percentage
                          }
                          %
                        </strong>
                      </div>

                      <div className="stage-modal-progress-track">
                        <div
                          className="stage-modal-progress-fill"
                          style={{
                            width: `${progress.percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* STAGES */}

                    <div className="stages-list-wrapper">
                      <div className="stages-list-title">
                        <FaListOl />

                        <div>
                          <h3>
                            مراحل المهمة
                          </h3>

                          <span>
                            يجب إنجاز جميع
                            المراحل لإكمال
                            المهمة
                          </span>
                        </div>
                      </div>

                      {stages.length ===
                      0 ? (
                        <div className="no-stages">
                          <div className="no-stages-icon">
                            <FaListOl />
                          </div>

                          <h4>
                            لا توجد مراحل
                          </h4>

                          <p>
                            هذه المهمة لا
                            تحتوي على مراحل
                            حتى الآن.
                          </p>
                        </div>
                      ) : (
                        <div className="stages-list">
                          {stages.map(
                            (
                              stage,
                              index
                            ) => {
                              const completed =
                                isStageCompleted(
                                  stage
                                );

                              return (
                                <div
                                  key={
                                    stage.stage_id ||
                                    stage.id ||
                                    index
                                  }
                                  className={`stage-item ${
                                    completed
                                      ? "completed"
                                      : ""
                                  }`}
                                >
                                  <div
                                    className={`stage-checkbox ${
                                      completed
                                        ? "checked"
                                        : ""
                                    }`}
                                  >
                                    {completed &&
                                      "✓"}
                                  </div>

                                  <div className="stage-number">
                                    {index +
                                      1}
                                  </div>

                                  <div className="stage-content">
                                    <div className="stage-content-top">
                                      <h4>
                                        {stage.title ||
                                          stage.name ||
                                          `المرحلة ${
                                            index +
                                            1
                                          }`}
                                      </h4>

                                      {completed ? (
                                        <span className="stage-status-badge completed">
                                          <FaCheckCircle />
                                          مكتملة
                                        </span>
                                      ) : (
                                        <span className="stage-status-badge pending">
                                          <FaClock />
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

                                    {stage.due_date && (
                                      <div className="stage-due-date">
                                        <FaCalendarAlt />

                                        <span>
                                          الاستحقاق:
                                        </span>

                                        <strong>
                                          {formatDate(
                                            stage.due_date
                                          )}
                                        </strong>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>

                    {/* FOOTER */}

                    <div className="stage-modal-footer">
                      {progress.total >
                        0 &&
                      progress.completed ===
                        progress.total ? (
                        <div className="stage-complete-message">
                          <FaCheckCircle />

                          <span>
                            تم إنجاز جميع
                            مراحل المهمة
                          </span>
                        </div>
                      ) : (
                        <div className="stage-pending-message">
                          <FaHourglassHalf />

                          <span>
                            تبقى{" "}
                            {progress.total -
                              progress.completed}{" "}
                            مرحلة لإكمال
                            المهمة
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        className="stage-modal-close-btn"
                        onClick={
                          closeStageModal
                        }
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
            if (
              e.target ===
              e.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="task-modal task-modal-large"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            {/* HEADER */}

            <div className="modal-header">
              <div>
                <h2>
                  {editingTask
                    ? "تعديل المهمة"
                    : "إضافة مهمة جديدة"}
                </h2>

                <p>
                  أدخل بيانات المهمة
                  وأضف مراحلها
                </p>
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

            <form
              onSubmit={saveTask}
            >
              {/* TITLE */}

              <div className="form-group">
                <label>
                  عنوان المهمة
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={
                    handleFormChange
                  }
                  placeholder="مثال: إعداد التقرير الشهري"
                  disabled={saving}
                  autoFocus
                />
              </div>

              {/* DESCRIPTION */}

              <div className="form-group">
                <label>
                  وصف المهمة
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="اكتب وصف المهمة هنا..."
                  rows={4}
                  disabled={saving}
                />
              </div>

              {/* TASK DUE DATE */}

              <div className="form-group">
                <label>
                  تاريخ استحقاق المهمة
                </label>

                <div className="date-input-wrapper">
                  <FaCalendarAlt />

                  <input
                    type="date"
                    name="due_date"
                    value={
                      form.due_date
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={saving}
                  />
                </div>

                <small className="form-help-text">
                  التاريخ النهائي الذي يجب
                  إنجاز المهمة قبله.
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

                    <p>
                      أضف المراحل التي يجب
                      إنجازها لإكمال المهمة.
                    </p>
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
                  {form.stages.map(
                    (
                      stage,
                      index
                    ) => (
                      <div
                        className="stage-form-card"
                        key={index}
                      >
                        <div className="stage-form-card-header">
                          <div className="stage-form-number">
                            {index + 1}
                          </div>

                          <div>
                            <strong>
                              المرحلة{" "}
                              {index + 1}
                            </strong>

                            <span>
                              بيانات المرحلة
                            </span>
                          </div>

                          <button
                            type="button"
                            className="remove-stage-btn"
                            onClick={() =>
                              removeStage(
                                index
                              )
                            }
                            disabled={
                              saving ||
                              form.stages
                                .length ===
                                1
                            }
                            title="حذف المرحلة"
                          >
                            <FaTrash />
                          </button>
                        </div>

                        <div className="stage-form-grid">
                          <div className="form-group">
                            <label>
                              اسم المرحلة
                            </label>

                            <input
                              type="text"
                              value={
                                stage.title
                              }
                              onChange={(e) =>
                                handleStageChange(
                                  index,
                                  "title",
                                  e.target
                                    .value
                                )
                              }
                              placeholder="مثال: جمع البيانات"
                              disabled={
                                saving
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>
                              تاريخ استحقاق
                              المرحلة
                            </label>

                            <div className="date-input-wrapper">
                              <FaCalendarAlt />

                              <input
                                type="date"
                                value={
                                  stage.due_date
                                }
                                max={
                                  form.due_date ||
                                  undefined
                                }
                                onChange={(e) =>
                                  handleStageChange(
                                    index,
                                    "due_date",
                                    e.target
                                      .value
                                  )
                                }
                                disabled={
                                  saving
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-group stage-description-group">
                          <label>
                            وصف المرحلة
                          </label>

                          <textarea
                            value={
                              stage.description
                            }
                            onChange={(e) =>
                              handleStageChange(
                                index,
                                "description",
                                e.target
                                  .value
                              )
                            }
                            placeholder="اكتب وصف المرحلة هنا..."
                            rows={3}
                            disabled={
                              saving
                            }
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* INFO */}

              <div className="form-note">
                💡 بعد إنشاء المهمة يمكنك
                استخدام زر{" "}
                <strong>
                  "تعيين موظفين"
                </strong>{" "}
                لاختيار موظف واحد أو عدة
                موظفين.
                <br />
                🌐 إذا لم يتم تعيين موظفين،
                تبقى المهمة متاحة لجميع
                الموظفين.
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
                  disabled={
                    saving ||
                    !form.title.trim() ||
                    !form.due_date
                  }
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
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeAssignModal();
            }
          }}
        >
          <div
            className="assign-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            {/* HEADER */}

            <div className="modal-header">
              <div>
                <h2>
                  تعيين موظفين للمهمة
                </h2>

                <p>
                  {assigningTask.title}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeAssignModal
                }
                disabled={saving}
              >
                ×
              </button>
            </div>

            {/* TASK DATE */}

            <div className="assign-task-date">
              <FaCalendarAlt />

              <div>
                <span>
                  تاريخ استحقاق المهمة
                </span>

                <strong>
                  {formatDate(
                    assigningTask.due_date
                  )}
                </strong>
              </div>
            </div>

            {/* SELECTED COUNT */}

            <div className="selected-employees-summary">
              <div className="selected-summary-icon">
                👥
              </div>

              <div>
                <span>
                  عدد الموظفين المختارين
                </span>

                <strong>
                  {
                    selectedEmployees.length
                  }
                </strong>
              </div>
            </div>

            {/* SEARCH */}

            <div className="employee-search-box">
              <span>🔎</span>

              <input
                type="text"
                value={
                  employeeSearch
                }
                onChange={(e) =>
                  setEmployeeSearch(
                    e.target.value
                  )
                }
                placeholder="ابحث عن اسم الموظف أو البريد..."
                disabled={saving}
              />

              {employeeSearch && (
                <button
                  type="button"
                  onClick={() =>
                    setEmployeeSearch("")
                  }
                >
                  ×
                </button>
              )}
            </div>

            {/* SELECT ALL */}

            <div className="employees-actions">
              <button
                type="button"
                onClick={
                  selectAllEmployees
                }
                disabled={
                  saving ||
                  employees.length === 0
                }
              >
                ☑ تحديد الكل
              </button>

              <button
                type="button"
                onClick={
                  clearSelectedEmployees
                }
                disabled={
                  saving ||
                  selectedEmployees.length ===
                    0
                }
              >
                ☐ إلغاء تحديد الكل
              </button>
            </div>

            {/* EMPLOYEES LIST */}

            <div className="employees-check-list">
              {filteredEmployees.length ===
              0 ? (
                <div className="no-employees-found">
                  <span>🔍</span>

                  <p>
                    لا يوجد موظفون مطابقون
                    للبحث
                  </p>
                </div>
              ) : (
                filteredEmployees.map(
                  (employee) => {
                    const employeeId =
                      getEmployeeId(
                        employee
                      );

                    if (
                      employeeId ===
                        null ||
                      employeeId ===
                        undefined
                    ) {
                      return null;
                    }

                    const id =
                      String(
                        employeeId
                      );

                    const checked =
                      selectedEmployees.includes(
                        id
                      );

                    const name =
                      employee.name ||
                      employee.full_name ||
                      employee.username ||
                      `موظف #${employeeId}`;

                    const email =
                      employee.email ||
                      "";

                    return (
                      <label
                        key={employeeId}
                        className={
                          checked
                            ? "employee-check-item selected"
                            : "employee-check-item"
                        }
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleEmployee(
                              employeeId
                            )
                          }
                          disabled={
                            saving
                          }
                        />

                        <span className="custom-checkbox">
                          {checked &&
                            "✓"}
                        </span>

                        <span className="employee-check-avatar">
                          {name
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <span className="employee-check-info">
                          <span className="employee-check-name">
                            {name}
                          </span>

                          {email && (
                            <span className="employee-check-email">
                              {email}
                            </span>
                          )}
                        </span>

                        {checked && (
                          <span className="employee-check-mark">
                            ✓
                          </span>
                        )}
                      </label>
                    );
                  }
                )
              )}
            </div>

            {/* FOOTER */}

            <div className="assign-modal-footer">
              <div className="selected-footer-text">
                {selectedEmployees.length ===
                0 ? (
                  "لم يتم اختيار أي موظف"
                ) : (
                  <>
                    تم اختيار{" "}
                    <strong>
                      {
                        selectedEmployees.length
                      }
                    </strong>{" "}
                    موظف
                  </>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    closeAssignModal
                  }
                  disabled={saving}
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  className="save-btn assign-save-btn"
                  onClick={
                    assignTask
                  }
                  disabled={
                    saving ||
                    selectedEmployees.length ===
                      0
                  }
                >
                  {saving
                    ? "جاري التعيين..."
                    : `تعيين لـ ${selectedEmployees.length} موظف`}
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
            if (
              e.target ===
              e.currentTarget
            ) {
              closeMessage();
            }
          }}
        >
          <div
            className="message-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div
              className={`message-modal-icon ${messageModal.type}`}
            >
              {messageModal.type ===
              "success"
                ? "✓"
                : messageModal.type ===
                  "error"
                ? "!"
                : "⚠"}
            </div>

            <h3>
              {messageModal.title}
            </h3>

            <p>
              {messageModal.message}
            </p>

            <button
              type="button"
              className="save-btn"
              onClick={
                closeMessage
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