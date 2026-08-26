import { useEffect, useState } from "react";
import API from "../api/api";
import "./SelectTask.css";

export default function SelectTask() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    employee_id: "",
  });

  const emp = JSON.parse(
    localStorage.getItem("employee") || "null"
  );

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tasks");
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "فشل تحميل المهام"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "فشل تحميل الموظفين"
      );
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const openAddModal = () => {
    setEditingTask(null);

    setForm({
      title: "",
      description: "",
      employee_id: "",
    });

    setShowModal(true);
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveTask = async (e) => {
    e.preventDefault();

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

      closeModal();
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "حدث خطأ أثناء حفظ المهمة"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (task) => {
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
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "فشل حذف المهمة"
      );
    } finally {
      setSaving(false);
    }
  };

  const selectTask = async (task_id) => {
    if (!emp?.id) {
      alert("لم يتم العثور على بيانات الموظف");
      return;
    }

    try {
      setSaving(true);

      await API.post("/tasks/assign", {
        employee_id: emp.id,
        task_id,
      });

      alert("تم اختيار المهمة بنجاح ✅");
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "حدث خطأ أثناء اختيار المهمة"
      );
    } finally {
      setSaving(false);
    }
  };

  const getEmployeeName = (employeeId) => {
    if (
      employeeId === null ||
      employeeId === undefined ||
      employeeId === ""
    ) {
      return "متاحة لجميع الموظفين";
    }

    const employee = employees.find(
      (item) =>
        Number(item.id) === Number(employeeId)
    );

    return (
      employee?.name ||
      employee?.full_name ||
      employee?.username ||
      `موظف #${employeeId}`
    );
  };

  const filteredTasks = tasks.filter((task) => {
    const employeeName = getEmployeeName(
      task.employee_id
    );

    const text = `
      ${task.title || ""}
      ${task.description || ""}
      ${employeeName || ""}
    `.toLowerCase();

    return text.includes(
      search.toLowerCase()
    );
  });

  return (
    <div className="tasks-page">

      {/* HEADER */}

      <div className="tasks-header">

        <div>
          <div className="page-kicker">
            إدارة المهام
          </div>

          <h1>
            <span className="page-title-icon">
              📋
            </span>
            المهام
          </h1>

          <p>
            إدارة وإضافة وتعديل المهام وتخصيصها للموظفين
          </p>
        </div>

        <button
          className="add-task-btn"
          onClick={openAddModal}
        >
          <span>＋</span>
          إضافة مهمة
        </button>

      </div>

      {/* STATS */}

      <div className="tasks-stats">

        <div className="task-stat-card">

          <div className="stat-icon blue">
            📋
          </div>

          <div>
            <span>إجمالي المهام</span>
            <strong>{tasks.length}</strong>
          </div>

        </div>

        <div className="task-stat-card">

          <div className="stat-icon green">
            ✓
          </div>

          <div>
            <span>المهام المعروضة</span>
            <strong>
              {filteredTasks.length}
            </strong>
          </div>

        </div>

        <div className="task-stat-card">

          <div className="stat-icon purple">
            👤
          </div>

          <div>
            <span>الموظفون</span>
            <strong>
              {employees.length}
            </strong>
          </div>

        </div>

      </div>

      {/* TOOLBAR */}

      <div className="tasks-toolbar">

        <div className="task-search">

          <span>🔍</span>

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
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}

        </div>

      </div>

      {/* LOADING */}

      {loading ? (

        <div className="tasks-loading">

          <div className="task-spinner"></div>

          <p>
            جاري تحميل المهام...
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
            (task, index) => (

              <div
                className="task-card"
                key={task.task_id}
              >

                <div className="task-card-header">

                  <span className="task-number">
                    #{String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="task-actions">

                    <button
                      className="edit-task"
                      onClick={() =>
                        openEditModal(task)
                      }
                      title="تعديل"
                    >
                      ✏️
                    </button>

                    <button
                      className="delete-task"
                      onClick={() =>
                        deleteTask(task)
                      }
                      title="حذف"
                    >
                      🗑️
                    </button>

                  </div>

                </div>

                <h3>
                  {task.title}
                </h3>

                <p className="task-description">
                  {task.description ||
                    "لا يوجد وصف للمهمة"}
                </p>

                <div className="task-assignment">

                  <div className="assignment-icon">
                    👤
                  </div>

                  <div>

                    <small>
                      مخصصة إلى
                    </small>

                    <strong>
                      {getEmployeeName(
                        task.employee_id
                      )}
                    </strong>

                  </div>

                </div>

                <div className="task-divider"></div>

                <button
                  className={
                    saving
                      ? "select-task disabled"
                      : "select-task"
                  }
                  disabled={saving}
                  onClick={() =>
                    selectTask(
                      task.task_id
                    )
                  }
                >
                  <span>
                    {saving
                      ? "جاري التنفيذ..."
                      : "اختيار المهمة"}
                  </span>

                  {!saving && (
                    <span>←</span>
                  )}
                </button>

              </div>

            )
          )}

        </div>

      )}

      {/* MODAL */}

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

              <div>

                <div className="modal-icon">
                  {editingTask ? "✏️" : "＋"}
                </div>

                <h2>
                  {editingTask
                    ? "تعديل المهمة"
                    : "إضافة مهمة جديدة"}
                </h2>

                <p>
                  {editingTask
                    ? "قم بتعديل بيانات المهمة وتخصيصها"
                    : "أدخل بيانات المهمة واختر الموظف المسؤول عنها"}
                </p>

              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ✕
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
                  onChange={handleChange}
                  placeholder="مثال: إعداد التقرير الشهري"
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
                  onChange={handleChange}
                  placeholder="اكتب وصفًا مختصرًا للمهمة..."
                  rows={5}
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
                >

                  <option value="">
                    🌐 متاحة لجميع الموظفين
                  </option>

                  {employees.map(
                    (employee) => (

                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        👤{" "}
                        {employee.name ||
                          employee.full_name ||
                          employee.username ||
                          `موظف #${employee.id}`}
                      </option>

                    )
                  )}

                </select>

                <small>
                  اختر موظفًا معينًا لتظهر له المهمة فقط،
                  أو اختر "متاحة لجميع الموظفين".
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

    </div>
  );
}