import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaRocket,
  FaStar,
} from "react-icons/fa";

export default function WelcomeEmployee() {
  const nav = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadEmployee();
  }, []);

  const loadEmployee = async () => {
    try {
      const res = await API.get("/employees/me");

      const data = res.data;

      // إذا كان الموظف شاهد الترحيب مسبقًا
      // لا نسمح له بالبقاء في صفحة الترحيب
      if (data.welcome_seen) {
        nav("/employee", {
          replace: true,
        });
        return;
      }

      setEmployee(data);
    } catch (err) {
      console.error(
        "Welcome employee error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        nav("/login", {
          replace: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (starting) return;

    try {
      setStarting(true);

      await API.put(
        "/employees/me/welcome"
      );

      // تحديث user الموجود في localStorage
      try {
        const storedUser =
          JSON.parse(
            localStorage.getItem("user") ||
              "{}"
          );

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            welcome_seen: true,
          })
        );
      } catch (error) {
        console.warn(
          "Could not update local user:",
          error
        );
      }

      nav("/employee", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Welcome completion error:",
        err
      );

      alert(
        "حدث خطأ أثناء بدء استخدام النظام، يرجى المحاولة مرة أخرى."
      );

      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loader} />

        <p style={styles.loadingText}>
          جاري تجهيز حسابك...
        </p>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <div style={styles.page} dir="rtl">
      {/* =========================================
          CONFETTI
      ========================================= */}

      <div style={styles.confettiContainer}>
        {Array.from(
          { length: 45 },
          (_, index) => (
            <span
              key={index}
              className="welcome-confetti"
              style={{
                ...styles.confetti,
                left: `${(index * 37) % 100}%`,
                animationDelay: `${
                  (index % 10) * 0.18
                }s`,
                animationDuration: `${
                  3 + (index % 5) * 0.5
                }s`,
                transform: `rotate(${
                  index * 23
                }deg)`,
              }}
            />
          )
        )}
      </div>

      {/* =========================================
          GLOW
      ========================================= */}

      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      {/* =========================================
          CONTENT
      ========================================= */}

      <div style={styles.content}>
        {/* Logo */}

        <div style={styles.logoWrapper}>
          <div style={styles.logo}>
            HR
          </div>

          <div style={styles.logoText}>
            نظام الموارد البشرية
          </div>
        </div>

        {/* Welcome Icon */}

        <div style={styles.welcomeIconWrapper}>
          <div style={styles.welcomeIcon}>
            <FaRocket />
          </div>

          <span
            style={{
              ...styles.star,
              top: "-5px",
              right: "-8px",
            }}
          >
            <FaStar />
          </span>

          <span
            style={{
              ...styles.star,
              bottom: "4px",
              left: "-10px",
              fontSize: "13px",
            }}
          >
            <FaStar />
          </span>
        </div>

        {/* Text */}

        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          حسابك جاهز الآن
        </div>

        <h1 style={styles.title}>
          أهلاً وسهلاً بك
        </h1>

        <h2 style={styles.name}>
          {employee.name}
        </h2>

        <p style={styles.description}>
          يسعدنا انضمامك إلى فريق العمل.
          <br />
          نتمنى لك تجربة مميزة وموفقة مع
          نظام الموارد البشرية.
        </p>

        {/* Features */}

        <div style={styles.features}>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              <FaCheckCircle />
            </div>

            <div>
              <strong style={styles.featureTitle}>
                إدارة مهامك
              </strong>

              <span style={styles.featureText}>
                تابع المهام والمراحل المطلوبة منك
              </span>
            </div>
          </div>

          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              <FaCheckCircle />
            </div>

            <div>
              <strong style={styles.featureTitle}>
                متابعة إجازاتك
              </strong>

              <span style={styles.featureText}>
                قدم طلبات الإجازة وتابع حالتها
              </span>
            </div>
          </div>

          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              <FaCheckCircle />
            </div>

            <div>
              <strong style={styles.featureTitle}>
                حسابك الشخصي
              </strong>

              <span style={styles.featureText}>
                اطلع على بياناتك وإعدادات حسابك
              </span>
            </div>
          </div>
        </div>

        {/* Button */}

        <button
          type="button"
          onClick={handleStart}
          disabled={starting}
          style={{
            ...styles.button,
            ...(starting
              ? styles.buttonDisabled
              : {}),
          }}
        >
          {starting ? (
            <>
              <span style={styles.spinner} />
              جاري البدء...
            </>
          ) : (
            <>
              <span>
                ابدأ الآن
              </span>

              <span style={styles.buttonIcon}>
                <FaArrowLeft />
              </span>
            </>
          )}
        </button>

        <p style={styles.footerText}>
          مرحباً بك في فريقنا ✨
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #faf9ff 100%)",
    fontFamily:
      "Cairo, Tahoma, Arial, sans-serif",
  },

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #f8faff, #eef2ff)",
    fontFamily:
      "Cairo, Tahoma, Arial, sans-serif",
    direction: "rtl",
  },

  loader: {
    width: "38px",
    height: "38px",
    border: "4px solid #e0e7ff",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation:
      "welcomeSpin 0.8s linear infinite",
  },

  loadingText: {
    marginTop: "15px",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "700",
  },

  glowOne: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "rgba(99,102,241,0.13)",
    filter: "blur(100px)",
    top: "-280px",
    right: "-150px",
    pointerEvents: "none",
  },

  glowTwo: {
    position: "absolute",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background:
      "rgba(139,92,246,0.10)",
    filter: "blur(100px)",
    bottom: "-260px",
    left: "-150px",
    pointerEvents: "none",
  },

  confettiContainer: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: 1,
  },

  confetti: {
    position: "absolute",
    top: "-30px",
    width: "8px",
    height: "14px",
    borderRadius: "3px",
    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",
    opacity: 0.7,
    animation:
      "welcomeFall linear infinite",
  },

  content: {
    position: "relative",
    zIndex: 5,
    width: "100%",
    maxWidth: "650px",
    padding: "45px 45px 35px",
    boxSizing: "border-box",
    textAlign: "center",
    background:
      "rgba(255,255,255,0.90)",
    border:
      "1px solid rgba(255,255,255,0.95)",
    borderRadius: "32px",
    boxShadow:
      "0 30px 80px rgba(30,41,100,0.12)",
    backdropFilter: "blur(20px)",
    animation:
      "welcomeFadeUp 0.7s ease both",
  },

  logoWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "25px",
  },

  logo: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "900",
    boxShadow:
      "0 10px 25px rgba(79,70,229,0.25)",
  },

  logoText: {
    color: "#334155",
    fontSize: "12px",
    fontWeight: "800",
  },

  welcomeIconWrapper: {
    position: "relative",
    width: "92px",
    height: "92px",
    margin: "0 auto 20px",
  },

  welcomeIcon: {
    width: "92px",
    height: "92px",
    borderRadius: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontSize: "34px",
    boxShadow:
      "0 20px 45px rgba(99,102,241,0.28)",
    animation:
      "welcomeFloat 3s ease-in-out infinite",
  },

  star: {
    position: "absolute",
    color: "#f59e0b",
    fontSize: "17px",
    filter:
      "drop-shadow(0 4px 8px rgba(245,158,11,0.2))",
    animation:
      "welcomeStar 2s ease-in-out infinite",
  },

  badge: {
    width: "fit-content",
    margin: "0 auto 14px",
    padding: "7px 13px",
    borderRadius: "20px",
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "10px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  badgeDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#10b981",
  },

  title: {
    margin: 0,
    color: "#172033",
    fontSize: "32px",
    fontWeight: "900",
    lineHeight: "1.4",
  },

  name: {
    margin: "4px 0 10px",
    color: "#6366f1",
    fontSize: "25px",
    fontWeight: "900",
  },

  description: {
    margin: "0 auto",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: "2",
    maxWidth: "470px",
  },

  features: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "10px",
    marginTop: "28px",
    marginBottom: "25px",
  },

  feature: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "15px 10px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #eef2f7",
  },

  featureIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "12px",
  },

  featureTitle: {
    display: "block",
    color: "#334155",
    fontSize: "9px",
    fontWeight: "900",
  },

  featureText: {
    display: "block",
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "7px",
    lineHeight: "1.6",
  },

  button: {
    width: "100%",
    maxWidth: "330px",
    height: "53px",
    border: "none",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    margin: "0 auto",
    background:
      "linear-gradient(135deg,#4f46e5,#6366f1,#7c3aed)",
    color: "#fff",
    fontFamily: "inherit",
    fontSize: "12px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow:
      "0 15px 35px rgba(79,70,229,0.25)",
    transition:
      "transform .2s ease, box-shadow .2s ease",
  },

  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  buttonIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(255,255,255,0.15)",
    fontSize: "10px",
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
      "welcomeSpin .7s linear infinite",
  },

  footerText: {
    margin: "18px 0 0",
    color: "#a1acbb",
    fontSize: "9px",
  },
};

const welcomeAnimationStyle = document.createElement(
  "style"
);

welcomeAnimationStyle.innerHTML = `
  @keyframes welcomeSpin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @keyframes welcomeFall {
    0% {
      top: -30px;
      opacity: 0;
    }

    10% {
      opacity: 0.8;
    }

    90% {
      opacity: 0.7;
    }

    100% {
      top: 110%;
      opacity: 0;
      transform:
        translateX(80px)
        rotate(500deg);
    }
  }

  @keyframes welcomeFadeUp {
    from {
      opacity: 0;
      transform: translateY(25px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes welcomeFloat {
    0%, 100% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-8px);
    }
  }

  @keyframes welcomeStar {
    0%, 100% {
      transform: scale(1);
      opacity: .8;
    }

    50% {
      transform: scale(1.25);
      opacity: 1;
    }
  }

  @media (max-width: 600px) {
    .welcome-content {
      padding: 35px 20px !important;
    }
  }
`;

if (
  !document.getElementById(
    "welcome-employee-animations"
  )
) {
  welcomeAnimationStyle.id =
    "welcome-employee-animations";

  document.head.appendChild(
    welcomeAnimationStyle
  );
}