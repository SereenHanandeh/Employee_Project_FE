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
      await API.put(`/employees/${id}/delete`, { status: "deleted" });

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
      await API.put(`/employees/${id}/restore`, { status: "active" });

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
      await API.put(`/employees/${editing.employee_id}/update`, form);

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

  // ================= FILTER =================
  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.status !== "deleted" &&
      emp.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterDept ? emp.department === filterDept : true) &&
      (filterStatus ? emp.status === filterStatus : true)
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
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>👨‍💼 الموظفين</h1>
      </div>

      {/* TOP BAR */}
      <div style={styles.topBar}>
        <input
          placeholder="🔍 بحث"
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
          <option value="IT">IT</option>
          <option value="HR">HR</option>
        </select>

        <select
          style={styles.input}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="deleted">محذوف</option>
        </select>

        <button style={styles.trashBtn} onClick={() => setShowTrash(true)}>
          🗑️ سلة المهملات
        </button>

        <button style={styles.exportBtn} onClick={exportToExcel}>
          📥 Excel
        </button>
      </div>

      {/* TABLE */}
      <div style={styles.table}>
        {filteredEmployees.map((emp) => (
          <div key={emp.employee_id} style={styles.row}>
            <span>{emp.name}</span>
            <span>{emp.email}</span>
            <span>{emp.department}</span>
            <span>{emp.position}</span>
            <span>
              {emp.status === "active" ? "🟢 نشط" : "🔴 محذوف"}
            </span>

            <div>
              <button onClick={() => openEdit(emp)}>تعديل</button>
              <button onClick={() => deleteEmployee(emp.employee_id)}>
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* TRASH */}
      {showTrash && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>🗑️ سلة المهملات</h2>

            {deletedEmployees.map((emp) => (
              <div key={emp.employee_id} style={styles.row}>
                <span>{emp.name}</span>
                <button onClick={() => restoreEmployee(emp.employee_id)}>
                  استرجاع
                </button>
              </div>
            ))}

            <button onClick={() => setShowTrash(false)}>إغلاق</button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>تعديل موظف</h2>

            <label>الاسم</label>
            <input
              style={styles.input}
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <label>الإيميل</label>
            <input
              style={styles.input}
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <label>القسم</label>
            <input
              style={styles.input}
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
            />

            <label>المنصب</label>
            <input
              style={styles.input}
              value={form.position}
              onChange={(e) =>
                setForm({ ...form, position: e.target.value })
              }
            />

            <label>الدور</label>
            <input
              style={styles.input}
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            />

            <button onClick={updateEmployee}>حفظ</button>
            <button onClick={() => setEditing(null)}>إلغاء</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLE ================= */
const styles = {
  page: { padding: "30px", color: "#fff" },

  header: { marginBottom: "20px" },

  title: { fontSize: "26px" },

  topBar: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  input: {
    padding: "8px",
    borderRadius: "8px",
  },

  trashBtn: {
    background: "red",
    color: "#fff",
    border: "none",
    padding: "8px",
  },

  exportBtn: {
    background: "green",
    color: "#fff",
    border: "none",
    padding: "8px",
  },

  table: { display: "flex", flexDirection: "column", gap: "10px" },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
    background: "#1e293b",
    padding: "10px",
    borderRadius: "10px",
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
    background: "#0f172a",
    padding: "20px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};