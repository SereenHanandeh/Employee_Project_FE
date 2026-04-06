import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../api/api";

export default function Result() {
  const nav = useNavigate();
  const { state } = useLocation();

  const [evaluationId, setEvaluationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState("");
  const [error, setError] = useState("");

  const {
    employee_id,
    name,
    performance,
    personality,
    relations,
    from_date,
    to_date,
  } = state || {};

  const performanceTotal = Object.values(performance || {}).reduce(
    (a, b) => a + Number(b),
    0,
  );
  const personalityTotal = Object.values(personality || {}).reduce(
    (a, b) => a + Number(b),
    0,
  );
  const relationsTotal = Object.values(relations || {}).reduce(
    (a, b) => a + Number(b),
    0,
  );

  // التحقق من وجود البيانات الأساسية
  useEffect(() => {
    if (!employee_id || !performance || !personality || !relations) {
      alert("البيانات غير مكتملة، سيتم الرجوع");
      nav("/");
    }
  }, [employee_id, performance, personality, relations, nav]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const handleSubmit = async () => {
        try {
          setLoading(true);
          setError("");

          // جهز payload بجميع الأعمدة الـ13 المطلوبة
          const payload = {
            employee_id, // معرف الموظف
            performance: Object.values(performance || {}).reduce(
              (a, b) => a + Number(b),
              0,
            ), // مجموع الأداء
            personality: Object.values(personality || {}).reduce(
              (a, b) => a + Number(b),
              0,
            ), // مجموع الشخصية
            relations: Object.values(relations || {}).reduce(
              (a, b) => a + Number(b),
              0,
            ), // مجموع العلاقات
            performance_details: performance || {}, // كائن التفاصيل
            personality_details: personality || {}, // كائن التفاصيل
            relations_details: relations || {}, // كائن التفاصيل
            total:
              Object.values(performance || {}).reduce(
                (a, b) => a + Number(b),
                0,
              ) +
              Object.values(personality || {}).reduce(
                (a, b) => a + Number(b),
                0,
              ) +
              Object.values(relations || {}).reduce((a, b) => a + Number(b), 0), // المجموع النهائي
            percentage: null, // الباك إند يحسب النسبة
            grade: null, // الباك إند يحسب التقدير
            notes: "", // ملاحظات فارغة
            from_date: from_date || null, // تاريخ البداية
            to_date: to_date || null, // تاريخ النهاية
          };

          console.log("Sending payload:", payload);

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

      const res = await API.post("/evaluations", payload);

      setEvaluationId(res.data.evaluation_id);
      setGrade(res.data.grade);

      alert(`تم الحفظ بنجاح! التقدير: ${res.data.grade}`);
    } catch (err) {
      console.log(err);
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
        employee_id,
        grade,
      },
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>تأكيد وحفظ التقييم</h2>

        <div style={styles.card}>
          <p>
            <strong>الموظف:</strong> {name}
          </p>
          <p>
            <strong>من:</strong> {from_date}
          </p>
          <p>
            <strong>إلى:</strong> {to_date}
          </p>
          <p>
            <strong>الأداء:</strong> {performanceTotal}
          </p>
          <p>
            <strong>الشخصية:</strong> {personalityTotal}
          </p>
          <p>
            <strong>العلاقات:</strong> {relationsTotal}
          </p>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleSubmit} style={styles.button} disabled={loading}>
          {loading ? "جارٍ الحفظ..." : "حفظ التقييم"}
        </button>

        {grade && (
          <>
            <div style={styles.gradeCard}>
              التقدير: <strong>{grade}</strong>
            </div>

            <button onClick={goToNotes} style={styles.nextButton}>
              إضافة ملاحظات
            </button>
          </>
        )}
      </div>

      <button style={styles.backButton} onClick={() => nav(-1)}>
        ⬅ رجوع
      </button>
    </div>
  );
}

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
