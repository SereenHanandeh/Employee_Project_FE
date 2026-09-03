import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";

const personalityItems = [
  { title: "القدرة على الحوار وعرض الرأي", max: 4 },
  { title: "تقدير المسؤولية", max: 4 },
  { title: "حسن التصرف", max: 4 },
  { title: "تقبل التوجيهات والاستعداد لتنفيذها", max: 4 },
  { title: "الاهتمام بالمظهر", max: 3 },
];

const normalizeScores = (value) => {
  if (!value) return {};

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  return value;
};

export default function Personality() {
  const nav = useNavigate();
  const location = useLocation();

  const {
    employee_id,
    name,
    from_date,
    to_date,
    performance,
    evaluationId,
    editMode = false,
  } = location.state || {};

  const [p, setP] = useState({});
  const [employeeId, setEmployeeId] = useState(employee_id || "");
  const [employeeName, setEmployeeName] = useState(name || "");
  const [period, setPeriod] = useState({
    from: from_date || "",
    to: to_date || "",
  });

  const [loading, setLoading] = useState(
    Boolean(editMode && evaluationId)
  );

  const [error, setError] = useState("");

  const maxTotal = useMemo(
    () =>
      personalityItems.reduce(
        (sum, item) => sum + item.max,
        0
      ),
    []
  );

  const completed = Object.keys(p).length;

  const progress = Math.round(
    (completed / personalityItems.length) * 100
  );

  const total = useMemo(
    () =>
      Object.values(p).reduce(
        (sum, value) => sum + Number(value || 0),
        0
      ),
    [p]
  );

  const percentage = Math.round(
    (total / maxTotal) * 100
  );

  // =========================================================
  // LOAD EXISTING EVALUATION IN EDIT MODE
  // =========================================================

  useEffect(() => {
    if (!editMode || !evaluationId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadEvaluation = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(
          `/evaluations/${evaluationId}`
        );

        if (cancelled) return;

        const data = response.data;

        // Employee
        if (data.employee_id) {
          setEmployeeId(data.employee_id);
        }

        if (data.name) {
          setEmployeeName(data.name);
        }

        // Dates
        setPeriod({
          from: from_date || data.from_date || "",
          to: to_date || data.to_date || "",
        });

        // Personality details
        const details = normalizeScores(
          data.personality_details
        );

        const preparedScores = {};

        personalityItems.forEach((item, index) => {
          const value =
            details[index] ??
            details[String(index)];

          if (
            value !== undefined &&
            value !== null &&
            value !== ""
          ) {
            let number = Number(value);

            if (!Number.isNaN(number)) {
              if (number < 0) number = 0;
              if (number > item.max) number = item.max;

              preparedScores[index] = number;
            }
          }
        });

        setP(preparedScores);
      } catch (err) {
        console.error(
          "خطأ أثناء تحميل التقييم:",
          err.response?.data || err
        );

        if (!cancelled) {
          setError(
            "تعذر تحميل بيانات التقييم. يرجى المحاولة مرة أخرى."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadEvaluation();

    return () => {
      cancelled = true;
    };
  }, [editMode, evaluationId, from_date, to_date]);

  // =========================================================
  // CHANGE SCORE
  // =========================================================

  const change = (index, value, max) => {
    if (value === "") {
      setP((prev) => {
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

    setP((prev) => ({
      ...prev,
      [index]: num,
    }));
  };

  // =========================================================
  // NEXT
  // =========================================================

  const next = () => {
    if (!employeeId || !period.from || !period.to) {
      alert(
        "بيانات الموظف أو فترة التقييم غير مكتملة!"
      );
      return;
    }

    if (
      Object.keys(p).length <
      personalityItems.length
    ) {
      alert(
        "يرجى تعبئة جميع حقول الصفات الشخصية قبل المتابعة!"
      );
      return;
    }

    nav("/relations", {
      state: {
        employee_id: employeeId,
        name: employeeName,
        from_date: period.from,
        to_date: period.to,

        performance,
        personality: p,

        // مهم جدًا للتعديل
        evaluationId,
        editMode,
      },
    });
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />

          <h3 style={styles.loadingTitle}>
            جاري تحميل التقييم
          </h3>

          <p style={styles.loadingText}>
            يتم تجهيز بيانات الصفات الشخصية...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>!</div>

          <h3 style={styles.loadingTitle}>
            حدث خطأ
          </h3>

          <p style={styles.loadingText}>
            {error}
          </p>

          <button
            type="button"
            style={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="personality-page" style={styles.page}>
      <main style={styles.container}>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header
          className="personality-header"
          style={styles.header}
        >
          <div style={styles.headerIcon}>
            🧠
          </div>

          <div style={{ flex: 1 }}>
            <div style={styles.badge}>
              {editMode
                ? "تعديل التقييم"
                : "الخطوة الثانية من التقييم"}
            </div>

            <h1
              className="personality-title"
              style={styles.title}
            >
              الصفات الشخصية
            </h1>

            <p style={styles.subtitle}>
              قيّم الصفات الشخصية والسلوكية للموظف بدقة
            </p>
          </div>

          {editMode && (
            <div style={styles.editBadge}>
              ✏️ تعديل
            </div>
          )}
        </header>

        {/* =====================================================
            EMPLOYEE
        ===================================================== */}

        {employeeName && (
          <section style={styles.employeeCard}>
            <div style={styles.employeeAvatar}>
              {employeeName
                .trim()
                .charAt(0)}
            </div>

            <div>
              <span style={styles.employeeLabel}>
                الموظف محل التقييم
              </span>

              <strong style={styles.employeeName}>
                {employeeName}
              </strong>
            </div>

            {editMode && (
              <div style={styles.editStatus}>
                يتم تعديل التقييم الحالي
              </div>
            )}
          </section>
        )}

        {/* =====================================================
            INFO
        ===================================================== */}

        <section
          className="personality-info"
          style={styles.infoCard}
        >
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>
              🧠
            </span>

            <div>
              <span style={styles.infoLabel}>
                نوع التقييم
              </span>

              <strong style={styles.infoValue}>
                الصفات الشخصية
              </strong>
            </div>
          </div>

          <div
            className="personality-divider"
            style={styles.divider}
          />

          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>
              📋
            </span>

            <div>
              <span style={styles.infoLabel}>
                عدد المعايير
              </span>

              <strong style={styles.infoValue}>
                {personalityItems.length}
              </strong>
            </div>
          </div>

          <div
            className="personality-divider"
            style={styles.divider}
          />

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

        {/* =====================================================
            PROGRESS
        ===================================================== */}

        <section style={styles.progressCard}>
          <div style={styles.progressTop}>
            <div>
              <span style={styles.progressTitle}>
                نسبة اكتمال التقييم
              </span>

              <div style={styles.progressText}>
                {completed === personalityItems.length
                  ? "اكتملت جميع المعايير ✓"
                  : `تم تقييم ${completed} من ${personalityItems.length} معايير`}
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

        {/* =====================================================
            MAIN CARD
        ===================================================== */}

        <section
          className="personality-card"
          style={styles.card}
        >
          <div
            className="personality-card-header"
            style={styles.cardHeader}
          >
            <div>
              <h2 style={styles.sectionTitle}>
                معايير الصفات الشخصية
              </h2>

              <p style={styles.sectionSubtitle}>
                أدخل الدرجة المناسبة لكل صفة
              </p>
            </div>

            <div
              className="personality-current-score"
              style={styles.currentScore}
            >
              <span style={styles.currentScoreLabel}>
                المجموع الحالي
              </span>

              <strong style={styles.currentScoreValue}>
                {total}
                <small> / {maxTotal}</small>
              </strong>
            </div>
          </div>

          {/* =====================================================
              ITEMS
          ===================================================== */}

          <div
            className="personality-items"
            style={styles.itemsGrid}
          >
            {personalityItems.map(
              (item, index) => {
                const value = p[index];

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
                      <div
                        style={{
                          ...styles.itemNumber,
                          ...(isCompleted
                            ? styles.itemNumberCompleted
                            : {}),
                        }}
                      >
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
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

                      <div
                        style={styles.miniProgressTrack}
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
              }
            )}
          </div>

          {/* =====================================================
              TOTAL
          ===================================================== */}

          <div
            className="personality-total"
            style={styles.totalCard}
          >
            <div style={{ flex: 1 }}>
              <span style={styles.totalLabel}>
                إجمالي نقاط الصفات الشخصية
              </span>

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

          {/* =====================================================
              ACTIONS
          ===================================================== */}

          <div
            className="personality-actions"
            style={styles.actions}
          >
            <button
              type="button"
              className="personality-back"
              style={styles.backButton}
              onClick={() => nav(-1)}
            >
              <span>→</span>
              رجوع
            </button>

            <button
              type="button"
              className="personality-next"
              style={styles.nextButton}
              onClick={next}
            >
              <span>
                الانتقال إلى العلاقات الوظيفية
              </span>

              <span style={styles.arrow}>
                ←
              </span>
            </button>
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer style={styles.footer}>
          <span>🔒</span>
          بيانات التقييم محفوظة بشكل آمن
        </footer>
      </main>

      {/* =====================================================
          RESPONSIVE
      ===================================================== */}

      <style>
        {`
          * {
            box-sizing: border-box;
          }

          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            opacity: 1;
          }

          .personality-page {
            direction: rtl;
          }

          .personality-page button {
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease,
              background 0.2s ease;
          }

          .personality-page button:hover {
            transform: translateY(-1px);
          }

          .personality-page input:focus {
            border-color: #93c5fd !important;
            box-shadow:
              0 0 0 4px rgba(59, 130, 246, 0.10);
          }

          @media (max-width: 800px) {
            .personality-info {
              flex-wrap: wrap !important;
            }
          }

          @media (max-width: 700px) {
            .personality-items {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 600px) {
            .personality-page {
              padding: 20px 12px !important;
            }

            .personality-header {
              align-items: flex-start !important;
            }

            .personality-title {
              font-size: 23px !important;
            }

            .personality-card {
              padding: 18px !important;
            }

            .personality-info {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 14px !important;
            }

            .personality-divider {
              width: 100% !important;
              height: 1px !important;
            }

            .personality-card-header {
              flex-direction: column !important;
              align-items: stretch !important;
            }

            .personality-current-score {
              width: 100% !important;
              box-sizing: border-box !important;
            }

            .personality-actions {
              flex-direction: column-reverse !important;
            }

            .personality-next {
              width: 100% !important;
              max-width: none !important;
            }

            .personality-back {
              width: 100% !important;
              justify-content: center !important;
            }

            .personality-total {
              flex-wrap: wrap !important;
            }
          }

          @media (max-width: 430px) {
            .personality-header {
              gap: 12px !important;
            }

            .personality-header > div:first-child {
              width: 52px !important;
              min-width: 52px !important;
              height: 52px !important;
            }

            .personality-item {
              padding: 14px !important;
            }

            .personality-total {
              gap: 12px !important;
            }

            .personality-total > div:last-child {
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   LIGHT PROFESSIONAL STYLES
========================================================= */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f8fc 0%, #eef4fb 50%, #f8faff 100%)",
    fontFamily: "'Cairo', sans-serif",
    direction: "rtl",
    padding: "40px 20px",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    color: "#172033",
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
    gap: "18px",
    marginBottom: "20px",
  },

  headerIcon: {
    width: "64px",
    height: "64px",
    minWidth: "64px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    background:
      "linear-gradient(135deg, #dbeafe, #e0e7ff)",
    border: "1px solid #c7d2fe",
    boxShadow:
      "0 10px 25px rgba(59,130,246,0.12)",
  },

  badge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#2563eb",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    padding: "5px 12px",
    borderRadius: "20px",
    marginBottom: "5px",
  },

  editBadge: {
    padding: "8px 14px",
    borderRadius: "10px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#c2410c",
    fontSize: "12px",
    fontWeight: "800",
    whiteSpace: "nowrap",
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
    gap: "13px",
    padding: "13px 17px",
    marginBottom: "15px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    boxShadow:
      "0 5px 18px rgba(15,23,42,0.05)",
  },

  employeeAvatar: {
    width: "43px",
    height: "43px",
    minWidth: "43px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #dbeafe, #e0e7ff)",
    color: "#2563eb",
    fontSize: "18px",
    fontWeight: "800",
  },

  employeeLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "10px",
    marginBottom: "1px",
  },

  employeeName: {
    display: "block",
    color: "#1e293b",
    fontSize: "15px",
    fontWeight: "800",
  },

  editStatus: {
    marginRight: "auto",
    color: "#2563eb",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    borderRadius: "9px",
    padding: "6px 10px",
    fontSize: "10px",
    fontWeight: "700",
  },

  /* INFO */

  infoCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "18px 22px",
    marginBottom: "15px",
    borderRadius: "17px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 7px 24px rgba(15,23,42,0.05)",
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
    borderRadius: "11px",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    fontSize: "18px",
  },

  infoLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "10px",
    marginBottom: "2px",
  },

  infoValue: {
    color: "#1e293b",
    fontSize: "15px",
    fontWeight: "800",
  },

  divider: {
    width: "1px",
    height: "32px",
    background: "#e2e8f0",
  },

  /* PROGRESS */

  progressCard: {
    padding: "18px 22px",
    marginBottom: "15px",
    borderRadius: "17px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 7px 24px rgba(15,23,42,0.05)",
  },

  progressTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
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
    fontWeight: "800",
  },

  progressTrack: {
    height: "8px",
    background: "#eaf0f7",
    borderRadius: "20px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: "20px",
    background:
      "linear-gradient(90deg, #60a5fa, #6366f1)",
    transition: "width 0.3s ease",
  },

  /* MAIN CARD */

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "28px",
    boxShadow:
      "0 14px 45px rgba(15,23,42,0.07)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    paddingBottom: "20px",
    marginBottom: "20px",
    borderBottom: "1px solid #edf1f6",
  },

  sectionTitle: {
    margin: 0,
    color: "#1e293b",
    fontSize: "20px",
    fontWeight: "800",
  },

  sectionSubtitle: {
    margin: "4px 0 0",
    color: "#94a3b8",
    fontSize: "11px",
  },

  currentScore: {
    textAlign: "center",
    padding: "9px 18px",
    borderRadius: "13px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  currentScoreLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "9px",
    marginBottom: "2px",
  },

  currentScoreValue: {
    color: "#2563eb",
    fontSize: "19px",
    fontWeight: "800",
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
    border: "1px solid #e5eaf0",
    transition: "all 0.2s ease",
  },

  itemCompleted: {
    border: "1px solid #bfdbfe",
    background:
      "linear-gradient(145deg, #f8fbff, #f1f5ff)",
  },

  itemTop: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    marginBottom: "14px",
  },

  itemNumber: {
    width: "35px",
    height: "35px",
    minWidth: "35px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "800",
    background: "#eef2f7",
    border: "1px solid #e2e8f0",
  },

  itemNumberCompleted: {
    color: "#2563eb",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
  },

  itemContent: {
    flex: 1,
  },

  label: {
    display: "block",
    color: "#334155",
    fontSize: "12px",
    fontWeight: "700",
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
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    fontSize: "11px",
    fontWeight: "800",
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
    border: "1px solid #dbe2ea",
    background: "#ffffff",
    color: "#1e293b",
    fontSize: "14px",
    fontWeight: "700",
    outline: "none",
    textAlign: "center",
    fontFamily: "'Cairo', sans-serif",
    transition:
      "border-color 0.2s ease, box-shadow 0.2s ease",
  },

  inputSuffix: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    fontSize: "9px",
    pointerEvents: "none",
  },

  miniProgressTrack: {
    flex: 1,
    height: "6px",
    borderRadius: "20px",
    background: "#e7edf4",
    overflow: "hidden",
  },

  miniProgress: {
    height: "100%",
    borderRadius: "20px",
    background:
      "linear-gradient(90deg, #60a5fa, #6366f1)",
    transition: "width 0.25s ease",
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
    padding: "18px 20px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #eff6ff, #f5f3ff)",
    border: "1px solid #dbeafe",
  },

  totalLabel: {
    display: "block",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "800",
  },

  totalHint: {
    display: "block",
    color: "#94a3b8",
    fontSize: "9px",
    marginTop: "3px",
  },

  totalScore: {
    marginRight: "auto",
    display: "flex",
    alignItems: "baseline",
    gap: "3px",
    color: "#64748b",
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
    border: "1px solid #dbeafe",
    fontSize: "12px",
    fontWeight: "800",
  },

  /* ACTIONS */

  actions: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    marginTop: "23px",
  },

  backButton: {
    padding: "12px 24px",
    borderRadius: "11px",
    border: "1px solid #dbe2ea",
    background: "#ffffff",
    color: "#475569",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  nextButton: {
    flex: 1,
    maxWidth: "310px",
    padding: "13px 24px",
    borderRadius: "11px",
    border: "none",
    background:
      "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "800",
    fontSize: "12px",
    boxShadow:
      "0 9px 22px rgba(59,130,246,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },

  arrow: {
    fontSize: "17px",
  },

  footer: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "9px",
    marginTop: "16px",
  },

  /* LOADING */

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #f5f8fc, #eef4fb)",
    fontFamily: "'Cairo', sans-serif",
    direction: "rtl",
    padding: "20px",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "360px",
    textAlign: "center",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "35px 25px",
    boxShadow:
      "0 15px 40px rgba(15,23,42,0.08)",
  },

  errorCard: {
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
    background: "#ffffff",
    border: "1px solid #fecaca",
    borderRadius: "20px",
    padding: "35px 25px",
    boxShadow:
      "0 15px 40px rgba(15,23,42,0.08)",
  },

  spinner: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border:
      "4px solid #dbeafe",
    borderTopColor: "#3b82f6",
    margin: "0 auto 18px",
    animation: "personalitySpin 0.8s linear infinite",
  },

  errorIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    fontSize: "22px",
    fontWeight: "800",
  },

  loadingTitle: {
    margin: 0,
    color: "#1e293b",
    fontSize: "17px",
    fontWeight: "800",
  },

  loadingText: {
    margin: "7px 0 0",
    color: "#94a3b8",
    fontSize: "11px",
    lineHeight: "1.8",
  },

  retryButton: {
    marginTop: "20px",
    padding: "10px 22px",
    borderRadius: "10px",
    border: "none",
    background: "#3b82f6",
    color: "#ffffff",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "700",
    cursor: "pointer",
  },
};