import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home() {
  const nav = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    nav("/login");
  };

  return (
    <div style={styles.page}>
      {/* ================= BACKGROUND ================= */}

      <div style={styles.backgroundGlow1}></div>
      <div style={styles.backgroundGlow2}></div>

      {/* ================= NAVBAR ================= */}

      <header style={styles.navbar}>
        <div style={styles.logoArea}>
          <div style={styles.logo}>
            HR
          </div>

          <div>
            <div style={styles.logoTitle}>
              إدارة الموظفين
            </div>

            <div style={styles.logoSubtitle}>
              نظام الموارد البشرية
            </div>
          </div>
        </div>

        <div style={styles.navActions}>
          {isLoggedIn ? (
            <>
              <button
                style={styles.dashboardButton}
                onClick={() => nav("/admin-dashboard")}
              >
                لوحة التحكم
              </button>

              <button
                style={styles.logoutButton}
                onClick={handleLogout}
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
            <button
              style={styles.loginButton}
              onClick={() => nav("/login")}
            >
              تسجيل الدخول

            </button>
          )}
        </div>
      </header>

      {/* ================= HERO ================= */}

      <main style={styles.main}>

        <section style={styles.hero}>

          {/* LEFT / TEXT */}

          <div style={styles.heroContent}>

            <div style={styles.badge}>
              <span style={styles.badgeDot}></span>
              نظام إدارة الموارد البشرية
            </div>

            <h1 style={styles.heroTitle}>
              إدارة موظفيك
              <br />

              <span style={styles.gradientText}>
                بطريقة أذكى وأسهل
              </span>
            </h1>

            <p style={styles.heroDescription}>
              منصة متكاملة تساعدك على إدارة الموظفين،
              متابعة الأداء، تنظيم الإجازات والمهام،
              وإجراء التقييمات بكل سهولة واحترافية.
            </p>

            <div style={styles.heroButtons}>

              {isLoggedIn ? (
                <button
                  style={styles.primaryHeroButton}
                  onClick={() => nav("/admin-dashboard")}
                >
                  <span>الدخول إلى لوحة التحكم</span>
                  <span style={styles.arrow}>←</span>
                </button>
              ) : (
                <button
                  style={styles.primaryHeroButton}
                  onClick={() => nav("/login")}
                >
                  <span>ابدأ الآن</span>
                  <span style={styles.arrow}>←</span>
                </button>
              )}


            </div>

            {/* ================= FEATURES ================= */}

            <div style={styles.features}>

              <div style={styles.feature}>
                <div style={styles.featureIcon}>
                  👨‍💼
                </div>

                <div>
                  <strong style={styles.featureTitle}>
                    الموظفين
                  </strong>

                  <span style={styles.featureText}>
                    إدارة بيانات الموظفين
                  </span>
                </div>
              </div>

              <div style={styles.feature}>
                <div style={styles.featureIcon}>
                  📅
                </div>

                <div>
                  <strong style={styles.featureTitle}>
                    الإجازات
                  </strong>

                  <span style={styles.featureText}>
                    متابعة طلبات الإجازات
                  </span>
                </div>
              </div>

              <div style={styles.feature}>
                <div style={styles.featureIcon}>
                  📊
                </div>

                <div>
                  <strong style={styles.featureTitle}>
                    التقييم
                  </strong>

                  <span style={styles.featureText}>
                    متابعة أداء الموظفين
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* ================= VISUAL CARD ================= */}

          <div style={styles.heroVisual}>

            <div style={styles.glowCircle}></div>

            <div style={styles.dashboardCard}>

              {/* Card Header */}

              <div style={styles.dashboardHeader}>

                <div>
                  <div style={styles.dashboardSmallTitle}>
                    لوحة الإدارة
                  </div>

                  <div style={styles.dashboardTitle}>
                    نظرة عامة
                  </div>
                </div>

                <div style={styles.dashboardIcon}>
                  HR
                </div>

              </div>

              {/* Statistics */}

              <div style={styles.miniStats}>

                <div style={styles.miniStat}>
                  <div style={styles.miniIconBlue}>
                    👥
                  </div>

                  <div>
                    <span style={styles.miniLabel}>
                      الموظفين
                    </span>

                    <strong style={styles.miniNumber}>
                      128
                    </strong>
                  </div>
                </div>

                <div style={styles.miniStat}>
                  <div style={styles.miniIconGreen}>
                    ✓
                  </div>

                  <div>
                    <span style={styles.miniLabel}>
                      التقييمات
                    </span>

                    <strong style={styles.miniNumber}>
                      96
                    </strong>
                  </div>
                </div>

              </div>

              {/* Chart */}

              <div style={styles.chartCard}>

                <div style={styles.chartHeader}>
                  <span>
                    أداء الموظفين
                  </span>

                  <span style={styles.chartPercentage}>
                    +18.5%
                  </span>
                </div>

                <div style={styles.chart}>

                  <div
                    style={{
                      ...styles.bar,
                      height: "35%",
                    }}
                  ></div>

                  <div
                    style={{
                      ...styles.bar,
                      height: "55%",
                    }}
                  ></div>

                  <div
                    style={{
                      ...styles.bar,
                      height: "45%",
                    }}
                  ></div>

                  <div
                    style={{
                      ...styles.bar,
                      height: "70%",
                    }}
                  ></div>

                  <div
                    style={{
                      ...styles.bar,
                      height: "62%",
                    }}
                  ></div>

                  <div
                    style={{
                      ...styles.bar,
                      height: "88%",
                    }}
                  ></div>

                  <div
                    style={{
                      ...styles.bar,
                      height: "78%",
                    }}
                  ></div>

                </div>

              </div>

              {/* Leave */}

              <div style={styles.leaveSummary}>

                <div style={styles.leaveIcon}>
                  📅
                </div>

                <div style={styles.leaveText}>
                  <strong>
                    طلبات الإجازات
                  </strong>

                  <span>
                    12 طلب قيد المراجعة
                  </span>
                </div>

                <div style={styles.leaveCount}>
                  12
                </div>

              </div>

            </div>

            {/* Floating Card */}

            <div style={styles.floatingCard}>

              <div style={styles.checkCircle}>
                ✓
              </div>

              <div>
                <strong style={styles.floatingTitle}>
                  أداء ممتاز
                </strong>

                <span style={styles.floatingText}>
                  تم تحديث التقييم
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* ================= BOTTOM STATS ================= */}

        <section style={styles.bottomSection}>

          <div style={styles.bottomCard}>
            <span style={styles.bottomIcon}>
              👥
            </span>

            <div>
              <strong>
                إدارة الموظفين
              </strong>

              <span>
                بيانات منظمة وسهلة الوصول
              </span>
            </div>
          </div>

          <div style={styles.bottomCard}>
            <span style={styles.bottomIcon}>
              📅
            </span>

            <div>
              <strong>
                تنظيم الإجازات
              </strong>

              <span>
                قبول ورفض ومتابعة الطلبات
              </span>
            </div>
          </div>

          <div style={styles.bottomCard}>
            <span style={styles.bottomIcon}>
              ✓
            </span>

            <div>
              <strong>
                إدارة المهام
              </strong>

              <span>
                توزيع ومتابعة مهام الموظفين
              </span>
            </div>
          </div>

          <div style={styles.bottomCard}>
            <span style={styles.bottomIcon}>
              📈
            </span>

            <div>
              <strong>
                تقييم الأداء
              </strong>

              <span>
                تقارير ومتابعة الأداء
              </span>
            </div>
          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer style={styles.footer}>
        © 2026 نظام إدارة الموظفين — جميع الحقوق محفوظة
      </footer>

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {

  page: {
    minHeight: "100vh",
    width: "100%",
    background:
      "linear-gradient(135deg,#050816 0%,#0b1020 45%,#111827 100%)",
    color: "#fff",
    fontFamily: "Cairo, Tahoma, Arial, sans-serif",
    direction: "rtl",
    position: "relative",
    overflow: "hidden",
  },

  backgroundGlow1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "rgba(99,102,241,0.13)",
    filter: "blur(100px)",
    top: "-180px",
    left: "-150px",
    pointerEvents: "none",
  },

  backgroundGlow2: {
    position: "absolute",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background:
      "rgba(59,130,246,0.10)",
    filter: "blur(100px)",
    bottom: "-200px",
    right: "-120px",
    pointerEvents: "none",
  },

  /* ================= NAVBAR ================= */

  navbar: {
    position: "relative",
    zIndex: 5,
    height: "80px",
    padding: "0 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom:
      "1px solid rgba(255,255,255,0.06)",
    background:
      "rgba(5,8,22,0.45)",
    backdropFilter: "blur(20px)",
    boxSizing: "border-box",
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "900",
    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",
    boxShadow:
      "0 8px 30px rgba(99,102,241,0.35)",
  },

  logoTitle: {
    fontSize: "15px",
    fontWeight: "800",
  },

  logoSubtitle: {
    fontSize: "10px",
    color: "#64748b",
    marginTop: "2px",
  },

  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  loginButton: {
    border: "1px solid rgba(255,255,255,0.12)",
    background:
      "rgba(255,255,255,0.06)",
    color: "#fff",
    padding: "10px 17px",
    borderRadius: "10px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  dashboardButton: {
    border: "none",
    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
    padding: "10px 17px",
    borderRadius: "10px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
  },

  logoutButton: {
    border:
      "1px solid rgba(239,68,68,0.25)",
    background:
      "rgba(239,68,68,0.08)",
    color: "#f87171",
    padding: "10px 15px",
    borderRadius: "10px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "600",
  },

  /* ================= MAIN ================= */

  main: {
    position: "relative",
    zIndex: 2,
    width: "90%",
    maxWidth: "1250px",
    margin: "0 auto",
  },

  /* ================= HERO ================= */

  hero: {
    minHeight: "650px",
    display: "grid",
    gridTemplateColumns:
      "1fr 0.9fr",
    alignItems: "center",
    gap: "70px",
    padding: "60px 0",
  },

  heroContent: {
    maxWidth: "620px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 13px",
    borderRadius: "30px",
    background:
      "rgba(99,102,241,0.10)",
    border:
      "1px solid rgba(99,102,241,0.20)",
    color: "#a5b4fc",
    fontSize: "11px",
    fontWeight: "700",
    marginBottom: "22px",
  },

  badgeDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#818cf8",
    boxShadow:
      "0 0 10px rgba(129,140,248,0.8)",
  },

  heroTitle: {
    margin: 0,
    fontSize: "54px",
    lineHeight: "1.25",
    fontWeight: "900",
    letterSpacing: "-1.5px",
  },

  gradientText: {
    background:
      "linear-gradient(90deg,#818cf8,#38bdf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  heroDescription: {
    maxWidth: "580px",
    color: "#94a3b8",
    fontSize: "15px",
    lineHeight: "2",
    marginTop: "22px",
  },

  heroButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "30px",
    flexWrap: "wrap",
  },

  primaryHeroButton: {
    border: "none",
    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
    padding: "14px 22px",
    borderRadius: "12px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "800",
    boxShadow:
      "0 12px 30px rgba(99,102,241,0.30)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  arrow: {
    fontSize: "18px",
  },

  secondaryHeroButton: {
    border:
      "1px solid rgba(255,255,255,0.10)",
    background:
      "rgba(255,255,255,0.04)",
    color: "#cbd5e1",
    padding: "14px 22px",
    borderRadius: "12px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
  },

  /* ================= FEATURES ================= */

  features: {
    display: "flex",
    gap: "28px",
    marginTop: "40px",
    flexWrap: "wrap",
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  featureIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(255,255,255,0.06)",
    border:
      "1px solid rgba(255,255,255,0.07)",
  },

  featureTitle: {
    display: "block",
    fontSize: "11px",
    color: "#e2e8f0",
  },

  featureText: {
    display: "block",
    fontSize: "9px",
    color: "#64748b",
    marginTop: "2px",
  },

  /* ================= VISUAL ================= */

  heroVisual: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "500px",
  },

  glowCircle: {
    position: "absolute",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background:
      "rgba(99,102,241,0.18)",
    filter: "blur(80px)",
  },

  dashboardCard: {
    position: "relative",
    zIndex: 2,
    width: "410px",
    padding: "22px",
    borderRadius: "22px",
    background:
      "linear-gradient(145deg,rgba(30,41,59,0.92),rgba(15,23,42,0.92))",
    border:
      "1px solid rgba(255,255,255,0.10)",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.45)",
    backdropFilter: "blur(25px)",
    transform: "perspective(1000px) rotateY(-5deg) rotateX(2deg)",
  },

  dashboardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "22px",
  },

  dashboardSmallTitle: {
    color: "#64748b",
    fontSize: "10px",
  },

  dashboardTitle: {
    fontSize: "20px",
    fontWeight: "800",
    marginTop: "4px",
  },

  dashboardIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",
    fontSize: "11px",
    fontWeight: "900",
  },

  miniStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "12px",
  },

  miniStat: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px",
    borderRadius: "12px",
    background:
      "rgba(255,255,255,0.035)",
    border:
      "1px solid rgba(255,255,255,0.05)",
  },

  miniIconBlue: {
    width: "35px",
    height: "35px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(59,130,246,0.12)",
  },

  miniIconGreen: {
    width: "35px",
    height: "35px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(34,197,94,0.12)",
    color: "#4ade80",
  },

  miniLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "9px",
  },

  miniNumber: {
    display: "block",
    fontSize: "17px",
    marginTop: "2px",
  },

  chartCard: {
    padding: "15px",
    borderRadius: "13px",
    background:
      "rgba(255,255,255,0.035)",
    border:
      "1px solid rgba(255,255,255,0.05)",
  },

  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#94a3b8",
    fontSize: "10px",
  },

  chartPercentage: {
    color: "#4ade80",
    fontWeight: "700",
  },

  chart: {
    height: "120px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: "8px",
    marginTop: "15px",
  },

  bar: {
    width: "28px",
    borderRadius: "6px 6px 3px 3px",
    background:
      "linear-gradient(to top,#6366f1,#38bdf8)",
    opacity: 0.85,
  },

  leaveSummary: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "12px",
    padding: "12px",
    borderRadius: "12px",
    background:
      "rgba(255,255,255,0.035)",
  },

  leaveIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(234,179,8,0.10)",
  },

  leaveText: {
    flex: 1,
  },

  leaveTextStrong: {
    display: "block",
  },

  leaveCount: {
    fontSize: "18px",
    fontWeight: "900",
    color: "#facc15",
  },

  floatingCard: {
    position: "absolute",
    zIndex: 3,
    left: "-5px",
    bottom: "45px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 15px",
    borderRadius: "13px",
    background:
      "rgba(15,23,42,0.92)",
    border:
      "1px solid rgba(255,255,255,0.09)",
    boxShadow:
      "0 15px 40px rgba(0,0,0,0.35)",
  },

  checkCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background:
      "rgba(34,197,94,0.15)",
    color: "#4ade80",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
  },

  floatingTitle: {
    display: "block",
    fontSize: "11px",
  },

  floatingText: {
    display: "block",
    color: "#64748b",
    fontSize: "8px",
    marginTop: "2px",
  },

  /* ================= BOTTOM ================= */

  bottomSection: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4,1fr)",
    gap: "12px",
    paddingBottom: "40px",
  },

  bottomCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    borderRadius: "14px",
    background:
      "rgba(15,23,42,0.65)",
    border:
      "1px solid rgba(255,255,255,0.06)",
    transition: "0.2s",
  },

  bottomIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background:
      "rgba(99,102,241,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomCardStrong: {
    display: "block",
  },

  footer: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    padding: "18px",
    color: "#475569",
    fontSize: "10px",
    borderTop:
      "1px solid rgba(255,255,255,0.05)",
  },
};

/* =========================================================
   RESPONSIVE
========================================================= */

if (typeof document !== "undefined") {
  const styleId = "home-responsive-styles";

  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");

    style.id = styleId;

    style.innerHTML = `
      button {
        transition: all 0.2s ease;
      }

      button:hover {
        transform: translateY(-2px);
        opacity: 0.95;
      }

      @media (max-width: 1000px) {

        .home-page {
          width: 95%;
        }

      }

      @media (max-width: 850px) {

        body {
          overflow-x: hidden;
        }

        .home-hero {
          grid-template-columns: 1fr;
        }

      }

      @media (max-width: 700px) {

        .home-navbar {
          padding: 0 20px;
        }

        .home-main {
          width: 92%;
        }

        .home-hero {
          display: flex;
          flex-direction: column;
          padding-top: 35px;
          gap: 30px;
        }

        .home-title {
          font-size: 38px;
        }

        .home-dashboard {
          width: 100%;
          max-width: 390px;
        }

        .home-features {
          gap: 15px;
        }

        .home-bottom {
          grid-template-columns: 1fr 1fr;
        }

      }

      @media (max-width: 500px) {

        .home-title {
          font-size: 32px;
        }

        .home-description {
          font-size: 13px;
        }

        .home-dashboard {
          transform: none;
        }

        .home-bottom {
          grid-template-columns: 1fr;
        }

        .home-nav-actions button {
          padding: 8px 10px;
          font-size: 11px;
        }

      }
    `;

    document.head.appendChild(style);
  }
}