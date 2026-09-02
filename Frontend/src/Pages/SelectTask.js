
import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/api";
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

  // البحث داخل قائمة الموظفين
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Form إضافة / تعديل مهمة
  const [form, setForm] = useState({
    title: "",
    description: "",
    employee_id: "",
  });

  // =========================================================
  // HELPERS
  // =========================================================

  /**
   * الحصول على ID الموظف مهما كان اسم الحقل القادم من الـ API
   */
  const getEmployeeId = useCallback((employee) => {
    if (!employee) return null;

    return (
      employee.employee_id ??
      employee.id ??
      employee.user_id ??
      null
    );
  }, []);

  /**
   * اسم الموظف حسب ID
   */
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

  /**
   * استخراج IDs الموظفين المرتبطين بالمهمة.
   *
   * يدعم:
   * employees: [{ employee_id: 1 }, ...]
   * employee_ids: [1,2,3]
   * employee_id: 1
   */
  const getTaskEmployeeIds = useCallback(
    (task) => {
      if (!task) return [];

      // الحالة الجديدة
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

      // إذا كان الـ Backend يرجع employees
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

      // دعم النظام القديم
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
    [getEmployeeId]
  );

  /**
   * الحصول على الموظفين المرتبطين بالمهمة
   */
  const getTaskEmployees = useCallback(
    (task) => {
      const ids = getTaskEmployeeIds(task);

      return ids.map((id) => {
        const employee = employees.find(
          (item) =>
            Number(getEmployeeId(item)) === Number(id)
        );

        return (
          employee || {
            employee_id: id,
            name: `موظف #${id}`,
          }
        );
      });
    },
    [employees, getEmployeeId, getTaskEmployeeIds]
  );

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

      /**
       * توحيد شكل بيانات الموظفين داخل المهمة
       */
      const normalizedTasks = data.map((task) => {
        let employeeIds = [];

        // الحالة الجديدة
        if (Array.isArray(task.employee_ids)) {
          employeeIds = task.employee_ids;
        }

        // employees array
        else if (Array.isArray(task.employees)) {
          employeeIds = task.employees
            .map((employee) =>
              Number(getEmployeeId(employee))
            )
            .filter(
              (id) =>
                Number.isInteger(id) && id > 0
            );
        }

        // النظام القديم
        else if (
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
        };
      });

      setTasks(normalizedTasks);
    } catch (error) {
      console.error("FETCH TASKS ERROR:", error);

      alert(
        error?.response?.data?.message ||
          "حدث خطأ أثناء جلب المهام"
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

      alert(
        error?.response?.data?.message ||
          "حدث خطأ أثناء جلب الموظفين"
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
    const value = search.trim().toLowerCase();

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

      const employeeNames = getTaskEmployees(task)
        .map(
          (employee) =>
            employee.name ||
            employee.full_name ||
            employee.username ||
            ""
        )
        .join(" ")
        .toLowerCase();

      return (
        title.includes(value) ||
        description.includes(value) ||
        employeeNames.includes(value)
      );
    });
  }, [tasks, search, getTaskEmployees]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalTasks = tasks.length;

  const assignedTasks = tasks.filter((task) => {
    return getTaskEmployeeIds(task).length > 0;
  }).length;

  const unassignedTasks =
    totalTasks - assignedTasks;

  // =========================================================
  // FORM
  // =========================================================

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
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
      employee_id: "",
    });

    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (task) => {
    setEditingTask(task);

    const employeeIds =
      getTaskEmployeeIds(task);

    setForm({
      title: task.title || "",
      description: task.description || "",
      employee_id:
        employeeIds.length > 0
          ? String(employeeIds[0])
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

    setForm({
      title: "",
      description: "",
      employee_id: "",
    });
  };

  // =========================================================
  // SAVE TASK
  // =========================================================

  const saveTask = async (e) => {
    e?.preventDefault();

    if (saving) return;

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      alert("يرجى إدخال عنوان المهمة");
      return;
    }

    const taskData = {
      title,
      description,
      employee_id: form.employee_id
        ? Number(form.employee_id)
        : null,
    };

    try {
      setSaving(true);

      if (editingTask) {
        const res = await API.put(
          `/tasks/${editingTask.task_id}`,
          taskData
        );

        const updatedTask =
          res.data?.task || res.data;

        setTasks((prev) =>
          prev.map((task) =>
            Number(task.task_id) ===
            Number(editingTask.task_id)
              ? {
                  ...task,
                  ...updatedTask,
                  task_id:
                    updatedTask?.task_id ??
                    task.task_id,
                }
              : task
          )
        );

        alert("تم تعديل المهمة بنجاح ✅");
      } else {
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
            },
            ...prev,
          ]);
        }

        alert("تم إنشاء المهمة بنجاح ✅");
      }

      closeModal();
    } catch (error) {
      console.error("SAVE TASK ERROR:", error);

      alert(
        error?.response?.data?.message ||
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
    if (!task?.task_id) return;

    const confirmed = window.confirm(
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

      alert("تم حذف المهمة بنجاح ✅");
    } catch (error) {
      console.error("DELETE TASK ERROR:", error);

      alert(
        error?.response?.data?.message ||
          "حدث خطأ أثناء حذف المهمة"
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
  // SELECT / UNSELECT EMPLOYEE
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
  // UNSELECT ALL
  // =========================================================

  const clearSelectedEmployees = () => {
    setSelectedEmployees([]);
  };

  // =========================================================
  // FILTER EMPLOYEES IN ASSIGN MODAL
  // =========================================================

  const filteredEmployees = useMemo(() => {
    const value =
      employeeSearch.trim().toLowerCase();

    if (!value) {
      return employees;
    }

    return employees.filter((employee) => {
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
    });
  }, [
    employees,
    employeeSearch,
    getEmployeeId,
  ]);

  // =========================================================
  // ASSIGN TASK TO MULTIPLE EMPLOYEES
  // =========================================================

  const assignTask = async () => {
    if (saving) return;

    if (!assigningTask) {
      alert("لم يتم تحديد المهمة");
      return;
    }

    const taskId = Number(
      assigningTask.task_id
    );

    const employeeIds = [
      ...new Set(
        selectedEmployees
          .map(Number)
          .filter(
            (id) =>
              Number.isInteger(id) && id > 0
          )
      ),
    ];

    console.log("ASSIGN DATA:", {
      employee_ids: employeeIds,
      task_id: taskId,
    });

    if (
      !Number.isInteger(taskId) ||
      taskId <= 0
    ) {
      alert("معرّف المهمة غير صحيح");
      return;
    }

    if (employeeIds.length === 0) {
      alert(
        "يرجى اختيار موظف واحد على الأقل"
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

      console.log(
        "ASSIGN RESPONSE:",
        res.data
      );

      // الموظفون الذين تم إرجاعهم من السيرفر
      const returnedEmployees =
        Array.isArray(res.data?.employees)
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
                }
              );
            });

      // تحديث المهمة مباشرة بدون إعادة تحميل الصفحة
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

            employee_ids: employeeIds,

            // للحفاظ على توافق الكود القديم
            employee_id:
              employeeIds.length > 0
                ? employeeIds[0]
                : null,

            employees:
              returnedEmployees,
          };
        })
      );

      alert(
        `تم تعيين المهمة لـ ${employeeIds.length} موظف ${
          employeeIds.length === 1
            ? "بنجاح"
            : "بنجاح"
        } ✅`
      );

      closeAssignModal();
    } catch (error) {
      console.error(
        "ASSIGN TASK ERROR:",
        error
      );

      console.error(
        "SERVER DATA:",
        error?.response?.data
      );

      alert(
        error?.response?.data?.message ||
          "حدث خطأ أثناء تعيين المهمة"
      );
    } finally {
      setSaving(false);
    }
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

          <p>
            إنشاء المهام وتعيينها لأكثر من موظف
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
          <div className="stat-icon">📋</div>

          <div>
            <span>إجمالي المهام</span>
            <strong>{totalTasks}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>

          <div>
            <span>المهام المعينة</span>
            <strong>{assignedTasks}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>

          <div>
            <span>غير المعينة</span>
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
            placeholder="ابحث عن مهمة أو موظف..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
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
          عرض{" "}
          <strong>
            {filteredTasks.length}
          </strong>{" "}
          من {tasks.length} مهمة
        </div>
      </div>

      {/* =====================================================
          LOADING
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
        /* ===================================================
           TASK CARDS
        ==================================================== */

        <div className="tasks-grid">
          {filteredTasks.map((task) => {
            const taskEmployees =
              getTaskEmployees(task);

            const employeeCount =
              getTaskEmployeeIds(task).length;

            const isAssigned =
              employeeCount > 0;

            return (
              <div
                className="task-card"
                key={task.task_id}
              >
                {/* CARD HEADER */}

                <div className="task-card-header">
                  <div className="task-number">
                    #{task.task_id}
                  </div>

                  <div className="task-actions">
                    <button
                      type="button"
                      title="تعديل"
                      onClick={() =>
                        openEditModal(task)
                      }
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      title="حذف"
                      onClick={() =>
                        deleteTask(task)
                      }
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* TITLE */}

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

                  {/* =========================================
                      EMPLOYEES
                  ========================================== */}

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
                        <span>👤</span>
                        <span>
                          لم يتم تعيين موظفين
                        </span>
                      </div>
                    ) : (
                      <div className="assigned-employees">
                        {taskEmployees.map(
                          (employee, index) => {
                            const employeeId =
                              getEmployeeId(
                                employee
                              );

                            const name =
                              employee.name ||
                              employee.full_name ||
                              employee.username ||
                              `موظف #${employeeId}`;

                            return (
                              <div
                                className="employee-chip"
                                key={`${employeeId}-${index}`}
                              >
                                <span className="employee-avatar">
                                  {name
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>

                                <span className="employee-name">
                                  {name}
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
                        : "○"}
                    </span>

                    {isAssigned
                      ? `${employeeCount} موظف معين`
                      : "غير معينة"}
                  </div>

                  <button
                    type="button"
                    className="assign-btn"
                    onClick={() =>
                      openAssignModal(task)
                    }
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
          ADD / EDIT TASK MODAL
      ====================================================== */}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="task-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  {editingTask
                    ? "تعديل المهمة"
                    : "إضافة مهمة جديدة"}
                </h2>

                <p>
                  أدخل بيانات المهمة
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

            <form onSubmit={saveTask}>
              <div className="form-group">
                <label>
                  عنوان المهمة
                </label>

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

              <div className="form-group">
                <label>
                  وصف المهمة
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="اكتب وصف المهمة هنا..."
                  rows={5}
                  disabled={saving}
                />
              </div>

              <div className="form-note">
                💡 بعد إنشاء المهمة يمكنك الضغط على
                <strong>
                  "تعيين موظفين"
                </strong>
                لاختيار موظف واحد أو عدة موظفين.
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
                  className="save-btn"
                  disabled={
                    saving ||
                    !form.title.trim()
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
              e.target === e.currentTarget
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
                onClick={closeAssignModal}
                disabled={saving}
              >
                ×
              </button>
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
                  {selectedEmployees.length}
                </strong>
              </div>
            </div>

            {/* SEARCH EMPLOYEES */}

            <div className="employee-search-box">
              <span>🔎</span>

              <input
                type="text"
                value={employeeSearch}
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
                onClick={selectAllEmployees}
                disabled={
                  saving ||
                  employees.length === 0
                }
              >
                ☑ تحديد الكل
              </button>

              <button
                type="button"
                onClick={clearSelectedEmployees}
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
                    لا يوجد موظفون مطابقون للبحث
                  </p>
                </div>
              ) : (
                filteredEmployees.map(
                  (employee) => {
                    const employeeId =
                      getEmployeeId(employee);

                    if (
                      employeeId === null ||
                      employeeId === undefined
                    ) {
                      return null;
                    }

                    const id =
                      String(employeeId);

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
                      employee.email || "";

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
                          disabled={saving}
                        />

                        <span className="custom-checkbox">
                          {checked && "✓"}
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
                      {selectedEmployees.length}
                    </strong>{" "}
                    موظف
                  </>
                )}
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
    </div>
  );
}
