import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import API from "../api/api";

export default function Notes() {
  const nav = useNavigate();
  const { state } = useLocation();

  const evaluationId = state?.evaluationId;
  const employeeId = state?.employee_id;
  const employeeName = state?.name;
  const grade = state?.grade;

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================================
  // حفظ الملاحظات والانتقال للطباعة
  // =========================================================

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
        { notes: notes.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("تم حفظ الملاحظات بنجاح ✅");

      // إرسال ID لصفحة الطباعة
      nav("/print", {
        state: {
          evaluationId,
        },
      });
    } catch (err) {
      console.error("Error saving notes:", err);
      alert("حدث خطأ أثناء حفظ الملاحظات");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // عدد الأحرف
  // =========================================================

  const characterCount = notes.length;

  return (
    <div style={styles.page}>
      {/* خلفيات زخرفية */}
      <div style={styles.glowTop}></div>
      <div style={styles.glowBottom}></div>

      <div style={styles.container}>
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div style={styles.header}>
          <div style={styles.headerIcon}>📝</div>

          <div style={styles.headerContent}>
            <div style={styles.badge}>
              الخطوة الأخيرة
            </div>

            <h1 style={styles.heading}>
              ملاحظات التقييم
            </h1>

            <p style={styles.subheading}>
              أضف ملاحظاتك وتوصياتك قبل إصدار نموذج التقييم
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* EMPLOYEE INFO */}
        {/* ================================================= */}

        {(employeeName || employeeId || grade) && (
          <div style={styles.employeeCard}>
            <div style={styles.employeeIcon}>
              👤
            </div>

            <div style={styles.employeeInfo}>
              <span style={styles.label}>
                الموظف محل التقييم
              </span>

              <strong style={styles.employeeName}>
                {employeeName || `الموظف رقم ${employeeId}`}
              </strong>

              {employeeId && (
                <span style={styles.employeeId}>
                  الرقم الوظيفي: {employeeId}
                </span>
              )}
            </div>

            {grade && (
              <div style={styles.gradeBadge}>
                ⭐ {grade}
              </div>
            )}
          </div>
        )}

        {/* ================================================= */}
        {/* NOTES CARD */}
        {/* ================================================= */}

        <div style={styles.notesCard}>
          <div style={styles.notesHeader}>
            <div style={styles.notesTitleWrapper}>
              <div style={styles.notesIcon}>
                ✍️
              </div>

              <div>
                <h2 style={styles.notesTitle}>
                  ملاحظات المسؤول
                </h2>

                <p style={styles.notesSubtitle}>
                  اكتب الملاحظات المتعلقة بأداء الموظف
                </p>
              </div>
            </div>

            <div style={styles.requiredBadge}>
              مطلوب
            </div>
          </div>

          {/* ================================================= */}
          {/* TEXTAREA */}
          {/* ================================================= */}

          <div style={styles.textareaWrapper}>
            <textarea
              rows="10"
              style={styles.textarea}
              placeholder="اكتب ملاحظاتك هنا...

مثال:
- نقاط القوة لدى الموظف
- الجوانب التي تحتاج إلى تطوير
- التوصيات المستقبلية
- أي ملاحظات إضافية مهمة"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />

            <div style={styles.textareaFooter}>
              <span style={styles.hint}>
                💡 حاول أن تكون الملاحظات واضحة ومحددة
              </span>

              <span
                style={{
                  ...styles.counter,
                  color:
                    characterCount > 0
                      ? "#60a5fa"
                      : "#64748b",
                }}
              >
                {characterCount} حرف
              </span>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* INFO BOX */}
        {/* ================================================= */}

        <div style={styles.infoBox}>
          <div style={styles.infoIcon}>
            ℹ️
          </div>

          <div>
            <strong style={styles.infoTitle}>
              قبل المتابعة
            </strong>

            <p style={styles.infoText}>
              بعد حفظ الملاحظات سيتم الانتقال إلى صفحة الطباعة
              لإصدار نموذج التقييم النهائي.
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <div style={styles.actions}>
          <button
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
            onClick={next}
            disabled={loading}
          >
            <span style={styles.buttonIcon}>
              {loading ? "⏳" : "🖨️"}
            </span>

            <span>
              {loading
                ? "جارٍ حفظ الملاحظات..."
                : "حفظ الملاحظات والانتقال للطباعة"}
            </span>

            {!loading && (
              <span style={styles.buttonArrow}>
                ←
              </span>
            )}
          </button>

          <button
            style={styles.backButton}
            onClick={() => nav(-1)}
            disabled={loading}
          >
            <span>→</span>
            الرجوع للتقييم
          </button>
        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div style={styles.footer}>
          <span>🔒</span>
          جميع البيانات محفوظة ضمن نظام التقييم
        </div>
      </div>

      {/* Responsive */}
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: "Cairo", "Tajawal", Arial, sans-serif;
          }

          button,
          textarea {
            font-family: inherit;
          }

          textarea::placeholder {
            color: #64748b;
            opacity: 1;
          }

          textarea:focus {
            border-color: rgba(56, 189, 248, 0.65) !important;
            box-shadow:
              0 0 0 4px rgba(56, 189, 248, 0.08),
              0 10px 30px rgba(0, 0, 0, 0.15);
          }

          button:not(:disabled):hover {
            transform: translateY(-2px);
          }

          @media (max-width: 650px) {
            .notes-page-container {
              padding: 20px 14px !important;
            }
          }

          @media (max-width: 500px) {
            .employee-card-mobile {
              flex-direction: column !important;
              align-items: flex-start !important;
            }
          }
        `}
      </style>
    </div>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px 20px 70px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    background:
      "radial-gradient(circle at top right, rgba(37,99,235,.18), transparent 35%), radial-gradient(circle at bottom left, rgba(99,102,241,.15), transparent 35%), linear-gradient(135deg, #07111f, #0f172a 55%, #111827)",
    position: "relative",
    overflow: "hidden",
    direction: "rtl",
    color: "#fff",
  },

  glowTop: {
    position: "fixed",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(14,165,233,.09)",
    filter: "blur(90px)",
    top: "-120px",
    right: "-80px",
    pointerEvents: "none",
  },

  glowBottom: {
    position: "fixed",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(99,102,241,.09)",
    filter: "blur(90px)",
    bottom: "-120px",
    left: "-80px",
    pointerEvents: "none",
  },

  container: {
    width: "100%",
    maxWidth: "850px",
    position: "relative",
    zIndex: 2,
  },

  // =========================================================
  // HEADER
  // =========================================================

  header: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "25px",
  },

  headerIcon: {
    width: "65px",
    height: "65px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "29px",
    flexShrink: 0,
    background:
      "linear-gradient(135deg, #0ea5e9, #4f46e5)",
    boxShadow:
      "0 15px 35px rgba(37,99,235,.25)",
  },

  headerContent: {
    flex: 1,
  },

  badge: {
    display: "inline-flex",
    padding: "5px 12px",
    borderRadius: "30px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#93c5fd",
    background: "rgba(59,130,246,.12)",
    border:
      "1px solid rgba(96,165,250,.20)",
    marginBottom: "6px",
  },

  heading: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-.5px",
  },

  subheading: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },

  // =========================================================
  // EMPLOYEE
  // =========================================================

  employeeCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "18px 20px",
    marginBottom: "16px",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, rgba(30,41,59,.85), rgba(15,23,42,.75))",
    border:
      "1px solid rgba(148,163,184,.12)",
    boxShadow:
      "0 15px 40px rgba(0,0,0,.18)",
  },

  employeeIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    background:
      "linear-gradient(135deg, rgba(14,165,233,.15), rgba(79,70,229,.15))",
    border:
      "1px solid rgba(96,165,250,.14)",
    flexShrink: 0,
  },

  employeeInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  label: {
    color: "#64748b",
    fontSize: "11px",
  },

  employeeName: {
    color: "#f8fafc",
    fontSize: "18px",
    fontWeight: "800",
  },

  employeeId: {
    color: "#64748b",
    fontSize: "11px",
  },

  gradeBadge: {
    padding: "8px 13px",
    borderRadius: "10px",
    color: "#86efac",
    background: "rgba(34,197,94,.10)",
    border:
      "1px solid rgba(34,197,94,.16)",
    fontSize: "12px",
    fontWeight: "800",
  },

  // =========================================================
  // NOTES CARD
  // =========================================================

  notesCard: {
    padding: "25px",
    borderRadius: "24px",
    background:
      "linear-gradient(145deg, rgba(30,41,59,.86), rgba(15,23,42,.80))",
    border:
      "1px solid rgba(148,163,184,.12)",
    boxShadow:
      "0 20px 60px rgba(0,0,0,.24)",
    marginBottom: "15px",
  },

  notesHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "20px",
  },

  notesTitleWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  notesIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    background:
      "linear-gradient(135deg, rgba(14,165,233,.15), rgba(99,102,241,.15))",
  },

  notesTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "800",
    color: "#f1f5f9",
  },

  notesSubtitle: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#64748b",
  },

  requiredBadge: {
    padding: "6px 11px",
    borderRadius: "20px",
    color: "#fbbf24",
    background: "rgba(245,158,11,.09)",
    border:
      "1px solid rgba(245,158,11,.15)",
    fontSize: "10px",
    fontWeight: "700",
  },

  // =========================================================
  // TEXTAREA
  // =========================================================

  textareaWrapper: {
    position: "relative",
  },

  textarea: {
    width: "100%",
    minHeight: "260px",
    padding: "18px",
    borderRadius: "17px",
    border:
      "1px solid rgba(71,85,105,.75)",
    outline: "none",
    resize: "vertical",
    background:
      "rgba(2,6,23,.45)",
    color: "#f8fafc",
    fontSize: "14px",
    lineHeight: "2",
    transition: "all .2s ease",
    direction: "rtl",
  },

  textareaFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginTop: "9px",
  },

  hint: {
    color: "#475569",
    fontSize: "10px",
  },

  counter: {
    fontSize: "11px",
    fontWeight: "700",
    direction: "rtl",
  },

  // =========================================================
  // INFO
  // =========================================================

  infoBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "15px 17px",
    borderRadius: "16px",
    marginBottom: "18px",
    background:
      "rgba(14,165,233,.055)",
    border:
      "1px solid rgba(14,165,233,.12)",
  },

  infoIcon: {
    fontSize: "18px",
    flexShrink: 0,
  },

  infoTitle: {
    display: "block",
    color: "#bae6fd",
    fontSize: "12px",
    marginBottom: "3px",
  },

  infoText: {
    margin: 0,
    color: "#64748b",
    fontSize: "11px",
    lineHeight: "1.8",
  },

  // =========================================================
  // ACTIONS
  // =========================================================

  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  button: {
    width: "100%",
    minHeight: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    border: "none",
    borderRadius: "16px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #0ea5e9, #4f46e5)",
    boxShadow:
      "0 15px 30px rgba(37,99,235,.22)",
    transition: "all .2s ease",
  },

  buttonIcon: {
    fontSize: "18px",
  },

  buttonArrow: {
    fontSize: "19px",
    marginRight: "5px",
  },

  backButton: {
    width: "100%",
    minHeight: "47px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border:
      "1px solid rgba(148,163,184,.13)",
    borderRadius: "14px",
    color: "#94a3b8",
    background:
      "rgba(30,41,59,.55)",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all .2s ease",
  },

  // =========================================================
  // FOOTER
  // =========================================================

  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    marginTop: "17px",
    color: "#475569",
    fontSize: "10px",
  },
};