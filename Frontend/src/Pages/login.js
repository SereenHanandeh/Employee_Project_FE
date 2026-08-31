
import { useState } from "react";
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
} from "react-icons/fa";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState(
    localStorage.getItem("rememberEmail") || ""
  );

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [remember, setRemember] = useState(
    !!localStorage.getItem("rememberEmail")
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // VALIDATION
  // =========================

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      return "يرجى تعبئة جميع الحقول";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "البريد الإلكتروني غير صالح";
    }

    if (password.length < 4) {
      return "كلمة المرور قصيرة جداً";
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

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (remember) {
        localStorage.setItem("rememberEmail", email.trim());
      } else {
        localStorage.removeItem("rememberEmail");
      }

      if (user.role === "admin") {
        nav("/admin-dashboard");
      } else {
        nav("/employee");
      }
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "البريد الإلكتروني أو كلمة المرور غير صحيحة"
      );
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

  return (
    <div style={styles.wrapper}>

      {/* =========================
          BACKGROUND
      ========================= */}

      <div style={styles.backgroundCircleOne} />
      <div style={styles.backgroundCircleTwo} />
      <div style={styles.backgroundCircleThree} />

      {/* =========================
          BACK TO HOME
      ========================= */}

      <button
        style={styles.homeButton}
        onClick={() => nav("/")}
      >
        <FaArrowRight />
        الرئيسية
      </button>

      {/* =========================
          LOGIN CARD
      ========================= */}

      <div style={styles.card}>

        {/* =========================
            LOGO
        ========================= */}

        <div style={styles.logoWrapper}>
          <div style={styles.logo}>
            HR
          </div>
        </div>

        {/* =========================
            TITLE
        ========================= */}

        <h1 style={styles.title}>
          أهلاً بعودتك 👋
        </h1>

        <p style={styles.subtitle}>
          سجّل الدخول للوصول إلى نظام إدارة الموظفين
        </p>

        {/* =========================
            SECURITY BADGE
        ========================= */}

        <div style={styles.securityBadge}>
          <FaShieldAlt />

          <span>
            تسجيل دخول آمن ومحمي
          </span>
        </div>

        {/* =========================
            EMAIL
        ========================= */}

        <div style={styles.fieldContainer}>

          <label style={styles.label}>
            البريد الإلكتروني
          </label>

          <div
            style={{
              ...styles.inputBox,
              ...(error && !email
                ? styles.inputError
                : {}),
            }}
          >
            <FaEnvelope style={styles.icon} />

            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              style={styles.input}
              autoComplete="email"
            />
          </div>

        </div>

        {/* =========================
            PASSWORD
        ========================= */}

        <div style={styles.fieldContainer}>

          <label style={styles.label}>
            كلمة المرور
          </label>

          <div style={styles.inputBox}>

            <FaLock style={styles.icon} />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              style={styles.input}
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              style={styles.eyeButton}
              aria-label={
                showPassword
                  ? "إخفاء كلمة المرور"
                  : "إظهار كلمة المرور"
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

        </div>

        {/* =========================
            REMEMBER ME
        ========================= */}

        <div style={styles.options}>

          <label style={styles.rememberLabel}>

            <input
              type="checkbox"
              checked={remember}
              onChange={(e) =>
                setRemember(e.target.checked)
              }
              style={styles.checkbox}
            />

            <span>
              تذكرني
            </span>

          </label>

        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div style={styles.errorBox}>

            <span style={styles.errorIcon}>
              !
            </span>

            <span>
              {error}
            </span>

          </div>
        )}

        {/* =========================
            LOGIN BUTTON
        ========================= */}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading
              ? styles.buttonDisabled
              : {}),
          }}
        >

          {loading ? (
            <>
              <span style={styles.spinner} />
              جاري تسجيل الدخول...
            </>
          ) : (
            <>
              تسجيل الدخول

              <FaArrowRight
                style={{
                  transform: "rotate(180deg)",
                }}
              />
            </>
          )}

        </button>

        {/* =========================
            FOOTER
        ========================= */}

        <div style={styles.footer}>

          <div style={styles.footerIcon}>
            <FaUsers />
          </div>

          <div>

            <div style={styles.footerTitle}>
              نظام إدارة الموظفين
            </div>

            <div style={styles.footerText}>
              إدارة الموظفين والأداء والإجازات بسهولة
            </div>

          </div>

        </div>

      </div>

      {/* =========================
          COPYRIGHT
      ========================= */}

      <div style={styles.copyright}>
        © 2026 نظام إدارة الموظفين — جميع الحقوق محفوظة
      </div>

    </div>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = {

  /* =========================
     PAGE
  ========================= */

  wrapper: {
    minHeight: "100vh",
    width: "100%",
    position: "relative",
    overflow: "hidden",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    padding: "30px 20px",
    boxSizing: "border-box",

    background:
      "linear-gradient(135deg, #f8fbff 0%, #eef5ff 50%, #f8faff 100%)",

    fontFamily:
      "Cairo, Tahoma, Arial, sans-serif",

    direction: "rtl",
  },

  /* =========================
     BACKGROUND CIRCLES
  ========================= */

  backgroundCircleOne: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",

    background:
      "rgba(99,102,241,0.09)",

    filter: "blur(80px)",

    top: "-180px",
    right: "-120px",

    pointerEvents: "none",
  },

  backgroundCircleTwo: {
    position: "absolute",
    width: "350px",
    height: "350px",
    borderRadius: "50%",

    background:
      "rgba(59,130,246,0.08)",

    filter: "blur(80px)",

    bottom: "-130px",
    left: "-100px",

    pointerEvents: "none",
  },

  backgroundCircleThree: {
    position: "absolute",
    width: "220px",
    height: "220px",
    borderRadius: "50%",

    background:
      "rgba(139,92,246,0.05)",

    filter: "blur(70px)",

    top: "40%",
    left: "45%",

    pointerEvents: "none",
  },

  /* =========================
     HOME BUTTON
  ========================= */

  homeButton: {
    position: "absolute",

    top: "25px",
    right: "25px",

    display: "flex",
    alignItems: "center",

    gap: "8px",

    padding: "10px 16px",

    borderRadius: "11px",

    border:
      "1px solid #dbe5f2",

    background:
      "rgba(255,255,255,0.85)",

    color: "#475569",

    cursor: "pointer",

    fontFamily: "inherit",

    fontWeight: "700",

    fontSize: "12px",

    boxShadow:
      "0 6px 20px rgba(15,23,42,0.06)",

    transition: "0.2s",

    zIndex: 10,
  },

  /* =========================
     CARD
  ========================= */

  card: {
    width: "100%",
    maxWidth: "430px",

    boxSizing: "border-box",

    padding: "38px",

    borderRadius: "24px",

    background:
      "rgba(255,255,255,0.96)",

    border:
      "1px solid #e5edf7",

    boxShadow:
      "0 25px 70px rgba(30,64,175,0.12)",

    position: "relative",

    zIndex: 2,
  },

  /* =========================
     LOGO
  ========================= */

  logoWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },

  logo: {
    width: "68px",
    height: "68px",

    borderRadius: "20px",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",

    color: "#fff",

    fontSize: "22px",
    fontWeight: "900",

    boxShadow:
      "0 12px 30px rgba(99,102,241,0.25)",
  },

  /* =========================
     TITLE
  ========================= */

  title: {
    margin: 0,

    textAlign: "center",

    color: "#172033",

    fontSize: "25px",

    fontWeight: "800",
  },

  subtitle: {
    textAlign: "center",

    margin:
      "8px 0 20px",

    color: "#64748b",

    fontSize: "13px",

    lineHeight: "1.7",
  },

  /* =========================
     SECURITY
  ========================= */

  securityBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "7px",

    width: "fit-content",

    margin:
      "0 auto 25px",

    padding: "7px 12px",

    borderRadius: "20px",

    background:
      "#ecfdf5",

    border:
      "1px solid #bbf7d0",

    color: "#15803d",

    fontSize: "10px",

    fontWeight: "700",
  },

  /* =========================
     FIELD
  ========================= */

  fieldContainer: {
    marginBottom: "17px",
  },

  label: {
    display: "block",

    color: "#334155",

    fontSize: "12px",

    fontWeight: "700",

    marginBottom: "7px",

    textAlign: "right",
  },

  inputBox: {
    display: "flex",

    alignItems: "center",

    gap: "10px",

    height: "50px",

    boxSizing: "border-box",

    padding: "0 13px",

    borderRadius: "12px",

    background: "#f8fafc",

    border:
      "1px solid #dbe4ef",

    transition: "0.2s",
  },

  inputError: {
    border:
      "1px solid #f87171",

    background:
      "#fffafa",
  },

  icon: {
    color: "#6366f1",

    fontSize: "15px",

    minWidth: "16px",
  },

  input: {
    flex: 1,

    width: "100%",

    border: "none",

    outline: "none",

    background: "transparent",

    color: "#172033",

    fontSize: "13px",

    fontFamily: "inherit",

    direction: "ltr",

    textAlign: "left",
  },

  eyeButton: {
    border: "none",

    background: "transparent",

    color: "#94a3b8",

    cursor: "pointer",

    display: "flex",

    alignItems: "center",

    padding: "4px",

    fontSize: "15px",
  },

  /* =========================
     OPTIONS
  ========================= */

  options: {
    display: "flex",

    justifyContent: "flex-start",

    alignItems: "center",

    margin:
      "3px 0 15px",
  },

  rememberLabel: {
    display: "flex",

    alignItems: "center",

    gap: "7px",

    color: "#64748b",

    fontSize: "12px",

    cursor: "pointer",
  },

  checkbox: {
    width: "15px",
    height: "15px",

    accentColor: "#6366f1",

    cursor: "pointer",
  },

  /* =========================
     ERROR
  ========================= */

  errorBox: {
    display: "flex",

    alignItems: "center",

    gap: "9px",

    padding: "10px 12px",

    marginBottom: "13px",

    borderRadius: "10px",

    background:
      "#fff1f2",

    border:
      "1px solid #fecdd3",

    color: "#dc2626",

    fontSize: "11px",

    textAlign: "right",
  },

  errorIcon: {
    width: "19px",
    height: "19px",

    minWidth: "19px",

    borderRadius: "50%",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    background:
      "#fee2e2",

    fontWeight: "800",
  },

  /* =========================
     BUTTON
  ========================= */

  button: {
    width: "100%",

    height: "50px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "10px",

    border: "none",

    borderRadius: "12px",

    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",

    color: "#fff",

    fontFamily: "inherit",

    fontSize: "13px",

    fontWeight: "700",

    cursor: "pointer",

    boxShadow:
      "0 10px 25px rgba(99,102,241,0.22)",

    transition: "0.2s",
  },

  buttonDisabled: {
    opacity: 0.65,

    cursor: "not-allowed",

    boxShadow: "none",
  },

  /* =========================
     SPINNER
  ========================= */

  spinner: {
    width: "16px",

    height: "16px",

    border:
      "2px solid rgba(255,255,255,0.35)",

    borderTop:
      "2px solid #fff",

    borderRadius: "50%",

    animation:
      "loginSpin 0.8s linear infinite",
  },

  /* =========================
     FOOTER
  ========================= */

  footer: {
    display: "flex",

    alignItems: "center",

    gap: "10px",

    marginTop: "25px",

    paddingTop: "18px",

    borderTop:
      "1px solid #edf2f7",
  },

  footerIcon: {
    width: "35px",

    height: "35px",

    borderRadius: "9px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    background:
      "#eef2ff",

    color: "#6366f1",

    fontSize: "14px",
  },

  footerTitle: {
    color: "#334155",

    fontSize: "11px",

    fontWeight: "700",
  },

  footerText: {
    color: "#94a3b8",

    fontSize: "9px",

    marginTop: "2px",
  },

  /* =========================
     COPYRIGHT
  ========================= */

  copyright: {
    position: "absolute",

    bottom: "15px",

    left: 0,

    right: 0,

    textAlign: "center",

    color: "#94a3b8",

    fontSize: "10px",

    zIndex: 1,
  },
};

/* =====================================================
   ANIMATION + RESPONSIVE
===================================================== */

if (typeof document !== "undefined") {
  const styleId = "login-page-styles";

  if (!document.getElementById(styleId)) {
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

      input::placeholder {
        color: #94a3b8;
      }

      button {
        transition: all 0.2s ease;
      }

      button:hover:not(:disabled) {
        transform: translateY(-2px);
      }

      @media (max-width: 600px) {
        .login-card {
          padding: 28px 22px;
        }
      }

      @media (max-width: 480px) {
        body {
          overflow-x: hidden;
        }
      }
    `;

    document.head.appendChild(style);
  }
}
