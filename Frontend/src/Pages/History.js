import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function History() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("الكل");
  const [sortOrder, setSortOrder] = useState("newest");
  const [deleteId, setDeleteId] = useState(null);

  const nav = useNavigate();

  useEffect(() => {
    fetchEvaluations();
  }, []);

  // ================= FETCH =================
  const fetchEvaluations = async () => {
    try {
      setLoading(true);

      const res = await API.get("/evaluations");

      setData(res.data || []);
    } catch (err) {
      alert("فشل تحميل التقييمات");
    } finally {
      setLoading(false);
    }
  };

  // ================= VIEW REPORT =================
  const viewReport = (id) => {
    nav("/print", {
      state: {
        evaluationId: id,
      },
    });
  };

  // ================= DELETE =================
  const deleteOne = async (id) => {
    try {
      await API.delete(`/evaluations/${id}`);

      setData((prev) =>
        prev.filter((e) => e.evaluation_id !== id)
      );

      setDeleteId(null);
    } catch (err) {
      alert("فشل حذف التقييم");
    }
  };

  // ================= NAVIGATION =================
  const goToAddEvaluation = () => nav("/step1");

  const goBack = () => nav(-1);

  // ================= GRADE STYLE =================
  const gradeStyle = (grade) => {
    if (!grade) {
      return {
        background: "rgba(148,163,184,0.12)",
        color: "#94a3b8",
      };
    }

    if (grade.includes("ممتاز")) {
      return {
        background: "rgba(34,197,94,0.15)",
        color: "#4ade80",
        border: "1px solid rgba(34,197,94,0.25)",
      };
    }

    if (grade.includes("جيد جداً")) {
      return {
        background: "rgba(59,130,246,0.15)",
        color: "#60a5fa",
        border: "1px solid rgba(59,130,246,0.25)",
      };
    }

    if (grade.includes("جيد")) {
      return {
        background: "rgba(245,158,11,0.15)",
        color: "#fbbf24",
        border: "1px solid rgba(245,158,11,0.25)",
      };
    }

    if (grade.includes("مقبول")) {
      return {
        background: "rgba(249,115,22,0.15)",
        color: "#fb923c",
        border: "1px solid rgba(249,115,22,0.25)",
      };
    }

    return {
      background: "rgba(239,68,68,0.15)",
      color: "#f87171",
      border: "1px solid rgba(239,68,68,0.25)",
    };
  };

  // ================= SCORE STYLE =================
  const scoreColor = (total) => {
    const score = Number(total);

    if (score >= 90) return "#4ade80";
    if (score >= 80) return "#60a5fa";
    if (score >= 70) return "#fbbf24";
    if (score >= 60) return "#fb923c";

    return "#f87171";
  };

  // ================= FILTER + SEARCH + SORT =================
  const filteredData = useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      result = result.filter((item) =>
        String(item.name || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (gradeFilter !== "الكل") {
      result = result.filter((item) =>
        String(item.grade || "").includes(gradeFilter)
      );
    }

    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
        );
      }

      if (sortOrder === "oldest") {
        return (
          new Date(a.created_at || 0) -
          new Date(b.created_at || 0)
        );
      }

      if (sortOrder === "highest") {
        return Number(b.total || 0) - Number(a.total || 0);
      }

      if (sortOrder === "lowest") {
        return Number(a.total || 0) - Number(b.total || 0);
      }

      return 0;
    });

    return result;
  }, [data, search, gradeFilter, sortOrder]);

  // ================= STATISTICS =================
  const statistics = useMemo(() => {
    const total = data.length;

    const average =
      total > 0
        ? Math.round(
            data.reduce(
              (sum, item) => sum + Number(item.total || 0),
              0
            ) / total
          )
        : 0;

    const excellent = data.filter((item) =>
      String(item.grade || "").includes("ممتاز")
    ).length;

    const veryGood = data.filter((item) =>
      String(item.grade || "").includes("جيد جداً")
    ).length;

    return {
      total,
      average,
      excellent,
      veryGood,
    };
  }, [data]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>جاري تحميل سجل التقييمات...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ================= HEADER ================= */}
        <div style={styles.header}>
          <div style={styles.headerRight}>
            <button
              style={styles.backBtn}
              onClick={goBack}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, styles.backBtnHover)
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, styles.backBtn)
              }
            >
              <span>→</span>
              رجوع
            </button>

            <div>
              <div style={styles.pageLabel}>
                لوحة التحكم
              </div>

              <h1 style={styles.title}>
                سجل التقييمات
              </h1>

              <p style={styles.subtitle}>
                إدارة ومتابعة جميع تقييمات الموظفين
              </p>
            </div>
          </div>

          <button
            style={styles.addBtn}
            onClick={goToAddEvaluation}
            onMouseEnter={(e) =>
              Object.assign(e.currentTarget.style, styles.addBtnHover)
            }
            onMouseLeave={(e) =>
              Object.assign(e.currentTarget.style, styles.addBtn)
            }
          >
            <span style={styles.addIcon}>+</span>
            إضافة تقييم جديد
          </button>
        </div>

        {/* ================= STATISTICS ================= */}
        <div style={styles.statsGrid}>

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "rgba(59,130,246,0.15)",
                color: "#60a5fa",
              }}
            >
              📊
            </div>

            <div>
              <p style={styles.statLabel}>إجمالي التقييمات</p>
              <h2 style={styles.statValue}>
                {statistics.total}
              </h2>
            </div>
          </div>

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "rgba(168,85,247,0.15)",
                color: "#c084fc",
              }}
            >
              %
            </div>

            <div>
              <p style={styles.statLabel}>متوسط التقييم</p>
              <h2 style={styles.statValue}>
                {statistics.average}%
              </h2>
            </div>
          </div>

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "rgba(34,197,94,0.15)",
                color: "#4ade80",
              }}
            >
              ★
            </div>

            <div>
              <p style={styles.statLabel}>تقييم ممتاز</p>
              <h2 style={styles.statValue}>
                {statistics.excellent}
              </h2>
            </div>
          </div>

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "rgba(59,130,246,0.15)",
                color: "#60a5fa",
              }}
            >
              ✓
            </div>

            <div>
              <p style={styles.statLabel}>جيد جداً</p>
              <h2 style={styles.statValue}>
                {statistics.veryGood}
              </h2>
            </div>
          </div>

        </div>

        {/* ================= FILTER BAR ================= */}
        <div style={styles.filterBar}>

          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>⌕</span>

            <input
              type="text"
              placeholder="ابحث باسم الموظف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            style={styles.select}
          >
            <option value="الكل">كل التقديرات</option>
            <option value="ممتاز">ممتاز</option>
            <option value="جيد جداً">جيد جداً</option>
            <option value="جيد">جيد</option>
            <option value="مقبول">مقبول</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={styles.select}
          >
            <option value="newest">الأحدث أولاً</option>
            <option value="oldest">الأقدم أولاً</option>
            <option value="highest">أعلى تقييم</option>
            <option value="lowest">أقل تقييم</option>
          </select>

        </div>

        {/* ================= RESULT COUNT ================= */}
        {data.length > 0 && (
          <div style={styles.resultInfo}>
            <span>
              عرض <strong>{filteredData.length}</strong> من{" "}
              <strong>{data.length}</strong> تقييم
            </span>
          </div>
        )}

        {/* ================= EMPTY ================= */}
        {data.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>📊</div>

            <h2 style={styles.emptyTitle}>
              لا توجد تقييمات حتى الآن
            </h2>

            <p style={styles.emptyText}>
              ابدأ بإضافة أول تقييم للموظفين وسيظهر هنا.
            </p>

            <button
              style={styles.emptyBtn}
              onClick={goToAddEvaluation}
            >
              + إضافة أول تقييم
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>🔎</div>

            <h2 style={styles.emptyTitle}>
              لا توجد نتائج
            </h2>

            <p style={styles.emptyText}>
              لم نجد أي تقييم يطابق البحث أو الفلترة الحالية.
            </p>

            <button
              style={styles.resetBtn}
              onClick={() => {
                setSearch("");
                setGradeFilter("الكل");
              }}
            >
              إعادة ضبط البحث
            </button>
          </div>
        ) : (

          /* ================= CARDS ================= */
          <div style={styles.grid}>

            {filteredData.map((e) => (

              <div
                key={e.evaluation_id}
                style={styles.card}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform =
                    "translateY(-5px)";
                  event.currentTarget.style.borderColor =
                    "rgba(96,165,250,0.35)";
                  event.currentTarget.style.boxShadow =
                    "0 20px 45px rgba(0,0,0,0.35)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform =
                    "translateY(0)";
                  event.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.08)";
                  event.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(0,0,0,0.22)";
                }}
              >

                {/* CARD HEADER */}
                <div style={styles.cardHeader}>

                  <div style={styles.employeeInfo}>

                    <div style={styles.avatar}>
                      {String(e.name || "?")
                        .trim()
                        .charAt(0)}
                    </div>

                    <div>
                      <h3 style={styles.name}>
                        {e.name || "موظف غير معروف"}
                      </h3>

                      <span style={styles.evaluationNumber}>
                        تقييم #{e.evaluation_id}
                      </span>
                    </div>

                  </div>

                  <span
                    style={{
                      ...styles.grade,
                      ...gradeStyle(e.grade),
                    }}
                  >
                    {e.grade || "-"}
                  </span>

                </div>

                {/* DIVIDER */}
                <div style={styles.divider}></div>

                {/* SCORE */}
                <div style={styles.scoreBox}>

                  <div>
                    <span style={styles.scoreLabel}>
                      النتيجة النهائية
                    </span>

                    <div style={styles.scoreValue}>
                      <span
                        style={{
                          color: scoreColor(e.total),
                        }}
                      >
                        {e.total || 0}
                      </span>
                      <small>%</small>
                    </div>
                  </div>

                  <div style={styles.progressWrapper}>
                    <div style={styles.progressBackground}>
                      <div
                        style={{
                          ...styles.progress,
                          width: `${Math.min(
                            Number(e.total || 0),
                            100
                          )}%`,
                          background: scoreColor(e.total),
                        }}
                      ></div>
                    </div>
                  </div>

                </div>

                {/* INFO */}
                <div style={styles.infoList}>

                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>📅</span>

                    <div>
                      <span style={styles.infoLabel}>
                        فترة التقييم
                      </span>

                      <span style={styles.infoValue}>
                        {e.from_date || "-"}{" "}
                        <span style={styles.arrow}>←</span>{" "}
                        {e.to_date || "-"}
                      </span>
                    </div>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>🕒</span>

                    <div>
                      <span style={styles.infoLabel}>
                        تاريخ الإنشاء
                      </span>

                      <span style={styles.infoValue}>
                        {e.created_at
                          ? new Date(
                              e.created_at
                            ).toLocaleDateString("en-GB")
                          : "-"}
                      </span>
                    </div>
                  </div>

                </div>

                {/* ACTIONS */}
                <div style={styles.actions}>

                  <button
                    style={styles.viewBtn}
                    onClick={() =>
                      viewReport(e.evaluation_id)
                    }
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background =
                        "rgba(59,130,246,0.25)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background =
                        "rgba(59,130,246,0.12)";
                    }}
                  >
                    📄 عرض التقرير
                  </button>

                  <button
                    style={styles.deleteBtn}
                    onClick={() =>
                      setDeleteId(e.evaluation_id)
                    }
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background =
                        "rgba(239,68,68,0.18)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background =
                        "rgba(239,68,68,0.10)";
                    }}
                  >
                    🗑 حذف
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

      {/* ================= DELETE MODAL ================= */}
      {deleteId !== null && (
        <div style={styles.overlay}>

          <div style={styles.modal}>

            <div style={styles.modalIcon}>
              ⚠️
            </div>

            <h2 style={styles.modalTitle}>
              حذف التقييم
            </h2>

            <p style={styles.modalText}>
              هل أنت متأكد من حذف هذا التقييم؟
              <br />
              لا يمكن التراجع عن هذه العملية.
            </p>

            <div style={styles.modalActions}>

              <button
                style={styles.cancelBtn}
                onClick={() => setDeleteId(null)}
              >
                إلغاء
              </button>

              <button
                style={styles.confirmDeleteBtn}
                onClick={() => deleteOne(deleteId)}
              >
                نعم، حذف
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px",
    fontFamily: "Cairo, sans-serif",
    direction: "rtl",
    background:
      "radial-gradient(circle at top right, rgba(59,130,246,0.12), transparent 35%), linear-gradient(135deg,#0b1120,#111827 55%,#0f172a)",
    color: "#fff",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1450px",
    margin: "0 auto",
  },

  /* HEADER */

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  pageLabel: {
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "3px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "14px",
  },

  backBtn: {
    background: "rgba(148,163,184,0.08)",
    border: "1px solid rgba(148,163,184,0.18)",
    color: "#cbd5e1",
    padding: "11px 17px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontFamily: "inherit",
    transition: "all 0.25s ease",
  },

  backBtnHover: {
    background: "rgba(148,163,184,0.16)",
    border: "1px solid rgba(148,163,184,0.3)",
    color: "#fff",
    padding: "11px 17px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontFamily: "inherit",
  },

  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    border: "none",
    padding: "12px 20px",
    borderRadius: "13px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    fontFamily: "inherit",
    boxShadow:
      "0 10px 25px rgba(37,99,235,0.28)",
    transition: "all 0.25s ease",
  },

  addBtnHover: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background:
      "linear-gradient(135deg,#3b82f6,#6366f1)",
    border: "none",
    padding: "12px 20px",
    borderRadius: "13px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    fontFamily: "inherit",
    boxShadow:
      "0 14px 30px rgba(37,99,235,0.4)",
    transform: "translateY(-2px)",
  },

  addIcon: {
    fontSize: "20px",
    lineHeight: 1,
  },

  /* STATISTICS */

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(210px,1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "18px",
    backdropFilter: "blur(15px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
    flexShrink: 0,
  },

  statLabel: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "12px",
  },

  statValue: {
    margin: "3px 0 0",
    fontSize: "25px",
    fontWeight: "800",
  },

  /* FILTER */

  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    marginBottom: "10px",
    background: "rgba(255,255,255,0.04)",
    border:
      "1px solid rgba(255,255,255,0.07)",
    borderRadius: "15px",
    backdropFilter: "blur(12px)",
    flexWrap: "wrap",
  },

  searchWrapper: {
    flex: 1,
    minWidth: "230px",
    position: "relative",
  },

  searchIcon: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748b",
    fontSize: "22px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(148,163,184,0.13)",
    color: "#fff",
    padding: "11px 43px 11px 14px",
    borderRadius: "11px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "13px",
  },

  select: {
    minWidth: "165px",
    background: "#111827",
    border:
      "1px solid rgba(148,163,184,0.15)",
    color: "#cbd5e1",
    padding: "11px 13px",
    borderRadius: "11px",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
  },

  resultInfo: {
    color: "#64748b",
    fontSize: "12px",
    margin: "15px 3px",
  },

  /* GRID */

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill,minmax(340px,1fr))",
    gap: "18px",
  },

  /* CARD */

  card: {
    background:
      "linear-gradient(145deg,rgba(255,255,255,0.065),rgba(255,255,255,0.025))",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "20px",
    backdropFilter: "blur(16px)",
    boxShadow:
      "0 12px 30px rgba(0,0,0,0.22)",
    transition:
      "all 0.25s ease",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  employeeInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg,#2563eb,#6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "17px",
    flexShrink: 0,
    boxShadow:
      "0 8px 20px rgba(37,99,235,0.25)",
  },

  name: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#f8fafc",
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  evaluationNumber: {
    display: "block",
    marginTop: "3px",
    color: "#64748b",
    fontSize: "10px",
  },

  grade: {
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  divider: {
    height: "1px",
    background:
      "rgba(255,255,255,0.07)",
    margin: "18px 0",
  },

  /* SCORE */

  scoreBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "20px",
  },

  scoreLabel: {
    color: "#64748b",
    fontSize: "11px",
    display: "block",
  },

  scoreValue: {
    marginTop: "2px",
    fontSize: "28px",
    fontWeight: "800",
    lineHeight: 1,
  },

  scoreValueSmall: {
    fontSize: "13px",
  },

  progressWrapper: {
    flex: 1,
  },

  progressBackground: {
    width: "100%",
    height: "7px",
    background:
      "rgba(148,163,184,0.12)",
    borderRadius: "20px",
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    borderRadius: "20px",
    transition: "width 0.5s ease",
  },

  /* INFO */

  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  infoIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background:
      "rgba(148,163,184,0.07)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
  },

  infoLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "10px",
    marginBottom: "2px",
  },

  infoValue: {
    display: "block",
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: "600",
  },

  arrow: {
    color: "#475569",
    margin: "0 3px",
  },

  /* ACTIONS */

  actions: {
    display: "flex",
    gap: "9px",
    marginTop: "20px",
  },

  viewBtn: {
    flex: 1,
    background:
      "rgba(59,130,246,0.12)",
    border:
      "1px solid rgba(59,130,246,0.22)",
    color: "#60a5fa",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },

  deleteBtn: {
    width: "80px",
    background:
      "rgba(239,68,68,0.10)",
    border:
      "1px solid rgba(239,68,68,0.20)",
    color: "#f87171",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },

  /* EMPTY */

  emptyCard: {
    marginTop: "25px",
    minHeight: "320px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    background:
      "rgba(255,255,255,0.035)",
    border:
      "1px dashed rgba(148,163,184,0.18)",
    borderRadius: "20px",
    padding: "30px",
  },

  emptyIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "20px",
    background:
      "rgba(59,130,246,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    marginBottom: "15px",
  },

  emptyTitle: {
    margin: "0 0 7px",
    fontSize: "19px",
  },

  emptyText: {
    margin: "0 0 20px",
    color: "#64748b",
    fontSize: "13px",
  },

  emptyBtn: {
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    border: "none",
    color: "#fff",
    padding: "11px 20px",
    borderRadius: "11px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
  },

  resetBtn: {
    background:
      "rgba(148,163,184,0.10)",
    border:
      "1px solid rgba(148,163,184,0.18)",
    color: "#cbd5e1",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  /* LOADING */

  loadingContainer: {
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  spinner: {
    width: "42px",
    height: "42px",
    border:
      "3px solid rgba(255,255,255,0.1)",
    borderTop:
      "3px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    color: "#94a3b8",
    marginTop: "15px",
    fontSize: "14px",
  },

  /* MODAL */

  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(2,6,23,0.75)",
    backdropFilter: "blur(7px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },

  modal: {
    width: "100%",
    maxWidth: "420px",
    background:
      "linear-gradient(145deg,#172033,#0f172a)",
    border:
      "1px solid rgba(255,255,255,0.10)",
    borderRadius: "20px",
    padding: "30px",
    textAlign: "center",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.5)",
  },

  modalIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "18px",
    background:
      "rgba(239,68,68,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    fontSize: "28px",
  },

  modalTitle: {
    margin: "0 0 10px",
    fontSize: "20px",
  },

  modalText: {
    margin: "0",
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: "1.8",
  },

  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "25px",
  },

  cancelBtn: {
    flex: 1,
    padding: "11px",
    borderRadius: "10px",
    border:
      "1px solid rgba(148,163,184,0.18)",
    background:
      "rgba(148,163,184,0.08)",
    color: "#cbd5e1",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "600",
  },

  confirmDeleteBtn: {
    flex: 1,
    padding: "11px",
    borderRadius: "10px",
    border: "none",
    background:
      "linear-gradient(135deg,#dc2626,#ef4444)",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
  },
};