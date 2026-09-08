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
      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div
        className="home-glow home-glow-one"
        style={styles.backgroundGlow1}
      />

      <div
        className="home-glow home-glow-two"
        style={styles.backgroundGlow2}
      />

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="home-navbar" style={styles.navbar}>
        <div style={styles.logoArea}>
          <div className="home-logo" style={styles.logo}>
            HR
          </div>

          <div>
            <div style={styles.logoTitle}>إدارة الموظفين</div>

            <div style={styles.logoSubtitle}>نظام الموارد البشرية</div>
          </div>
        </div>

        <div className="home-nav-actions" style={styles.navActions}>
          {isLoggedIn ? (
            <>
              <button
                className="nav-dashboard-btn"
                style={styles.dashboardButton}
                onClick={() => nav("/admin-dashboard")}
              >
                <span style={styles.dashboardButtonIcon}>▦</span>
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
              <span style={styles.loginArrow}>←</span>
            </button>
          )}
        </div>
      </header>

      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="home-main" style={styles.main}>
        {/* =======================================================
            HERO
        ======================================================= */}

        <section className="home-hero" style={styles.hero}>
          {/* =====================================================
              TEXT CONTENT
          ===================================================== */}

          <div className="home-hero-content" style={styles.heroContent}>
            <div className="home-badge" style={styles.badge}>
              <span style={styles.badgeDot} />
              نظام إدارة الموارد البشرية
            </div>

            <h1 className="home-title" style={styles.heroTitle}>
              Blackboard
              <br />
              <span style={styles.gradientText}>قسم البلاك بورد</span>
            </h1>

            <p className="home-description" style={styles.heroDescription}>
              منصة متكاملة تساعدك على إدارة الموظفين، متابعة الأداء، تنظيم
              الإجازات والمهام، وإجراء التقييمات بكل سهولة واحترافية.
            </p>

            {/* BUTTON */}

            <div className="home-hero-buttons" style={styles.heroButtons}>
              {isLoggedIn ? (
                <button
                  className="hero-primary-btn"
                  style={styles.primaryHeroButton}
                  onClick={() => nav("/admin-dashboard")}
                >
                  <span>الدخول إلى لوحة التحكم</span>

                  <span style={styles.arrow}>←</span>
                </button>
              ) : (
                <button
                  className="hero-primary-btn"
                  style={styles.primaryHeroButton}
                  onClick={() => nav("/login")}
                >
                  <span>ابدأ الآن</span>

                  <span style={styles.arrow}>←</span>
                </button>
              )}
            </div>

            {/* ===================================================
                FEATURES
            =================================================== */}

            <div className="home-features" style={styles.features}>
              <div className="home-feature" style={styles.feature}>
                <div style={styles.featureIcon}>
                  <span>👨‍💼</span>
                </div>

                <div>
                  <strong style={styles.featureTitle}>الموظفين</strong>

                  <span style={styles.featureText}>
                    إدارة بيانات الموظفين
                  </span>
                </div>
              </div>

              <div className="home-feature" style={styles.feature}>
                <div style={styles.featureIcon}>
                  <span>📅</span>
                </div>

                <div>
                  <strong style={styles.featureTitle}>الإجازات</strong>

                  <span style={styles.featureText}>
                    متابعة طلبات الإجازات
                  </span>
                </div>
              </div>

              <div className="home-feature" style={styles.feature}>
                <div style={styles.featureIcon}>
                  <span>📊</span>
                </div>

                <div>
                  <strong style={styles.featureTitle}>التقييم</strong>

                  <span style={styles.featureText}>
                    متابعة أداء الموظفين
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              SIMPLE HR VISUAL
          ===================================================== */}

          <div className="home-visual" style={styles.heroVisual}>
            {/* Background circle */}

            <div
              className="home-visual-circle"
              style={styles.visualCircle}
            />

            {/* Main Illustration */}

            <div className="home-hr-illustration" style={styles.hrIllustration}>
              {/* Decorative small dots */}

              <div
                className="visual-dot visual-dot-one"
                style={styles.visualDotOne}
              />

              <div
                className="visual-dot visual-dot-two"
                style={styles.visualDotTwo}
              />

              <div
                className="visual-dot visual-dot-three"
                style={styles.visualDotThree}
              />

              {/* Main person */}

              <div className="main-person" style={styles.mainPerson}>
                <div style={styles.personHead} />

                <div style={styles.personBody}>
                  <div style={styles.personBadge}>HR</div>
                </div>
              </div>

              {/* Left small person */}

              <div className="small-person small-person-left" style={styles.smallPersonLeft}>
                <div style={styles.smallPersonHead} />

                <div style={styles.smallPersonBody} />
              </div>

              {/* Right small person */}

              <div
                className="small-person small-person-right"
                style={styles.smallPersonRight}
              >
                <div style={styles.smallPersonHead} />

                <div style={styles.smallPersonBody} />
              </div>

              {/* Main HR card */}

              <div
                className="hr-info-card"
                style={styles.hrInfoCard}
              >
                <div style={styles.hrInfoIcon}>✓</div>

                <div>
                  <strong style={styles.hrInfoTitle}>
                    إدارة الموارد البشرية
                  </strong>

                  <span style={styles.hrInfoText}>
                    تنظيم ومتابعة الموظفين
                  </span>
                </div>
              </div>

              {/* Small floating card */}

              <div
                className="hr-small-card"
                style={styles.hrSmallCard}
              >
                <span style={styles.hrSmallIcon}>👥</span>

                <div>
                  <strong style={styles.hrSmallNumber}>128</strong>

                  <span style={styles.hrSmallText}>موظف</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            BOTTOM FEATURES
        ========================================================= */}

        <section className="home-bottom" style={styles.bottomSection}>
          <div className="home-bottom-card" style={styles.bottomCard}>
            <span style={styles.bottomIcon}>👥</span>

            <div>
              <strong style={styles.bottomTitle}>
                إدارة الموظفين
              </strong>

              <span style={styles.bottomText}>
                بيانات منظمة وسهلة الوصول
              </span>
            </div>
          </div>

          <div className="home-bottom-card" style={styles.bottomCard}>
            <span style={styles.bottomIcon}>📅</span>

            <div>
              <strong style={styles.bottomTitle}>
                تنظيم الإجازات
              </strong>

              <span style={styles.bottomText}>
                قبول ورفض ومتابعة الطلبات
              </span>
            </div>
          </div>

          <div className="home-bottom-card" style={styles.bottomCard}>
            <span style={styles.bottomIcon}>✓</span>

            <div>
              <strong style={styles.bottomTitle}>
                إدارة المهام
              </strong>

              <span style={styles.bottomText}>
                توزيع ومتابعة مهام الموظفين
              </span>
            </div>
          </div>

          <div className="home-bottom-card" style={styles.bottomCard}>
            <span style={styles.bottomIcon}>📈</span>

            <div>
              <strong style={styles.bottomTitle}>
                تقييم الأداء
              </strong>

              <span style={styles.bottomText}>
                تقارير ومتابعة الأداء
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer style={styles.footer}>
        © 2026 نظام إدارة الموظفين — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}

/* ===============================================================
   STYLES
================================================================ */

const styles = {
  /* =============================================================
     PAGE
  ============================================================= */

  page: {
    minHeight: "100vh",
    width: "100%",
    background:
      "linear-gradient(135deg,#f8fbff 0%,#f5f8ff 45%,#eef4ff 100%)",
    color: "#172033",
    fontFamily: "Cairo, Tahoma, Arial, sans-serif",
    direction: "rtl",
    position: "relative",
    overflow: "hidden",
  },

  /* =============================================================
     BACKGROUND
  ============================================================= */

  backgroundGlow1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "rgba(99,102,241,0.09)",
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
    background: "rgba(59,130,246,0.08)",
    filter: "blur(100px)",
    bottom: "-200px",
    right: "-150px",
    pointerEvents: "none",
  },

  /* =============================================================
     NAVBAR
  ============================================================= */

  navbar: {
    position: "relative",
    zIndex: 5,
    height: "82px",
    padding: "0 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(148,163,184,0.16)",
    background: "rgba(255,255,255,0.82)",
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
    background: "linear-gradient(135deg,#4f46e5,#3b82f6)",
    boxShadow: "0 10px 25px rgba(79,70,229,0.22)",
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
    border: "1px solid #dbe3f0",
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
    boxShadow: "0 4px 14px rgba(15,23,42,0.05)",
  },

  loginArrow: {
    fontSize: "17px",
  },

  dashboardButton: {
    border: "none",
    background: "linear-gradient(135deg,#4f46e5,#3b82f6)",
    color: "#ffffff",
    padding: "10px 17px",
    borderRadius: "11px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    boxShadow: "0 8px 20px rgba(59,130,246,0.20)",
  },

  dashboardButtonIcon: {
    fontSize: "15px",
  },

  logoutButton: {
    border: "1px solid #fecaca",
    background: "#fff7f7",
    color: "#dc2626",
    padding: "10px 15px",
    borderRadius: "11px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "600",
  },

  /* =============================================================
     MAIN
  ============================================================= */

  main: {
    position: "relative",
    zIndex: 2,
    width: "90%",
    maxWidth: "1250px",
    margin: "0 auto",
  },

  /* =============================================================
     HERO
  ============================================================= */

  hero: {
    minHeight: "650px",
    display: "grid",
    gridTemplateColumns: "1fr 0.9fr",
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
    background: "linear-gradient(135deg,#eef2ff,#eff6ff)",
    border: "1px solid #dbe4ff",
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
    boxShadow: "0 0 0 4px rgba(79,70,229,0.10)",
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
    background: "linear-gradient(90deg,#4f46e5,#2563eb,#0284c7)",
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
    background: "linear-gradient(135deg,#4f46e5,#3b82f6)",
    color: "#ffffff",
    padding: "14px 23px",
    borderRadius: "12px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "800",
    boxShadow: "0 12px 28px rgba(59,130,246,0.22)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  arrow: {
    fontSize: "18px",
  },

  /* =============================================================
     FEATURES
  ============================================================= */

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
    border: "1px solid #e2e8f0",
    boxShadow: "0 5px 15px rgba(15,23,42,0.05)",
    fontSize: "17px",
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

  /* =============================================================
     VISUAL AREA
  ============================================================= */

  heroVisual: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "500px",
  },

  visualCircle: {
    position: "absolute",
    width: "390px",
    height: "390px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle,rgba(99,102,241,0.13) 0%,rgba(59,130,246,0.06) 45%,rgba(255,255,255,0) 72%)",
  },

  /* =============================================================
     HR ILLUSTRATION
  ============================================================= */

  hrIllustration: {
    position: "relative",
    width: "430px",
    height: "430px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  /* =============================================================
     MAIN PERSON
  ============================================================= */

  mainPerson: {
    position: "relative",
    zIndex: 3,
    width: "180px",
    height: "250px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  personHead: {
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
    border: "7px solid rgba(255,255,255,0.9)",
    boxShadow: "0 15px 35px rgba(79,70,229,0.12)",
    position: "relative",
    zIndex: 2,
  },

  personBody: {
    width: "145px",
    height: "145px",
    marginTop: "-12px",
    borderRadius: "70px 70px 25px 25px",
    background:
      "linear-gradient(145deg,#4f46e5,#3b82f6)",
    boxShadow: "0 22px 40px rgba(59,130,246,0.20)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  personBadge: {
    width: "54px",
    height: "54px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.28)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "900",
    backdropFilter: "blur(10px)",
  },

  /* =============================================================
     SMALL PERSON LEFT
  ============================================================= */

  smallPersonLeft: {
    position: "absolute",
    zIndex: 2,
    left: "48px",
    top: "126px",
    width: "95px",
    height: "155px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  smallPersonHead: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#e2e8f0",
    border: "5px solid #ffffff",
    boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
  },

  smallPersonBody: {
    width: "82px",
    height: "88px",
    marginTop: "-5px",
    borderRadius: "40px 40px 16px 16px",
    background:
      "linear-gradient(145deg,#dbeafe,#bfdbfe)",
    boxShadow: "0 12px 25px rgba(59,130,246,0.10)",
  },

  /* =============================================================
     SMALL PERSON RIGHT
  ============================================================= */

  smallPersonRight: {
    position: "absolute",
    zIndex: 2,
    right: "48px",
    top: "126px",
    width: "95px",
    height: "155px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  /* =============================================================
     INFO CARD
  ============================================================= */

  hrInfoCard: {
    position: "absolute",
    zIndex: 5,
    right: "10px",
    bottom: "55px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px 16px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.96)",
    border: "1px solid #e2e8f0",
    boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
    backdropFilter: "blur(15px)",
  },

  hrInfoIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "#dcfce7",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "15px",
  },

  hrInfoTitle: {
    display: "block",
    fontSize: "10px",
    color: "#1e293b",
  },

  hrInfoText: {
    display: "block",
    fontSize: "8px",
    color: "#94a3b8",
    marginTop: "3px",
  },

  /* =============================================================
     SMALL FLOATING CARD
  ============================================================= */

  hrSmallCard: {
    position: "absolute",
    zIndex: 5,
    left: "18px",
    top: "75px",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "11px 14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.96)",
    border: "1px solid #e2e8f0",
    boxShadow: "0 15px 35px rgba(15,23,42,0.09)",
  },

  hrSmallIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
  },

  hrSmallNumber: {
    display: "block",
    fontSize: "14px",
    color: "#1e293b",
    lineHeight: "1",
  },

  hrSmallText: {
    display: "block",
    fontSize: "8px",
    color: "#94a3b8",
    marginTop: "3px",
  },

  /* =============================================================
     DECORATIVE DOTS
  ============================================================= */

  visualDotOne: {
    position: "absolute",
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#818cf8",
    top: "80px",
    right: "80px",
    boxShadow: "0 0 0 6px rgba(129,140,248,0.10)",
  },

  visualDotTwo: {
    position: "absolute",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#60a5fa",
    bottom: "95px",
    left: "70px",
    boxShadow: "0 0 0 5px rgba(96,165,250,0.10)",
  },

  visualDotThree: {
    position: "absolute",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#a5b4fc",
    top: "180px",
    right: "30px",
  },

  /* =============================================================
     BOTTOM
  ============================================================= */

  bottomSection: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
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
    border: "1px solid #e5eaf2",
    boxShadow: "0 8px 25px rgba(15,23,42,0.045)",
    transition: "all 0.25s ease",
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
    fontSize: "17px",
  },

  bottomTitle: {
    display: "block",
    fontSize: "11px",
    color: "#334155",
  },

  bottomText: {
    display: "block",
    fontSize: "9px",
    color: "#94a3b8",
    marginTop: "3px",
  },

  /* =============================================================
     FOOTER
  ============================================================= */

  footer: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    padding: "18px",
    color: "#94a3b8",
    fontSize: "10px",
    borderTop: "1px solid #e5eaf2",
    background: "rgba(255,255,255,0.55)",
  },
};

/* ===============================================================
   RESPONSIVE
================================================================ */

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

      /* =====================================================
         NAVBAR HOVER
      ===================================================== */

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

      /* =====================================================
         BOTTOM CARDS
      ===================================================== */

      .home-bottom-card:hover {
        transform: translateY(-4px);
        box-shadow:
          0 15px 35px rgba(15,23,42,0.09) !important;
        border-color: #dbe4f0 !important;
      }

      /* =====================================================
         FEATURES
      ===================================================== */

      .home-feature {
        transition: transform 0.2s ease;
      }

      .home-feature:hover {
        transform: translateY(-2px);
      }

      /* =====================================================
         SIMPLE ILLUSTRATION ANIMATION
      ===================================================== */

      .home-hr-illustration {
        animation:
          hrIllustrationFloat 5s ease-in-out infinite;
      }

      .hr-small-card {
        animation:
          smallCardFloat 4s ease-in-out infinite;
      }

      .hr-info-card {
        animation:
          infoCardFloat 4.5s ease-in-out infinite;
      }

      @keyframes hrIllustrationFloat {
        0%, 100% {
          transform: translateY(0);
        }

        50% {
          transform: translateY(-7px);
        }
      }

      @keyframes smallCardFloat {
        0%, 100% {
          transform: translateY(0);
        }

        50% {
          transform: translateY(-7px);
        }
      }

      @keyframes infoCardFloat {
        0%, 100% {
          transform: translateY(0);
        }

        50% {
          transform: translateY(6px);
        }
      }

      /* =====================================================
         1000px
      ===================================================== */

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

        .home-hr-illustration {
          transform: scale(0.92);
        }
      }

      /* =====================================================
         850px
      ===================================================== */

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
          min-height: 450px !important;
        }

        .home-hr-illustration {
          transform: scale(0.95);
        }

        .home-bottom {
          grid-template-columns:
            repeat(2,1fr) !important;
        }
      }

      /* =====================================================
         700px
      ===================================================== */

      @media (max-width: 700px) {
        .home-navbar {
          height: 72px !important;
          padding: 0 20px !important;
        }

        .home-main {
          width: 92% !important;
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
          gap: 10px !important;
        }

        .home-features {
          gap: 18px !important;
        }

        .home-visual {
          min-height: 430px !important;
        }

        .home-hr-illustration {
          transform: scale(0.82);
        }

        .home-bottom {
          grid-template-columns:
            1fr 1fr !important;
        }
      }

      /* =====================================================
         500px
      ===================================================== */

      @media (max-width: 500px) {
        .home-navbar {
          padding: 0 14px !important;
        }

        .home-nav-actions {
          gap: 6px !important;
        }

        .home-nav-actions button {
          font-size: 9px !important;
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
          min-height: 370px !important;
          overflow: hidden;
        }

        .home-hr-illustration {
          transform: scale(0.67);
        }

        .home-visual-circle {
          width: 300px !important;
          height: 300px !important;
        }

        .home-bottom {
          grid-template-columns: 1fr !important;
        }
      }
    `;

    document.head.appendChild(style);
  }
}