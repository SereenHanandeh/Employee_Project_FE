import { useEffect, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [editing, setEditing] = useState(null);
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showTrash, setShowTrash] = useState(false);

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

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");
      setEmployees(res.data || []);
    } catch {
      alert("فشل تحميل الموظفين");
    }
  };

  // ================= حذف =================
  const deleteEmployee = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف الموظف؟")) return;

    try {
      await API.delete(`/employees/${id}/delete`);

      setEmployees((prev) =>
        prev.map((e) => (e.employee_id === id ? { ...e, status: "محذوف" } : e)),
      );
    } catch {
      alert("فشل عملية الحذف");
    }
  };

  const restoreEmployee = async (id) => {
    try {
      await API.put(`/employees/${id}/restore`);

      setEmployees((prev) =>
        prev.map((e) => (e.employee_id === id ? { ...e, status: "نشط" } : e)),
      );
    } catch {
      alert("فشل الاسترجاع");
    }
  };

  // ================= تعديل =================
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
    try {
      await API.put(`/employees/${editing.employee_id}/update`, form);

      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === editing.employee_id ? { ...e, ...form } : e,
        ),
      );

      setEditing(null);
    } catch {
      alert("فشل التعديل");
    }
  };

  // ================= فلترة =================
  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterDept ? emp.department === filterDept : true) &&
      (filterStatus ? emp.status === filterStatus : emp.status !== "محذوف")
    );
  });

  const deletedEmployees = employees.filter((emp) => emp.status === "محذوف");

  // ================= Excel =================
  const exportToExcel = () => {
    const data = filteredEmployees.map((emp) => ({
      الاسم: emp.name,
      "البريد الإلكتروني": emp.email,
      القسم: emp.department,
      المنصب: emp.position,
      الحالة: emp.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الموظفين");

    const file = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([file], { type: "application/octet-stream" }),
      "الموظفين.xlsx",
    );
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>👨‍💼 إدارة الموظفين</h1>

      {/* أدوات التحكم */}
      <div style={styles.topBar}>
        {/* أدوات البحث (يسار) */}
        <div style={styles.leftTools}>
          <input
            placeholder="🔍 بحث عن موظف..."
            style={styles.input}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            style={styles.input}
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="">كل الأقسام</option>
            <option value="IT">تقنية المعلومات</option>
            <option value="HR">الموارد البشرية</option>
          </select>

          <select
            style={styles.input}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">كل الحالات</option>
            <option value="نشط">نشط</option>
            <option value="محذوف">محذوف</option>
          </select>
        </div>

        {/* الأزرار (يمين) */}
        <div style={styles.rightTools}>
          <button style={styles.trashBtn} onClick={() => setShowTrash(true)}>
            🗑️ سلة المحذوفات
          </button>

          <button style={styles.exportBtn} onClick={exportToExcel}>
            📥 تصدير Excel
          </button>

          <button style={styles.addBtn} onClick={() => nav("/add-employee")}>
            ➕ إضافة موظف
          </button>
        </div>
      </div>

      {/* الجدول */}
      <div style={styles.table}>
        {filteredEmployees.map((emp) => (
          <div key={emp.employee_id} style={styles.row}>
            <div>
              <small style={styles.label}>الاسم</small>
              <div>{emp.name}</div>
            </div>

            <div>
              <small style={styles.label}>البريد الإلكتروني</small>
              <div>{emp.email}</div>
            </div>

            <div>
              <small style={styles.label}>القسم</small>
              <div>{emp.department}</div>
            </div>

            <div>
              <small style={styles.label}>المنصب</small>
              <div>{emp.position}</div>
            </div>

            <div>
              <small style={styles.label}>الحالة</small>

              <span
                style={{
                  ...styles.statusBadge,
                  ...(emp.status === "نشط"
                    ? styles.statusActive
                    : styles.statusDeleted),
                }}
              >
                {emp.status}
              </span>
            </div>

            <div>
              <button
                style={{ ...styles.button, ...styles.editBtn }}
                onClick={() => openEdit(emp)}
              >
                تعديل
              </button>

              <button
                style={{ ...styles.button, ...styles.deleteBtn }}
                onClick={() => deleteEmployee(emp.employee_id)}
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🗑️ سلة المحذوفات */}
      {showTrash && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>سلة المحذوفات</h2>

            {deletedEmployees.map((emp) => (
              <div key={emp.employee_id} style={styles.row}>
                <span>{emp.name}</span>
                <button
                  style={styles.restoreBtn}
                  onClick={() => restoreEmployee(emp.employee_id)}
                >
                  استرجاع
                </button>
              </div>
            ))}

            <button onClick={() => setShowTrash(false)}>إغلاق</button>
          </div>
        </div>
      )}

      {/* ✏️ Modal */}
      {editing && (
        <div style={styles.modalOverlay}>
          <div style={styles.editModal}>
            <h2 style={styles.modalTitle}>✏️ تعديل بيانات الموظف</h2>

            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label>الاسم</label>
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div style={styles.field}>
                <label>البريد الإلكتروني</label>
                <input
                  style={styles.input}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div style={styles.field}>
                <label>القسم</label>
                <input
                  style={styles.input}
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                />
              </div>

              <div style={styles.field}>
                <label>المنصب</label>
                <input
                  style={styles.input}
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                />
              </div>

              <div style={styles.fieldFull}>
                <label>الدور</label>
                <input
                  style={styles.input}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button style={styles.saveBtn} onClick={updateEmployee}>
                💾 حفظ التعديلات
              </button>

              <button style={styles.cancelBtn} onClick={() => setEditing(null)}>
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
    padding: "30px",
    background: "#0b1220",
    minHeight: "100vh",
    color: "#fff",
    direction: "rtl",
  },

  title: {
    fontSize: "28px",
    marginBottom: "20px",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  label: {
    fontSize: "11px",
    color: "#9ca3af",
    marginBottom: "2px",
    display: "block",
  },

  leftTools: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  rightTools: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  addBtn: {
    background: "#6366f1",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #333",
  },

  table: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr 1fr",
    background: "#111827",
    padding: "12px",
    borderRadius: "10px",
    alignItems: "center",
  },

  button: {
    padding: "5px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    marginLeft: "5px",
  },

  editBtn: { background: "#3b82f6", color: "#fff" },
  deleteBtn: { background: "#ef4444", color: "#fff" },

  trashBtn: {
    background: "red",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
  },

  exportBtn: {
    background: "green",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
  },

  statusBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "inline-block",
    marginTop: "3px",
  },

  statusActive: {
    background: "rgba(34, 197, 94, 0.15)",
    color: "#22c55e",
    border: "1px solid #22c55e",
    fontWeight: "bold",
  },

  statusDeleted: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    border: "1px solid #ef4444",
    fontWeight: "bold",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    background: "#0f172a",
    padding: "20px",
    borderRadius: "10px",
    width: "400px",
  },

  /* ✨ MODAL EDIT الجديد */
  editModal: {
    background: "#0f172a",
    padding: "25px",
    borderRadius: "15px",
    width: "500px",
    color: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    animation: "fadeIn 0.3s ease-in-out",
  },

  modalTitle: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "22px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  fieldFull: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  modalActions: {
    display: "flex",
    marginTop: "20px",
    gap: "10px",
  },

  saveBtn: {
    background: "#22c55e",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    flex: 1,
  },

  cancelBtn: {
    background: "#ef4444",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    flex: 1,
  },
};
