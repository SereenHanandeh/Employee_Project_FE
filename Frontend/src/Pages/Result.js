import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import API from "../api/api";

export default function Result() {
  const nav = useNavigate();
  const { state } = useLocation();

  const [evaluationId, setEvaluationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const [grade, setGrade] = useState("");
  const [error, setError] = useState("");
  const [employeeName, setEmployeeName] = useState("");

  const {
    employee_id,
    name,
    performance,
    personality,
    relations,
    from_date,
    to_date,
  } = state || {};

  // =========================================================
  // حساب المجاميع
  // =========================================================

  const performanceTotal = useMemo(() => {
    return Object.values(performance || {}).reduce(
      (a, b) => a + Number(b),
      0
    );
  }, [performance]);

  const personalityTotal = useMemo(() => {
    return Object.values(personality || {}).reduce(
      (a, b) => a + Number(b),
      0
    );
  }, [personality]);

  const relationsTotal = useMemo(() => {
    return Object.values(relations || {}).reduce(
      (a, b) => a + Number(b),
      0
    );
  }, [relations]);

  const totalScore =
    performanceTotal + personalityTotal + relationsTotal;

  // =========================================================
  // الحدود القصوى
  // الأداء = 76
  // الشخصية = 19
  // العلاقات = 9
  // المجموع = 104
  // =========================================================

  const maxPerformance = 76;
  const maxPersonality = 19;
  const maxRelations = 9;
  const maxTotal = 104;

  const percentage = Math.round((totalScore / maxTotal) * 100);

  // =========================================================
  // جلب اسم الموظف حسب employee_id
  // =========================================================

  useEffect(() => {
    const getEmployee = async () => {
      if (!employee_id) {
        setLoadingEmployee(false);
        return;
      }

      // إذا كان الاسم موجوداً أصلاً نستخدمه
      if (name && name.trim()) {
        setEmployeeName(name);
        setLoadingEmployee(false);
        return;
      }

      try {
        setLoadingEmployee(true);

        const res = await API.get("/employees");

        const employees = Array.isArray(res.data)
          ? res.data
          : res.data.employees || [];

        const employee = employees.find(
          (emp) => String(emp.id) === String(employee_id)
        );

        if (employee) {
          setEmployeeName(
            employee.name ||
              employee.full_name ||
              employee.employee_name ||
              `${employee.first_name || ""} ${
                employee.last_name || ""
              }`.trim()
          );
        } else {
          setEmployeeName(`الموظف رقم ${employee_id}`);
        }
      } catch (err) {
        console.error("Error fetching employee:", err);

        // في حالة فشل الجلب لا نخلي الاسم فارغ
        setEmployeeName(
          name || `الموظف رقم ${employee_id}`
        );
      } finally {
        setLoadingEmployee(false);
      }
    };

    getEmployee();
  }, [employee_id, name]);

  // =========================================================
  // التحقق من البيانات
  // =========================================================

  useEffect(() => {
    if (
      !employee_id ||
      !performance ||
      !personality ||
      !relations
    ) {
      alert("البيانات غير مكتملة، سيتم الرجوع");
      nav("/");
    }
  }, [
    employee_id,
    performance,
    personality,
    relations,
    nav,
  ]);

  // =========================================================
  // حفظ التقييم
  // =========================================================

  const handleSubmit = async () => {
    if (evaluationId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/evaluations", {
        employee_id,
        performance,
        personality,
        relations,
        from_date,
        to_date,
        notes: "",
      });

      setEvaluationId(res.data.evaluation_id);
      setGrade(res.data.grade);

      alert(`تم الحفظ بنجاح! التقدير: ${res.data.grade}`);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء حفظ التقييم");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // الانتقال للملاحظات
  // =========================================================

  const goToNotes = () => {
    if (!evaluationId) {
      alert("يجب حفظ التقييم أولاً!");
      return;
    }

    nav("/notes", {
      state: {
        evaluationId,
        employee_id,
        name: employeeName,
        grade,
      },
    });
  };

  // =========================================================
  // واجهة الصفحة
  // =========================================================

  return (
    <div style={styles.page}>
      {/* الخلفية */}
      <div style={styles.backgroundGlow1}></div>
      <div style={styles.backgroundGlow2}></div>

      <div style={styles.container}>
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div style={styles.header}>
          <div style={styles.headerIcon}>📋</div>

          <div>
            <div style={styles.badge}>
              المرحلة النهائية
            </div>

            <h1 style={styles.heading}>
              مراجعة وحفظ التقييم
            </h1>

            <p style={styles.subheading}>
              راجع نتائج تقييم الموظف قبل اعتماد التقييم
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* EMPLOYEE CARD */}
        {/* ================================================= */}

        <div style={styles.employeeCard}>
          <div style={styles.employeeIcon}>👤</div>

          <div style={styles.employeeInfo}>
            <span style={styles.employeeLabel}>
              الموظف محل التقييم
            </span>

            {loadingEmployee ? (
              <div style={styles.loadingName}>
                جاري تحميل بيانات الموظف...
              </div>
            ) : (
              <strong style={styles.employeeName}>
                {employeeName || "لم يتم تحديد الموظف"}
              </strong>
            )}

            <span style={styles.employeeId}>
              الرقم الوظيفي: {employee_id}
            </span>
          </div>

          <div style={styles.verified}>
            ✓
          </div>
        </div>

        {/* ================================================= */}
        {/* PERIOD */}
        {/* ================================================= */}

        <div style={styles.periodCard}>
          <div style={styles.periodItem}>
            <span style={styles.periodIcon}>📅</span>

            <div>
              <span style={styles.smallLabel}>
                تاريخ بداية التقييم
              </span>

              <strong style={styles.dateValue}>
                {from_date || "-"}
              </strong>
            </div>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.periodItem}>
            <span style={styles.periodIcon}>📅</span>

            <div>
              <span style={styles.smallLabel}>
                تاريخ نهاية التقييم
              </span>

              <strong style={styles.dateValue}>
                {to_date || "-"}
              </strong>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* SCORE HEADER */}
        {/* ================================================= */}

        <div style={styles.scoreHeader}>
          <div>
            <span style={styles.scoreHeaderTitle}>
              ملخص نتيجة التقييم
            </span>

            <p style={styles.scoreHeaderSubtitle}>
              مجموع درجات جميع محاور التقييم
            </p>
          </div>

          <div style={styles.totalCircle}>
            <strong>{totalScore}</strong>
            <span>/ {maxTotal}</span>
          </div>
        </div>

        {/* ================================================= */}
        {/* SCORE CARDS */}
        {/* ================================================= */}

        <div style={styles.scoresGrid}>
          {/* الأداء */}
          <div style={styles.scoreCard}>
            <div style={styles.scoreTop}>
              <div
                style={{
                  ...styles.scoreIcon,
                  background:
                    "linear-gradient(135deg, #0ea5e9, #2563eb)",
                }}
              >
                📊
              </div>

              <div style={styles.scoreTitleBox}>
                <span style={styles.scoreTitle}>
                  الأداء الوظيفي
                </span>

                <span style={styles.scoreMax}>
                  الحد الأقصى {maxPerformance}
                </span>
              </div>

              <strong style={styles.scoreNumber}>
                {performanceTotal}
              </strong>
            </div>

            <div style={styles.progressBackground}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${
                    (performanceTotal / maxPerformance) * 100
                  }%`,
                  background:
                    "linear-gradient(90deg, #0ea5e9, #2563eb)",
                }}
              ></div>
            </div>

            <div style={styles.scoreFooter}>
              <span>نسبة الإنجاز</span>

              <strong>
                {Math.round(
                  (performanceTotal / maxPerformance) * 100
                )}
                %
              </strong>
            </div>
          </div>

          {/* الشخصية */}
          <div style={styles.scoreCard}>
            <div style={styles.scoreTop}>
              <div
                style={{
                  ...styles.scoreIcon,
                  background:
                    "linear-gradient(135deg, #8b5cf6, #6366f1)",
                }}
              >
                🧠
              </div>

              <div style={styles.scoreTitleBox}>
                <span style={styles.scoreTitle}>
                  الصفات الشخصية
                </span>

                <span style={styles.scoreMax}>
                  الحد الأقصى {maxPersonality}
                </span>
              </div>

              <strong style={styles.scoreNumber}>
                {personalityTotal}
              </strong>
            </div>

            <div style={styles.progressBackground}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${
                    (personalityTotal / maxPersonality) * 100
                  }%`,
                  background:
                    "linear-gradient(90deg, #8b5cf6, #6366f1)",
                }}
              ></div>
            </div>

            <div style={styles.scoreFooter}>
              <span>نسبة الإنجاز</span>

              <strong>
                {Math.round(
                  (personalityTotal / maxPersonality) * 100
                )}
                %
              </strong>
            </div>
          </div>

          {/* العلاقات */}
          <div style={styles.scoreCard}>
            <div style={styles.scoreTop}>
              <div
                style={{
                  ...styles.scoreIcon,
                  background:
                    "linear-gradient(135deg, #06b6d4, #0891b2)",
                }}
              >
                🤝
              </div>

              <div style={styles.scoreTitleBox}>
                <span style={styles.scoreTitle}>
                  العلاقات الوظيفية
                </span>

                <span style={styles.scoreMax}>
                  الحد الأقصى {maxRelations}
                </span>
              </div>

              <strong style={styles.scoreNumber}>
                {relationsTotal}
              </strong>
            </div>

            <div style={styles.progressBackground}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${
                    (relationsTotal / maxRelations) * 100
                  }%`,
                  background:
                    "linear-gradient(90deg, #06b6d4, #0891b2)",
                }}
              ></div>
            </div>

            <div style={styles.scoreFooter}>
              <span>نسبة الإنجاز</span>

              <strong>
                {Math.round(
                  (relationsTotal / maxRelations) * 100
                )}
                %
              </strong>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* TOTAL RESULT */}
        {/* ================================================= */}

        <div style={styles.resultCard}>
          <div style={styles.resultLeft}>
            <div style={styles.resultIcon}>🏆</div>

            <div>
              <span style={styles.resultLabel}>
                النتيجة الإجمالية
              </span>

              <p style={styles.resultDescription}>
                مجموع الأداء والصفات الشخصية والعلاقات الوظيفية
              </p>
            </div>
          </div>

          <div style={styles.resultRight}>
            <strong>{totalScore}</strong>

            <span>/ {maxTotal}</span>

            <div style={styles.percentageBadge}>
              {percentage}%
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* GRADE */}
        {/* ================================================= */}

        {grade && (
          <div style={styles.gradeSection}>
            <div style={styles.gradeIcon}>⭐</div>

            <div style={styles.gradeContent}>
              <span>التقدير النهائي</span>

              <strong>{grade}</strong>

              <small>
                تم حفظ التقييم بنجاح ويمكنك الآن إضافة الملاحظات
              </small>
            </div>

            <div style={styles.successCheck}>
              ✓
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div style={styles.error}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <div style={styles.actions}>
          {!evaluationId && (
            <button
              onClick={handleSubmit}
              style={{
                ...styles.saveButton,
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
            >
              <span>
                {loading ? "⏳" : "💾"}
              </span>

              {loading
                ? "جارٍ حفظ التقييم..."
                : "اعتماد وحفظ التقييم"}
            </button>
          )}

          {grade && (
            <button
              onClick={goToNotes}
              style={styles.notesButton}
            >
              <span>📝</span>
              إضافة ملاحظات
              <span style={styles.arrow}>←</span>
            </button>
          )}

          <button
            style={styles.backButton}
            onClick={() => nav(-1)}
            disabled={loading}
          >
            <span>→</span>
            تعديل التقييم
          </button>
        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div style={styles.footer}>
          <span>🔒</span>
          تأكد من صحة البيانات قبل اعتماد التقييم
        </div>
      </div>

      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: "Cairo", "Tajawal", Arial, sans-serif;
          }

          button {
            font-family: inherit;
          }

          button:not(:disabled):hover {
            transform: translateY(-2px);
          }

          @media (max-width: 850px) {
            .result-page-container {
              padding: 25px 15px !important;
            }
          }

          @media (max-width: 600px) {
            .result-score-grid {
              grid-template-columns: 1fr !important;
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
    background:
      "radial-gradient(circle at top right, rgba(37,99,235,.20), transparent 35%), radial-gradient(circle at bottom left, rgba(99,102,241,.16), transparent 35%), linear-gradient(135deg, #07111f, #0f172a 55%, #111827)",
    position: "relative",
    overflow: "hidden",
    direction: "rtl",
    color: "#fff",
  },

  backgroundGlow1: {
    position: "fixed",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(14,165,233,.10)",
    filter: "blur(80px)",
    top: "-100px",
    right: "-80px",
    pointerEvents: "none",
  },

  backgroundGlow2: {
    position: "fixed",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "rgba(99,102,241,.10)",
    filter: "blur(80px)",
    bottom: "-100px",
    left: "-80px",
    pointerEvents: "none",
  },

  container: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
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
    marginBottom: "28px",
  },

  headerIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    background:
      "linear-gradient(135deg, #0ea5e9, #4f46e5)",
    boxShadow: "0 15px 35px rgba(37,99,235,.25)",
    flexShrink: 0,
  },

  badge: {
    display: "inline-flex",
    padding: "5px 12px",
    borderRadius: "30px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#93c5fd",
    background: "rgba(59,130,246,.12)",
    border: "1px solid rgba(96,165,250,.20)",
    marginBottom: "6px",
  },

  heading: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-.5px",
  },

  subheading: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "14px",
  },

  // =========================================================
  // EMPLOYEE
  // =========================================================

  employeeCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    borderRadius: "22px",
    marginBottom: "15px",
    background:
      "linear-gradient(135deg, rgba(30,41,59,.85), rgba(15,23,42,.78))",
    border: "1px solid rgba(148,163,184,.12)",
    boxShadow: "0 18px 50px rgba(0,0,0,.20)",
  },

  employeeIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    background:
      "linear-gradient(135deg, rgba(14,165,233,.18), rgba(79,70,229,.18))",
    border: "1px solid rgba(96,165,250,.15)",
    flexShrink: 0,
  },

  employeeInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    flex: 1,
  },

  employeeLabel: {
    color: "#64748b",
    fontSize: "12px",
  },

  employeeName: {
    color: "#f8fafc",
    fontSize: "20px",
    fontWeight: "800",
  },

  employeeId: {
    color: "#94a3b8",
    fontSize: "12px",
  },

  loadingName: {
    color: "#cbd5e1",
    fontSize: "15px",
  },

  verified: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#4ade80",
    background: "rgba(34,197,94,.12)",
    border: "1px solid rgba(34,197,94,.20)",
    fontWeight: "800",
  },

  // =========================================================
  // PERIOD
  // =========================================================

  periodCard: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "20px",
    padding: "18px 22px",
    marginBottom: "25px",
    borderRadius: "20px",
    background: "rgba(15,23,42,.62)",
    border: "1px solid rgba(148,163,184,.10)",
  },

  periodItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  periodIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(59,130,246,.10)",
    fontSize: "18px",
  },

  smallLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "11px",
    marginBottom: "2px",
  },

  dateValue: {
    color: "#e2e8f0",
    fontSize: "14px",
  },

  divider: {
    width: "1px",
    height: "38px",
    background: "rgba(148,163,184,.12)",
  },

  // =========================================================
  // SCORE HEADER
  // =========================================================

  scoreHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "15px",
  },

  scoreHeaderTitle: {
    fontSize: "19px",
    fontWeight: "800",
    color: "#f8fafc",
  },

  scoreHeaderSubtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "12px",
  },

  totalCircle: {
    minWidth: "88px",
    height: "68px",
    padding: "0 15px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    gap: "3px",
    background:
      "linear-gradient(135deg, rgba(14,165,233,.16), rgba(99,102,241,.16))",
    border: "1px solid rgba(96,165,250,.18)",
  },

  // =========================================================
  // SCORE CARDS
  // =========================================================

  scoresGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },

  scoreCard: {
    padding: "19px",
    borderRadius: "20px",
    background: "rgba(15,23,42,.68)",
    border: "1px solid rgba(148,163,184,.10)",
    boxShadow: "0 12px 35px rgba(0,0,0,.14)",
  },

  scoreTop: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  scoreIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },

  scoreTitleBox: {
    flex: 1,
    minWidth: 0,
  },

  scoreTitle: {
    display: "block",
    color: "#e2e8f0",
    fontSize: "13px",
    fontWeight: "700",
  },

  scoreMax: {
    display: "block",
    color: "#64748b",
    fontSize: "10px",
    marginTop: "2px",
  },

  scoreNumber: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#f8fafc",
  },

  progressBackground: {
    height: "7px",
    marginTop: "17px",
    borderRadius: "20px",
    overflow: "hidden",
    background: "rgba(51,65,85,.65)",
  },

  progressFill: {
    height: "100%",
    borderRadius: "20px",
    transition: "width .5s ease",
  },

  scoreFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "8px",
    color: "#64748b",
    fontSize: "10px",
  },

  // =========================================================
  // RESULT
  // =========================================================

  resultCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "22px",
    marginBottom: "18px",
    borderRadius: "22px",
    background:
      "linear-gradient(135deg, rgba(30,64,175,.20), rgba(79,70,229,.18))",
    border: "1px solid rgba(96,165,250,.18)",
    boxShadow: "0 20px 50px rgba(30,64,175,.12)",
  },

  resultLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  resultIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    background: "rgba(250,204,21,.10)",
  },

  resultLabel: {
    display: "block",
    color: "#f8fafc",
    fontSize: "16px",
    fontWeight: "800",
  },

  resultDescription: {
    margin: "3px 0 0",
    color: "#94a3b8",
    fontSize: "11px",
  },

  resultRight: {
    display: "flex",
    alignItems: "baseline",
    gap: "3px",
    direction: "ltr",
  },

  percentageBadge: {
    marginRight: "10px",
    padding: "5px 9px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "800",
    color: "#93c5fd",
    background: "rgba(59,130,246,.13)",
  },

  // =========================================================
  // GRADE
  // =========================================================

  gradeSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
    borderRadius: "20px",
    marginBottom: "15px",
    background:
      "linear-gradient(135deg, rgba(34,197,94,.13), rgba(16,185,129,.08))",
    border: "1px solid rgba(74,222,128,.18)",
  },

  gradeIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    background: "rgba(250,204,21,.10)",
  },

  gradeContent: {
    flex: 1,
  },

  successCheck: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#4ade80",
    background: "rgba(34,197,94,.12)",
    fontWeight: "900",
  },

  // =========================================================
  // ERROR
  // =========================================================

  error: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "13px 15px",
    borderRadius: "14px",
    marginBottom: "15px",
    color: "#fca5a5",
    background: "rgba(239,68,68,.10)",
    border: "1px solid rgba(239,68,68,.18)",
    fontSize: "13px",
  },

  // =========================================================
  // BUTTONS
  // =========================================================

  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px",
  },

  saveButton: {
    width: "100%",
    minHeight: "55px",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #0ea5e9, #4f46e5)",
    boxShadow: "0 14px 30px rgba(37,99,235,.24)",
    transition: "all .2s ease",
  },

  notesButton: {
    width: "100%",
    minHeight: "53px",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #16a34a, #059669)",
    boxShadow: "0 12px 25px rgba(22,163,74,.18)",
    transition: "all .2s ease",
  },

  arrow: {
    marginRight: "10px",
    fontSize: "18px",
  },

  backButton: {
    width: "100%",
    minHeight: "48px",
    border: "1px solid rgba(148,163,184,.14)",
    borderRadius: "14px",
    cursor: "pointer",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: "700",
    background: "rgba(30,41,59,.65)",
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
    marginTop: "18px",
    color: "#475569",
    fontSize: "11px",
  },
};