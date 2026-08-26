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

      // حفظ التوكن
      localStorage.setItem("token", token);

      // حفظ بيانات المستخدم
      localStorage.setItem("user", JSON.stringify(user));

      // Remember Me
      if (remember) {
        localStorage.setItem("rememberEmail", email.trim());
      } else {
        localStorage.removeItem("rememberEmail");
      }

      // التوجيه حسب الصلاحية
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
          BACKGROUND EFFECTS
      ========================= */}

      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

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

        {/* Logo */}

        <div style={styles.logoWrapper}>
          <div style={styles.logo}>
            HR
          </div>
        </div>

        {/* Title */}

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
                  transform:
                    "rotate(180deg)",
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
        © 2026 نظام إدارة الموظفين
      </div>

    </div>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = {
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
      "radial-gradient(circle at top right, rgba(99,102,241,0.25), transparent 35%), radial-gradient(circle at bottom left, rgba(59,130,246,0.18), transparent 35%), linear-gradient(135deg, #020617 0%, #0f172a 50%, #111827 100%)",

    fontFamily:
      "Cairo, Tahoma, Arial, sans-serif",

    direction: "rtl",
  },

  /* =========================
     GLOW
  ========================= */

  glowOne: {
    position: "absolute",
    width: "350px",
    height: "350px",

    borderRadius: "50%",

    background:
      "rgba(99,102,241,0.12)",

    filter: "blur(80px)",

    top: "-120px",
    right: "-100px",

    pointerEvents: "none",
  },

  glowTwo: {
    position: "absolute",
    width: "300px",
    height: "300px",

    borderRadius: "50%",

    background:
      "rgba(59,130,246,0.10)",

    filter: "blur(80px)",

    bottom: "-100px",
    left: "-100px",

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

    padding: "10px 15px",

    borderRadius: "10px",

    border:
      "1px solid rgba(255,255,255,0.10)",

    background:
      "rgba(255,255,255,0.05)",

    backdropFilter: "blur(10px)",

    color: "#cbd5e1",

    cursor: "pointer",

    fontFamily: "inherit",
    fontWeight: "600",

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
      "linear-gradient(145deg, rgba(15,23,42,0.92), rgba(15,23,42,0.78))",

    border:
      "1px solid rgba(255,255,255,0.10)",

    backdropFilter: "blur(25px)",

    boxShadow:
      "0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(99,102,241,0.04)",

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
      "0 15px 35px rgba(99,102,241,0.35)",

    border:
      "1px solid rgba(255,255,255,0.15)",
  },

  /* =========================
     TITLE
  ========================= */

  title: {
    margin: 0,

    textAlign: "center",

    color: "#f8fafc",

    fontSize: "25px",

    fontWeight: "800",
  },

  subtitle: {
    textAlign: "center",

    margin:
      "8px 0 20px",

    color: "#94a3b8",

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
      "rgba(34,197,94,0.08)",

    border:
      "1px solid rgba(34,197,94,0.15)",

    color: "#4ade80",

    fontSize: "10px",
    fontWeight: "600",
  },

  /* =========================
     FIELD
  ========================= */

  fieldContainer: {
    marginBottom: "17px",
  },

  label: {
    display: "block",

    color: "#cbd5e1",

    fontSize: "12px",

    fontWeight: "600",

    marginBottom: "7px",

    textAlign: "right",
  },

  inputBox: {
    display: "flex",
    alignItems: "center",

    gap: "10px",

    height: "48px",

    boxSizing: "border-box",

    padding:
      "0 13px",

    borderRadius: "12px",

    background:
      "rgba(255,255,255,0.045)",

    border:
      "1px solid rgba(255,255,255,0.09)",

    transition: "0.2s",
  },

  inputError: {
    border:
      "1px solid rgba(239,68,68,0.5)",
  },

  icon: {
    color: "#818cf8",

    fontSize: "15px",

    minWidth: "16px",
  },

  input: {
    flex: 1,

    width: "100%",

    border: "none",
    outline: "none",

    background: "transparent",

    color: "#f8fafc",

    fontSize: "13px",

    fontFamily: "inherit",

    direction: "ltr",

    textAlign: "left",
  },

  eyeButton: {
    border: "none",

    background: "transparent",

    color: "#64748b",

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

    justifyContent:
      "flex-start",

    alignItems: "center",

    margin:
      "3px 0 15px",
  },

  rememberLabel: {
    display: "flex",

    alignItems: "center",

    gap: "7px",

    color: "#94a3b8",

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
      "rgba(239,68,68,0.08)",

    border:
      "1px solid rgba(239,68,68,0.18)",

    color: "#f87171",

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
      "rgba(239,68,68,0.15)",

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
      "0 10px 25px rgba(99,102,241,0.25)",

    transition: "0.2s",
  },

  buttonDisabled: {
    opacity: 0.65,

    cursor: "not-allowed",

    boxShadow: "none",
  },

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
      "1px solid rgba(255,255,255,0.06)",
  },

  footerIcon: {
    width: "35px",
    height: "35px",

    borderRadius: "9px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    background:
      "rgba(99,102,241,0.12)",

    color: "#818cf8",

    fontSize: "14px",
  },

  footerTitle: {
    color: "#cbd5e1",

    fontSize: "11px",

    fontWeight: "700",
  },

  footerText: {
    color: "#64748b",

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

    color: "#475569",

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
        color: #475569;
      }

      button:hover:not(:disabled) {
        opacity: 0.92;
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