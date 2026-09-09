import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaShieldAlt,
  FaUsers,
  FaCheckCircle,
  FaBuilding,
  FaChartLine,
} from "react-icons/fa";

export default function Login() {
  const nav = useNavigate();

  // =========================
  // STATES
  // =========================

  const [email, setEmail] = useState(
    localStorage.getItem("rememberEmail") || "",
  );

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [remember, setRemember] = useState(
    Boolean(localStorage.getItem("rememberEmail")),
  );

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [focusedField, setFocusedField] = useState("");

  // =========================
  // PAGE STYLE
  // =========================

  useEffect(() => {
    const styleId = "login-modern-styles";

    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;

    style.innerHTML = `
      @keyframes loginSpin {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }

      @keyframes loginFloat {
        0%, 100% {
          transform: translateY(0);
        }

        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes loginFadeUp {
        from {
          opacity: 0;
          transform: translateY(15px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes loginPulse {
        0% {
          box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.20);
        }

        70% {
          box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
        }

        100% {
          box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
        }
      }

      .login-page-input::placeholder {
        color: #a0aec0;
      }

      .login-page-button {
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease,
          opacity 0.2s ease;
      }

      .login-page-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow:
          0 16px 35px rgba(79, 70, 229, 0.30);
      }

      .login-page-button:active:not(:disabled) {
        transform: translateY(0);
      }

      .login-home-button {
        transition: all 0.2s ease;
      }

      .login-home-button:hover {
        background: rgba(255, 255, 255, 0.95) !important;
        border-color: #c7d2fe !important;
        color: #4f46e5 !important;
        transform: translateY(-1px);
      }

      .login-feature {
        transition: all 0.2s ease;
      }

      .login-feature:hover {
        transform: translateY(-3px);
        border-color: #d9dfff !important;
        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
      }

      .login-checkbox {
        appearance: none;
        -webkit-appearance: none;
        width: 17px;
        height: 17px;
        border-radius: 5px;
        border: 1.5px solid #cbd5e1;
        background: #fff;
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .login-checkbox:checked {
        background: #6366f1;
        border-color: #6366f1;
      }

      .login-checkbox:checked::after {
        content: "✓";
        position: absolute;
        color: white;
        font-size: 11px;
        font-weight: 800;
        left: 3px;
        top: -1px;
      }

      .login-card-animation {
        animation: loginFadeUp 0.5s ease both;
      }

      .login-floating {
        animation: loginFloat 5s ease-in-out infinite;
      }

      @media (max-width: 900px) {
        .login-left-panel {
          display: none !important;
        }

        .login-main-area {
          width: 100% !important;
        }
      }

      @media (max-width: 600px) {
        .login-wrapper {
          padding: 20px 15px !important;
        }

        .login-card {
          padding: 30px 22px !important;
          border-radius: 24px !important;
        }

        .login-home-button {
          top: 15px !important;
          right: 15px !important;
        }

        .login-copyright {
          position: static !important;
          margin-top: 20px;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      const existing = document.getElementById(styleId);

      if (existing) {
        existing.remove();
      }
    };
  }, []);

  // =========================
  // VALIDATION
  // =========================

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      return "يرجى إدخال البريد الإلكتروني وكلمة المرور";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return "يرجى إدخال بريد إلكتروني صحيح";
    }

    if (password.length < 4) {
      return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
    }

    return "";
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async () => {
    if (loading) return;

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const { token, user } = res.data;

      // =========================
      // SAVE LOGIN DATA
      // =========================

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // =========================
      // REMEMBER EMAIL
      // =========================

      if (remember) {
        localStorage.setItem("rememberEmail", email.trim());
      } else {
        localStorage.removeItem("rememberEmail");
      }

      // =========================
      // REDIRECT
      // =========================

      if (user.role === "admin") {
        nav("/admin-dashboard");
      } else if (user.role === "employee" && !user.welcome_seen) {
        nav("/employee/welcome");
      } else {
        nav("/employee");
      }
    } catch (err) {
      console.error("Login Error:", err);

      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ENTER KEY
  // =========================

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // =========================
  // CLEAR ERROR
  // =========================

  const clearError = () => {
    if (error) {
      setError("");
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div style={styles.wrapper} className="login-wrapper">
      {/* =========================================
          BACKGROUND
      ========================================= */}

      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />
      <div style={styles.backgroundGlowThree} />

      <div style={styles.gridBackground} />

      {/* =========================================
          BACK HOME
      ========================================= */}

      <button
        type="button"
        onClick={() => nav("/")}
        style={styles.homeButton}
        className="login-home-button"
      >
        <FaArrowRight
          style={{
            transform: "rotate(180deg)",
            fontSize: "11px",
          }}
        />

        <span>الرئيسية</span>
      </button>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <div style={styles.mainContainer}>
        {/* =======================================
            LEFT / BRAND PANEL
        ======================================= */}

        <div style={styles.leftPanel} className="login-left-panel">
          <div style={styles.leftContent}>
            {/* Logo */}

            <div style={styles.brandLogo}>
              <span>HR</span>
            </div>

            <div style={styles.brandSmallTitle}>نظام الموارد البشرية</div>

            <h2 style={styles.brandTitle}>
              إدارة فريقك
              <br />
              <span>بذكاء وبساطة.</span>
            </h2>

            <p style={styles.brandDescription}>
              منصة متكاملة تساعدك على إدارة الموظفين والإجازات والمهام وتقييم
              الأداء من مكان واحد.
            </p>

            {/* Features */}

            <div style={styles.featuresList}>
              <div style={styles.featureItem} className="login-feature">
                <div style={styles.featureIcon}>
                  <FaUsers />
                </div>

                <div>
                  <div style={styles.featureTitle}>إدارة الموظفين</div>

                  <div style={styles.featureText}>
                    بيانات الموظفين في مكان واحد
                  </div>
                </div>

                <FaCheckCircle style={styles.checkIcon} />
              </div>

              <div style={styles.featureItem} className="login-feature">
                <div
                  style={{
                    ...styles.featureIcon,
                    background: "#eefcf8",
                    color: "#0f9f7f",
                  }}
                >
                  <FaChartLine />
                </div>

                <div>
                  <div style={styles.featureTitle}>متابعة الأداء</div>

                  <div style={styles.featureText}>تقييم ومتابعة أداء فريقك</div>
                </div>

                <FaCheckCircle
                  style={{
                    ...styles.checkIcon,
                    color: "#10b981",
                  }}
                />
              </div>

              <div style={styles.featureItem} className="login-feature">
                <div
                  style={{
                    ...styles.featureIcon,
                    background: "#fff7ed",
                    color: "#f97316",
                  }}
                >
                  <FaBuilding />
                </div>

                <div>
                  <div style={styles.featureTitle}>تنظيم العمل</div>

                  <div style={styles.featureText}>
                    أقسام ومهام وإجازات بشكل منظم
                  </div>
                </div>

                <FaCheckCircle
                  style={{
                    ...styles.checkIcon,
                    color: "#f59e0b",
                  }}
                />
              </div>
            </div>

            {/* Floating mini card */}

            <div style={styles.floatingCard} className="login-floating">
              <div style={styles.floatingIcon}>
                <FaShieldAlt />
              </div>

              <div>
                <div style={styles.floatingTitle}>بيئة آمنة</div>

                <div style={styles.floatingText}>بياناتك محمية وآمنة</div>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================
            RIGHT / LOGIN
        ======================================= */}

        <div style={styles.mainArea} className="login-main-area">
          <div style={styles.card} className="login-card login-card-animation">
            {/* ===================================
                LOGO MOBILE
            =================================== */}

            <div style={styles.mobileLogo}>
              <div style={styles.mobileLogoBox}>HR</div>

              <div>
                <div style={styles.mobileBrandTitle}>نظام الموارد البشرية</div>

                <div style={styles.mobileBrandSubtitle}>
                  Employee Management System
                </div>
              </div>
            </div>

            {/* ===================================
                HEADER
            =================================== */}

            <div style={styles.header}>
              <div style={styles.welcomeBadge}>
                <span style={styles.badgeDot} />
                مرحباً بك من جديد
              </div>

              <h1 style={styles.title}>تسجيل الدخول</h1>

              <p style={styles.subtitle}>أدخل بياناتك للوصول إلى حسابك</p>
            </div>

            {/* ===================================
                SECURITY
            =================================== */}

            <div style={styles.securityBadge}>
              <div style={styles.securityIcon}>
                <FaShieldAlt />
              </div>

              <div>
                <div style={styles.securityTitle}>تسجيل دخول آمن</div>

                <div style={styles.securityText}>معلوماتك محمية ومشفرة</div>
              </div>
            </div>

            {/* ===================================
                EMAIL
            =================================== */}

            <div style={styles.fieldContainer}>
              <label style={styles.label}>البريد الإلكتروني</label>

              <div
                style={{
                  ...styles.inputBox,
                  ...(focusedField === "email" ? styles.inputFocused : {}),
                  ...(error && !email.trim() ? styles.inputError : {}),
                }}
              >
                <div
                  style={{
                    ...styles.inputIcon,
                    ...(focusedField === "email"
                      ? styles.inputIconFocused
                      : {}),
                  }}
                >
                  <FaEnvelope />
                </div>

                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError();
                  }}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  onKeyDown={handleKeyDown}
                  style={styles.input}
                  className="login-page-input"
                  autoComplete="email"
                  dir="ltr"
                />
              </div>
            </div>

            {/* ===================================
                PASSWORD
            =================================== */}

            <div style={styles.fieldContainer}>
              <label style={styles.label}>كلمة المرور</label>

              <div
                style={{
                  ...styles.inputBox,
                  ...(focusedField === "password" ? styles.inputFocused : {}),
                  ...(error && !password ? styles.inputError : {}),
                }}
              >
                <div
                  style={{
                    ...styles.inputIcon,
                    ...(focusedField === "password"
                      ? styles.inputIconFocused
                      : {}),
                  }}
                >
                  <FaLock />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  onKeyDown={handleKeyDown}
                  style={styles.input}
                  className="login-page-input"
                  autoComplete="current-password"
                  dir="ltr"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  aria-label={
                    showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                  }
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* ===================================
                REMEMBER ME
            =================================== */}

            <div style={styles.options}>
              <label style={styles.rememberLabel}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    setRemember(checked);

                    if (!checked) {
                      localStorage.removeItem("rememberEmail");
                    } else if (email.trim()) {
                      localStorage.setItem("rememberEmail", email.trim());
                    }
                  }}
                  className="login-checkbox"
                />

                <span>تذكر البريد الإلكتروني</span>
              </label>

              <span style={styles.rememberHint}>لن يتم حفظ كلمة المرور</span>
            </div>

            {/* ===================================
                ERROR
            =================================== */}

            {error && (
              <div style={styles.errorBox}>
                <div style={styles.errorIcon}>!</div>

                <div style={styles.errorContent}>
                  <div style={styles.errorTitle}>تعذر تسجيل الدخول</div>

                  <div style={styles.errorText}>{error}</div>
                </div>
              </div>
            )}

            {/* ===================================
                LOGIN BUTTON
            =================================== */}

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
              className="login-page-button"
            >
              {loading ? (
                <>
                  <span style={styles.spinner} />

                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>

                  <span style={styles.buttonArrow}>
                    <FaArrowRight
                      style={{
                        transform: "rotate(180deg)",
                      }}
                    />
                  </span>
                </>
              )}
            </button>

            {/* ===================================
                FOOTER INFO
            =================================== */}

            <div style={styles.footer}>
              <div style={styles.footerIcon}>
                <FaUsers />
              </div>

              <div style={{ flex: 1 }}>
                <div style={styles.footerTitle}>نظام إدارة الموظفين</div>

                <div style={styles.footerText}>
                  إدارة الموظفين والأداء والإجازات والمهام بسهولة
                </div>
              </div>

              <FaShieldAlt style={styles.footerShield} />
            </div>
          </div>

          {/* COPYRIGHT */}

          <div style={styles.copyright} className="login-copyright">
            © 2026 نظام إدارة الموظفين
            <span style={styles.copyrightDot}>•</span>
            جميع الحقوق محفوظة
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {
  // =========================
  // WRAPPER
  // =========================

  wrapper: {
    minHeight: "100vh",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "45px 35px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #f8faff 0%, #f1f4ff 48%, #f9fbff 100%)",
    fontFamily: "Cairo, Tahoma, Arial, sans-serif",
    direction: "rtl",
  },

  // =========================
  // BACKGROUND
  // =========================

  backgroundGlowOne: {
    position: "absolute",
    width: "550px",
    height: "550px",
    borderRadius: "50%",
    background: "rgba(99, 102, 241, 0.12)",
    filter: "blur(100px)",
    top: "-280px",
    right: "-180px",
    pointerEvents: "none",
  },

  backgroundGlowTwo: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.09)",
    filter: "blur(100px)",
    bottom: "-280px",
    left: "-180px",
    pointerEvents: "none",
  },

  backgroundGlowThree: {
    position: "absolute",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "rgba(139, 92, 246, 0.07)",
    filter: "blur(80px)",
    top: "35%",
    left: "38%",
    pointerEvents: "none",
  },

  gridBackground: {
    position: "absolute",
    inset: 0,
    opacity: 0.35,
    pointerEvents: "none",
    backgroundImage:
      "linear-gradient(rgba(99,102,241,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.025) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
  },

  // =========================
  // HOME BUTTON
  // =========================

  homeButton: {
    position: "absolute",
    top: "25px",
    right: "28px",
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(226,232,240,0.9)",
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(12px)",
    color: "#64748b",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
    fontSize: "11px",
    boxShadow: "0 8px 25px rgba(15,23,42,0.05)",
  },

  // =========================
  // MAIN CONTAINER
  // =========================

  mainContainer: {
    width: "100%",
    maxWidth: "1080px",
    minHeight: "650px",
    display: "flex",
    direction: "ltr",
    position: "relative",
    zIndex: 2,
    borderRadius: "32px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.80)",
    border: "1px solid rgba(255,255,255,0.9)",
    boxShadow: "0 35px 100px rgba(30,41,100,0.13)",
    backdropFilter: "blur(20px)",
  },

  // =========================
  // LEFT PANEL
  // =========================

  leftPanel: {
    width: "47%",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(145deg, #312e81 0%, #4338ca 45%, #4f46e5 100%)",
    color: "#fff",
    direction: "rtl",
  },

  leftContent: {
    height: "100%",
    minHeight: "650px",
    boxSizing: "border-box",
    padding: "55px 48px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  brandLogo: {
    width: "56px",
    height: "56px",
    borderRadius: "17px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
    marginBottom: "20px",
    backdropFilter: "blur(10px)",
  },

  brandLogoText: {
    fontSize: "19px",
    fontWeight: "900",
  },

  brandSmallTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.72)",
    marginBottom: "11px",
  },

  brandTitle: {
    margin: 0,
    fontSize: "34px",
    lineHeight: "1.35",
    fontWeight: "900",
    letterSpacing: "-0.7px",
  },

  brandDescription: {
    margin: "18px 0 30px",
    color: "rgba(255,255,255,0.75)",
    fontSize: "12px",
    lineHeight: "2",
    maxWidth: "390px",
  },

  featuresList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 13px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.075)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  featureIcon: {
    width: "37px",
    height: "37px",
    minWidth: "37px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "14px",
  },

  featureTitle: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#fff",
  },

  featureText: {
    fontSize: "9px",
    color: "rgba(255,255,255,0.60)",
    marginTop: "3px",
  },

  checkIcon: {
    marginRight: "auto",
    color: "#a5b4fc",
    fontSize: "12px",
  },

  floatingCard: {
    position: "absolute",
    left: "30px",
    bottom: "32px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.11)",
    border: "1px solid rgba(255,255,255,0.15)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
  },

  floatingIcon: {
    width: "31px",
    height: "31px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.16)",
    color: "#c7d2fe",
    fontSize: "12px",
  },

  floatingTitle: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#fff",
  },

  floatingText: {
    fontSize: "8px",
    color: "rgba(255,255,255,0.58)",
    marginTop: "2px",
  },

  // =========================
  // MAIN AREA
  // =========================

  mainArea: {
    width: "53%",
    direction: "rtl",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(255,255,255,0.92)",
    position: "relative",
    padding: "50px 45px 40px",
    boxSizing: "border-box",
  },

  // =========================
  // CARD
  // =========================

  card: {
    width: "100%",
    maxWidth: "400px",
    boxSizing: "border-box",
  },

  // =========================
  // MOBILE LOGO
  // =========================

  mobileLogo: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    marginBottom: "25px",
  },

  mobileLogoBox: {
    width: "43px",
    height: "43px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "900",
    boxShadow: "0 8px 20px rgba(99,102,241,0.20)",
  },

  mobileBrandTitle: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#334155",
  },

  mobileBrandSubtitle: {
    fontSize: "8px",
    color: "#94a3b8",
    marginTop: "2px",
  },

  // =========================
  // HEADER
  // =========================

  header: {
    marginBottom: "22px",
  },

  welcomeBadge: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    width: "fit-content",
    padding: "6px 10px",
    borderRadius: "20px",
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "9px",
    fontWeight: "800",
    marginBottom: "13px",
  },

  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#6366f1",
    animation: "loginPulse 2s infinite",
  },

  title: {
    margin: 0,
    color: "#172033",
    fontSize: "28px",
    lineHeight: "1.4",
    fontWeight: "900",
    letterSpacing: "-0.4px",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "11px",
    lineHeight: "1.8",
  },

  // =========================
  // SECURITY
  // =========================

  securityBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 13px",
    marginBottom: "22px",
    borderRadius: "14px",
    background: "linear-gradient(135deg,#f0fdf9,#f7fffc)",
    border: "1px solid #d5f5e8",
  },

  securityIcon: {
    width: "31px",
    height: "31px",
    minWidth: "31px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#dff8ee",
    color: "#0f9f7f",
    fontSize: "12px",
  },

  securityTitle: {
    fontSize: "9px",
    fontWeight: "800",
    color: "#15803d",
  },

  securityText: {
    fontSize: "8px",
    color: "#6b9b88",
    marginTop: "2px",
  },

  // =========================
  // FIELDS
  // =========================

  fieldContainer: {
    marginBottom: "16px",
  },

  label: {
    display: "block",
    textAlign: "right",
    marginBottom: "7px",
    color: "#334155",
    fontSize: "10px",
    fontWeight: "800",
  },

  inputBox: {
    height: "52px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxSizing: "border-box",
    padding: "0 13px",
    borderRadius: "13px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    transition: "all 0.2s ease",
  },

  inputFocused: {
    border: "1px solid #818cf8",
    background: "#fff",
    boxShadow: "0 0 0 4px rgba(99,102,241,0.08)",
  },

  inputError: {
    border: "1px solid #fca5a5",
    background: "#fffafa",
  },

  inputIcon: {
    width: "28px",
    height: "28px",
    minWidth: "28px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "11px",
    transition: "all 0.2s ease",
  },

  inputIconFocused: {
    background: "#6366f1",
    color: "#fff",
  },

  input: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#172033",
    fontFamily: "inherit",
    fontSize: "11px",
    textAlign: "left",
  },

  eyeButton: {
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    fontSize: "13px",
    transition: "0.2s",
  },

  // =========================
  // OPTIONS
  // =========================

  options: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "4px 0 17px",
  },

  rememberLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "600",
    cursor: "pointer",
    userSelect: "none",
  },

  rememberHint: {
    color: "#a1acbb",
    fontSize: "8px",
  },

  // =========================
  // ERROR
  // =========================

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 12px",
    marginBottom: "14px",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#fff5f5,#fffafa)",
    border: "1px solid #fecaca",
    color: "#b91c1c",
  },

  errorIcon: {
    width: "27px",
    height: "27px",
    minWidth: "27px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fee2e2",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "900",
  },

  errorContent: {
    minWidth: 0,
  },

  errorTitle: {
    fontSize: "9px",
    fontWeight: "900",
    color: "#b91c1c",
  },

  errorText: {
    fontSize: "9px",
    color: "#dc2626",
    marginTop: "2px",
  },

  // =========================
  // BUTTON
  // =========================

  button: {
    width: "100%",
    height: "52px",
    border: "none",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "11px",
    background: "linear-gradient(135deg,#4f46e5 0%,#6366f1 50%,#7c3aed 100%)",
    color: "#fff",
    fontFamily: "inherit",
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(79,70,229,0.22)",
  },

  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  buttonArrow: {
    width: "26px",
    height: "26px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.15)",
    fontSize: "10px",
  },

  spinner: {
    width: "15px",
    height: "15px",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "loginSpin 0.75s linear infinite",
  },

  // =========================
  // FOOTER
  // =========================

  footer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "24px",
    paddingTop: "17px",
    borderTop: "1px solid #eef2f7",
  },

  footerIcon: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "12px",
  },

  footerTitle: {
    color: "#475569",
    fontSize: "9px",
    fontWeight: "800",
  },

  footerText: {
    color: "#9aa6b5",
    fontSize: "8px",
    marginTop: "3px",
  },

  footerShield: {
    color: "#cbd5e1",
    fontSize: "14px",
  },

  // =========================
  // COPYRIGHT
  // =========================

  copyright: {
    marginTop: "18px",
    color: "#a1acbb",
    fontSize: "8px",
    textAlign: "center",
  },

  copyrightDot: {
    margin: "0 7px",
    color: "#cbd5e1",
  },
};
