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

  // ================= normalize status =================
  const getStatusKey = (status) => {
    if (!status) return "";

    const s = status.toLowerCase();

    if (s === "نشط" || s === "active") return "active";
    if (s === "محذوف" || s === "deleted") return "deleted";

    return s;
  };

  // ================= fetch =================
  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");
      setEmployees(res.data || []);
    } catch {
      alert("فشل تحميل الموظفين");
    }
  };

  // ================= delete =================
  const deleteEmployee = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف الموظف؟")) return;

    try {
      await API.delete(`/employees/${id}/delete`);

      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === id ? { ...e, status: "محذوف" } : e
        )
      );
    } catch {
      alert("فشل عملية الحذف");
    }
  };

  // ================= restore =================
  const restoreEmployee = async (id) => {
    try {
      await API.put(`/employees/${id}/restore`);

      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === id ? { ...e, status: "نشط" } : e
        )
      );
    } catch {
      alert("فشل الاسترجاع");
    }
  };

  // ================= edit =================
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
          e.employee_id === editing.employee_id ? { ...e, ...form } : e
        )
      );

      setEditing(null);
    } catch {
      alert("فشل التعديل");
    }
  };

  // ================= filter =================
  const filteredEmployees = employees.filter((emp) => {
    const statusKey = getStatusKey(emp.status);

    return (
      emp.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterDept ? emp.department === filterDept : true) &&
      (filterStatus
        ? statusKey === getStatusKey(filterStatus)
        : statusKey !== "deleted")
    );
  });

  const deletedEmployees = employees.filter(
    (emp) => getStatusKey(emp.status) === "deleted"
  );

  // ================= excel =================
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
      "الموظفين.xlsx"
    );
  };

  return (
    <div style={styles.page}>

      {/* HEADER + BACK BUTTON */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={styles.title}>👨‍💼 إدارة الموظفين</h1>

        <button
          onClick={() => nav(-1)}
          style={{
            background: "#334155",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          🔙 رجوع
        </button>
      </div>

      {/* TOP BAR */}
      <div style={styles.topBar}>
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

      {/* TABLE */}
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
                  ...(getStatusKey(emp.status) === "active"
                    ? styles.statusActive
                    : styles.statusDeleted),
                }}
              >
                {emp.status}
              </span>
            </div>

            {/* ACTIONS */}
            {getStatusKey(emp.status) === "active" ? (
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
            ) : (
              <button
                style={styles.restoreBtn}
                onClick={() => restoreEmployee(emp.employee_id)}
              >
                استرجاع
              </button>
            )}
          </div>
        ))}
      </div>

      {/* TRASH MODAL */}
      {showTrash && (
        <div style={styles.modalOverlay}>
          <div style={styles.trashModal}>
            <div style={styles.trashHeader}>
              <h2>🗑️ سلة المحذوفات</h2>

              <button
                style={styles.closeBtn}
                onClick={() => setShowTrash(false)}
              >
                ✖
              </button>
            </div>

            <div style={styles.trashList}>
              {deletedEmployees.length === 0 ? (
                <p style={{ textAlign: "center", color: "#9ca3af" }}>
                  لا يوجد موظفين محذوفين
                </p>
              ) : (
                deletedEmployees.map((emp) => (
                  <div key={emp.employee_id} style={styles.trashCard}>
                    <div>
                      <div style={styles.trashName}>{emp.name}</div>
                      <div style={styles.trashInfo}>{emp.email}</div>
                      <div style={styles.trashInfo}>{emp.department}</div>
                    </div>

                    <button
                      style={styles.restoreBtn}
                      onClick={() => restoreEmployee(emp.employee_id)}
                    >
                      🔄 استرجاع
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={styles.trashFooter}>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowTrash(false)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
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
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div style={styles.field}>
                <label>البريد الإلكتروني</label>
                <input
                  style={styles.input}
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button style={styles.saveBtn} onClick={updateEmployee}>
                💾 حفظ
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
    padding: "30px",
    background: "#0b1220",
    minHeight: "100vh",
    color: "#fff",
    direction: "rtl",
  },
  title: { fontSize: "28px", marginBottom: "20px" },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  leftTools: { display: "flex", gap: "10px", flexWrap: "wrap" },
  rightTools: { display: "flex", gap: "10px", flexWrap: "wrap" },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #333",
  },

  addBtn: {
    background: "#6366f1",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
  },

  trashBtn: {
    background: "red",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
  },

  exportBtn: {
    background: "green",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
  },

  table: { display: "flex", flexDirection: "column", gap: "10px" },

  row: {
    display: "grid",
    gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr 1fr",
    background: "#111827",
    padding: "12px",
    borderRadius: "10px",
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

  restoreBtn: {
    background: "#22c55e",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
  },

  statusBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
  },

  statusActive: {
    background: "#14532d",
    color: "#22c55e",
  },

  statusDeleted: {
    background: "#450a0a",
    color: "#ef4444",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  editModal: {
    background: "#0f172a",
    padding: "25px",
    borderRadius: "15px",
    width: "500px",
  },

  trashModal: {
    width: "500px",
    maxHeight: "80vh",
    background: "#0f172a",
    padding: "20px",
    borderRadius: "15px",
  },

  trashList: {
    maxHeight: "50vh",
    overflowY: "auto",
  },

  trashCard: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
  },

  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },

  saveBtn: {
    background: "#22c55e",
    color: "#fff",
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
  },

  cancelBtn: {
    background: "#ef4444",
    color: "#fff",
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
  },
};