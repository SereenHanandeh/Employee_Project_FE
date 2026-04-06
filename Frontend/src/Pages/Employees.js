import { useEffect, useState } from "react";
import API from "../api/api";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    role: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const goBack = () => window.history.back();

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");
      setEmployees(res.data || []);
    } catch (err) {
      alert("فشل تحميل الموظفين");
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;

    try {
      await API.delete(`/employees/${id}`);
      setEmployees((prev) =>
        prev.filter((e) => e.employee_id !== id)
      );
    } catch {
      alert("فشل الحذف");
    }
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      role: emp.role,
    });
  };

  const updateEmployee = async () => {
    const emailExists = employees.some(
      (e) =>
        e.email === form.email &&
        e.employee_id !== editing.employee_id
    );

    if (emailExists) {
      alert("❌ هذا الإيميل مستخدم مسبقاً");
      return;
    }

    try {
      await API.put(`/employees/${editing.employee_id}`, form);

      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === editing.employee_id
            ? { ...e, ...form }
            : e
        )
      );

      setEditing(null);
    } catch {
      alert("فشل التعديل");
    }
  };

  return (
    <div style={styles.page}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={goBack}>
          ⬅ رجوع
        </button>

        <h1 style={styles.title}>👨‍💼 الموظفين</h1>

        <button
          style={styles.addBtn}
          onClick={() => (window.location.href = "/add-employee")}
        >
          ➕ إضافة موظف
        </button>
      </div>

      {/* TABLE */}
      <div style={styles.table}>
        <div style={styles.headerRow}>
          <span>الاسم</span>
          <span>الإيميل</span>
          <span>القسم</span>
          <span>المنصب</span>
          <span>الإجراءات</span>
        </div>

        {employees.map((emp) => (
          <div key={emp.employee_id} style={styles.row}>
            <span>{emp.name}</span>
            <span>{emp.email}</span>
            <span>{emp.department}</span>
            <span>{emp.position}</span>

            <div style={styles.actions}>
              <button
                style={styles.editBtn}
                onClick={() => openEdit(emp)}
              >
                تعديل
              </button>

              <button
                style={styles.deleteBtn}
                onClick={() => deleteEmployee(emp.employee_id)}
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {editing && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>تعديل موظف</h2>

            <input
              style={styles.input}
              placeholder="الاسم"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              style={styles.input}
              placeholder="الإيميل"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              style={styles.input}
              placeholder="القسم"
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
            />

            <input
              style={styles.input}
              placeholder="المنصب"
              value={form.position}
              onChange={(e) =>
                setForm({ ...form, position: e.target.value })
              }
            />

            <input
              style={styles.input}
              placeholder="الدور"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            />

            <div style={styles.modalActions}>
              <button style={styles.saveBtn} onClick={updateEmployee}>
                حفظ
              </button>

              <button
                style={styles.cancelBtn}
                onClick={() => setEditing(null)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLE ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    direction: "rtl",

    fontFamily:
      "'Cairo', 'Tajawal', 'Segoe UI', Arial, sans-serif",

    background: "linear-gradient(135deg,#0f172a,#1e293b)",
    color: "#f1f5f9",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "10px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "800",
  },

  backBtn: {
    background: "rgba(148,163,184,0.15)",
    border: "1px solid rgba(148,163,184,0.3)",
    color: "#cbd5e1",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  addBtn: {
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    border: "none",
    padding: "10px 16px",
    borderRadius: "12px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 10px 20px rgba(59,130,246,0.3)",
  },

  table: {
    maxWidth: "1000px",
    margin: "auto",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
  },

  headerRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
    padding: "15px",
    background: "rgba(59,130,246,0.25)",
    fontWeight: "700",
    fontSize: "14px",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
    padding: "15px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: "14px",
  },

  actions: {
    display: "flex",
    gap: "10px",
  },

  editBtn: {
    background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#111",
    fontWeight: "600",
  },

  deleteBtn: {
    background: "linear-gradient(135deg,#ef4444,#f87171)",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#fff",
    fontWeight: "600",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "380px",
    padding: "25px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",

    fontFamily:
      "'Cairo', 'Tajawal', 'Segoe UI', Arial, sans-serif",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    outline: "none",
    fontSize: "14px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },

  saveBtn: {
    background: "#22c55e",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  cancelBtn: {
    background: "#64748b",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
  },
};