import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Step1() {
  const nav = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return nav("/login");

    const fetchData = async () => {
      try {
        const [empRes, leavesRes] = await Promise.all([
          API.get("/employees"),
          API.get("/leaves"),
        ]);

        setEmployees(empRes.data);
        setLeaves(leavesRes.data);
      } catch (err) {
        console.log(err);
        alert("فشل تحميل البيانات");
      }
    };

    fetchData();
  }, [nav]);

  const isOnLeave = (employeeId) => {
    const today = new Date();

    return leaves.some(
      (l) =>
        l.employee_id === employeeId &&
        new Date(l.from_date) <= today &&
        new Date(l.to_date) >= today &&
        l.status === "approved",
    );
  };

  const next = () => {
    if (!name || !from || !to) return alert("يرجى تعبئة جميع الحقول!");

    if (new Date(to) < new Date(from))
      return alert("تاريخ 'إلى' يجب أن يكون بعد 'من'");

    const selectedEmployee = employees.find((emp) => emp.name === name);

    if (!selectedEmployee) return alert("خطأ: الموظف غير موجود!");

    // 🚫 check leave from DB
    if (isOnLeave(selectedEmployee.employee_id)) {
      return alert("هذا الموظف في إجازة حالياً!");
    }

    nav("/performance", {
      state: {
        employee_id: selectedEmployee.employee_id,
        name,
        from_date: from,
        to_date: to,
      },
    });
  };

  const goBack = () => nav(-1);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>👨‍💼 بيانات الموظف</h2>

        {/* Employee Select */}
        <div style={styles.formGroup}>
          <label style={styles.label}>اختر الموظف</label>
          <select
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          >
            <option value="">-- اختر الموظف --</option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.name}>
                {emp.name} {isOnLeave(emp.employee_id) ? " (On Leave)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* From */}
        <div style={styles.formGroup}>
          <label style={styles.label}>من</label>
          <input
            type="date"
            style={styles.input}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        {/* To */}
        <div style={styles.formGroup}>
          <label style={styles.label}>إلى</label>
          <input
            type="date"
            style={styles.input}
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <button style={styles.button} onClick={next}>
          ➜ التالي
        </button>
      </div>

      <button style={styles.backBtn} onClick={goBack}>
        ⬅ رجوع
      </button>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#0f172a,#1e293b)",
    fontFamily: "'Cairo', sans-serif",
    direction: "rtl",
    padding: "20px",
  },

  card: {
    width: "500px",
    padding: "40px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
  },

  heading: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#fff",
    fontSize: "26px",
    fontWeight: "700",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
  },

  label: {
    marginBottom: "8px",
    fontWeight: "600",
    color: "#cbd5e1",
  },

  input: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "14px",
    marginTop: "10px",
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(59,130,246,0.3)",
  },

  backBtn: {
    position: "fixed",
    bottom: "25px",
    right: "25px",
    background: "linear-gradient(135deg,#475569,#1e293b)",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "50px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
  },
};
