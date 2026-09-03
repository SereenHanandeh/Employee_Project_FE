import { useLocation, useNavigate } from "react-router-dom";
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

  const state = location.state || {};

  const {
    employee_id,
    name,
    from_date,
    to_date,
    evaluationId,
    editMode,
    performance: oldPerformance,
  } = state;

  // =====================================================
  // INITIAL SCORES
  // =====================================================

  const initialScores = useMemo(() => {
    if (!editMode || !oldPerformance) {
      return {};
    }

    const normalized = {};

    Object.entries(oldPerformance).forEach(
      ([key, value]) => {
        const numericValue = Number(value);

        if (!Number.isNaN(numericValue)) {
          normalized[key] = numericValue;
        }
      }
    );

    return normalized;
  }, [editMode, oldPerformance]);

  const [scores, setScores] =
    useState(initialScores);

  // =====================================================
  // MAX TOTAL
  // =====================================================

  const maxTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.max,
        0
      ),
    []
  );

  // =====================================================
  // TOTAL
  // =====================================================

  const total = useMemo(
    () =>
      Object.values(scores).reduce(
        (sum, value) =>
          sum + Number(value || 0),
        0
      ),
    [scores]
  );

  // =====================================================
  // PROGRESS
  // =====================================================

  const completed =
    Object.keys(scores).length;

  const progress = Math.round(
    (completed / items.length) * 100
  );

  const percentage = Math.round(
    (total / maxTotal) * 100
  );

  // =====================================================
  // CHANGE SCORE
  // =====================================================

  const change = (index, value, max) => {
    if (value === "") {
      setScores((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });

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

  // =====================================================
  // NEXT
  // =====================================================

  const next = () => {
    if (!employee_id || !from_date || !to_date) {
      alert(
        "بيانات الموظف أو فترة التقييم غير مكتملة!"
      );

      return;
    }

    if (
      Object.keys(scores).length <
      items.length
    ) {
      alert(
        "يرجى تعبئة جميع حقول التقييم قبل المتابعة."
      );

      return;
    }

    nav("/personality", {
      state: {
        employee_id,
        name,
        from_date,
        to_date,

        performance: scores,

        evaluationId,
        editMode,
      },
    });
  };

  // =====================================================
  // BACK
  // =====================================================

  const goBack = () => {
    nav(-1);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlow1} />
      <div style={styles.backgroundGlow2} />

      <main style={styles.container}>

        {/* =================================================
            HEADER
        ================================================= */}

        <header style={styles.header}>

          <div style={styles.headerIcon}>
            📊
          </div>

          <div style={styles.headerContent}>

            <div style={styles.badge}>
              {editMode
                ? "تعديل تقييم الموظف"
                : "نظام تقييم الموظفين"}
            </div>

            <h1 style={styles.title}>
              {editMode
                ? "تعديل تقييم الأداء الوظيفي"
                : "تقييم الأداء الوظيفي"}
            </h1>

            <p style={styles.subtitle}>
              {editMode
                ? "قم بمراجعة وتعديل درجات تقييم الموظف"
                : "يرجى تقييم مستوى أداء الموظف في كل معيار بدقة"}
            </p>

          </div>

        </header>

        {/* =================================================
            EMPLOYEE INFO
        ================================================= */}

        {name && (
          <section style={styles.employeeCard}>

            <div style={styles.employeeAvatar}>
              {String(name)
                .trim()
                .charAt(0)}
            </div>

            <div style={styles.employeeDetails}>

              <span style={styles.employeeLabel}>
                الموظف
              </span>

              <strong style={styles.employeeName}>
                {name}
              </strong>

            </div>

            {evaluationId && (
              <div style={styles.evaluationBadge}>
                <span>
                  رقم التقييم
                </span>

                <strong>
                  #{evaluationId}
                </strong>
              </div>
            )}

          </section>
        )}

        {/* =================================================
            INFO
        ================================================= */}

        <section style={styles.infoCard}>

          <div style={styles.infoItem}>

            <span style={styles.infoIcon}>
              📋
            </span>

            <div>
              <span style={styles.infoLabel}>
                عدد المعايير
              </span>

              <strong style={styles.infoValue}>
                {items.length}
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

          <div style={styles.divider} />

          <div style={styles.infoItem}>

            <span style={styles.infoIcon}>
              ✅
            </span>

            <div>
              <span style={styles.infoLabel}>
                تم التقييم
              </span>

              <strong style={styles.infoValue}>
                {completed} / {items.length}
              </strong>
            </div>

          </div>

          <div style={styles.divider} />

          <div style={styles.infoItem}>

            <span style={styles.infoIcon}>
              📈
            </span>

            <div>
              <span style={styles.infoLabel}>
                النتيجة الحالية
              </span>

              <strong
                style={{
                  ...styles.infoValue,
                  color:
                    percentage >= 75
                      ? "#16a34a"
                      : percentage >= 60
                      ? "#d97706"
                      : "#dc2626",
                }}
              >
                {percentage}%
              </strong>
            </div>

          </div>

        </section>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <section style={styles.progressCard}>

          <div style={styles.progressTop}>

            <div>

              <span style={styles.progressTitle}>
                نسبة اكتمال التقييم
              </span>

              <div style={styles.progressText}>
                {completed === items.length
                  ? "اكتمل التقييم بالكامل ✓"
                  : `تم تقييم ${completed} من ${items.length} معيار`}
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

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div>

              <div style={styles.sectionBadge}>
                القسم الأول
              </div>

              <h2 style={styles.sectionTitle}>
                معايير الأداء
              </h2>

              <p style={styles.sectionSubtitle}>
                أدخل الدرجة المناسبة لكل معيار
              </p>

            </div>

            <div style={styles.currentScore}>

              <span>
                المجموع الحالي
              </span>

              <strong>
                {total}
                <small>
                  {" "}
                  / {maxTotal}
                </small>
              </strong>

            </div>

          </div>

          {/* =================================================
              ITEMS
          ================================================= */}

          <div style={styles.itemsGrid}>

            {items.map((item, index) => {

              const value = scores[index];

              const isCompleted =
                value !== undefined;

              const itemPercentage =
                isCompleted
                  ? Math.round(
                      (Number(value) /
                        item.max) *
                        100
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
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div style={styles.itemContent}>

                      <label
                        style={styles.label}
                      >
                        {item.title}
                      </label>

                      <span
                        style={styles.maxScore}
                      >
                        الدرجة القصوى:{" "}
                        {item.max}
                      </span>

                    </div>

                    {isCompleted && (
                      <div style={styles.check}>
                        ✓
                      </div>
                    )}

                  </div>

                  <div style={styles.inputRow}>

                    <div
                      style={styles.inputWrapper}
                    >

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

                      <span
                        style={styles.inputSuffix}
                      >
                        / {item.max}
                      </span>

                    </div>

                    <div
                      style={
                        styles.miniProgressTrack
                      }
                    >

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

          {/* =================================================
              TOTAL
          ================================================= */}

          <div style={styles.totalCard}>

            <div style={styles.totalInfo}>

              <span style={styles.totalLabel}>
                إجمالي نقاط الأداء
              </span>

              <span style={styles.totalHint}>
                من أصل {maxTotal} نقطة
              </span>

            </div>

            <div style={styles.totalScore}>

              <strong>
                {total}
              </strong>

              <span>
                / {maxTotal}
              </span>

            </div>

            <div style={styles.totalPercent}>
              {percentage}%
            </div>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div style={styles.actions}>

            <button
              type="button"
              style={styles.backButton}
              onClick={goBack}
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
                {editMode
                  ? "متابعة التعديل"
                  : "التالي"}
              </span>

              <span style={styles.arrow}>
                ←
              </span>
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
      "linear-gradient(135deg, #f8fafc 0%, #eef4ff 50%, #f5f3ff 100%)",
    fontFamily: "'Cairo', sans-serif",
    direction: "rtl",
    padding: "40px 20px",
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
      "rgba(59, 130, 246, 0.10)",
    filter: "blur(100px)",
    top: "-180px",
    right: "-120px",
    pointerEvents: "none",
  },

  backgroundGlow2: {
    position: "fixed",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background:
      "rgba(139, 92, 246, 0.08)",
    filter: "blur(100px)",
    bottom: "-180px",
    left: "-100px",
    pointerEvents: "none",
  },

  container: {
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  /* HEADER */

  header: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "22px",
  },

  headerIcon: {
    width: "62px",
    height: "62px",
    minWidth: "62px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    background:
      "linear-gradient(135deg, #2563eb, #4f46e5)",
    boxShadow:
      "0 12px 30px rgba(37,99,235,0.20)",
  },

  headerContent: {
    flex: 1,
  },

  badge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#2563eb",
    background: "#eff6ff",
    border:
      "1px solid #dbeafe",
    padding: "5px 12px",
    borderRadius: "20px",
    marginBottom: "5px",
  },

  title: {
    margin: 0,
    color: "#172033",
    fontSize: "29px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  /* EMPLOYEE */

  employeeCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "15px 18px",
    marginBottom: "15px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.88)",
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.06)",
  },

  employeeAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #2563eb, #6366f1)",
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "800",
  },

  employeeDetails: {
    flex: 1,
  },

  employeeLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "10px",
    marginBottom: "1px",
  },

  employeeName: {
    color: "#172033",
    fontSize: "15px",
    fontWeight: "800",
  },

  evaluationBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 13px",
    borderRadius: "10px",
    background: "#f8fafc",
    border:
      "1px solid #e2e8f0",
  },

  evaluationBadgeSpan: {
    color: "#94a3b8",
    fontSize: "10px",
  },

  /* INFO */

  infoCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "18px 20px",
    marginBottom: "15px",
    borderRadius: "18px",
    background:
      "rgba(255,255,255,0.90)",
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.05)",
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  infoIcon: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    background: "#eff6ff",
    fontSize: "18px",
  },

  infoLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "10px",
    marginBottom: "2px",
  },

  infoValue: {
    color: "#172033",
    fontSize: "16px",
    fontWeight: "800",
  },

  divider: {
    width: "1px",
    height: "34px",
    background: "#e2e8f0",
  },

  /* PROGRESS */

  progressCard: {
    padding: "18px 22px",
    marginBottom: "15px",
    borderRadius: "18px",
    background:
      "rgba(255,255,255,0.90)",
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.05)",
  },

  progressTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "11px",
  },

  progressTitle: {
    display: "block",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "800",
  },

  progressText: {
    color: "#94a3b8",
    fontSize: "10px",
    marginTop: "3px",
  },

  progressNumber: {
    color: "#2563eb",
    fontSize: "21px",
    fontWeight: "900",
  },

  progressTrack: {
    height: "8px",
    background: "#e8eef7",
    borderRadius: "20px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: "20px",
    background:
      "linear-gradient(90deg, #2563eb, #6366f1)",
    transition: "width .3s ease",
  },

  /* CARD */

  card: {
    background:
      "rgba(255,255,255,0.94)",
    border:
      "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "28px",
    boxShadow:
      "0 20px 55px rgba(15,23,42,0.08)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    paddingBottom: "20px",
    marginBottom: "20px",
    borderBottom:
      "1px solid #eef2f7",
  },

  sectionBadge: {
    display: "inline-block",
    color: "#2563eb",
    background: "#eff6ff",
    border:
      "1px solid #dbeafe",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "800",
    marginBottom: "6px",
  },

  sectionTitle: {
    margin: 0,
    color: "#172033",
    fontSize: "20px",
    fontWeight: "900",
  },

  sectionSubtitle: {
    margin: "4px 0 0",
    color: "#94a3b8",
    fontSize: "11px",
  },

  currentScore: {
    textAlign: "center",
    padding: "10px 18px",
    borderRadius: "14px",
    background: "#f8fafc",
    border:
      "1px solid #e2e8f0",
  },

  currentScoreSpan: {
    display: "block",
    color: "#94a3b8",
    fontSize: "10px",
  },

  currentScoreStrong: {
    color: "#2563eb",
    fontSize: "20px",
    fontWeight: "900",
  },

  /* ITEMS */

  itemsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "13px",
  },

  item: {
    padding: "17px",
    borderRadius: "16px",
    background: "#f8fafc",
    border:
      "1px solid #e5eaf1",
    transition: "all .2s ease",
  },

  itemCompleted: {
    border:
      "1px solid #bfdbfe",
    background:
      "linear-gradient(145deg, #f8fbff, #eff6ff)",
  },

  itemTop: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    marginBottom: "13px",
  },

  itemNumber: {
    width: "35px",
    height: "35px",
    minWidth: "35px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
    fontSize: "10px",
    fontWeight: "900",
    background: "#eff6ff",
    border:
      "1px solid #dbeafe",
  },

  itemContent: {
    flex: 1,
  },

  label: {
    display: "block",
    color: "#334155",
    fontSize: "12px",
    fontWeight: "800",
    lineHeight: "1.7",
  },

  maxScore: {
    display: "block",
    color: "#94a3b8",
    fontSize: "9px",
    marginTop: "1px",
  },

  check: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#16a34a",
    background: "#dcfce7",
    fontSize: "11px",
    fontWeight: "900",
  },

  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  inputWrapper: {
    position: "relative",
    width: "105px",
    minWidth: "105px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 40px 10px 10px",
    borderRadius: "10px",
    border:
      "1px solid #dbe3ee",
    background: "#ffffff",
    color: "#172033",
    fontSize: "14px",
    fontWeight: "800",
    outline: "none",
    textAlign: "center",
    fontFamily: "'Cairo', sans-serif",
  },

  inputSuffix: {
    position: "absolute",
    right: "9px",
    top: "50%",
    transform:
      "translateY(-50%)",
    color: "#94a3b8",
    fontSize: "9px",
    pointerEvents: "none",
  },

  miniProgressTrack: {
    flex: 1,
    height: "6px",
    borderRadius: "20px",
    background: "#e5eaf1",
    overflow: "hidden",
  },

  miniProgress: {
    height: "100%",
    borderRadius: "20px",
    background:
      "linear-gradient(90deg, #3b82f6, #6366f1)",
    transition: "width .25s ease",
  },

  percent: {
    width: "38px",
    color: "#64748b",
    fontSize: "9px",
    textAlign: "left",
  },

  /* TOTAL */

  totalCard: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginTop: "23px",
    padding: "19px 21px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #eff6ff, #f5f3ff)",
    border:
      "1px solid #dbeafe",
  },

  totalInfo: {
    flex: 1,
  },

  totalLabel: {
    display: "block",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "900",
  },

  totalHint: {
    display: "block",
    color: "#94a3b8",
    fontSize: "9px",
    marginTop: "3px",
  },

  totalScore: {
    display: "flex",
    alignItems: "baseline",
    gap: "3px",
  },

  totalScoreStrong: {
    color: "#2563eb",
  },

  totalPercent: {
    minWidth: "55px",
    textAlign: "center",
    padding: "7px 10px",
    borderRadius: "9px",
    color: "#2563eb",
    background: "#ffffff",
    border:
      "1px solid #dbeafe",
    fontSize: "12px",
    fontWeight: "900",
  },

  /* ACTIONS */

  actions: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    marginTop: "24px",
  },

  backButton: {
    padding: "13px 24px",
    borderRadius: "11px",
    border:
      "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#64748b",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  nextButton: {
    flex: 1,
    maxWidth: "280px",
    padding: "14px 25px",
    borderRadius: "11px",
    border: "none",
    background:
      "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "900",
    fontSize: "13px",
    boxShadow:
      "0 10px 25px rgba(37,99,235,.18)",
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
    color: "#94a3b8",
    fontSize: "9px",
    marginTop: "17px",
  },
};

/* =========================================================
   RESPONSIVE
========================================================= */

if (typeof document !== "undefined") {
  const styleId =
    "performance-responsive-style";

  if (!document.getElementById(styleId)) {
    const style =
      document.createElement("style");

    style.id = styleId;

    style.innerHTML = `
      @media (max-width: 900px) {
        .performance-items {
          grid-template-columns: 1fr !important;
        }
      }

      @media (max-width: 700px) {
        .performance-info {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 14px !important;
        }

        .performance-divider {
          width: 100% !important;
          height: 1px !important;
        }

        .performance-card {
          padding: 20px !important;
        }
      }

      @media (max-width: 600px) {
        .performance-page {
          padding: 20px 12px !important;
        }

        .performance-header {
          align-items: flex-start !important;
        }

        .performance-title {
          font-size: 22px !important;
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

        .performance-employee {
          flex-wrap: wrap !important;
        }
      }
    `;

    document.head.appendChild(style);
  }
}