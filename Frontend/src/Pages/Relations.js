import { useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";

const relationsItems = [
  { title: "العلاقات مع الرؤساء", max: 3 },
  { title: "العلاقات مع الزملاء", max: 3 },
  { title: "العلاقات مع المراجعين", max: 3 },
];

export default function Relations() {
  const nav = useNavigate();
  const location = useLocation();

  const {
    employee_id,
    name,
    from_date,
    to_date,
    performance,
    personality,
  } = location.state || {};

  const [r, setR] = useState({});

  const maxTotal = useMemo(
    () =>
      relationsItems.reduce(
        (sum, item) => sum + item.max,
        0
      ),
    []
  );

  const completed = Object.keys(r).length;

  const progress = Math.round(
    (completed / relationsItems.length) * 100
  );

  const total = useMemo(
    () =>
      Object.values(r).reduce(
        (sum, value) => sum + Number(value || 0),
        0
      ),
    [r]
  );

  const percentage = Math.round(
    (total / maxTotal) * 100
  );

  const change = (index, value, max) => {
    if (value === "") {
      const copy = { ...r };
      delete copy[index];
      setR(copy);
      return;
    }

    let num = Number(value);

    if (Number.isNaN(num)) return;

    if (num > max) num = max;
    if (num < 0) num = 0;

    setR((prev) => ({
      ...prev,
      [index]: num,
    }));
  };

  const next = () => {
    if (!employee_id || !from_date || !to_date) {
      alert("بيانات الموظف أو فترة التقييم غير مكتملة!");
      return;
    }

    if (Object.keys(r).length < relationsItems.length) {
      alert("يرجى تعبئة جميع معايير العلاقات قبل المتابعة!");
      return;
    }

    nav("/result", {
      state: {
        employee_id,
        name,
        from_date,
        to_date,
        performance,
        personality,
        relations: r,
      },
    });
  };

  return (
    <div style={styles.page}>

      {/* Background Decorations */}
      <div style={styles.backgroundGlow1} />
      <div style={styles.backgroundGlow2} />

      <main style={styles.container}>

        {/* ================= HEADER ================= */}

        <header style={styles.header}>

          <div style={styles.headerIcon}>
            🤝
          </div>

          <div>
            <div style={styles.badge}>
              المرحلة الثالثة والأخيرة
            </div>

            <h1 style={styles.title}>
              العلاقات الوظيفية
            </h1>

            <p style={styles.subtitle}>
              قيّم مستوى العلاقات والتعامل مع مختلف الأطراف
            </p>
          </div>

        </header>

        {/* ================= INFO ================= */}

        <section style={styles.infoCard}>

          <div style={styles.infoItem}>

            <span style={styles.infoIcon}>
              🤝
            </span>

            <div>
              <span style={styles.infoLabel}>
                نوع التقييم
              </span>

              <strong style={styles.infoValue}>
                العلاقات الوظيفية
              </strong>
            </div>

          </div>

          <div style={styles.divider} />

          <div style={styles.infoItem}>

            <span style={styles.infoIcon}>
              📋
            </span>

            <div>
              <span style={styles.infoLabel}>
                عدد المعايير
              </span>

              <strong style={styles.infoValue}>
                {relationsItems.length}
              </strong>
            </div>

          </div>

          <div style={styles.divider} />

          <div style={styles.infoItem}>

            <span style={styles.infoIcon}>
              🎯
            </span>

            <div>
              <span style={styles.infoLabel}>
                الدرجة القصوى
              </span>

              <strong style={styles.infoValue}>
                {maxTotal}
              </strong>
            </div>

          </div>

        </section>

        {/* ================= PROGRESS ================= */}

        <section style={styles.progressCard}>

          <div style={styles.progressTop}>

            <div>

              <span style={styles.progressTitle}>
                اكتمال تقييم العلاقات
              </span>

              <div style={styles.progressText}>
                {completed === relationsItems.length
                  ? "تم تقييم جميع العلاقات ✓"
                  : `تم تقييم ${completed} من ${relationsItems.length} معايير`}
              </div>

            </div>

            <div style={styles.progressNumber}>
              {progress}%
            </div>

          </div>

          <div style={styles.progressTrack}>

            <div
              style={{
                ...styles.progressBar,
                width: `${progress}%`,
              }}
            />

          </div>

        </section>

        {/* ================= MAIN CARD ================= */}

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div>

              <h2 style={styles.sectionTitle}>
                معايير العلاقات الوظيفية
              </h2>

              <p style={styles.sectionSubtitle}>
                حدد الدرجة المناسبة لكل علاقة
              </p>

            </div>

            <div style={styles.currentScore}>

              <span style={styles.currentScoreLabel}>
                المجموع الحالي
              </span>

              <strong style={styles.currentScoreValue}>
                {total}
                <small> / {maxTotal}</small>
              </strong>

            </div>

          </div>

          {/* ================= ITEMS ================= */}

          <div style={styles.itemsGrid}>

            {relationsItems.map((item, index) => {

              const value = r[index];

              const isCompleted =
                value !== undefined;

              const itemPercentage = isCompleted
                ? Math.round(
                    (Number(value) / item.max) * 100
                  )
                : 0;

              return (
                <div
                  key={index}
                  style={{
                    ...styles.item,
                    ...(isCompleted
                      ? styles.itemCompleted
                      : {}),
                  }}
                >

                  <div style={styles.itemTop}>

                    <div style={styles.itemNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div style={styles.itemContent}>

                      <label style={styles.label}>
                        {item.title}
                      </label>

                      <span style={styles.maxScore}>
                        الدرجة القصوى: {item.max}
                      </span>

                    </div>

                    {isCompleted && (
                      <div style={styles.check}>
                        ✓
                      </div>
                    )}

                  </div>

                  <div style={styles.inputRow}>

                    <div style={styles.inputWrapper}>

                      <input
                        type="number"
                        min="0"
                        max={item.max}
                        step="1"
                        placeholder="0"
                        value={value ?? ""}
                        onChange={(e) =>
                          change(
                            index,
                            e.target.value,
                            item.max
                          )
                        }
                        style={styles.input}
                      />

                      <span style={styles.inputSuffix}>
                        / {item.max}
                      </span>

                    </div>

                    <div style={styles.miniProgressTrack}>

                      <div
                        style={{
                          ...styles.miniProgress,
                          width: `${itemPercentage}%`,
                        }}
                      />

                    </div>

                    <span style={styles.percent}>
                      {itemPercentage}%
                    </span>

                  </div>

                </div>
              );
            })}

          </div>

          {/* ================= TOTAL ================= */}

          <div style={styles.totalCard}>

            <div>

              <span style={styles.totalLabel}>
                إجمالي نقاط العلاقات
              </span>

              <span style={styles.totalHint}>
                من أصل {maxTotal} نقاط
              </span>

            </div>

            <div style={styles.totalScore}>
              <strong>{total}</strong>
              <span>/ {maxTotal}</span>
            </div>

            <div style={styles.totalPercent}>
              {percentage}%
            </div>

          </div>

          {/* ================= FINAL MESSAGE ================= */}

          {completed === relationsItems.length && (
            <div style={styles.successMessage}>
              <span style={styles.successIcon}>
                ✓
              </span>

              <div>
                <strong>
                  اكتملت جميع مراحل التقييم
                </strong>

                <span>
                  اضغط على الزر للانتقال إلى النتيجة النهائية
                </span>
              </div>
            </div>
          )}

          {/* ================= ACTIONS ================= */}

          <div style={styles.actions}>

            <button
              type="button"
              style={styles.backButton}
              onClick={() => nav(-1)}
            >
              <span>→</span>
              رجوع
            </button>

            <button
              type="button"
              style={styles.nextButton}
              onClick={next}
            >
              <span>
                عرض النتيجة النهائية
              </span>

              <span style={styles.arrow}>
                ←
              </span>
            </button>

          </div>

        </section>

        {/* ================= FOOTER ================= */}

        <footer style={styles.footer}>
          <span>🔒</span>
          بيانات التقييم محفوظة بشكل آمن
        </footer>

      </main>

      {/* ================= RESPONSIVE ================= */}

      <style>
        {`
          @media (max-width: 700px) {

            .relations-items {
              grid-template-columns: 1fr !important;
            }

          }

          @media (max-width: 600px) {

            .relations-page {
              padding: 20px 12px !important;
            }

            .relations-header {
              align-items: flex-start !important;
            }

            .relations-title {
              font-size: 23px !important;
            }

            .relations-info {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 14px !important;
            }

            .relations-divider {
              width: 100% !important;
              height: 1px !important;
            }

            .relations-card {
              padding: 18px !important;
            }

            .relations-card-header {
              flex-direction: column !important;
              align-items: stretch !important;
            }

            .relations-current-score {
              width: 100% !important;
              box-sizing: border-box !important;
            }

            .relations-total {
              flex-wrap: wrap !important;
            }

            .relations-actions {
              flex-direction: column-reverse !important;
            }

            .relations-next {
              width: 100% !important;
              max-width: none !important;
            }

            .relations-back {
              width: 100% !important;
              justify-content: center !important;
            }

          }
        `}
      </style>

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {

  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #07111f 0%, #0f1f35 45%, #111827 100%)",
    fontFamily: "'Cairo', sans-serif",
    direction: "rtl",
    padding: "45px 20px",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  backgroundGlow1: {
    position: "fixed",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background:
      "rgba(14,165,233,0.12)",
    filter: "blur(90px)",
    top: "-180px",
    right: "-120px",
    pointerEvents: "none",
  },

  backgroundGlow2: {
    position: "fixed",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background:
      "rgba(37,99,235,0.10)",
    filter: "blur(90px)",
    bottom: "-180px",
    left: "-100px",
    pointerEvents: "none",
  },

  container: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  /* HEADER */

  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
  },

  headerIcon: {
    width: "65px",
    height: "65px",
    minWidth: "65px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    background:
      "linear-gradient(135deg, #0284c7, #2563eb)",
    boxShadow:
      "0 12px 30px rgba(14,165,233,0.30)",
  },

  badge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "700",
    color: "#7dd3fc",
    background:
      "rgba(14,165,233,0.10)",
    border:
      "1px solid rgba(56,189,248,0.18)",
    padding: "4px 11px",
    borderRadius: "20px",
    marginBottom: "5px",
  },

  title: {
    margin: 0,
    color: "#ffffff",
    fontSize: "30px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },

  /* INFO */

  infoCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "20px 25px",
    marginBottom: "18px",
    borderRadius: "18px",
    background:
      "rgba(255,255,255,0.055)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(15px)",
    boxShadow:
      "0 15px 40px rgba(0,0,0,0.18)",
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  infoIcon: {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    background:
      "rgba(14,165,233,0.12)",
    fontSize: "19px",
  },

  infoLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "11px",
    marginBottom: "2px",
  },

  infoValue: {
    color: "#f8fafc",
    fontSize: "17px",
  },

  divider: {
    width: "1px",
    height: "35px",
    background:
      "rgba(255,255,255,0.08)",
  },

  /* PROGRESS */

  progressCard: {
    padding: "20px 24px",
    marginBottom: "18px",
    borderRadius: "18px",
    background:
      "rgba(255,255,255,0.055)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(15px)",
  },

  progressTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "13px",
  },

  progressTitle: {
    display: "block",
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: "700",
  },

  progressText: {
    color: "#64748b",
    fontSize: "11px",
    marginTop: "3px",
  },

  progressNumber: {
    color: "#38bdf8",
    fontSize: "22px",
    fontWeight: "800",
  },

  progressTrack: {
    height: "8px",
    background:
      "rgba(255,255,255,0.07)",
    borderRadius: "20px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: "20px",
    background:
      "linear-gradient(90deg, #0284c7, #2563eb)",
    transition: "width 0.3s ease",
  },

  /* MAIN CARD */

  card: {
    background:
      "rgba(255,255,255,0.065)",
    border:
      "1px solid rgba(255,255,255,0.09)",
    backdropFilter: "blur(18px)",
    borderRadius: "24px",
    padding: "30px",
    boxShadow:
      "0 25px 70px rgba(0,0,0,0.28)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    paddingBottom: "22px",
    marginBottom: "22px",
    borderBottom:
      "1px solid rgba(255,255,255,0.07)",
  },

  sectionTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "21px",
    fontWeight: "800",
  },

  sectionSubtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "12px",
  },

  currentScore: {
    textAlign: "center",
    padding: "10px 20px",
    borderRadius: "14px",
    background:
      "rgba(14,165,233,0.09)",
    border:
      "1px solid rgba(56,189,248,0.14)",
  },

  currentScoreLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "10px",
    marginBottom: "2px",
  },

  currentScoreValue: {
    color: "#38bdf8",
    fontSize: "20px",
    fontWeight: "800",
  },

  /* ITEMS */

  itemsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },

  item: {
    padding: "20px",
    borderRadius: "17px",
    background:
      "rgba(15,23,42,0.55)",
    border:
      "1px solid rgba(255,255,255,0.06)",
    transition: "all 0.2s ease",
  },

  itemCompleted: {
    border:
      "1px solid rgba(14,165,233,0.28)",
    background:
      "linear-gradient(145deg, rgba(7,89,133,0.18), rgba(15,23,42,0.65))",
  },

  itemTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },

  itemNumber: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#7dd3fc",
    fontSize: "11px",
    fontWeight: "800",
    background:
      "rgba(14,165,233,0.10)",
    border:
      "1px solid rgba(56,189,248,0.14)",
  },

  itemContent: {
    flex: 1,
  },

  label: {
    display: "block",
    color: "#e2e8f0",
    fontSize: "13px",
    fontWeight: "700",
    lineHeight: "1.7",
  },

  maxScore: {
    display: "block",
    color: "#64748b",
    fontSize: "10px",
    marginTop: "2px",
  },

  check: {
    width: "23px",
    height: "23px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#bae6fd",
    background:
      "rgba(14,165,233,0.18)",
    fontSize: "12px",
    fontWeight: "800",
  },

  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  inputWrapper: {
    position: "relative",
    width: "100px",
    minWidth: "100px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 38px 11px 10px",
    borderRadius: "11px",
    border:
      "1px solid rgba(255,255,255,0.10)",
    background:
      "rgba(255,255,255,0.045)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    outline: "none",
    textAlign: "center",
    fontFamily: "'Cairo', sans-serif",
  },

  inputSuffix: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform:
      "translateY(-50%)",
    color: "#64748b",
    fontSize: "10px",
    pointerEvents: "none",
  },

  miniProgressTrack: {
    flex: 1,
    height: "6px",
    borderRadius: "20px",
    background:
      "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },

  miniProgress: {
    height: "100%",
    borderRadius: "20px",
    background:
      "linear-gradient(90deg, #0284c7, #2563eb)",
    transition:
      "width 0.25s ease",
  },

  percent: {
    width: "35px",
    color: "#64748b",
    fontSize: "10px",
    textAlign: "left",
  },

  /* TOTAL */

  totalCard: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginTop: "25px",
    padding: "20px 22px",
    borderRadius: "17px",
    background:
      "linear-gradient(135deg, rgba(14,165,233,0.12), rgba(37,99,235,0.08))",
    border:
      "1px solid rgba(56,189,248,0.15)",
  },

  totalLabel: {
    display: "block",
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: "800",
  },

  totalHint: {
    display: "block",
    color: "#64748b",
    fontSize: "10px",
    marginTop: "3px",
  },

  totalScore: {
    marginRight: "auto",
    display: "flex",
    alignItems: "baseline",
    gap: "3px",
  },

  totalPercent: {
    minWidth: "55px",
    textAlign: "center",
    padding: "7px 10px",
    borderRadius: "9px",
    color: "#bae6fd",
    background:
      "rgba(14,165,233,0.12)",
    fontSize: "12px",
    fontWeight: "800",
  },

  /* SUCCESS */

  successMessage: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "15px",
    padding: "13px 16px",
    borderRadius: "13px",
    background:
      "rgba(34,197,94,0.07)",
    border:
      "1px solid rgba(34,197,94,0.15)",
  },

  successIcon: {
    width: "30px",
    height: "30px",
    minWidth: "30px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(34,197,94,0.15)",
    color: "#86efac",
    fontWeight: "800",
  },

  /* ACTIONS */

  actions: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    marginTop: "25px",
  },

  backButton: {
    padding: "13px 25px",
    borderRadius: "12px",
    border:
      "1px solid rgba(255,255,255,0.09)",
    background:
      "rgba(255,255,255,0.045)",
    color: "#cbd5e1",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  nextButton: {
    flex: 1,
    maxWidth: "300px",
    padding: "14px 25px",
    borderRadius: "12px",
    border: "none",
    background:
      "linear-gradient(135deg, #0284c7, #2563eb)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "800",
    fontSize: "13px",
    boxShadow:
      "0 10px 25px rgba(14,165,233,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },

  arrow: {
    fontSize: "18px",
  },

  footer: {
    textAlign: "center",
    color: "#475569",
    fontSize: "10px",
    marginTop: "18px",
  },
};
