import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../api/api";
import "./SelectTask.css";

export default function SelectTask() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Assign Modal
  const [assigningTask, setAssigningTask] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    employee_id: "",
  });

  // =========================================================
  // GET EMPLOYEE ID
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

  // =========================================================
  // GET EMPLOYEE NAME
  // =========================================================
  const getEmployeeName = useCallback(
    (employeeId) => {
      if (
        employeeId === null ||
        employeeId === undefined ||
        employeeId === ""
      ) {
        return "متاحة لجميع الموظفين";
      }

      const employee = employees.find(
        (item) =>
          Number(getEmployeeId(item)) === Number(employeeId)
      );

      return (
        employee?.name ||
        employee?.full_name ||
        employee?.username ||
        `موظف #${employeeId}`
      );
    },
    [employees, getEmployeeId]
  );

  // =========================================================
  // GET EMPLOYEE
  // =========================================================
  const getEmployee = useCallback(
    (employeeId) => {
      if (
        employeeId === null ||
        employeeId === undefined ||
        employeeId === ""
      ) {
        return null;
      }

      return (
        employees.find(
          (item) =>
            Number(getEmployeeId(item)) === Number(employeeId)
        ) || null
      );
    },
    [employees, getEmployeeId]
  );

  // =========================================================
  // FETCH TASKS
  // =========================================================
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get("/tasks");

      setTasks(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      console.error("FETCH TASKS ERROR:", err);

      alert(
        err?.response?.data?.message ||
          "فشل تحميل المهام"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // FETCH EMPLOYEES
  // =========================================================
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await API.get("/employees");

      setEmployees(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      console.error(
        "FETCH EMPLOYEES ERROR:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "فشل تحميل الموظفين"
      );
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [fetchTasks, fetchEmployees]);

  // =========================================================
  // FILTERED TASKS
  // =========================================================
  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tasks;
    }

    return tasks.filter((task) => {
      const employeeName = getEmployeeName(
        task.employee_id
      );

      const text = `
        ${task.title || ""}
        ${task.description || ""}
        ${employeeName || ""}
      `.toLowerCase();

      return text.includes(query);
    });
  }, [
    tasks,
    search,
    getEmployeeName,
  ]);

  // =========================================================
  // RESET FORM
  // =========================================================
  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      employee_id: "",
    });
  };

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================
  const openAddModal = () => {
    setEditingTask(null);
    resetForm();
    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================
  const openEditModal = (task) => {
    setEditingTask(task);

    setForm({
      title: task.title || "",
      description: task.description || "",
      employee_id:
        task.employee_id !== null &&
        task.employee_id !== undefined
          ? String(task.employee_id)
          : "",
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
    resetForm();
  };

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // SAVE TASK
  // =========================================================
  const saveTask = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (!form.title.trim()) {
      alert("يرجى كتابة عنوان المهمة");
      return;
    }

    try {
      setSaving(true);

      const taskData = {
        title: form.title.trim(),
        description: form.description.trim(),
        employee_id: form.employee_id
          ? Number(form.employee_id)
          : null,
      };

      if (editingTask) {
        const res = await API.put(
          `/tasks/${editingTask.task_id}`,
          taskData
        );

        setTasks((prev) =>
          prev.map((task) =>
            task.task_id === editingTask.task_id
              ? res.data
              : task
          )
        );

        alert("تم تعديل المهمة بنجاح ✅");
      } else {
        const res = await API.post(
          "/tasks",
          taskData
        );

        setTasks((prev) => [
          res.data,
          ...prev,
        ]);

        alert("تمت إضافة المهمة بنجاح ✅");
      }

      setShowModal(false);
      setEditingTask(null);
      resetForm();
    } catch (err) {
      console.error(
        "SAVE TASK ERROR:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "حدث خطأ أثناء حفظ المهمة"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE TASK
  // =========================================================
  const deleteTask = async (task) => {
    if (saving) return;

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف المهمة:\n\n"${task.title}"؟`
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
            item.task_id !== task.task_id
        )
      );

      alert("تم حذف المهمة بنجاح 🗑️");
    } catch (err) {
      console.error(
        "DELETE TASK ERROR:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "فشل حذف المهمة"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // OPEN ASSIGN MODAL
  // =========================================================
  const openAssignModal = (task) => {
    setAssigningTask(task);

    setSelectedEmployee(
      task.employee_id !== null &&
        task.employee_id !== undefined
        ? String(task.employee_id)
        : ""
    );
  };

  // =========================================================
  // CLOSE ASSIGN MODAL
  // =========================================================
  const closeAssignModal = () => {
    if (saving) return;

    setAssigningTask(null);
    setSelectedEmployee("");
  };

  // =========================================================
  // ASSIGN TASK
  // =========================================================
  const assignTask = async () => {
    if (saving) return;

    if (!assigningTask) {
      alert("لم يتم تحديد المهمة");
      return;
    }

    const employeeId = Number(
      selectedEmployee
    );

    const taskId = Number(
      assigningTask.task_id
    );

    console.log("ASSIGN DATA:", {
      employee_id: employeeId,
      task_id: taskId,
    });

    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      alert("يرجى اختيار موظف صحيح");
      return;
    }

    if (!Number.isInteger(taskId) || taskId <= 0) {
      alert("معرّف المهمة غير صحيح");
      return;
    }

    try {
      setSaving(true);

      const res = await API.post(
        "/tasks/assign",
        {
          employee_id: employeeId,
          task_id: taskId,
        }
      );

      console.log(
        "ASSIGN RESPONSE:",
        res.data
      );

      // تحديث المهمة في الواجهة
      setTasks((prev) =>
        prev.map((task) =>
          Number(task.task_id) === taskId
            ? {
                ...task,
                employee_id: employeeId,
              }
            : task
        )
      );

      const employeeName =
        getEmployeeName(employeeId);

      alert(
        `تم تعيين المهمة للموظف ${employeeName} بنجاح ✅`
      );

      setAssigningTask(null);
      setSelectedEmployee("");
    } catch (err) {
      console.error(
        "ASSIGN TASK ERROR:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "حدث خطأ أثناء تعيين المهمة"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // STATS
  // =========================================================
  const assignedTasksCount =
    tasks.filter(
      (task) =>
        task.employee_id !== null &&
        task.employee_id !== undefined &&
        task.employee_id !== ""
    ).length;

  const availableTasksCount =
    tasks.length - assignedTasksCount;

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="tasks-page">

      {/* HEADER */}
      <div className="tasks-header">
        <div className="tasks-header-content">
          <div className="page-kicker">
            إدارة الموارد البشرية
          </div>

          <h1>
            <span className="page-title-icon">
              📋
            </span>
            إدارة المهام
          </h1>

          <p>
            إنشاء وإدارة المهام وتخصيصها
            للموظفين بسهولة
          </p>
        </div>

        <button
          className="add-task-btn"
          onClick={openAddModal}
          disabled={saving}
        >
          <span className="add-icon">
            ＋
          </span>
          إضافة مهمة
        </button>
      </div>

      {/* STATS */}
      <div className="tasks-stats">

        <div className="task-stat-card">
          <div className="stat-icon blue">
            📋
          </div>

          <div className="stat-content">
            <span>إجمالي المهام</span>
            <strong>{tasks.length}</strong>
          </div>
        </div>

        <div className="task-stat-card">
          <div className="stat-icon green">
            ✓
          </div>

          <div className="stat-content">
            <span>المهام المخصصة</span>
            <strong>
              {assignedTasksCount}
            </strong>
          </div>
        </div>

        <div className="task-stat-card">
          <div className="stat-icon orange">
            ◷
          </div>

          <div className="stat-content">
            <span>مهام غير مخصصة</span>
            <strong>
              {availableTasksCount}
            </strong>
          </div>
        </div>

        <div className="task-stat-card">
          <div className="stat-icon purple">
            👤
          </div>

          <div className="stat-content">
            <span>الموظفون</span>
            <strong>
              {employees.length}
            </strong>
          </div>
        </div>

      </div>

      {/* TOOLBAR */}
      <div className="tasks-toolbar">

        <div className="toolbar-title">
          <h2>قائمة المهام</h2>

          <span>
            {filteredTasks.length} مهمة
          </span>
        </div>

        <div className="task-search">
          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="ابحث عن مهمة أو موظف..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              className="clear-search"
              type="button"
              onClick={() =>
                setSearch("")
              }
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="tasks-loading">
          <div className="task-spinner"></div>

          <h3>
            جاري تحميل المهام...
          </h3>

          <p>
            يرجى الانتظار قليلاً
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="tasks-empty">
          <div className="empty-icon">
            📋
          </div>

          <h2>
            {search
              ? "لا توجد نتائج"
              : "لا توجد مهام حتى الآن"}
          </h2>

          <p>
            {search
              ? "جرّب البحث باستخدام كلمة أخرى"
              : "ابدأ بإضافة أول مهمة إلى النظام"}
          </p>

          {!search && (
            <button
              className="empty-add-btn"
              onClick={openAddModal}
            >
              ＋ إضافة أول مهمة
            </button>
          )}
        </div>
      ) : (
        <div className="tasks-grid">

          {filteredTasks.map(
            (task, index) => {
              const employee =
                getEmployee(
                  task.employee_id
                );

              const isAssigned =
                task.employee_id !== null &&
                task.employee_id !== undefined &&
                task.employee_id !== "";

              return (
                <div
                  className="task-card"
                  key={task.task_id}
                >

                  {/* CARD HEADER */}
                  <div className="task-card-header">

                    <span className="task-number">
                      #
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <div className="task-actions">

                      <button
                        className="edit-task"
                        onClick={() =>
                          openEditModal(task)
                        }
                        title="تعديل المهمة"
                        disabled={saving}
                      >
                        ✏️
                      </button>

                      <button
                        className="delete-task"
                        onClick={() =>
                          deleteTask(task)
                        }
                        title="حذف المهمة"
                        disabled={saving}
                      >
                        🗑️
                      </button>

                    </div>
                  </div>

                  {/* TITLE */}
                  <h3 className="task-title">
                    {task.title}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="task-description">
                    {task.description ||
                      "لا يوجد وصف للمهمة"}
                  </p>

                  {/* ASSIGNMENT */}
                  <div
                    className={
                      isAssigned
                        ? "task-assignment assigned"
                        : "task-assignment available"
                    }
                  >

                    <div className="assignment-icon">
                      {isAssigned
                        ? "👤"
                        : "🌐"}
                    </div>

                    <div className="assignment-info">

                      <small>
                        {isAssigned
                          ? "الموظف المسؤول"
                          : "حالة المهمة"}
                      </small>

                      <strong>
                        {isAssigned
                          ? employee
                            ? getEmployeeName(
                                task.employee_id
                              )
                            : `موظف #${task.employee_id}`
                          : "متاحة لجميع الموظفين"}
                      </strong>

                    </div>

                    <span
                      className={
                        isAssigned
                          ? "assignment-status assigned-status"
                          : "assignment-status available-status"
                      }
                    >
                      {isAssigned
                        ? "مخصصة"
                        : "متاحة"}
                    </span>

                  </div>

                  <div className="task-divider"></div>

                  {/* ASSIGN BUTTON */}
                  <button
                    className={
                      saving
                        ? "select-task disabled"
                        : "select-task"
                    }
                    disabled={saving}
                    onClick={() =>
                      openAssignModal(task)
                    }
                  >
                    <span>
                      {isAssigned
                        ? "تغيير الموظف"
                        : "تعيين موظف للمهمة"}
                    </span>

                    {!saving && (
                      <span className="button-arrow">
                        ←
                      </span>
                    )}
                  </button>

                </div>
              );
            }
          )}

        </div>
      )}

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}
      {showModal && (
        <div
          className="task-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="task-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div className="modal-heading">

                <div className="modal-icon">
                  {editingTask
                    ? "✏️"
                    : "＋"}
                </div>

                <div>
                  <h2>
                    {editingTask
                      ? "تعديل المهمة"
                      : "إضافة مهمة جديدة"}
                  </h2>

                  <p>
                    {editingTask
                      ? "قم بتعديل بيانات المهمة"
                      : "أدخل بيانات المهمة الجديدة"}
                  </p>
                </div>

              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
                type="button"
              >
                ✕
              </button>

            </div>

            <form onSubmit={saveTask}>

              <div className="form-group">

                <label>
                  عنوان المهمة
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="مثال: إعداد التقرير الشهري"
                  autoFocus
                  disabled={saving}
                />

              </div>

              <div className="form-group">

                <label>
                  وصف المهمة
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="اكتب وصفًا مختصرًا للمهمة..."
                  rows={5}
                  disabled={saving}
                />

              </div>

              <div className="form-group">

                <label>
                  تخصيص المهمة
                </label>

                <select
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  disabled={saving}
                >

                  <option value="">
                    🌐 متاحة لجميع الموظفين
                  </option>

                  {employees.map(
                    (employee) => {
                      const employeeId =
                        getEmployeeId(
                          employee
                        );

                      if (!employeeId) {
                        return null;
                      }

                      return (
                        <option
                          key={employeeId}
                          value={employeeId}
                        >
                          👤{" "}
                          {employee.name ||
                            employee.full_name ||
                            employee.username ||
                            `موظف #${employeeId}`}
                        </option>
                      );
                    }
                  )}

                </select>

                <small>
                  يمكنك تخصيص المهمة لموظف معين
                  أو جعلها متاحة لجميع الموظفين.
                </small>

              </div>

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
                  className={
                    saving
                      ? "save-task-btn disabled"
                      : "save-task-btn"
                  }
                  disabled={saving}
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
          ASSIGN EMPLOYEE MODAL
      ===================================================== */}
      {assigningTask && (
        <div
          className="task-modal-overlay"
          onClick={closeAssignModal}
        >
          <div
            className="task-modal assign-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div className="modal-heading">

                <div className="modal-icon assign-icon">
                  👤
                </div>

                <div>
                  <h2>
                    {selectedEmployee
                      ? "تغيير الموظف"
                      : "تعيين موظف"}
                  </h2>

                  <p>
                    اختر الموظف المسؤول عن هذه المهمة
                  </p>
                </div>

              </div>

              <button
                className="modal-close"
                onClick={closeAssignModal}
                disabled={saving}
                type="button"
              >
                ✕
              </button>

            </div>

            {/* TASK PREVIEW */}
            <div className="assignment-task-preview">

              <span className="preview-label">
                المهمة
              </span>

              <strong>
                {assigningTask.title}
              </strong>

              {assigningTask.description && (
                <p>
                  {assigningTask.description}
                </p>
              )}

            </div>

            {/* EMPLOYEE */}
            <div className="form-group">

              <label>
                الموظف المسؤول
                <span>*</span>
              </label>

              <select
                value={selectedEmployee}
                onChange={(e) =>
                  setSelectedEmployee(
                    e.target.value
                  )
                }
                disabled={saving}
                className="employee-select"
              >

                <option value="">
                  اختر الموظف
                </option>

                {employees.map(
                  (employee) => {
                    const employeeId =
                      getEmployeeId(
                        employee
                      );

                    if (!employeeId) {
                      return null;
                    }

                    return (
                      <option
                        key={employeeId}
                        value={employeeId}
                      >
                        {employee.name ||
                          employee.full_name ||
                          employee.username ||
                          `موظف #${employeeId}`}
                      </option>
                    );
                  }
                )}

              </select>

              <small>
                سيتم ربط المهمة بالموظف الذي
                تختاره هنا.
              </small>

            </div>

            {/* SELECTED EMPLOYEE */}
            {selectedEmployee && (
              <div className="selected-employee">

                <div className="selected-avatar">
                  👤
                </div>

                <div>
                  <small>
                    الموظف المحدد
                  </small>

                  <strong>
                    {getEmployeeName(
                      selectedEmployee
                    )}
                  </strong>
                </div>

                <div className="selected-check">
                  ✓
                </div>

              </div>
            )}

            {/* ACTIONS */}
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
                className={
                  saving ||
                  !selectedEmployee
                    ? "save-task-btn disabled"
                    : "save-task-btn"
                }
                onClick={assignTask}
                disabled={
                  saving ||
                  !selectedEmployee
                }
              >
                {saving
                  ? "جاري التعيين..."
                  : "تعيين المهمة"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}