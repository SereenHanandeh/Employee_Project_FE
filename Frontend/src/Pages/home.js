
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
    <div className="home-page" style={styles.page}>
      {/* ================= BACKGROUND ================= */}

      <div
        className="home-glow home-glow-one"
        style={styles.backgroundGlow1}
      />

      <div
        className="home-glow home-glow-two"
        style={styles.backgroundGlow2}
      />

      {/* ================= NAVBAR ================= */}

      <header
        className="home-navbar"
        style={styles.navbar}
      >
        <div style={styles.logoArea}>
          <div
            className="home-logo"
            style={styles.logo}
          >
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

        <div
          className="home-nav-actions"
          style={styles.navActions}
        >
          {isLoggedIn ? (
            <>
              <button
                className="nav-dashboard-btn"
                style={styles.dashboardButton}
                onClick={() =>
                  nav("/admin-dashboard")
                }
              >
                <span>▦</span>
                لوحة التحكم
              </button>

              <button
                className="nav-logout-btn"
                style={styles.logoutButton}
                onClick={handleLogout}
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
            <button
              className="nav-login-btn"
              style={styles.loginButton}
              onClick={() => nav("/login")}
            >
              تسجيل الدخول
              <span>←</span>
            </button>
          )}
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main
        className="home-main"
        style={styles.main}
      >
        {/* ================= HERO ================= */}

        <section
          className="home-hero"
          style={styles.hero}
        >
          {/* TEXT */}

          <div
            className="home-hero-content"
            style={styles.heroContent}
          >
            <div
              className="home-badge"
              style={styles.badge}
            >
              <span style={styles.badgeDot} />

              نظام إدارة الموارد البشرية
            </div>

            <h1
              className="home-title"
              style={styles.heroTitle}
            >
              إدارة موظفيك
              <br />

              <span style={styles.gradientText}>
                بطريقة أذكى وأسهل
              </span>
            </h1>

            <p
              className="home-description"
              style={styles.heroDescription}
            >
              منصة متكاملة تساعدك على إدارة الموظفين،
              متابعة الأداء، تنظيم الإجازات والمهام،
              وإجراء التقييمات بكل سهولة واحترافية.
            </p>

            {/* BUTTONS */}

            <div
              className="home-hero-buttons"
              style={styles.heroButtons}
            >
              {isLoggedIn ? (
                <button
                  className="hero-primary-btn"
                  style={styles.primaryHeroButton}
                  onClick={() =>
                    nav("/admin-dashboard")
                  }
                >
                  <span>الدخول إلى لوحة التحكم</span>

                  <span style={styles.arrow}>
                    ←
                  </span>
                </button>
              ) : (
                <button
                  className="hero-primary-btn"
                  style={styles.primaryHeroButton}
                  onClick={() => nav("/login")}
                >
                  <span>ابدأ الآن</span>

                  <span style={styles.arrow}>
                    ←
                  </span>
                </button>
              )}
            </div>

            {/* FEATURES */}

            <div
              className="home-features"
              style={styles.features}
            >
              <div
                className="home-feature"
                style={styles.feature}
              >
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

              <div
                className="home-feature"
                style={styles.feature}
              >
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

              <div
                className="home-feature"
                style={styles.feature}
              >
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

          {/* ================= VISUAL ================= */}

          <div
            className="home-visual"
            style={styles.heroVisual}
          >
            <div
              className="home-glow-circle"
              style={styles.glowCircle}
            />

            {/* Dashboard */}

            <div
              className="home-dashboard"
              style={styles.dashboardCard}
            >
              {/* Header */}

              <div style={styles.dashboardHeader}>
                <div>
                  <div
                    style={styles.dashboardSmallTitle}
                  >
                    لوحة الإدارة
                  </div>

                  <div
                    style={styles.dashboardTitle}
                  >
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
                  <div
                    style={{
                      ...styles.miniIconBlue,
                      background:
                        "linear-gradient(135deg,#eff6ff,#dbeafe)",
                    }}
                  >
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
                  <div
                    style={{
                      ...styles.miniIconGreen,
                      background:
                        "linear-gradient(135deg,#ecfdf5,#d1fae5)",
                    }}
                  >
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

                  <span
                    style={styles.chartPercentage}
                  >
                    +18.5%
                  </span>
                </div>

                <div style={styles.chart}>
                  <div
                    style={{
                      ...styles.bar,
                      height: "35%",
                    }}
                  />

                  <div
                    style={{
                      ...styles.bar,
                      height: "55%",
                    }}
                  />

                  <div
                    style={{
                      ...styles.bar,
                      height: "45%",
                    }}
                  />

                  <div
                    style={{
                      ...styles.bar,
                      height: "70%",
                    }}
                  />

                  <div
                    style={{
                      ...styles.bar,
                      height: "62%",
                    }}
                  />

                  <div
                    style={{
                      ...styles.bar,
                      height: "88%",
                    }}
                  />

                  <div
                    style={{
                      ...styles.bar,
                      height: "78%",
                    }}
                  />
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

            <div
              className="home-floating-card"
              style={styles.floatingCard}
            >
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

        {/* ================= BOTTOM ================= */}

        <section
          className="home-bottom"
          style={styles.bottomSection}
        >
          <div
            className="home-bottom-card"
            style={styles.bottomCard}
          >
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

          <div
            className="home-bottom-card"
            style={styles.bottomCard}
          >
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

          <div
            className="home-bottom-card"
            style={styles.bottomCard}
          >
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

          <div
            className="home-bottom-card"
            style={styles.bottomCard}
          >
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
   LIGHT THEME
========================================================= */

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background:
      "linear-gradient(135deg,#f8fbff 0%,#f5f8ff 45%,#eef4ff 100%)",
    color: "#172033",
    fontFamily:
      "Cairo, Tahoma, Arial, sans-serif",
    direction: "rtl",
    position: "relative",
    overflow: "hidden",
  },

  /* ================= BACKGROUND ================= */

  backgroundGlow1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "rgba(99,102,241,0.09)",
    filter: "blur(100px)",
    top: "-200px",
    left: "-150px",
    pointerEvents: "none",
  },

  backgroundGlow2: {
    position: "absolute",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background:
      "rgba(59,130,246,0.08)",
    filter: "blur(100px)",
    bottom: "-200px",
    right: "-150px",
    pointerEvents: "none",
  },

  /* ================= NAVBAR ================= */

  navbar: {
    position: "relative",
    zIndex: 5,
    height: "82px",
    padding: "0 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom:
      "1px solid rgba(148,163,184,0.16)",
    background:
      "rgba(255,255,255,0.82)",
    backdropFilter: "blur(20px)",
    boxSizing: "border-box",
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "900",
    color: "#ffffff",
    background:
      "linear-gradient(135deg,#4f46e5,#3b82f6)",
    boxShadow:
      "0 10px 25px rgba(79,70,229,0.22)",
  },

  logoTitle: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#172033",
  },

  logoSubtitle: {
    fontSize: "10px",
    color: "#7c8799",
    marginTop: "2px",
  },

  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  loginButton: {
    border:
      "1px solid #dbe3f0",
    background: "#ffffff",
    color: "#334155",
    padding: "10px 17px",
    borderRadius: "11px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow:
      "0 4px 14px rgba(15,23,42,0.05)",
  },

  dashboardButton: {
    border: "none",
    background:
      "linear-gradient(135deg,#4f46e5,#3b82f6)",
    color: "#ffffff",
    padding: "10px 17px",
    borderRadius: "11px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    boxShadow:
      "0 8px 20px rgba(59,130,246,0.20)",
  },

  logoutButton: {
    border:
      "1px solid #fecaca",
    background: "#fff7f7",
    color: "#dc2626",
    padding: "10px 15px",
    borderRadius: "11px",
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
    padding: "55px 0 45px",
  },

  heroContent: {
    maxWidth: "620px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 14px",
    borderRadius: "30px",
    background:
      "linear-gradient(135deg,#eef2ff,#eff6ff)",
    border:
      "1px solid #dbe4ff",
    color: "#4f46e5",
    fontSize: "11px",
    fontWeight: "800",
    marginBottom: "22px",
  },

  badgeDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#4f46e5",
    boxShadow:
      "0 0 0 4px rgba(79,70,229,0.10)",
  },

  heroTitle: {
    margin: 0,
    fontSize: "54px",
    lineHeight: "1.25",
    fontWeight: "900",
    letterSpacing: "-1.5px",
    color: "#172033",
  },

  gradientText: {
    background:
      "linear-gradient(90deg,#4f46e5,#2563eb,#0284c7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  heroDescription: {
    maxWidth: "580px",
    color: "#64748b",
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
      "linear-gradient(135deg,#4f46e5,#3b82f6)",
    color: "#ffffff",
    padding: "14px 23px",
    borderRadius: "12px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "800",
    boxShadow:
      "0 12px 28px rgba(59,130,246,0.22)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  arrow: {
    fontSize: "18px",
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
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 5px 15px rgba(15,23,42,0.05)",
  },

  featureTitle: {
    display: "block",
    fontSize: "11px",
    color: "#334155",
  },

  featureText: {
    display: "block",
    fontSize: "9px",
    color: "#94a3b8",
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
    width: "370px",
    height: "370px",
    borderRadius: "50%",
    background:
      "rgba(99,102,241,0.11)",
    filter: "blur(75px)",
  },

  dashboardCard: {
    position: "relative",
    zIndex: 2,
    width: "410px",
    padding: "23px",
    borderRadius: "23px",
    background:
      "rgba(255,255,255,0.96)",
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 30px 70px rgba(30,64,175,0.13)",
    backdropFilter: "blur(20px)",
    transform:
      "perspective(1000px) rotateY(-5deg) rotateX(2deg)",
  },

  dashboardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "22px",
  },

  dashboardSmallTitle: {
    color: "#94a3b8",
    fontSize: "10px",
  },

  dashboardTitle: {
    fontSize: "20px",
    fontWeight: "800",
    marginTop: "4px",
    color: "#172033",
  },

  dashboardIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg,#4f46e5,#3b82f6)",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "900",
    boxShadow:
      "0 8px 20px rgba(59,130,246,0.20)",
  },

  /* ================= MINI STATS ================= */

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
    borderRadius: "13px",
    background: "#f8fafc",
    border:
      "1px solid #edf1f7",
  },

  miniIconBlue: {
    width: "35px",
    height: "35px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  miniIconGreen: {
    width: "35px",
    height: "35px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#16a34a",
  },

  miniLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "9px",
  },

  miniNumber: {
    display: "block",
    fontSize: "17px",
    marginTop: "2px",
    color: "#1e293b",
  },

  /* ================= CHART ================= */

  chartCard: {
    padding: "15px",
    borderRadius: "14px",
    background: "#f8fafc",
    border:
      "1px solid #edf1f7",
  },

  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#64748b",
    fontSize: "10px",
  },

  chartPercentage: {
    color: "#16a34a",
    fontWeight: "800",
  },

  chart: {
    height: "120px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: "8px",
    marginTop: "15px",
    padding:
      "0 8px",
  },

  bar: {
    width: "28px",
    borderRadius: "7px 7px 3px 3px",
    background:
      "linear-gradient(to top,#6366f1,#60a5fa)",
    opacity: 0.9,
  },

  /* ================= LEAVE ================= */

  leaveSummary: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "12px",
    padding: "12px",
    borderRadius: "13px",
    background: "#fffbeb",
    border:
      "1px solid #fef3c7",
  },

  leaveIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fef3c7",
  },

  leaveText: {
    flex: 1,
  },

  leaveCount: {
    fontSize: "18px",
    fontWeight: "900",
    color: "#d97706",
  },

  /* ================= FLOATING CARD ================= */

  floatingCard: {
    position: "absolute",
    zIndex: 3,
    left: "-8px",
    bottom: "42px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 15px",
    borderRadius: "14px",
    background: "#ffffff",
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 15px 35px rgba(15,23,42,0.12)",
  },

  checkCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
  },

  floatingTitle: {
    display: "block",
    fontSize: "11px",
    color: "#1e293b",
  },

  floatingText: {
    display: "block",
    color: "#94a3b8",
    fontSize: "8px",
    marginTop: "2px",
  },

  /* ================= BOTTOM ================= */

  bottomSection: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4,1fr)",
    gap: "14px",
    paddingBottom: "40px",
  },

  bottomCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "17px",
    borderRadius: "15px",
    background: "#ffffff",
    border:
      "1px solid #e5eaf2",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.045)",
    transition:
      "all 0.25s ease",
  },

  bottomIcon: {
    width: "41px",
    height: "41px",
    borderRadius: "11px",
    background:
      "linear-gradient(135deg,#eef2ff,#eff6ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ================= FOOTER ================= */

  footer: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    padding: "18px",
    color: "#94a3b8",
    fontSize: "10px",
    borderTop:
      "1px solid #e5eaf2",
    background:
      "rgba(255,255,255,0.55)",
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
      * {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        margin: 0;
        background: #f8fbff;
      }

      button {
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease,
          background 0.2s ease,
          border-color 0.2s ease;
      }

      button:hover {
        transform: translateY(-2px);
      }

      .nav-login-btn:hover {
        border-color: #bfdbfe !important;
        box-shadow:
          0 8px 22px rgba(59,130,246,0.10) !important;
      }

      .nav-dashboard-btn:hover,
      .hero-primary-btn:hover {
        box-shadow:
          0 14px 30px rgba(59,130,246,0.28) !important;
      }

      .nav-logout-btn:hover {
        background: #fef2f2 !important;
        border-color: #fca5a5 !important;
      }

      .home-bottom-card:hover {
        transform: translateY(-4px);
        box-shadow:
          0 15px 35px rgba(15,23,42,0.09) !important;
        border-color: #dbe4f0 !important;
      }

      .home-feature {
        transition: transform 0.2s ease;
      }

      .home-feature:hover {
        transform: translateY(-2px);
      }

      .home-floating-card {
        animation:
          floatingCard 4s ease-in-out infinite;
      }

      .home-dashboard {
        animation:
          dashboardFloat 5s ease-in-out infinite;
      }

      @keyframes floatingCard {
        0%, 100% {
          transform: translateY(0);
        }

        50% {
          transform: translateY(-8px);
        }
      }

      @keyframes dashboardFloat {
        0%, 100% {
          transform:
            perspective(1000px)
            rotateY(-5deg)
            rotateX(2deg)
            translateY(0);
        }

        50% {
          transform:
            perspective(1000px)
            rotateY(-5deg)
            rotateX(2deg)
            translateY(-6px);
        }
      }

      @media (max-width: 1000px) {
        .home-main {
          width: 92% !important;
        }

        .home-hero {
          gap: 35px !important;
        }

        .home-title {
          font-size: 46px !important;
        }

        .home-dashboard {
          width: 390px !important;
        }
      }

      @media (max-width: 850px) {
        body {
          overflow-x: hidden;
        }

        .home-hero {
          grid-template-columns: 1fr !important;
          padding-top: 45px !important;
        }

        .home-hero-content {
          max-width: 700px !important;
          text-align: center;
          margin: 0 auto;
        }

        .home-badge {
          margin-left: auto;
          margin-right: auto;
        }

        .home-description {
          margin-left: auto !important;
          margin-right: auto !important;
        }

        .home-hero-buttons {
          justify-content: center;
        }

        .home-features {
          justify-content: center;
        }

        .home-visual {
          min-height: 480px !important;
        }

        .home-bottom {
          grid-template-columns:
            repeat(2,1fr) !important;
        }
      }

      @media (max-width: 700px) {
        .home-navbar {
          height: 72px !important;
          padding: 0 20px !important;
        }

        .home-main {
          width: 92% !important;
        }

        .logo-title {
          font-size: 13px;
        }

        .home-logo {
          width: 42px !important;
          height: 42px !important;
        }

        .home-nav-actions button {
          padding: 8px 10px !important;
          font-size: 10px !important;
        }

        .home-title {
          font-size: 38px !important;
          letter-spacing: -1px !important;
        }

        .home-description {
          font-size: 13px !important;
          line-height: 1.9 !important;
        }

        .home-hero {
          padding-top: 35px !important;
          gap: 15px !important;
        }

        .home-features {
          gap: 18px !important;
        }

        .home-dashboard {
          width: 100% !important;
          max-width: 390px !important;
        }

        .home-floating-card {
          left: 0 !important;
          bottom: 30px !important;
        }

        .home-bottom {
          grid-template-columns:
            1fr 1fr !important;
        }
      }

      @media (max-width: 500px) {
        .home-navbar {
          padding: 0 14px !important;
        }

        .logoSubtitle {
          display: none;
        }

        .home-nav-actions {
          gap: 6px !important;
        }

        .home-title {
          font-size: 32px !important;
        }

        .home-description {
          font-size: 12px !important;
        }

        .home-hero-buttons {
          width: 100%;
        }

        .hero-primary-btn {
          width: 100%;
          justify-content: center;
        }

        .home-features {
          display: grid !important;
          grid-template-columns: 1fr !important;
          justify-items: start;
          width: fit-content;
          margin-left: auto !important;
          margin-right: auto !important;
        }

        .home-visual {
          min-height: 430px !important;
        }

        .home-dashboard {
          width: 100% !important;
          padding: 17px !important;
          border-radius: 18px !important;
          transform: none !important;
        }

        .home-dashboard:hover {
          transform: none !important;
        }

        .home-floating-card {
          position: relative !important;
          left: auto !important;
          bottom: auto !important;
          margin-top: -25px;
          align-self: flex-start;
          margin-left: auto;
          margin-right: auto;
        }

        .home-bottom {
          grid-template-columns: 1fr !important;
        }

        .miniStats {
          gap: 7px;
        }
      }
    `;

    document.head.appendChild(style);
  }
}