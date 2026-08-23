import { useEffect, useState } from "react";
import API from "../api/api";

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

  // =====================================================
  // GET TASKS
  // =====================================================

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

  // =====================================================
  // GET EMPLOYEES
  // =====================================================

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

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingTask(null);

    setForm({
      title: "",
      description: "",
      employee_id: "",
    });

    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

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

  // =====================================================
  // CLOSE MODAL
  // =====================================================

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

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // ADD / UPDATE TASK
  // =====================================================

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

        // إذا لم يتم اختيار موظف
        // تصبح المهمة عامة
        employee_id: form.employee_id
          ? Number(form.employee_id)
          : null,
      };

      // =================================================
      // UPDATE
      // =================================================

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
      }

      // =================================================
      // CREATE
      // =================================================

      else {
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

  // =====================================================
  // DELETE TASK
  // =====================================================

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

  // =====================================================
  // ASSIGN TASK
  // =====================================================

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

  // =====================================================
  // GET EMPLOYEE NAME
  // =====================================================

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

  // =====================================================
  // SEARCH
  // =====================================================

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

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div style={styles.page}>

      {/* =================================================
          HEADER
      ================================================= */}

      <div style={styles.header}>

        <div>
          <div style={styles.smallTitle}>
            إدارة المهام
          </div>

          <h1 style={styles.heading}>
            📋 المهام
          </h1>

          <p style={styles.subtitle}>
            إدارة وإضافة وتعديل المهام وتخصيصها للموظفين
          </p>
        </div>

        <button
          style={styles.addButton}
          onClick={openAddModal}
        >
          <span style={styles.plusIcon}>
            ＋
          </span>

          إضافة مهمة
        </button>

      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div style={styles.stats}>

        <div style={styles.statCard}>

          <div style={styles.statIcon}>
            📋
          </div>

          <div>
            <div style={styles.statLabel}>
              إجمالي المهام
            </div>

            <div style={styles.statNumber}>
              {tasks.length}
            </div>
          </div>

        </div>

        <div style={styles.statCard}>

          <div style={styles.statIconGreen}>
            ✓
          </div>

          <div>
            <div style={styles.statLabel}>
              المهام المعروضة
            </div>

            <div style={styles.statNumber}>
              {filteredTasks.length}
            </div>
          </div>

        </div>

        <div style={styles.statCard}>

          <div style={styles.statIconPurple}>
            👤
          </div>

          <div>
            <div style={styles.statLabel}>
              الموظفون
            </div>

            <div style={styles.statNumber}>
              {employees.length}
            </div>
          </div>

        </div>

      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div style={styles.toolbar}>

        <div style={styles.searchWrapper}>

          <span style={styles.searchIcon}>
            🔍
          </span>

          <input
            type="text"
            placeholder="ابحث عن مهمة أو موظف..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={styles.search}
          />

          {search && (
            <button
              style={styles.clearSearch}
              onClick={() =>
                setSearch("")
              }
            >
              ✕
            </button>
          )}

        </div>

      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (

        <div style={styles.loading}>

          <div style={styles.spinner}></div>

          <p>
            جاري تحميل المهام...
          </p>

        </div>

      ) : filteredTasks.length === 0 ? (

        /* =================================================
           EMPTY
        ================================================= */

        <div style={styles.empty}>

          <div style={styles.emptyIcon}>
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
              style={styles.emptyButton}
              onClick={openAddModal}
            >
              ＋ إضافة أول مهمة
            </button>
          )}

        </div>

      ) : (

        /* =================================================
           TASKS
        ================================================= */

        <div style={styles.grid}>

          {filteredTasks.map(
            (task, index) => (

              <div
                key={task.task_id}
                style={styles.card}

                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-5px)";

                  e.currentTarget.style.borderColor =
                    "rgba(96,165,250,0.35)";

                  e.currentTarget.style.boxShadow =
                    "0 20px 45px rgba(0,0,0,0.35)";
                }}

                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(0)";

                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.10)";

                  e.currentTarget.style.boxShadow =
                    "0 15px 35px rgba(0,0,0,0.25)";
                }}
              >

                {/* CARD HEADER */}

                <div style={styles.cardHeader}>

                  <div style={styles.taskNumber}>
                    #{String(index + 1).padStart(2, "0")}
                  </div>

                  <div style={styles.actions}>

                    <button
                      style={styles.editButton}
                      onClick={() =>
                        openEditModal(task)
                      }
                      title="تعديل"
                    >
                      ✏️
                    </button>

                    <button
                      style={styles.deleteButton}
                      onClick={() =>
                        deleteTask(task)
                      }
                      title="حذف"
                    >
                      🗑️
                    </button>

                  </div>

                </div>

                {/* TITLE */}

                <h3 style={styles.taskTitle}>
                  {task.title}
                </h3>

                {/* DESCRIPTION */}

                <p style={styles.description}>
                  {task.description ||
                    "لا يوجد وصف للمهمة"}
                </p>

                {/* ASSIGNED EMPLOYEE */}

                <div style={styles.assignmentBox}>

                  <div style={styles.assignmentIcon}>
                    👤
                  </div>

                  <div>

                    <div style={styles.assignmentLabel}>
                      مخصصة إلى
                    </div>

                    <div style={styles.assignmentName}>
                      {getEmployeeName(
                        task.employee_id
                      )}
                    </div>

                  </div>

                </div>

                {/* DIVIDER */}

                <div style={styles.divider}></div>

                {/* FOOTER */}

                <div style={styles.cardFooter}>

                  <button
                    style={
                      saving
                        ? styles.selectButtonDisabled
                        : styles.selectButton
                    }
                    disabled={saving}
                    onClick={() =>
                      selectTask(
                        task.task_id
                      )
                    }
                  >

                    {saving ? (
                      "جاري التنفيذ..."
                    ) : (
                      <>
                        اختيار المهمة

                        <span>
                          ←
                        </span>
                      </>
                    )}

                  </button>

                </div>

              </div>

            )
          )}

        </div>
      )}

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (

        <div
          style={styles.overlay}
          onClick={closeModal}
        >

          <div
            style={styles.modal}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div style={styles.modalHeader}>

              <div>

                <div style={styles.modalIcon}>
                  {editingTask
                    ? "✏️"
                    : "＋"}
                </div>

                <h2 style={styles.modalTitle}>
                  {editingTask
                    ? "تعديل المهمة"
                    : "إضافة مهمة جديدة"}
                </h2>

                <p style={styles.modalSubtitle}>
                  {editingTask
                    ? "قم بتعديل بيانات المهمة وتخصيصها"
                    : "أدخل بيانات المهمة واختر الموظف المسؤول عنها"}
                </p>

              </div>

              <button
                style={styles.closeButton}
                onClick={closeModal}
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={saveTask}>

              {/* TITLE */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  عنوان المهمة
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="مثال: إعداد التقرير الشهري"
                  style={styles.input}
                  autoFocus
                />

              </div>

              {/* DESCRIPTION */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  وصف المهمة
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="اكتب وصفًا مختصرًا للمهمة..."
                  style={styles.textarea}
                  rows={5}
                />

              </div>

              {/* EMPLOYEE */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  تخصيص المهمة
                </label>

                <select
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  style={styles.selectInput}
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

                <small style={styles.helperText}>
                  اختر موظفًا معينًا لتظهر له المهمة فقط،
                  أو اختر "متاحة لجميع الموظفين".
                </small>

              </div>

              {/* MODAL ACTIONS */}

              <div style={styles.modalActions}>

                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={closeModal}
                  disabled={saving}
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  style={
                    saving
                      ? styles.saveButtonDisabled
                      : styles.saveButton
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

/* =========================================================
   STYLES
========================================================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "35px 45px",
    fontFamily: "Cairo, sans-serif",
    direction: "rtl",
    background:
      "radial-gradient(circle at top right, rgba(59,130,246,0.12), transparent 35%), linear-gradient(135deg,#020617 0%,#0f172a 50%,#111827 100%)",
    color: "#fff",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  smallTitle: {
    color: "#60a5fa",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "5px",
  },

  heading: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#94a3b8",
    fontSize: "14px",
  },

  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    border: "none",
    color: "#fff",
    padding: "13px 20px",
    borderRadius: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
    fontSize: "14px",
    boxShadow:
      "0 10px 25px rgba(37,99,235,0.3)",
  },

  plusIcon: {
    fontSize: "21px",
    lineHeight: 1,
  },

  /* STATS */

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "18px",
    marginBottom: "25px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "18px 20px",
    borderRadius: "16px",
    background:
      "rgba(255,255,255,0.055)",
    border:
      "1px solid rgba(255,255,255,0.09)",
    backdropFilter: "blur(12px)",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "13px",
    background:
      "rgba(59,130,246,0.15)",
    fontSize: "22px",
  },

  statIconGreen: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "13px",
    background:
      "rgba(34,197,94,0.15)",
    color: "#4ade80",
    fontSize: "23px",
    fontWeight: "800",
  },

  statIconPurple: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "13px",
    background:
      "rgba(168,85,247,0.15)",
    color: "#c084fc",
    fontSize: "21px",
  },

  statLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "3px",
  },

  statNumber: {
    fontSize: "22px",
    fontWeight: "800",
  },

  /* SEARCH */

  toolbar: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "25px",
  },

  searchWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "500px",
  },

  searchIcon: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform:
      "translateY(-50%)",
    opacity: 0.7,
  },

  search: {
    width: "100%",
    boxSizing: "border-box",
    background:
      "rgba(255,255,255,0.06)",
    border:
      "1px solid rgba(255,255,255,0.12)",
    borderRadius: "13px",
    padding: "13px 45px 13px 40px",
    color: "#fff",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "13px",
  },

  clearSearch: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform:
      "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "14px",
  },

  /* GRID */

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill,minmax(310px,1fr))",
    gap: "20px",
  },

  /* CARD */

  card: {
    position: "relative",
    padding: "22px",
    borderRadius: "18px",
    background:
      "linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035))",
    border:
      "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(14px)",
    boxShadow:
      "0 15px 35px rgba(0,0,0,0.25)",
    transition:
      "all .25s ease",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px",
  },

  taskNumber: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  actions: {
    display: "flex",
    gap: "7px",
  },

  editButton: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    border:
      "1px solid rgba(59,130,246,0.25)",
    background:
      "rgba(59,130,246,0.12)",
    cursor: "pointer",
    fontSize: "14px",
  },

  deleteButton: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    border:
      "1px solid rgba(239,68,68,0.25)",
    background:
      "rgba(239,68,68,0.10)",
    cursor: "pointer",
    fontSize: "14px",
  },

  taskTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "800",
    lineHeight: 1.5,
  },

  description: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.8,
    minHeight: "48px",
    margin: "10px 0",
  },

  /* ASSIGNMENT */

  assignmentBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "15px",
    padding: "11px 12px",
    borderRadius: "12px",
    background:
      "rgba(59,130,246,0.07)",
    border:
      "1px solid rgba(59,130,246,0.12)",
  },

  assignmentIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(59,130,246,0.13)",
    fontSize: "15px",
  },

  assignmentLabel: {
    color: "#64748b",
    fontSize: "10px",
    marginBottom: "2px",
  },

  assignmentName: {
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: "700",
  },

  divider: {
    height: "1px",
    background:
      "rgba(255,255,255,0.08)",
    margin: "17px 0",
  },

  cardFooter: {
    display: "flex",
  },

  selectButton: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "11px 14px",
    borderRadius: "11px",
    border:
      "1px solid rgba(34,197,94,0.25)",
    background:
      "rgba(34,197,94,0.12)",
    color: "#4ade80",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
  },

  selectButtonDisabled: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "11px",
    border: "none",
    background:
      "rgba(148,163,184,0.1)",
    color: "#64748b",
    cursor: "not-allowed",
    fontFamily: "inherit",
    fontWeight: "700",
  },

  /* EMPTY */

  empty: {
    textAlign: "center",
    padding: "70px 20px",
    borderRadius: "20px",
    border:
      "1px dashed rgba(255,255,255,0.13)",
    background:
      "rgba(255,255,255,0.03)",
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "10px",
    opacity: 0.7,
  },

  emptyButton: {
    marginTop: "15px",
    padding: "11px 18px",
    borderRadius: "11px",
    border: "none",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
  },

  /* LOADING */

  loading: {
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#94a3b8",
  },

  spinner: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    border:
      "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#60a5fa",
    animation:
      "spin 1s linear infinite",
  },

  /* MODAL */

  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(2,6,23,0.78)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 9999,
  },

  modal: {
    width: "100%",
    maxWidth: "540px",
    maxHeight: "90vh",
    overflowY: "auto",
    background:
      "linear-gradient(145deg,#111827,#0f172a)",
    border:
      "1px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "25px",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.55)",
    boxSizing: "border-box",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "25px",
  },

  modalIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background:
      "rgba(59,130,246,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    marginBottom: "10px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "21px",
    fontWeight: "800",
  },

  modalSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.7,
  },

  closeButton: {
    width: "35px",
    height: "35px",
    borderRadius: "9px",
    border:
      "1px solid rgba(255,255,255,0.1)",
    background:
      "rgba(255,255,255,0.05)",
    color: "#94a3b8",
    cursor: "pointer",
  },

  formGroup: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    borderRadius: "11px",
    border:
      "1px solid rgba(255,255,255,0.12)",
    background:
      "rgba(255,255,255,0.05)",
    color: "#fff",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "13px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    borderRadius: "11px",
    border:
      "1px solid rgba(255,255,255,0.12)",
    background:
      "rgba(255,255,255,0.05)",
    color: "#fff",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "13px",
    resize: "vertical",
  },

  selectInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    borderRadius: "11px",
    border:
      "1px solid rgba(255,255,255,0.12)",
    background: "#111827",
    color: "#fff",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "13px",
    cursor: "pointer",
  },

  helperText: {
    display: "block",
    marginTop: "7px",
    color: "#64748b",
    fontSize: "11px",
    lineHeight: 1.7,
  },

  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "25px",
  },

  cancelButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "11px",
    border:
      "1px solid rgba(255,255,255,0.12)",
    background:
      "rgba(255,255,255,0.05)",
    color: "#cbd5e1",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
  },

  saveButton: {
    flex: 2,
    padding: "12px",
    borderRadius: "11px",
    border: "none",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
  },

  saveButtonDisabled: {
    flex: 2,
    padding: "12px",
    borderRadius: "11px",
    border: "none",
    background:
      "rgba(148,163,184,0.15)",
    color: "#64748b",
    cursor: "not-allowed",
    fontFamily: "inherit",
    fontWeight: "700",
  },
};