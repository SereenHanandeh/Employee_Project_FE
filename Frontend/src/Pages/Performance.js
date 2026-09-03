import { useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";

const items = [
  { title: "القدرة على تطوير أساليب العمل", max: 5 },
  { title: "القدرة على تدريب غيره من العاملين", max: 4 },
  { title: "المهارة في التنفيذ", max: 6 },
  { title: "القدرة على تحديد متطلبات إنجاز العمل", max: 5 },
  { title: "القدرة على تحديد خطوات العمل والبرنامج الزمني", max: 4 },
  { title: "المحافظة على أوقات العمل", max: 6 },
  { title: "القدرة على التغلب على صعوبات العمل", max: 6 },
  { title: "المعرفة بالأسس والمفاهيم الفنية", max: 4 },
  { title: "المعرفة بنظم العمل", max: 4 },
  { title: "المتابعة لما يستجد", max: 4 },
  { title: "المشاركة في الاجتماعات", max: 4 },
  { title: "الاتصالات الفعالة", max: 5 },
  { title: "تحمل المسؤوليات", max: 3 },
  { title: "معرفة الأهداف", max: 2 },
  { title: "تقديم الأفكار", max: 2 },
  { title: "إنجاز العمل", max: 4 },
  { title: "المراجعة والتدقيق", max: 4 },
];

export default function Performance() {
  const nav = useNavigate();
  const location = useLocation();

  const { employee_id, from_date, to_date } = location.state || {};

  const [scores, setScores] = useState({});
  const [loading] = useState(false);

  const maxTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.max, 0),
    []
  );

  const total = useMemo(
    () =>
      Object.values(scores).reduce(
        (sum, value) => sum + Number(value || 0),
        0
      ),
    [scores]
  );

  const completed = Object.keys(scores).length;

  const progress = Math.round((completed / items.length) * 100);

  const percentage = Math.round((total / maxTotal) * 100);

  const change = (index, value, max) => {
    if (value === "") {
      const copy = { ...scores };
      delete copy[index];
      setScores(copy);
      return;
    }

    let num = Number(value);

    if (Number.isNaN(num)) return;

    if (num > max) num = max;
    if (num < 0) num = 0;

    setScores((prev) => ({
      ...prev,
      [index]: num,
    }));
  };

  const next = () => {
    if (!employee_id || !from_date || !to_date) {
      alert("بيانات الموظف أو فترة التقييم غير مكتملة!");
      return;
    }

    if (Object.keys(scores).length < items.length) {
      alert("يرجى تعبئة جميع حقول التقييم قبل المتابعة.");
      return;
    }

    nav("/personality", {
      state: {
        employee_id,
        from_date,
        to_date,
        performance: scores,
      },
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlow1} />
      <div style={styles.backgroundGlow2} />

      <main style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <div style={styles.headerIcon}>📊</div>

          <div>
            <div style={styles.badge}>نظام تقييم الموظفين</div>

            <h1 style={styles.title}>تقييم الأداء الوظيفي</h1>

            <p style={styles.subtitle}>
              يرجى تقييم مستوى أداء الموظف في كل معيار بدقة
            </p>
          </div>
        </header>

        {/* INFO CARD */}
        <section style={styles.infoCard}>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>📋</span>

            <div>
              <span style={styles.infoLabel}>عدد المعايير</span>
              <strong style={styles.infoValue}>{items.length}</strong>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>🎯</span>

            <div>
              <span style={styles.infoLabel}>الدرجة القصوى</span>
              <strong style={styles.infoValue}>{maxTotal}</strong>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>✅</span>

            <div>
              <span style={styles.infoLabel}>تم التقييم</span>
              <strong style={styles.infoValue}>
                {completed} / {items.length}
              </strong>
            </div>
          </div>
        </section>

        {/* PROGRESS */}
        <section style={styles.progressCard}>
          <div style={styles.progressTop}>
            <div>
              <span style={styles.progressTitle}>نسبة اكتمال التقييم</span>

              <div style={styles.progressText}>
                {completed === items.length
                  ? "اكتمل التقييم بالكامل ✓"
                  : `تم تقييم ${completed} من ${items.length} معيار`}
              </div>
            </div>

            <div style={styles.progressNumber}>{progress}%</div>
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

        {/* EVALUATION */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.sectionTitle}>معايير الأداء</h2>

              <p style={styles.sectionSubtitle}>
                أدخل الدرجة المناسبة لكل معيار
              </p>
            </div>

            <div style={styles.currentScore}>
              <span>المجموع الحالي</span>
              <strong>
                {total}
                <small> / {maxTotal}</small>
              </strong>
            </div>
          </div>

          <div style={styles.itemsGrid}>
            {items.map((item, index) => {
              const value = scores[index];

              const isCompleted = value !== undefined;

              const itemPercentage = isCompleted
                ? Math.round((Number(value) / item.max) * 100)
                : 0;

              return (
                <div
                  key={index}
                  style={{
                    ...styles.item,
                    ...(isCompleted ? styles.itemCompleted : {}),
                  }}
                >
                  <div style={styles.itemTop}>
                    <div style={styles.itemNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div style={styles.itemContent}>
                      <label style={styles.label}>{item.title}</label>

                      <span style={styles.maxScore}>
                        الدرجة القصوى: {item.max}
                      </span>
                    </div>

                    {isCompleted && (
                      <div style={styles.check}>✓</div>
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
                          change(index, e.target.value, item.max)
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

          {/* TOTAL */}
          <div style={styles.totalCard}>
            <div>
              <span style={styles.totalLabel}>إجمالي نقاط الأداء</span>

              <span style={styles.totalHint}>
                من أصل {maxTotal} نقطة
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

          {/* ACTIONS */}
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
              style={{
                ...styles.nextButton,
                ...(loading ? styles.disabled : {}),
              }}
              onClick={next}
              disabled={loading}
            >
              <span>التالي</span>
              <span style={styles.arrow}>←</span>
            </button>
          </div>
        </section>

        <footer style={styles.footer}>
          <span>🔒</span>
          جميع بيانات التقييم محفوظة بشكل آمن
        </footer>
      </main>
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
    background: "rgba(59, 130, 246, 0.12)",
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
    background: "rgba(99, 102, 241, 0.10)",
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
      "linear-gradient(135deg, #2563eb, #4f46e5)",
    boxShadow:
      "0 12px 30px rgba(37,99,235,0.35)",
  },

  badge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "700",
    color: "#93c5fd",
    background: "rgba(59,130,246,0.10)",
    border: "1px solid rgba(96,165,250,0.18)",
    padding: "4px 10px",
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
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(15px)",
    boxShadow: "0 15px 40px rgba(0,0,0,0.18)",
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
    background: "rgba(59,130,246,0.12)",
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
    background: "rgba(255,255,255,0.08)",
  },

  /* PROGRESS */

  progressCard: {
    padding: "20px 24px",
    marginBottom: "18px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.08)",
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
    color: "#60a5fa",
    fontSize: "22px",
    fontWeight: "800",
  },

  progressTrack: {
    height: "8px",
    background: "rgba(255,255,255,0.07)",
    borderRadius: "20px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: "20px",
    background:
      "linear-gradient(90deg, #2563eb, #6366f1)",
    transition: "width 0.3s ease",
  },

  /* MAIN CARD */

  card: {
    background: "rgba(255,255,255,0.065)",
    border: "1px solid rgba(255,255,255,0.09)",
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
    padding: "10px 18px",
    borderRadius: "14px",
    background: "rgba(59,130,246,0.09)",
    border: "1px solid rgba(59,130,246,0.14)",
  },

  currentScoreSpan: {
    color: "#64748b",
  },

  currentScore: {
    textAlign: "center",
    padding: "10px 18px",
    borderRadius: "14px",
    background: "rgba(59,130,246,0.09)",
    border: "1px solid rgba(59,130,246,0.14)",
  },

  currentScore: {
    color: "#94a3b8",
    fontSize: "11px",
  },

  /* ITEMS */

  itemsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },

  item: {
    padding: "18px",
    borderRadius: "17px",
    background: "rgba(15,23,42,0.55)",
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "all 0.2s ease",
  },

  itemCompleted: {
    border:
      "1px solid rgba(59,130,246,0.25)",
    background:
      "linear-gradient(145deg, rgba(30,58,138,0.18), rgba(15,23,42,0.65))",
  },

  itemTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
  },

  itemNumber: {
    width: "36px",
    height: "36px",
    minWidth: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#93c5fd",
    fontSize: "11px",
    fontWeight: "800",
    background:
      "rgba(59,130,246,0.10)",
    border:
      "1px solid rgba(59,130,246,0.14)",
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
    marginTop: "1px",
  },

  check: {
    width: "23px",
    height: "23px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#bfdbfe",
    background: "rgba(59,130,246,0.18)",
    fontSize: "12px",
    fontWeight: "800",
  },

  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  inputWrapper: {
    position: "relative",
    width: "105px",
    minWidth: "105px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 42px 11px 12px",
    borderRadius: "11px",
    border:
      "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.045)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    outline: "none",
    textAlign: "center",
    fontFamily: "'Cairo', sans-serif",
  },

  inputSuffix: {
    position: "absolute",
    right: "9px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748b",
    fontSize: "10px",
    pointerEvents: "none",
  },

  miniProgressTrack: {
    flex: 1,
    height: "6px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },

  miniProgress: {
    height: "100%",
    borderRadius: "20px",
    background:
      "linear-gradient(90deg, #3b82f6, #6366f1)",
    transition: "width 0.25s ease",
  },

  percent: {
    width: "38px",
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
      "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(79,70,229,0.08))",
    border:
      "1px solid rgba(96,165,250,0.15)",
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

  totalScoreStrong: {
    color: "#60a5fa",
  },

  totalPercent: {
    minWidth: "55px",
    textAlign: "center",
    padding: "7px 10px",
    borderRadius: "9px",
    color: "#bfdbfe",
    background: "rgba(59,130,246,0.12)",
    fontSize: "12px",
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
    border: "1px solid rgba(255,255,255,0.09)",
    background: "rgba(255,255,255,0.045)",
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
    maxWidth: "260px",
    padding: "14px 25px",
    borderRadius: "12px",
    border: "none",
    background:
      "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "800",
    fontSize: "14px",
    boxShadow:
      "0 10px 25px rgba(37,99,235,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },

  arrow: {
    fontSize: "18px",
  },

  disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  footer: {
    textAlign: "center",
    color: "#475569",
    fontSize: "10px",
    marginTop: "18px",
  },
};

/* =========================================================
   RESPONSIVE
========================================================= */

if (typeof document !== "undefined") {
  const styleId = "performance-responsive-style";

  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");

    style.id = styleId;

    style.innerHTML = `
      @media (max-width: 800px) {
        .performance-page {
          padding: 25px 12px !important;
        }
      }

      @media (max-width: 700px) {
        .performance-items {
          grid-template-columns: 1fr !important;
        }
      }

      @media (max-width: 600px) {
        .performance-info {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 15px !important;
        }

        .performance-divider {
          width: 100% !important;
          height: 1px !important;
        }

        .performance-card {
          padding: 20px !important;
        }

        .performance-header {
          align-items: flex-start !important;
        }

        .performance-title {
          font-size: 23px !important;
        }

        .performance-total {
          flex-wrap: wrap !important;
        }

        .performance-actions {
          flex-direction: column-reverse !important;
        }

        .performance-next {
          max-width: none !important;
          width: 100% !important;
        }

        .performance-back {
          width: 100% !important;
          justify-content: center !important;
        }
      }
    `;

    document.head.appendChild(style);
  }
}
