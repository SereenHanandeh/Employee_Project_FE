import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function History() {
  const nav = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("الكل");
  const [sortOrder, setSortOrder] = useState("newest");

  const [deleteId, setDeleteId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =====================================================
  // FETCH
  // =====================================================

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);

      const res = await API.get("/evaluations");

      setData(res.data || []);
    } catch (err) {
      console.error(err);
      alert("فشل تحميل التقييمات");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const goToDashboard = () => nav("/dashboard");

  const goToEmployees = () => nav("/employees");

  const goToEvaluations = () => nav("/history");

  const goToTasks = () => nav("/tasks");

  const goToLeaves = () => nav("/leaves-list");

  const goToAddEvaluation = () => nav("/step1");

  const viewReport = (id) => {
    nav("/print", {
      state: {
        evaluationId: id,
      },
    });
  };

  // =====================================================
  // DELETE
  // =====================================================

  const deleteOne = async (id) => {
    try {
      await API.delete(`/evaluations/${id}`);

      setData((prev) =>
        prev.filter((e) => e.evaluation_id !== id)
      );

      setDeleteId(null);
    } catch (err) {
      console.error(err);
      alert("فشل حذف التقييم");
    }
  };

  // =====================================================
  // GRADE STYLE
  // =====================================================

  const gradeStyle = (grade) => {
    if (!grade) {
      return {
        background: "rgba(148,163,184,0.12)",
        color: "#94a3b8",
      };
    }

    const value = String(grade);

    if (value.includes("ممتاز")) {
      return {
        background: "rgba(34,197,94,0.15)",
        color: "#4ade80",
        border: "1px solid rgba(34,197,94,0.25)",
      };
    }

    if (value.includes("جيد جداً")) {
      return {
        background: "rgba(59,130,246,0.15)",
        color: "#60a5fa",
        border: "1px solid rgba(59,130,246,0.25)",
      };
    }

    if (value.includes("جيد")) {
      return {
        background: "rgba(245,158,11,0.15)",
        color: "#fbbf24",
        border: "1px solid rgba(245,158,11,0.25)",
      };
    }

    if (value.includes("مقبول")) {
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

  // =====================================================
  // SCORE COLOR
  // =====================================================

  const scoreColor = (total) => {
    const score = Number(total);

    if (score >= 90) return "#4ade80";
    if (score >= 80) return "#60a5fa";
    if (score >= 70) return "#fbbf24";
    if (score >= 60) return "#fb923c";

    return "#f87171";
  };

  // =====================================================
  // FILTER + SEARCH + SORT
  // =====================================================

  const filteredData = useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      const searchValue = search.trim().toLowerCase();

      result = result.filter((item) =>
        String(item.name || "")
          .toLowerCase()
          .includes(searchValue)
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

  // =====================================================
  // STATISTICS
  // =====================================================

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

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString("ar-SA");
    } catch {
      return "-";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>
          جاري تحميل سجل التقييمات...
        </p>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div style={styles.app}>

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {sidebarOpen && (
        <div
          style={styles.mobileOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        style={{
          ...styles.sidebar,
          ...(sidebarOpen ? styles.sidebarMobileOpen : {}),
        }}
      >

        {/* LOGO */}

        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>HR</div>

          <div>
            <div style={styles.logoTitle}>
              HR System
            </div>

            <div style={styles.logoSubtitle}>
              نظام إدارة الموظفين
            </div>
          </div>

          <button
            style={styles.closeSidebar}
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* USER */}

        <div style={styles.userCard}>
          <div style={styles.userAvatar}>
            A
          </div>

          <div style={styles.userInfo}>
            <strong>المدير</strong>
            <span>مدير النظام</span>
          </div>

          <span style={styles.onlineDot}></span>
        </div>

        {/* MENU */}

        <div style={styles.menuLabel}>
          القائمة الرئيسية
        </div>

        <nav style={styles.nav}>

          <button
            style={styles.navItem}
            onClick={goToDashboard}
          >
            <span style={styles.navIcon}>⌂</span>
            <span>لوحة التحكم</span>
          </button>

          <button
            style={styles.navItem}
            onClick={goToEmployees}
          >
            <span style={styles.navIcon}>👥</span>
            <span>الموظفين</span>
          </button>

          <button
            style={{
              ...styles.navItem,
              ...styles.navItemActive,
            }}
            onClick={goToEvaluations}
          >
            <span style={styles.navIcon}>📊</span>
            <span>التقييمات</span>
            <span style={styles.activeIndicator}></span>
          </button>

          <button
            style={styles.navItem}
            onClick={goToTasks}
          >
            <span style={styles.navIcon}>✓</span>
            <span>المهام</span>
          </button>

          <button
            style={styles.navItem}
            onClick={goToLeaves}
          >
            <span style={styles.navIcon}>📅</span>
            <span>الإجازات</span>
          </button>

        </nav>

        {/* SIDEBAR FOOTER */}

        <div style={styles.sidebarFooter}>

          <button
            style={styles.navItem}
            onClick={() => alert("الإعدادات قريباً")}
          >
            <span style={styles.navIcon}>⚙</span>
            <span>الإعدادات</span>
          </button>

          <button
            style={styles.logoutBtn}
            onClick={() => {
              localStorage.removeItem("token");
              nav("/");
            }}
          >
            <span>⇥</span>
            تسجيل الخروج
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main style={styles.main}>

        {/* =================================================
            HEADER
        ================================================= */}

        <header style={styles.header}>

          <div style={styles.headerRight}>

            <button
              style={styles.menuButton}
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <div>

              <div style={styles.breadcrumb}>
                لوحة التحكم / التقييمات
              </div>

              <h1 style={styles.title}>
                سجل التقييمات
              </h1>

              <p style={styles.subtitle}>
                إدارة ومتابعة جميع تقييمات الموظفين
              </p>

            </div>

          </div>

          <div style={styles.headerLeft}>

            <div style={styles.notification}>
              🔔
              <span style={styles.notificationDot}></span>
            </div>

            <div style={styles.headerUser}>
              <div style={styles.smallAvatar}>
                A
              </div>

              <div>
                <strong>المدير</strong>
                <span>مدير النظام</span>
              </div>
            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <section style={styles.content}>

          {/* =================================================
              TOP ACTION
          ================================================= */}

          <div style={styles.pageActions}>

            <div>
              <span style={styles.sectionLabel}>
                التقييمات
              </span>

              <h2 style={styles.sectionTitle}>
                جميع التقييمات
              </h2>
            </div>

            <button
              style={styles.addBtn}
              onClick={goToAddEvaluation}
            >
              <span style={styles.addIcon}>+</span>
              إضافة تقييم جديد
            </button>

          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div style={styles.statsGrid}>

            <div style={styles.statCard}>

              <div
                style={{
                  ...styles.statIcon,
                  background:
                    "rgba(59,130,246,0.13)",
                  color: "#60a5fa",
                }}
              >
                📊
              </div>

              <div>
                <span style={styles.statLabel}>
                  إجمالي التقييمات
                </span>

                <strong style={styles.statValue}>
                  {statistics.total}
                </strong>

                <span style={styles.statHint}>
                  جميع التقييمات
                </span>
              </div>

            </div>

            <div style={styles.statCard}>

              <div
                style={{
                  ...styles.statIcon,
                  background:
                    "rgba(168,85,247,0.13)",
                  color: "#c084fc",
                }}
              >
                %
              </div>

              <div>
                <span style={styles.statLabel}>
                  متوسط التقييم
                </span>

                <strong style={styles.statValue}>
                  {statistics.average}%
                </strong>

                <span style={styles.statHint}>
                  متوسط النتائج
                </span>
              </div>

            </div>

            <div style={styles.statCard}>

              <div
                style={{
                  ...styles.statIcon,
                  background:
                    "rgba(34,197,94,0.13)",
                  color: "#4ade80",
                }}
              >
                ★
              </div>

              <div>
                <span style={styles.statLabel}>
                  تقييم ممتاز
                </span>

                <strong style={styles.statValue}>
                  {statistics.excellent}
                </strong>

                <span style={styles.statHint}>
                  أداء ممتاز
                </span>
              </div>

            </div>

            <div style={styles.statCard}>

              <div
                style={{
                  ...styles.statIcon,
                  background:
                    "rgba(59,130,246,0.13)",
                  color: "#60a5fa",
                }}
              >
                ✓
              </div>

              <div>
                <span style={styles.statLabel}>
                  جيد جداً
                </span>

                <strong style={styles.statValue}>
                  {statistics.veryGood}
                </strong>

                <span style={styles.statHint}>
                  أداء جيد جداً
                </span>
              </div>

            </div>

          </div>

          {/* =================================================
              FILTER
          ================================================= */}

          <div style={styles.filterCard}>

            <div style={styles.searchWrapper}>

              <span style={styles.searchIcon}>
                🔍
              </span>

              <input
                type="text"
                placeholder="ابحث باسم الموظف..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                style={styles.searchInput}
              />

              {search && (
                <button
                  style={styles.clearSearch}
                  onClick={() => setSearch("")}
                >
                  ✕
                </button>
              )}

            </div>

            <select
              value={gradeFilter}
              onChange={(e) =>
                setGradeFilter(e.target.value)
              }
              style={styles.select}
            >
              <option value="الكل">
                كل التقديرات
              </option>

              <option value="ممتاز">
                ممتاز
              </option>

              <option value="جيد جداً">
                جيد جداً
              </option>

              <option value="جيد">
                جيد
              </option>

              <option value="مقبول">
                مقبول
              </option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value)
              }
              style={styles.select}
            >
              <option value="newest">
                الأحدث أولاً
              </option>

              <option value="oldest">
                الأقدم أولاً
              </option>

              <option value="highest">
                أعلى تقييم
              </option>

              <option value="lowest">
                أقل تقييم
              </option>
            </select>

          </div>

          {/* =================================================
              RESULT COUNT
          ================================================= */}

          {data.length > 0 && (
            <div style={styles.resultInfo}>

              <span>
                عرض{" "}
                <strong>
                  {filteredData.length}
                </strong>{" "}
                من{" "}
                <strong>
                  {data.length}
                </strong>{" "}
                تقييم
              </span>

              {(search ||
                gradeFilter !== "الكل") && (
                <button
                  style={styles.resetFilter}
                  onClick={() => {
                    setSearch("");
                    setGradeFilter("الكل");
                  }}
                >
                  إعادة ضبط
                </button>
              )}

            </div>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {data.length === 0 ? (

            <div style={styles.emptyCard}>

              <div style={styles.emptyIcon}>
                📊
              </div>

              <h2 style={styles.emptyTitle}>
                لا توجد تقييمات حتى الآن
              </h2>

              <p style={styles.emptyText}>
                ابدأ بإضافة أول تقييم للموظفين
                وسيظهر هنا.
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

              <div style={styles.emptyIcon}>
                🔎
              </div>

              <h2 style={styles.emptyTitle}>
                لا توجد نتائج
              </h2>

              <p style={styles.emptyText}>
                لم نجد أي تقييم يطابق البحث
                أو الفلترة الحالية.
              </p>

              <button
                style={styles.resetBtn}
                onClick={() => {
                  setSearch("");
                  setGradeFilter("الكل");
                  setSortOrder("newest");
                }}
              >
                إعادة ضبط البحث
              </button>

            </div>

          ) : (

            /* =================================================
               CARDS
            ================================================= */

            <div style={styles.grid}>

              {filteredData.map((e) => {

                const score = Math.min(
                  Math.max(
                    Number(e.total || 0),
                    0
                  ),
                  100
                );

                return (
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
                        "rgba(255,255,255,0.07)";

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

                        <div style={styles.nameArea}>

                          <h3 style={styles.name}>
                            {e.name ||
                              "موظف غير معروف"}
                          </h3>

                          <span
                            style={
                              styles.evaluationNumber
                            }
                          >
                            تقييم #
                            {e.evaluation_id}
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

                    <div style={styles.divider}></div>

                    {/* SCORE */}

                    <div style={styles.scoreBox}>

                      <div style={styles.scoreNumber}>

                        <span
                          style={
                            styles.scoreLabel
                          }
                        >
                          النتيجة النهائية
                        </span>

                        <div
                          style={
                            styles.scoreValue
                          }
                        >
                          <span
                            style={{
                              color:
                                scoreColor(
                                  e.total
                                ),
                            }}
                          >
                            {e.total || 0}
                          </span>

                          <small>%</small>
                        </div>

                      </div>

                      <div
                        style={
                          styles.progressWrapper
                        }
                      >

                        <div
                          style={
                            styles.progressBackground
                          }
                        >

                          <div
                            style={{
                              ...styles.progress,
                              width: `${score}%`,
                              background:
                                scoreColor(
                                  e.total
                                ),
                            }}
                          />

                        </div>

                      </div>

                    </div>

                    {/* INFO */}

                    <div style={styles.infoList}>

                      <div
                        style={styles.infoRow}
                      >

                        <div
                          style={
                            styles.infoIcon
                          }
                        >
                          📅
                        </div>

                        <div>
                          <span
                            style={
                              styles.infoLabel
                            }
                          >
                            فترة التقييم
                          </span>

                          <span
                            style={
                              styles.infoValue
                            }
                          >
                            {e.from_date || "-"}
                            {" "}
                            <span
                              style={
                                styles.arrow
                              }
                            >
                              ←
                            </span>
                            {" "}
                            {e.to_date || "-"}
                          </span>
                        </div>

                      </div>

                      <div
                        style={styles.infoRow}
                      >

                        <div
                          style={
                            styles.infoIcon
                          }
                        >
                          🕒
                        </div>

                        <div>
                          <span
                            style={
                              styles.infoLabel
                            }
                          >
                            تاريخ الإنشاء
                          </span>

                          <span
                            style={
                              styles.infoValue
                            }
                          >
                            {formatDate(
                              e.created_at
                            )}
                          </span>
                        </div>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div style={styles.actions}>

                      <button
                        style={styles.viewBtn}
                        onClick={() =>
                          viewReport(
                            e.evaluation_id
                          )
                        }
                      >
                        📄 عرض التقرير
                      </button>

                      <button
                        style={
                          styles.deleteBtn
                        }
                        onClick={() =>
                          setDeleteId(
                            e.evaluation_id
                          )
                        }
                      >
                        🗑 حذف
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

      </main>

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteId !== null && (

        <div style={styles.modalOverlay}>

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
                onClick={() =>
                  setDeleteId(null)
                }
              >
                إلغاء
              </button>

              <button
                style={
                  styles.confirmDeleteBtn
                }
                onClick={() =>
                  deleteOne(deleteId)
                }
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

  /* APP */

  app: {
    minHeight: "100vh",
    direction: "rtl",
    background:
      "radial-gradient(circle at top right, rgba(59,130,246,0.10), transparent 30%), linear-gradient(135deg,#080f1d,#0f172a 55%,#111827)",
    color: "#fff",
    fontFamily: "Cairo, Arial, sans-serif",
  },

  /* SIDEBAR */

  sidebar: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "270px",
    height: "100vh",
    background:
      "linear-gradient(180deg,#111827,#0b1220)",
    borderLeft:
      "1px solid rgba(255,255,255,0.07)",
    padding: "22px 15px",
    boxSizing: "border-box",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    boxShadow:
      "-10px 0 35px rgba(0,0,0,0.18)",
  },

  sidebarMobileOpen: {
    transform: "translateX(0)",
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "5px 8px 22px",
    borderBottom:
      "1px solid rgba(255,255,255,0.06)",
  },

  logoIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "900",
    boxShadow:
      "0 8px 20px rgba(37,99,235,0.28)",
  },

  logoTitle: {
    fontSize: "16px",
    fontWeight: "800",
  },

  logoSubtitle: {
    fontSize: "9px",
    color: "#64748b",
    marginTop: "2px",
  },

  closeSidebar: {
    display: "none",
    marginRight: "auto",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "18px",
    cursor: "pointer",
  },

  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "18px 4px",
    padding: "12px",
    borderRadius: "13px",
    background:
      "rgba(255,255,255,0.035)",
    border:
      "1px solid rgba(255,255,255,0.06)",
  },

  userAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "11px",
    background:
      "linear-gradient(135deg,#334155,#475569)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },

  userInfoStrong: {
    fontSize: "12px",
  },

  onlineDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow:
      "0 0 8px rgba(34,197,94,0.6)",
  },

  menuLabel: {
    color: "#475569",
    fontSize: "10px",
    fontWeight: "700",
    padding: "8px 12px",
    marginBottom: "5px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  navItem: {
    position: "relative",
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 13px",
    borderRadius: "11px",
    border: "1px solid transparent",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "12px",
    fontWeight: "600",
    textAlign: "right",
    transition: "all 0.2s ease",
  },

  navItemActive: {
    background:
      "linear-gradient(90deg,rgba(59,130,246,0.18),rgba(59,130,246,0.06))",
    border:
      "1px solid rgba(59,130,246,0.15)",
    color: "#60a5fa",
  },

  navIcon: {
    width: "22px",
    textAlign: "center",
    fontSize: "16px",
  },

  activeIndicator: {
    position: "absolute",
    right: 0,
    width: "3px",
    height: "22px",
    borderRadius: "5px 0 0 5px",
    background: "#3b82f6",
  },

  sidebarFooter: {
    marginTop: "auto",
    paddingTop: "15px",
    borderTop:
      "1px solid rgba(255,255,255,0.06)",
  },

  logoutBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "8px",
    padding: "11px",
    borderRadius: "10px",
    border:
      "1px solid rgba(239,68,68,0.15)",
    background:
      "rgba(239,68,68,0.07)",
    color: "#f87171",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "600",
  },

  /* MAIN */

  main: {
    marginRight: "270px",
    minHeight: "100vh",
  },

  /* HEADER */

  header: {
    minHeight: "86px",
    padding: "18px 32px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    borderBottom:
      "1px solid rgba(255,255,255,0.06)",
    background:
      "rgba(8,15,29,0.72)",
    backdropFilter: "blur(16px)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  menuButton: {
    display: "none",
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    border:
      "1px solid rgba(255,255,255,0.08)",
    background:
      "rgba(255,255,255,0.05)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "18px",
  },

  breadcrumb: {
    color: "#475569",
    fontSize: "10px",
    marginBottom: "3px",
  },

  title: {
    margin: 0,
    fontSize: "25px",
    fontWeight: "800",
  },

  subtitle: {
    margin: "3px 0 0",
    color: "#64748b",
    fontSize: "11px",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  notification: {
    position: "relative",
    width: "39px",
    height: "39px",
    borderRadius: "11px",
    background:
      "rgba(255,255,255,0.045)",
    border:
      "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
  },

  notificationDot: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#ef4444",
  },

  headerUser: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  smallAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg,#2563eb,#6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  /* CONTENT */

  content: {
    padding: "30px 32px 50px",
    maxWidth: "1500px",
    margin: "0 auto",
    boxSizing: "border-box",
  },

  pageActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "22px",
  },

  sectionLabel: {
    color: "#64748b",
    fontSize: "10px",
  },

  sectionTitle: {
    margin: "3px 0 0",
    fontSize: "20px",
    fontWeight: "800",
  },

  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    border: "none",
    padding: "11px 18px",
    borderRadius: "11px",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
    boxShadow:
      "0 8px 22px rgba(37,99,235,0.25)",
  },

  addIcon: {
    fontSize: "19px",
    lineHeight: 1,
  },

  /* STATS */

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4,minmax(0,1fr))",
    gap: "15px",
    marginBottom: "18px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    minWidth: 0,
    padding: "17px",
    borderRadius: "15px",
    background:
      "linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))",
    border:
      "1px solid rgba(255,255,255,0.065)",
    boxShadow:
      "0 8px 25px rgba(0,0,0,0.13)",
  },

  statIcon: {
    width: "45px",
    height: "45px",
    flexShrink: 0,
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: "800",
  },

  statLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "10px",
  },

  statValue: {
    display: "block",
    marginTop: "3px",
    fontSize: "23px",
    fontWeight: "800",
  },

  statHint: {
    display: "block",
    marginTop: "2px",
    color: "#475569",
    fontSize: "9px",
  },

  /* FILTER */

  filterCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px",
    borderRadius: "14px",
    background:
      "rgba(255,255,255,0.035)",
    border:
      "1px solid rgba(255,255,255,0.065)",
    marginBottom: "12px",
  },

  searchWrapper: {
    flex: 1,
    minWidth: "220px",
    position: "relative",
  },

  searchIcon: {
    position: "absolute",
    right: "13px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748b",
    fontSize: "14px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    background:
      "rgba(15,23,42,0.8)",
    border:
      "1px solid rgba(148,163,184,0.12)",
    color: "#fff",
    padding: "11px 38px 11px 35px",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "11px",
  },

  clearSearch: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
  },

  select: {
    minWidth: "160px",
    background: "#111827",
    border:
      "1px solid rgba(148,163,184,0.13)",
    color: "#cbd5e1",
    padding: "10px 12px",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "11px",
    cursor: "pointer",
  },

  resultInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#64748b",
    fontSize: "10px",
    margin: "13px 3px",
  },

  resetFilter: {
    background: "transparent",
    border: "none",
    color: "#60a5fa",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "10px",
  },

  /* GRID */

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill,minmax(320px,1fr))",
    gap: "17px",
  },

  /* CARD */

  card: {
    background:
      "linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))",
    border:
      "1px solid rgba(255,255,255,0.07)",
    borderRadius: "17px",
    padding: "19px",
    backdropFilter: "blur(14px)",
    boxShadow:
      "0 12px 30px rgba(0,0,0,0.22)",
    transition: "all 0.25s ease",
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
    gap: "11px",
    minWidth: 0,
  },

  avatar: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    flexShrink: 0,
    background:
      "linear-gradient(135deg,#2563eb,#6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "16px",
    boxShadow:
      "0 7px 18px rgba(37,99,235,0.23)",
  },

  nameArea: {
    minWidth: 0,
  },

  name: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "700",
    maxWidth: "175px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  evaluationNumber: {
    display: "block",
    marginTop: "3px",
    color: "#64748b",
    fontSize: "9px",
  },

  grade: {
    padding: "5px 9px",
    borderRadius: "18px",
    fontSize: "10px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  divider: {
    height: "1px",
    background:
      "rgba(255,255,255,0.06)",
    margin: "17px 0",
  },

  /* SCORE */

  scoreBox: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "19px",
  },

  scoreNumber: {
    minWidth: "75px",
  },

  scoreLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "9px",
  },

  scoreValue: {
    marginTop: "3px",
    fontSize: "27px",
    lineHeight: 1,
    fontWeight: "900",
  },

  scoreValueSmall: {
    fontSize: "12px",
  },

  progressWrapper: {
    flex: 1,
  },

  progressBackground: {
    width: "100%",
    height: "7px",
    background:
      "rgba(148,163,184,0.10)",
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
    gap: "10px",
  },

  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  infoIcon: {
    width: "32px",
    height: "32px",
    flexShrink: 0,
    borderRadius: "9px",
    background:
      "rgba(148,163,184,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
  },

  infoLabel: {
    display: "block",
    color: "#475569",
    fontSize: "9px",
    marginBottom: "2px",
  },

  infoValue: {
    display: "block",
    color: "#cbd5e1",
    fontSize: "10px",
    fontWeight: "600",
  },

  arrow: {
    color: "#475569",
  },

  /* ACTIONS */

  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "18px",
  },

  viewBtn: {
    flex: 1,
    padding: "9px",
    borderRadius: "9px",
    border:
      "1px solid rgba(59,130,246,0.20)",
    background:
      "rgba(59,130,246,0.10)",
    color: "#60a5fa",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "10px",
    fontWeight: "700",
    transition: "all 0.2s ease",
  },

  deleteBtn: {
    width: "75px",
    padding: "9px",
    borderRadius: "9px",
    border:
      "1px solid rgba(239,68,68,0.18)",
    background:
      "rgba(239,68,68,0.08)",
    color: "#f87171",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "10px",
    fontWeight: "700",
    transition: "all 0.2s ease",
  },

  /* EMPTY */

  emptyCard: {
    minHeight: "320px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    background:
      "rgba(255,255,255,0.03)",
    border:
      "1px dashed rgba(148,163,184,0.16)",
    borderRadius: "18px",
    padding: "30px",
  },

  emptyIcon: {
    width: "65px",
    height: "65px",
    borderRadius: "18px",
    background:
      "rgba(59,130,246,0.09)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    marginBottom: "14px",
  },

  emptyTitle: {
    margin: "0 0 7px",
    fontSize: "18px",
  },

  emptyText: {
    margin: "0 0 18px",
    color: "#64748b",
    fontSize: "11px",
  },

  emptyBtn: {
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    border: "none",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
  },

  resetBtn: {
    background:
      "rgba(148,163,184,0.08)",
    border:
      "1px solid rgba(148,163,184,0.15)",
    color: "#cbd5e1",
    padding: "9px 17px",
    borderRadius: "9px",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  /* MODAL */

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background:
      "rgba(2,6,23,0.75)",
    backdropFilter: "blur(7px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },

  modal: {
    width: "100%",
    maxWidth: "400px",
    background:
      "linear-gradient(145deg,#172033,#0f172a)",
    border:
      "1px solid rgba(255,255,255,0.09)",
    borderRadius: "19px",
    padding: "28px",
    textAlign: "center",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.5)",
  },

  modalIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 14px",
    borderRadius: "17px",
    background:
      "rgba(239,68,68,0.11)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
  },

  modalTitle: {
    margin: "0 0 8px",
    fontSize: "19px",
  },

  modalText: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "11px",
    lineHeight: 1.8,
  },

  modalActions: {
    display: "flex",
    gap: "9px",
    marginTop: "23px",
  },

  cancelBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "9px",
    border:
      "1px solid rgba(148,163,184,0.15)",
    background:
      "rgba(148,163,184,0.07)",
    color: "#cbd5e1",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "600",
  },

  confirmDeleteBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "9px",
    border: "none",
    background:
      "linear-gradient(135deg,#dc2626,#ef4444)",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
  },

  /* LOADING */

  loadingPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#080f1d,#0f172a)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    direction: "rtl",
    fontFamily: "Cairo, Arial, sans-serif",
    color: "#fff",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border:
      "3px solid rgba(255,255,255,0.08)",
    borderTop:
      "3px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    marginTop: "14px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  mobileOverlay: {
    display: "none",
  },
};