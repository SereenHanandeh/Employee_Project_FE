import { useEffect, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [editing, setEditing] = useState(null);

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

  // ================= SOFT DELETE =================
  const deleteEmployee = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;

    try {
      await API.delete(/employees/${id}/delete);

      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === id ? { ...e, status: "deleted" } : e
        )
      );
    } catch {
      alert("فشل الحذف");
    }
  };

  const restoreEmployee = async (id) => {
    try {
      await API.put(/employees/${id}/restore);

      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === id ? { ...e, status: "active" } : e
        )
      );
    } catch {
      alert("فشل الاسترجاع");
    }
  };

  // ================= EDIT =================
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
      await API.put(/employees/${editing.employee_id}/update, form);

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

  // ================= FILTER =================
  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterDept ? emp.department === filterDept : true) &&
      (filterStatus ? emp.status === filterStatus : emp.status !== "deleted")
    );
  });

  const deletedEmployees = employees.filter(
    (emp) => emp.status === "deleted"
  );

  // ================= EXPORT EXCEL =================
  const exportToExcel = () => {
    const data = filteredEmployees.map((emp) => ({
      الاسم: emp.name,
      الإيميل: emp.email,
      القسم: emp.department,
      المنصب: emp.position,
      الحالة: emp.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const file = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([file], { type: "application/octet-stream" }),
      "employees.xlsx"
    );
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>👨‍💼 Employees Dashboard</h1>

      {/* TOP BAR */}
      <div style={styles.topBar}>
        <input
          placeholder="🔍 Search..."
          style={styles.input}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          style={styles.input}
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
        </select>

        <select
          style={styles.input}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Active Only</option>
          <option value="active">Active</option>
          <option value="deleted">Deleted</option>
        </select>

        <button style={styles.trashBtn} onClick={() => setShowTrash(true)}>
          🗑️ Trash
        </button>

        <button style={styles.exportBtn} onClick={exportToExcel}>
          📥 Excel
        </button>
      </div>

      {/* TABLE */}
      <div style={styles.table}>
        {filteredEmployees.map((emp) => (
          <div
            key={emp.employee_id}
            style={styles.row}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.01)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <span>{emp.name}</span>
            <span>{emp.email}</span>
            <span>{emp.department}</span>
            <span>{emp.position}</span>

            <span
              style={
                emp.status === "active"
                  ? styles.statusActive
                  : styles.statusDeleted
              }
            >
              {emp.status}
            </span>

            <div>
              <button
                style={{ ...styles.button, ...styles.editBtn }}
                onClick={() => openEdit(emp)}
              >
                Edit
              </button>

              <button
                style={{ ...styles.button, ...styles.deleteBtn }}
                onClick={() => deleteEmployee(emp.employee_id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* TRASH */}
      {showTrash && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>🗑️ Trash</h2>

            {deletedEmployees.map((emp) => (
              <div key={emp.employee_id} style={styles.row}>
                <span>{emp.name}</span>
                <button
                  style={{ ...styles.button, ...styles.restoreBtn }}
                  onClick={() => restoreEmployee(emp.employee_id)}
                >
                  Restore
                </button>
              </div>
            ))}

            <button onClick={() => setShowTrash(false)}>Close</button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Edit Employee</h2>

            <input
              style={styles.input}
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Name"
            />

            <input
              style={styles.input}
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="Email"
            />

            <input
              style={styles.input}
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
              placeholder="Department"
            />

            <input
              style={styles.input}
              value={form.position}
              onChange={(e) =>
                setForm({ ...form, position: e.target.value })
              }
              placeholder="Position"
            />

            <input
              style={styles.input}
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
              placeholder="Role"
            />

            <button onClick={updateEmployee}>Save</button>
            <button onClick={() => setEditing(null)}>Cancel</button>
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
    color: "#e5e7eb",
    fontFamily: "Arial",
  },

  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "20px",
  },

  topBar: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  input: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#111827",
    color: "#fff",
  },

  table: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr 1fr",
    background: "#111827",
    padding: "14px",
    borderRadius: "12px",
    transition: "0.2s",
    alignItems: "center",
  },

  button: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginLeft: "5px",
  },

  editBtn: { background: "#3b82f6", color: "#fff" },
  deleteBtn: { background: "#ef4444", color: "#fff" },
  restoreBtn: { background: "#f59e0b", color: "#fff" },

  trashBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "10px",
  },

  exportBtn: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "10px",
  },

  statusActive: {
    color: "#22c55e",
    fontWeight: "bold",
  },

  statusDeleted: {
    color: "#ef4444",
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
    borderRadius: "12px",
    width: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};