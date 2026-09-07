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
    <div className="hr-home">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />
      <div className="ambient ambient-3" />

      <div className="grid-overlay" />

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="hr-navbar">
        <div className="brand">
          <div className="brand-logo">
            <span>HR</span>
          </div>

          <div className="brand-text">
            <strong>إدارة الموظفين</strong>
            <span>نظام الموارد البشرية</span>
          </div>
        </div>

        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              <button
                className="dashboard-nav-btn"
                onClick={() => nav("/admin-dashboard")}
              >
                <span className="btn-icon">▦</span>
                لوحة التحكم
              </button>

              <button
                className="logout-nav-btn"
                onClick={handleLogout}
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
            <button
              className="login-nav-btn"
              onClick={() => nav("/login")}
            >
              تسجيل الدخول
              <span>←</span>
            </button>
          )}
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <main className="hero-wrapper">
        <section className="hero-section">

          {/* LEFT / TEXT */}

          <div className="hero-content">

            <div className="eyebrow">
              <span className="live-dot" />
              <span>منصة ذكية لإدارة الموارد البشرية</span>
            </div>

            <h1>
              إدارة موظفيك
              <br />

              <span className="gradient-heading">
                بطريقة أذكى وأسهل
              </span>
            </h1>

            <p className="hero-description">
              منصة متكاملة تمنحك كل الأدوات التي تحتاجها
              لإدارة الموظفين، الإجازات، المهام والتقييمات
              من مكان واحد وبطريقة بسيطة واحترافية.
            </p>

            <div className="hero-actions">
              <button
                className="main-cta"
                onClick={() =>
                  nav(
                    isLoggedIn
                      ? "/admin-dashboard"
                      : "/login"
                  )
                }
              >
                <span>
                  {isLoggedIn
                    ? "الدخول إلى لوحة التحكم"
                    : "ابدأ الآن"}
                </span>

                <span className="cta-arrow">
                  ←
                </span>
              </button>

              <div className="secure-badge">
                <span>✓</span>
                نظام آمن وسهل الاستخدام
              </div>
            </div>

            {/* FEATURES */}

            <div className="hero-features">

              <div className="feature-item">
                <div className="feature-icon purple">
                  👥
                </div>

                <div>
                  <strong>الموظفين</strong>
                  <span>إدارة البيانات</span>
                </div>
              </div>

              <div className="feature-divider" />

              <div className="feature-item">
                <div className="feature-icon blue">
                  📅
                </div>

                <div>
                  <strong>الإجازات</strong>
                  <span>طلبات ومتابعة</span>
                </div>
              </div>

              <div className="feature-divider" />

              <div className="feature-item">
                <div className="feature-icon green">
                  ✓
                </div>

                <div>
                  <strong>التقييمات</strong>
                  <span>قياس الأداء</span>
                </div>
              </div>

            </div>
          </div>

          {/* =================================================
              DASHBOARD VISUAL
          ================================================== */}

          <div className="hero-visual">

            <div className="visual-orbit orbit-1" />
            <div className="visual-orbit orbit-2" />

            {/* MAIN DASHBOARD */}

            <div className="dashboard-window">

              {/* Window top */}

              <div className="window-top">

                <div className="window-dots">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="window-title">
                  لوحة الإدارة
                </div>

                <div className="window-logo">
                  HR
                </div>
              </div>

              {/* Greeting */}

              <div className="dashboard-heading">

                <div>
                  <span>مرحباً بك 👋</span>

                  <h3>
                    نظرة عامة
                  </h3>
                </div>

                <div className="date-box">
                  <span>اليوم</span>
                  <strong>2026</strong>
                </div>

              </div>

              {/* Stats */}

              <div className="dashboard-stats">

                <div className="stat-card">

                  <div className="stat-top">
                    <div className="stat-icon purple">
                      👥
                    </div>

                    <span className="stat-trend">
                      +12%
                    </span>
                  </div>

                  <span className="stat-label">
                    إجمالي الموظفين
                  </span>

                  <strong className="stat-number">
                    128
                  </strong>

                  <div className="mini-line">
                    <span style={{ width: "76%" }} />
                  </div>
                </div>

                <div className="stat-card">

                  <div className="stat-top">
                    <div className="stat-icon green">
                      ✓
                    </div>

                    <span className="stat-trend green-text">
                      +18%
                    </span>
                  </div>

                  <span className="stat-label">
                    التقييمات
                  </span>

                  <strong className="stat-number">
                    96
                  </strong>

                  <div className="mini-line green-line">
                    <span style={{ width: "84%" }} />
                  </div>
                </div>

              </div>

              {/* Chart */}

              <div className="chart-container">

                <div className="chart-top">

                  <div>
                    <span>أداء الموظفين</span>
                    <strong>متوسط الأداء</strong>
                  </div>

                  <div className="chart-growth">
                    <span>↗</span>
                    +18.5%
                  </div>

                </div>

                <div className="chart-area">

                  <div className="chart-grid">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="bars">

                    <div className="bar">
                      <span style={{ height: "38%" }} />
                    </div>

                    <div className="bar">
                      <span style={{ height: "54%" }} />
                    </div>

                    <div className="bar">
                      <span style={{ height: "46%" }} />
                    </div>

                    <div className="bar">
                      <span style={{ height: "68%" }} />
                    </div>

                    <div className="bar">
                      <span style={{ height: "61%" }} />
                    </div>

                    <div className="bar active">
                      <span style={{ height: "88%" }} />
                    </div>

                    <div className="bar">
                      <span style={{ height: "76%" }} />
                    </div>

                  </div>

                  <div className="chart-labels">
                    <span>يناير</span>
                    <span>فبراير</span>
                    <span>مارس</span>
                    <span>أبريل</span>
                    <span>مايو</span>
                    <span>يونيو</span>
                    <span>يوليو</span>
                  </div>

                </div>
              </div>

              {/* Leave */}

              <div className="leave-card">

                <div className="leave-icon">
                  📅
                </div>

                <div className="leave-info">
                  <strong>
                    طلبات الإجازات
                  </strong>

                  <span>
                    تحتاج إلى المراجعة
                  </span>
                </div>

                <div className="leave-number">
                  12
                </div>

                <div className="leave-arrow">
                  ←
                </div>

              </div>

            </div>

            {/* FLOATING CARD */}

            <div className="floating-success">

              <div className="success-icon">
                ✓
              </div>

              <div>
                <strong>
                  أداء ممتاز
                </strong>

                <span>
                  تم تحديث التقييم
                </span>
              </div>

              <div className="success-dot" />

            </div>

            {/* SMALL FLOATING CARD */}

            <div className="floating-users">

              <div className="avatars">
                <span>👩</span>
                <span>👨</span>
                <span>👩</span>
              </div>

              <div>
                <strong>128</strong>
                <span>موظف نشط</span>
              </div>

            </div>

          </div>
        </section>

        {/* =================================================
            BOTTOM FEATURES
        ================================================== */}

        <section className="features-section">

          <div className="section-intro">
            <span>كل ما تحتاجه في مكان واحد</span>
          </div>

          <div className="feature-cards">

            <div className="large-feature-card">
              <div className="large-feature-icon purple">
                👥
              </div>

              <div>
                <strong>
                  إدارة الموظفين
                </strong>

                <span>
                  بيانات منظمة وسهلة الوصول
                </span>
              </div>

              <div className="feature-card-arrow">
                ←
              </div>
            </div>

            <div className="large-feature-card">
              <div className="large-feature-icon blue">
                📅
              </div>

              <div>
                <strong>
                  تنظيم الإجازات
                </strong>

                <span>
                  قبول ورفض ومتابعة الطلبات
                </span>
              </div>

              <div className="feature-card-arrow">
                ←
              </div>
            </div>

            <div className="large-feature-card">
              <div className="large-feature-icon orange">
                ✓
              </div>

              <div>
                <strong>
                  إدارة المهام
                </strong>

                <span>
                  توزيع ومتابعة المهام
                </span>
              </div>

              <div className="feature-card-arrow">
                ←
              </div>
            </div>

            <div className="large-feature-card">
              <div className="large-feature-icon green">
                📈
              </div>

              <div>
                <strong>
                  تقييم الأداء
                </strong>

                <span>
                  تقارير ومتابعة الأداء
                </span>
              </div>

              <div className="feature-card-arrow">
                ←
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="hr-footer">
        <div className="footer-line" />

        <span>
          © 2026 نظام إدارة الموظفين
        </span>

        <span className="footer-dot">•</span>

        <span>
          جميع الحقوق محفوظة
        </span>
      </footer>

      {/* =====================================================
          STYLES
      ====================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #f7f9ff;
          font-family:
            "Cairo",
            "Tajawal",
            Tahoma,
            Arial,
            sans-serif;
        }

        button {
          font-family: inherit;
        }

        /* ==============================================
           PAGE
        ============================================== */

        .hr-home {
          min-height: 100vh;
          width: 100%;
          direction: rtl;
          position: relative;
          overflow: hidden;

          background:
            radial-gradient(
              circle at 15% 15%,
              rgba(99,102,241,0.12),
              transparent 30%
            ),
            radial-gradient(
              circle at 85% 55%,
              rgba(59,130,246,0.10),
              transparent 32%
            ),
            linear-gradient(
              135deg,
              #fbfcff 0%,
              #f5f7ff 48%,
              #f0f5ff 100%
            );

          color: #172033;
        }

        /* ==============================================
           BACKGROUND
        ============================================== */

        .ambient {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(90px);
        }

        .ambient-1 {
          width: 420px;
          height: 420px;
          top: -180px;
          left: -100px;
          background: rgba(99,102,241,0.12);
        }

        .ambient-2 {
          width: 380px;
          height: 380px;
          right: -130px;
          top: 250px;
          background: rgba(14,165,233,0.10);
        }

        .ambient-3 {
          width: 320px;
          height: 320px;
          left: 35%;
          bottom: -200px;
          background: rgba(139,92,246,0.08);
        }

        .grid-overlay {
          position: absolute;
          inset: 0;

          background-image:
            linear-gradient(
              rgba(99,102,241,0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(99,102,241,0.025) 1px,
              transparent 1px
            );

          background-size: 45px 45px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 80%
            );

          pointer-events: none;
        }

        /* ==============================================
           NAVBAR
        ============================================== */

        .hr-navbar {
          position: relative;
          z-index: 10;

          height: 82px;
          width: 100%;

          padding:
            0 clamp(20px, 6vw, 90px);

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-bottom:
            1px solid rgba(148,163,184,0.14);

          background:
            rgba(255,255,255,0.68);

          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .brand-logo {
          width: 47px;
          height: 47px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 15px;

          background:
            linear-gradient(
              135deg,
              #6366f1,
              #4f46e5 48%,
              #2563eb
            );

          box-shadow:
            0 12px 30px rgba(79,70,229,0.25);

          position: relative;
        }

        .brand-logo::after {
          content: "";
          position: absolute;
          inset: 1px;

          border-radius: 14px;

          border:
            1px solid rgba(255,255,255,0.28);
        }

        .brand-logo span {
          color: white;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.5px;
          position: relative;
          z-index: 1;
        }

        .brand-text strong {
          display: block;
          font-size: 15px;
          font-weight: 900;
          color: #172033;
        }

        .brand-text span {
          display: block;
          font-size: 9px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .login-nav-btn,
        .dashboard-nav-btn,
        .logout-nav-btn {
          border-radius: 12px;
          padding: 10px 16px;
          cursor: pointer;
          font-weight: 800;
          font-size: 11px;
          transition: 0.25s ease;
        }

        .login-nav-btn {
          background: rgba(255,255,255,0.85);
          border: 1px solid #dce4f2;
          color: #334155;

          display: flex;
          align-items: center;
          gap: 9px;
        }

        .login-nav-btn:hover {
          transform: translateY(-2px);
          border-color: #c7d2fe;
          box-shadow:
            0 10px 25px rgba(79,70,229,0.10);
        }

        .dashboard-nav-btn {
          border: none;
          color: white;

          display: flex;
          align-items: center;
          gap: 7px;

          background:
            linear-gradient(
              135deg,
              #6366f1,
              #3b82f6
            );

          box-shadow:
            0 10px 25px rgba(59,130,246,0.20);
        }

        .dashboard-nav-btn:hover {
          transform: translateY(-2px);
          box-shadow:
            0 14px 30px rgba(59,130,246,0.30);
        }

        .btn-icon {
          font-size: 15px;
        }

        .logout-nav-btn {
          background: rgba(255,255,255,0.8);
          border: 1px solid #fee2e2;
          color: #dc2626;
        }

        .logout-nav-btn:hover {
          transform: translateY(-2px);
          background: #fff7f7;
        }

        /* ==============================================
           MAIN
        ============================================== */

        .hero-wrapper {
          position: relative;
          z-index: 2;

          width: min(90%, 1280px);
          margin: auto;
        }

        /* ==============================================
           HERO
        ============================================== */

        .hero-section {
          min-height: 680px;

          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(480px, 0.95fr);

          gap: 55px;

          align-items: center;

          padding:
            55px 0 35px;
        }

        .hero-content {
          max-width: 650px;
        }

        .eyebrow {
          width: fit-content;

          display: inline-flex;
          align-items: center;
          gap: 9px;

          padding: 8px 14px;

          border-radius: 30px;

          background:
            rgba(255,255,255,0.72);

          border:
            1px solid rgba(129,140,248,0.20);

          color: #4f46e5;

          font-size: 10px;
          font-weight: 900;

          box-shadow:
            0 8px 25px rgba(79,70,229,0.06);

          backdrop-filter: blur(10px);

          animation:
            fadeUp 0.7s ease both;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #6366f1;

          box-shadow:
            0 0 0 5px rgba(99,102,241,0.10);

          animation:
            pulseDot 2s infinite;
        }

        .hero-content h1 {
          margin: 23px 0 0;

          font-size:
            clamp(42px, 5vw, 66px);

          line-height: 1.18;

          letter-spacing: -2px;

          font-weight: 950;

          color: #172033;

          animation:
            fadeUp 0.8s 0.08s ease both;
        }

        .gradient-heading {
          background:
            linear-gradient(
              90deg,
              #4f46e5,
              #6366f1,
              #2563eb,
              #0284c7
            );

          -webkit-background-clip: text;
          background-clip: text;

          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          max-width: 570px;

          margin:
            23px 0 0;

          color: #64748b;

          font-size: 14px;
          line-height: 2.05;

          animation:
            fadeUp 0.8s 0.16s ease both;
        }

        /* ==============================================
           CTA
        ============================================== */

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;

          margin-top: 29px;

          animation:
            fadeUp 0.8s 0.24s ease both;
        }

        .main-cta {
          border: none;

          padding: 14px 21px;

          min-width: 190px;

          border-radius: 13px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;

          cursor: pointer;

          color: white;

          font-size: 12px;
          font-weight: 900;

          background:
            linear-gradient(
              135deg,
              #6366f1,
              #4f46e5 45%,
              #2563eb
            );

          box-shadow:
            0 16px 35px rgba(79,70,229,0.24);

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .main-cta:hover {
          transform: translateY(-3px);
          box-shadow:
            0 20px 42px rgba(79,70,229,0.32);
        }

        .cta-arrow {
          font-size: 18px;
        }

        .secure-badge {
          display: flex;
          align-items: center;
          gap: 7px;

          color: #64748b;
          font-size: 9px;
          font-weight: 700;
        }

        .secure-badge span {
          width: 22px;
          height: 22px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #dcfce7;
          color: #16a34a;

          font-size: 11px;
          font-weight: 900;
        }

        /* ==============================================
           HERO FEATURES
        ============================================== */

        .hero-features {
          display: flex;
          align-items: center;
          gap: 21px;

          margin-top: 42px;

          animation:
            fadeUp 0.8s 0.32s ease both;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .feature-item strong {
          display: block;

          color: #334155;

          font-size: 10px;
          font-weight: 900;
        }

        .feature-item span {
          display: block;

          color: #94a3b8;

          font-size: 8px;

          margin-top: 2px;
        }

        .feature-icon {
          width: 37px;
          height: 37px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          font-size: 16px;
        }

        .feature-icon.purple,
        .large-feature-icon.purple,
        .stat-icon.purple {
          background:
            linear-gradient(
              135deg,
              #eef2ff,
              #e0e7ff
            );
        }

        .feature-icon.blue,
        .large-feature-icon.blue,
        .stat-icon.blue {
          background:
            linear-gradient(
              135deg,
              #eff6ff,
              #dbeafe
            );
        }

        .feature-icon.green,
        .large-feature-icon.green,
        .stat-icon.green {
          background:
            linear-gradient(
              135deg,
              #ecfdf5,
              #d1fae5
            );
        }

        .large-feature-icon.orange {
          background:
            linear-gradient(
              135deg,
              #fff7ed,
              #fed7aa
            );
        }

        .feature-divider {
          height: 32px;
          width: 1px;
          background: #e2e8f0;
        }

        /* ==============================================
           VISUAL
        ============================================== */

        .hero-visual {
          min-height: 570px;

          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .visual-orbit {
          position: absolute;

          border-radius: 50%;

          border:
            1px solid rgba(99,102,241,0.10);

          pointer-events: none;
        }

        .orbit-1 {
          width: 500px;
          height: 500px;
        }

        .orbit-2 {
          width: 600px;
          height: 600px;

          border-color:
            rgba(59,130,246,0.055);
        }

        /* ==============================================
           DASHBOARD
        ============================================== */

        .dashboard-window {
          position: relative;
          z-index: 3;

          width: min(100%, 510px);

          padding: 19px;

          border-radius: 25px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.98),
              rgba(248,250,255,0.96)
            );

          border:
            1px solid rgba(255,255,255,0.85);

          box-shadow:
            0 35px 90px rgba(30,64,175,0.14),
            0 10px 30px rgba(15,23,42,0.06);

          backdrop-filter: blur(25px);

          transform:
            perspective(1200px)
            rotateY(-4deg)
            rotateX(2deg);

          animation:
            dashboardFloat 5s ease-in-out infinite;
        }

        .dashboard-window::before {
          content: "";

          position: absolute;

          inset: 0;

          border-radius: 25px;

          pointer-events: none;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,0.55),
              transparent 45%
            );
        }

        .window-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding-bottom: 15px;

          border-bottom:
            1px solid #eef2f7;
        }

        .window-dots {
          display: flex;
          gap: 5px;
        }

        .window-dots span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #dbe3ef;
        }

        .window-title {
          color: #94a3b8;
          font-size: 8px;
          font-weight: 700;
        }

        .window-logo {
          width: 31px;
          height: 31px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          color: white;

          font-size: 8px;
          font-weight: 900;

          background:
            linear-gradient(
              135deg,
              #6366f1,
              #2563eb
            );

          box-shadow:
            0 7px 15px rgba(59,130,246,0.20);
        }

        /* ==============================================
           DASHBOARD HEADING
        ============================================== */

        .dashboard-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 20px 3px 15px;
        }

        .dashboard-heading > div:first-child span {
          color: #94a3b8;
          font-size: 8px;
        }

        .dashboard-heading h3 {
          margin: 3px 0 0;

          color: #172033;

          font-size: 18px;
          font-weight: 900;
        }

        .date-box {
          padding: 7px 10px;

          border-radius: 9px;

          background: #f8fafc;

          border:
            1px solid #edf1f7;

          text-align: center;
        }

        .date-box span {
          display: block;
          color: #94a3b8;
          font-size: 7px;
        }

        .date-box strong {
          display: block;
          margin-top: 2px;
          color: #475569;
          font-size: 8px;
        }

        /* ==============================================
           STATS
        ============================================== */

        .dashboard-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .stat-card {
          padding: 13px;

          border-radius: 14px;

          background:
            rgba(248,250,252,0.90);

          border:
            1px solid #edf1f7;
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-icon {
          width: 32px;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          font-size: 14px;
        }

        .stat-trend {
          color: #6366f1;
          font-size: 7px;
          font-weight: 900;
        }

        .green-text {
          color: #16a34a;
        }

        .stat-label {
          display: block;

          margin-top: 11px;

          color: #94a3b8;

          font-size: 8px;
        }

        .stat-number {
          display: block;

          margin-top: 1px;

          color: #1e293b;

          font-size: 19px;
          font-weight: 950;
        }

        .mini-line {
          height: 4px;

          margin-top: 9px;

          overflow: hidden;

          border-radius: 10px;

          background: #e9edff;
        }

        .mini-line span {
          display: block;

          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #818cf8,
              #4f46e5
            );
        }

        .green-line {
          background: #dcfce7;
        }

        .green-line span {
          background:
            linear-gradient(
              90deg,
              #4ade80,
              #16a34a
            );
        }

        /* ==============================================
           CHART
        ============================================== */

        .chart-container {
          margin-top: 10px;

          padding: 15px;

          border-radius: 15px;

          background: #fff;

          border:
            1px solid #edf1f7;

          box-shadow:
            0 8px 25px rgba(15,23,42,0.025);
        }

        .chart-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chart-top span {
          display: block;

          color: #94a3b8;

          font-size: 7px;
        }

        .chart-top strong {
          display: block;

          margin-top: 3px;

          color: #475569;

          font-size: 9px;
        }

        .chart-growth {
          padding: 5px 8px;

          border-radius: 8px;

          background: #ecfdf5;

          color: #16a34a;

          font-size: 7px;
          font-weight: 900;
        }

        .chart-growth span {
          display: inline;
          color: #16a34a;
          font-size: 10px;
          margin-left: 3px;
        }

        .chart-area {
          position: relative;

          height: 145px;

          margin-top: 13px;
        }

        .chart-grid {
          position: absolute;
          inset: 0;

          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .chart-grid span {
          width: 100%;
          height: 1px;
          background: #f1f5f9;
        }

        .bars {
          position: absolute;

          inset:
            5px 7px 18px;

          display: flex;

          align-items: flex-end;
          justify-content: space-around;

          gap: 10px;
        }

        .bar {
          width: 24px;
          height: 100%;

          display: flex;
          align-items: flex-end;

          border-radius: 7px 7px 3px 3px;

          background: #f4f6ff;

          overflow: hidden;
        }

        .bar span {
          display: block;

          width: 100%;

          border-radius: 7px 7px 3px 3px;

          background:
            linear-gradient(
              to top,
              #818cf8,
              #60a5fa
            );

          opacity: 0.82;

          animation:
            barGrow 1.2s ease both;
        }

        .bar.active span {
          background:
            linear-gradient(
              to top,
              #4f46e5,
              #38bdf8
            );

          box-shadow:
            0 7px 15px rgba(79,70,229,0.20);

          opacity: 1;
        }

        .chart-labels {
          position: absolute;

          bottom: 0;

          left: 0;
          right: 0;

          display: flex;
          justify-content: space-around;

          color: #cbd5e1;

          font-size: 6px;
        }

        /* ==============================================
           LEAVE
        ============================================== */

        .leave-card {
          display: flex;
          align-items: center;

          gap: 10px;

          margin-top: 10px;

          padding: 11px 12px;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #fffbeb,
              #fffdf6
            );

          border:
            1px solid #fef3c7;
        }

        .leave-icon {
          width: 33px;
          height: 33px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background: #fef3c7;

          font-size: 14px;
        }

        .leave-info {
          flex: 1;
        }

        .leave-info strong {
          display: block;

          color: #475569;

          font-size: 9px;
        }

        .leave-info span {
          display: block;

          color: #a1a1aa;

          font-size: 7px;

          margin-top: 2px;
        }

        .leave-number {
          color: #d97706;

          font-size: 18px;
          font-weight: 950;
        }

        .leave-arrow {
          color: #d97706;
          font-size: 13px;
        }

        /* ==============================================
           FLOATING SUCCESS
        ============================================== */

        .floating-success {
          position: absolute;

          z-index: 5;

          left: -18px;
          bottom: 78px;

          display: flex;
          align-items: center;
          gap: 9px;

          padding: 10px 13px;

          border-radius: 14px;

          background:
            rgba(255,255,255,0.95);

          border:
            1px solid #e5e7eb;

          box-shadow:
            0 18px 40px rgba(15,23,42,0.12);

          backdrop-filter: blur(20px);

          animation:
            floatingCard 4s ease-in-out infinite;
        }

        .success-icon {
          width: 31px;
          height: 31px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #dcfce7;
          color: #16a34a;

          font-size: 13px;
          font-weight: 950;
        }

        .floating-success strong {
          display: block;

          color: #334155;

          font-size: 9px;
        }

        .floating-success span {
          display: block;

          color: #94a3b8;

          font-size: 7px;

          margin-top: 2px;
        }

        .success-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #22c55e;
        }

        /* ==============================================
           FLOATING USERS
        ============================================== */

        .floating-users {
          position: absolute;

          z-index: 5;

          right: -20px;
          top: 95px;

          display: flex;
          align-items: center;
          gap: 8px;

          padding: 9px 12px;

          border-radius: 13px;

          background:
            rgba(255,255,255,0.94);

          border:
            1px solid #e5e7eb;

          box-shadow:
            0 18px 40px rgba(15,23,42,0.10);

          animation:
            floatingCard 5s 0.5s ease-in-out infinite;
        }

        .avatars {
          display: flex;
          direction: ltr;
        }

        .avatars span {
          width: 24px;
          height: 24px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-left: -5px;

          border-radius: 50%;

          background: #f1f5f9;

          border: 2px solid white;

          font-size: 10px;
        }

        .floating-users strong {
          display: block;

          color: #334155;

          font-size: 10px;
        }

        .floating-users span {
          display: block;

          color: #94a3b8;

          font-size: 6px;
        }

        /* ==============================================
           BOTTOM FEATURES
        ============================================== */

        .features-section {
          padding: 25px 0 45px;
        }

        .section-intro {
          text-align: center;
          margin-bottom: 18px;
        }

        .section-intro span {
          color: #94a3b8;
          font-size: 9px;
          font-weight: 800;
        }

        .feature-cards {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 12px;
        }

        .large-feature-card {
          min-height: 85px;

          display: flex;
          align-items: center;

          gap: 11px;

          padding: 14px;

          border-radius: 16px;

          background:
            rgba(255,255,255,0.76);

          border:
            1px solid rgba(226,232,240,0.85);

          box-shadow:
            0 10px 30px rgba(15,23,42,0.035);

          backdrop-filter: blur(15px);

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .large-feature-card:hover {
          transform: translateY(-5px);

          border-color:
            rgba(129,140,248,0.25);

          box-shadow:
            0 20px 40px rgba(15,23,42,0.08);
        }

        .large-feature-icon {
          width: 39px;
          height: 39px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          font-size: 16px;
        }

        .large-feature-card > div:nth-child(2) {
          flex: 1;
        }

        .large-feature-card strong {
          display: block;

          color: #334155;

          font-size: 9px;
          font-weight: 900;
        }

        .large-feature-card span {
          display: block;

          margin-top: 3px;

          color: #94a3b8;

          font-size: 7px;
        }

        .feature-card-arrow {
          color: #cbd5e1;

          font-size: 13px;

          transition:
            transform 0.25s ease,
            color 0.25s ease;
        }

        .large-feature-card:hover
        .feature-card-arrow {
          transform: translateX(-3px);
          color: #6366f1;
        }

        /* ==============================================
           FOOTER
        ============================================== */

        .hr-footer {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          padding: 17px;

          color: #a1aab8;

          font-size: 8px;

          background:
            rgba(255,255,255,0.45);

          border-top:
            1px solid rgba(226,232,240,0.7);
        }

        .footer-dot {
          color: #cbd5e1;
        }

        /* ==============================================
           ANIMATIONS
        ============================================== */

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dashboardFloat {
          0%, 100% {
            transform:
              perspective(1200px)
              rotateY(-4deg)
              rotateX(2deg)
              translateY(0);
          }

          50% {
            transform:
              perspective(1200px)
              rotateY(-4deg)
              rotateX(2deg)
              translateY(-8px);
          }
        }

        @keyframes floatingCard {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes pulseDot {
          0%, 100% {
            box-shadow:
              0 0 0 5px rgba(99,102,241,0.10);
          }

          50% {
            box-shadow:
              0 0 0 8px rgba(99,102,241,0.04);
          }
        }

        @keyframes barGrow {
          from {
            transform: scaleY(0);
            transform-origin: bottom;
          }

          to {
            transform: scaleY(1);
            transform-origin: bottom;
          }
        }

        /* ==============================================
           1100
        ============================================== */

        @media (max-width: 1100px) {

          .hero-section {
            grid-template-columns:
              1fr 0.9fr;

            gap: 30px;
          }

          .hero-content h1 {
            font-size: 50px;
          }

          .dashboard-window {
            width: 470px;
          }

          .floating-users {
            right: -5px;
          }

          .floating-success {
            left: -5px;
          }

        }

        /* ==============================================
           900
        ============================================== */

        @media (max-width: 900px) {

          .hero-section {
            grid-template-columns: 1fr;

            padding-top: 50px;

            text-align: center;
          }

          .hero-content {
            max-width: 700px;
            margin: auto;
          }

          .eyebrow {
            margin: auto;
          }

          .hero-description {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-actions {
            justify-content: center;
          }

          .hero-features {
            justify-content: center;
          }

          .hero-visual {
            min-height: 550px;
          }

          .feature-cards {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }

        /* ==============================================
           650
        ============================================== */

        @media (max-width: 650px) {

          .hr-navbar {
            height: 72px;
            padding: 0 16px;
          }

          .brand-logo {
            width: 41px;
            height: 41px;
            border-radius: 12px;
          }

          .brand-text strong {
            font-size: 12px;
          }

          .brand-text span {
            display: none;
          }

          .navbar-actions {
            gap: 5px;
          }

          .login-nav-btn,
          .dashboard-nav-btn,
          .logout-nav-btn {
            padding: 8px 9px;
            font-size: 9px;
          }

          .hero-wrapper {
            width: 92%;
          }

          .hero-section {
            padding-top: 38px;
          }

          .hero-content h1 {
            font-size: 39px;
            letter-spacing: -1.3px;
          }

          .hero-description {
            font-size: 12px;
            line-height: 1.9;
          }

          .hero-actions {
            flex-direction: column;
            width: 100%;
          }

          .main-cta {
            width: 100%;
          }

          .hero-features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 32px;
          }

          .feature-divider {
            display: none;
          }

          .hero-visual {
            min-height: 470px;
          }

          .dashboard-window {
            width: 100%;
            padding: 14px;
            border-radius: 20px;

            transform: none;

            animation:
              dashboardFloatMobile 5s ease-in-out infinite;
          }

          .orbit-1 {
            width: 370px;
            height: 370px;
          }

          .orbit-2 {
            width: 450px;
            height: 450px;
          }

          .floating-success {
            left: 0;
            bottom: 50px;
          }

          .floating-users {
            right: 0;
            top: 35px;
          }

          .feature-cards {
            grid-template-columns: 1fr;
          }

          .large-feature-card {
            min-height: 75px;
          }

          .hr-footer {
            font-size: 7px;
          }

        }

        @keyframes dashboardFloatMobile {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-6px);
          }
        }

        /* ==============================================
           430
        ============================================== */

        @media (max-width: 430px) {

          .brand-text {
            display: none;
          }

          .navbar-actions {
            margin-right: auto;
          }

          .hero-content h1 {
            font-size: 34px;
          }

          .eyebrow {
            font-size: 8px;
            padding: 7px 11px;
          }

          .hero-features {
            grid-template-columns: 1fr;
            width: fit-content;
            margin-left: auto;
            margin-right: auto;
            text-align: right;
          }

          .feature-item {
            min-width: 170px;
          }

          .dashboard-heading h3 {
            font-size: 16px;
          }

          .stat-card {
            padding: 10px;
          }

          .chart-container {
            padding: 11px;
          }

          .chart-area {
            height: 125px;
          }

          .bar {
            width: 18px;
          }

          .chart-labels {
            font-size: 5px;
          }

          .floating-success {
            transform: scale(0.9);
            transform-origin: left bottom;
          }

          .floating-users {
            transform: scale(0.88);
            transform-origin: right top;
          }

        }

        /* ==============================================
           REDUCED MOTION
        ============================================== */

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

        }

      `}</style>
    </div>
  );
}

