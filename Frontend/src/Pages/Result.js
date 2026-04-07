import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../api/api";

export default function Result() {
  const nav = useNavigate();
  const location = useLocation();
  const state = location.state || {};

    // eslint-disable-next-line no-unused-vars
  const [employeeId, setEmployeeId] = useState(state.employee_id || null);
  const [name, setName] = useState(state.name || "");
    // eslint-disable-next-line no-unused-vars
  const [fromDate, setFromDate] = useState(state.from_date || "");
   // eslint-disable-next-line no-unused-vars
  const [toDate, setToDate] = useState(state.to_date || "");
    // eslint-disable-next-line no-unused-vars
  const [performance, setPerformance] = useState(state.performance || {});
    // eslint-disable-next-line no-unused-vars
  const [personality, setPersonality] = useState(state.personality || {});
    // eslint-disable-next-line no-unused-vars
  const [relations, setRelations] = useState(state.relations || {});

  const [evaluationId, setEvaluationId] = useState(null);
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // إذا الاسم غير موجود، جلبه من الـ API
  useEffect(() => {
    if (!name && employeeId) {
      API.get(`/employees/${employeeId}`)
        .then(res => setName(res.data.name))
        .catch(err => console.error("Fetch employee name failed", err));
    }
  }, [employeeId, name]);

  const performanceTotal = Object.values(performance).reduce(
    (a, b) => a + Number(b || 0),
    0
  );
  const personalityTotal = Object.values(personality).reduce(
    (a, b) => a + Number(b || 0),
    0
  );
  const relationsTotal = Object.values(relations).reduce(
    (a, b) => a + Number(b || 0),
    0
  );

  const handleSubmit = async () => {
    if (!employeeId || !fromDate || !toDate) {
      alert("تأكد من وجود بيانات الموظف والفترة");
      return;
    }

    const payload = {
      employee_id: employeeId,
      from_date: fromDate,
      to_date: toDate,
      notes: "",
      performance: performanceTotal,
      personality: personalityTotal,
      relations: relationsTotal,
      performance_details: performance,
      personality_details: personality,
      relations_details: relations,
      total: performanceTotal + personalityTotal + relationsTotal,
    };

    try {
      setLoading(true);
      setError("");
      const res = await API.post("/evaluations", payload);
      setEvaluationId(res.data.evaluation_id);
      setGrade(res.data.grade);
      alert(`تم الحفظ بنجاح! التقدير: ${res.data.grade}`);
    } catch (err) {
      console.error(err.response?.data || err);
      setError("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  const goToNotes = () => {
    if (!evaluationId) {
      alert("يجب حفظ التقييم أولاً!");
      return;
    }

    nav("/notes", {
      state: {
        evaluationId,
        employee_id: employeeId,
        grade,
      },
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>تأكيد وحفظ التقييم</h2>

        <div style={styles.card}>
          <p><strong>الموظف:</strong> {name || "جاري التحميل..."}</p>
          <p><strong>من:</strong> {fromDate}</p>
          <p><strong>إلى:</strong> {toDate}</p>
          <p><strong>الأداء:</strong> {performanceTotal}</p>
          <p><strong>الشخصية:</strong> {personalityTotal}</p>
          <p><strong>العلاقات:</strong> {relationsTotal}</p>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleSubmit} style={styles.button} disabled={loading}>
          {loading ? "جارٍ الحفظ..." : "حفظ التقييم"}
        </button>

        {grade && (
          <>
            <div style={styles.gradeCard}>التقدير: <strong>{grade}</strong></div>
            <button onClick={goToNotes} style={styles.nextButton}>إضافة ملاحظات</button>
          </>
        )}
      </div>

      <button style={styles.backButton} onClick={() => nav(-1)}>⬅ رجوع</button>
    </div>
  );
}

// ... styles كما هي

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
  },
  container: {
    width: "100%",
    maxWidth: "650px",
    padding: "40px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    textAlign: "center",
  },
  heading: { fontSize: "26px", color: "#fff", fontWeight: "700" },
  card: {
    background: "rgba(255,255,255,0.06)",
    padding: "20px",
    borderRadius: "15px",
    textAlign: "right",
    color: "#e2e8f0",
    marginBottom: "20px",
    lineHeight: "1.8",
  },
  gradeCard: {
    marginTop: "15px",
    padding: "15px",
    borderRadius: "12px",
    color: "#fff",
    background: "linear-gradient(90deg, #38bdf8, #6366f1)",
    fontSize: "18px",
  },
  error: { color: "#f87171", marginBottom: "10px" },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(90deg, #38bdf8, #6366f1)",
    marginTop: "10px",
  },
  nextButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    marginTop: "10px",
    background: "#22c55e",
    color: "#fff",
    fontWeight: "600",
  },
  backButton: {
    position: "fixed",
    bottom: "20px",
    left: "20px",
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "#ef4444",
    color: "#fff",
    fontWeight: "600",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  },
};
