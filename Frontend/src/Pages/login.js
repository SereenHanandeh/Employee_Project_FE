import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

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

  // 🎯 Validation
  const validate = () => {
    if (!email || !password) {
      return "يرجى تعبئة جميع الحقول";
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return "البريد الإلكتروني غير صالح";
    }

    if (password.length < 4) {
      return "كلمة المرور قصيرة جداً";
    }

    return "";
  };

  const handleLogin = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // 🔐 حفظ التوكن
      localStorage.setItem("token", token);

      // 🔐 Remember me
      if (remember) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      // التوجيه
      if (user.role === "admin") {
        nav("/dashboard");
      } else {
        nav("/employee");
      }
    } catch (err) {
      setError("البريد أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>👋 أهلاً بعودتك</h2>
        <p style={styles.subtitle}>سجّل الدخول إلى حسابك</p>

        {/* EMAIL */}
        <div style={styles.inputBox}>
          <FaEnvelope style={styles.icon} />
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* PASSWORD */}
        <div style={styles.inputBox}>
          <FaLock style={styles.icon} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="كلمة المرور"
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eye}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* REMEMBER ME */}
        <div style={styles.remember}>
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            تذكرني
          </label>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleLogin} style={styles.button}>
          {loading ? "جاري الدخول..." : "تسجيل الدخول"}
        </button>
      </div>
    </div>
  );
}

/* ================= STYLE ================= */

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #6c6eee, #3b82f6)",
    fontFamily: "Cairo, sans-serif",
  },

  card: {
    background: "rgba(255,255,255,0.95)",
    padding: "40px",
    borderRadius: "20px",
    width: "350px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    backdropFilter: "blur(10px)",
    textAlign: "center",
  },

  title: {
    marginBottom: "5px",
    color: "#1e293b",
  },

  subtitle: {
    marginBottom: "25px",
    color: "#64748b",
    fontSize: "14px",
  },

  inputBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
    border: "1px solid #e2e8f0",
    padding: "12px",
    borderRadius: "12px",
    background: "#f8fafc",
    position: "relative",
  },

  icon: {
    color: "#6366f1",
  },

  input: {
    border: "none",
    outline: "none",
    flex: 1,
    background: "transparent",
    fontSize: "14px",
  },

  eye: {
    cursor: "pointer",
    color: "#64748b",
  },

  remember: {
    textAlign: "left",
    marginBottom: "10px",
    fontSize: "13px",
    color: "#475569",
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
    transition: "0.3s",
  },

  error: {
    color: "#ef4444",
    fontSize: "13px",
    marginBottom: "10px",
  },
};