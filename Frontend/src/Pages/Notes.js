import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import API from "../api/api";

export default function Notes() {
  const nav = useNavigate();
  const { state } = useLocation();

  const evaluationId = state?.evaluationId;

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const next = async () => {
    if (notes.trim() === "") {
      alert("يرجى إدخال بعض الملاحظات قبل المتابعة!");
      return;
    }

    if (!evaluationId) {
      alert("لا يوجد ID للتقييم!");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await API.put(
        `/evaluations/${evaluationId}`,
        { notes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("تم حفظ الملاحظات بنجاح ✅");

      // ✅ إرسال ID لصفحة الطباعة
      nav("/print", {
        state: { evaluationId },
      });

    } catch (err) {
      console.log(err);
      alert("حدث خطأ أثناء حفظ الملاحظات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>الملاحظات</h2>

        <div style={styles.card}>
          <textarea
            rows="10"
            style={styles.textarea}
            placeholder="اكتب ملاحظاتك هنا..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
          }}
          onClick={next}
          disabled={loading}
        >
          {loading ? "جارٍ الحفظ..." : "الانتقال إلى الطباعة"}
        </button>
      </div>
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
    maxWidth: "700px",
    padding: "40px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    textAlign: "center",
  },

  heading: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "20px",
  },

  card: {
    background: "rgba(255,255,255,0.06)",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "25px",
  },

  textarea: {
    width: "100%",
    padding: "18px",
    borderRadius: "12px",
    border: "1px solid #334155",
    fontSize: "16px",
    resize: "vertical",
    outline: "none",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    color: "#fff",
  },

  button: {
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(90deg, #38bdf8, #6366f1)",
    color: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
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