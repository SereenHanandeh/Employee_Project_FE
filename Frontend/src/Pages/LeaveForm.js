import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function LeaveForm() {
  const nav = useNavigate();

  const [employees, setEmployees] = useState([]);

  const [me, setMe] = useState(null);

  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState("سنوية");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [notes, setNotes] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await API.get("/employees/me");
        setMe(res.data);

        if (res.data.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setEmployeeId(res.data.employee_id);
        }
      } catch (err) {
        console.log(err);
        alert("فشل جلب بيانات المستخدم");
      }
    };

    const fetchEmployees = async () => {
      try {
        const res = await API.get("/employees");
        setEmployees(res.data);
      } catch (err) {
        console.log(err);
        alert("فشل تحميل الموظفين");
      }
    };

    fetchMe();
    fetchEmployees();
  }, []);

  const saveLeave = async () => {
    console.log("from:", from);
    console.log("to:", to);
    if (!employeeId || !from || !to) {
      alert("يرجى تعبئة جميع الحقول");
      return;
    }

    const payload = {
      employee_id: employeeId,
      type,
      from_date: from || null,
      to_date: to || null,
      notes: notes || "",
    };

    console.log("SEND TO BACKEND:", payload);
    

    try {
      await API.post("/leaves", payload);
      alert("تم حفظ الإجازة بنجاح");
      nav("/employee");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("حدث خطأ في حفظ الإجازة");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>طلب إجازة</h2>

        {/* ADMIN ONLY */}
        {isAdmin ? (
          <>
            <label style={styles.label}>اسم الموظف</label>
            <select
              style={styles.input}
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">اختر الموظف</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label style={styles.label}>الموظف</label>
            <input style={styles.input} value={me?.name || ""} disabled />
          </>
        )}

        {/* TYPE */}
        <label style={styles.label}>نوع الإجازة</label>
        <select
          style={styles.input}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="سنوية">سنوية</option>
          <option value="مرضية">مرضية</option>
          <option value="طارئة">طارئة</option>
          <option value="بدون راتب">بدون راتب</option>
          <option value="أمومة">أمومة</option>
          <option value="استثنائية">استثنائية</option>
        </select>

        {/* DATES */}
        <label style={styles.label}>من تاريخ</label>
        <input
          type="date"
          style={styles.input}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />

        <label style={styles.label}>إلى تاريخ</label>
        <input
          type="date"
          style={styles.input}
          value={to}
          min={from}
          onChange={(e) => setTo(e.target.value)}
        />

        {/* NOTES */}
        <label style={styles.label}>ملاحظات</label>
        <textarea
          style={{ ...styles.input, height: 90 }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button style={styles.button} onClick={saveLeave}>
          حفظ الإجازة
        </button>
      </div>
    </div>
  );
}

/* ========================= */
/*        STYLES NEW         */
/* ========================= */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    direction: "rtl",
    fontFamily: "Tahoma",

    /* 🔥 خلفية حديثة بدل الأبيض */
    background: "linear-gradient(135deg, #0f172a, #1e293b, #0ea5e9)",
  },

  card: {
    width: "430px",
    padding: "35px",
    borderRadius: "18px",

    /* glass effect */
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",

    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.15)",

    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  title: {
    textAlign: "center",
    marginBottom: 10,
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
  },

  label: {
    fontSize: 13,
    color: "#e2e8f0",
    fontWeight: "bold",
  },

  input: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: 14,
    outline: "none",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
  },

  button: {
    marginTop: 15,
    padding: "12px",
    background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: 15,
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 10px 25px rgba(59,130,246,0.4)",
    transition: "0.3s",
  },
};
