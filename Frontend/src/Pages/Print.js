import html2pdf from "html2pdf.js";
import { performance, personality, relations } from "../data/criteria";
import { useRef, useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function Print() {
  const printRef = useRef();
  const nav = useNavigate();
  const { state } = useLocation();

  const [data, setData] = useState(null);

  // ✅ أخذ ID من Result page
  const evaluationId = state?.evaluationId;

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/evaluations/${evaluationId}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        alert("فشل تحميل بيانات التقييم");
      }
    };

    if (evaluationId) fetchData();
  }, [evaluationId]);

  if (!data) return <p>جاري تحميل البيانات...</p>;

  /* ================= DATA ================= */
  const emp = {
    name: data.name,
    major: data.major,
    degree: data.degree,
  };

  const perf = data.performance_details || {};
  const pers = data.personality_details || {};
  const rel = data.relations_details || {};

  const pTotal = data.performance;
  const peTotal = data.personality;
  const rTotal = data.relations;
  const total = data.total;
  const grade = data.grade;

  const mark = (g) => (grade === g ? "✔" : "☐");

  /* ================= PDF ================= */
  const downloadPDF = () => {
    html2pdf()
      .set({
        margin: 10,
        filename: "evaluation.pdf",
        jsPDF: { unit: "mm", format: "a4" },
      })
      .from(printRef.current)
      .save();
  };

  const TableSection = ({ dataList, values }) => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.cell}>العنصر</th>
          <th style={styles.cell}>العظمى</th>
          <th style={styles.cell}>الدرجة</th>
        </tr>
      </thead>
      <tbody>
        {dataList.map((item, i) => (
          <tr key={i}>
            <td style={styles.cell}>{item.title}</td>
            <td style={styles.cell}>{item.max}</td>
            <td style={styles.cell}>{values[i] ?? ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={{ padding: 15 }}>
      <div ref={printRef} style={styles.paper}>
        <h3 style={{ textAlign: "center" }}>
          بسم الله الرحمن الرحيم
        </h3>

        <h2 style={{ textAlign: "center" }}>
          الأداء الوظيفي في قسم Blackboard
        </h2>

        {/* بيانات الموظف */}
        <table style={styles.table}>
          <tbody>
            <tr>
              <td style={styles.cell}>القسم</td>
              <td style={styles.cell}>Blackboard</td>
              <td style={styles.cell}>فترة التقييم</td>
              <td style={styles.cell}>-</td>
            </tr>

            <tr>
              <td style={styles.cell}>الاسم</td>
              <td style={styles.cell}>{emp.name}</td>
              <td style={styles.cell}>المؤهل</td>
              <td style={styles.cell}>{emp.degree}</td>
            </tr>

            <tr>
              <td style={styles.cell}>التخصص</td>
              <td style={styles.cell}>{emp.major}</td>
              <td style={styles.cell}></td>
              <td style={styles.cell}></td>
            </tr>
          </tbody>
        </table>

        {/* المجاميع */}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.cell}>الأداء</th>
              <th style={styles.cell}>الشخصية</th>
              <th style={styles.cell}>العلاقات</th>
              <th style={styles.cell}>المجموع</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={styles.cell}>{pTotal}</td>
              <td style={styles.cell}>{peTotal}</td>
              <td style={styles.cell}>{rTotal}</td>
              <td style={styles.cell}>{total}</td>
            </tr>
          </tbody>
        </table>

        {/* التقدير */}
        <table style={styles.table}>
          <tbody>
            <tr>
              <td style={styles.cell}>ممتاز (90-100)</td>
              <td style={styles.cell}>{mark("ممتاز")}</td>
              <td style={styles.cell}>جيد جداً (75-89)</td>
              <td style={styles.cell}>{mark("جيد جدا")}</td>
            </tr>

            <tr>
              <td style={styles.cell}>جيد (60-74)</td>
              <td style={styles.cell}>{mark("جيد")}</td>
              <td style={styles.cell}>ضعيف</td>
              <td style={styles.cell}>{mark("ضعيف")}</td>
            </tr>
          </tbody>
        </table>

        {/* التفاصيل */}
        <h3>الأداء الوظيفي</h3>
        <TableSection dataList={performance} values={perf} />
        <p>المجموع: {pTotal}</p>

        <h3>الصفات الشخصية</h3>
        <TableSection dataList={personality} values={pers} />
        <p>المجموع: {peTotal}</p>

        <h3>العلاقات</h3>
        <TableSection dataList={relations} values={rel} />
        <p>المجموع: {rTotal}</p>

        <h3>المجموع الكلي: {total}</h3>
        <h3>التقدير: {grade}</h3>

        <h3>الملاحظات</h3>
        <p>{data.notes || "لا يوجد ملاحظات"}</p>

        <div style={{ marginTop: 30 }}>
          <p>التوقيع: ____________</p>
          <p>التاريخ: ____________</p>
        </div>

        {/* أزرار */}
        <div style={styles.buttonsContainer}>
          <button onClick={downloadPDF} style={styles.pdfButton}>
            📄 تحميل PDF
          </button>

          <button onClick={() => window.print()} style={styles.printButton}>
            🖨 طباعة
          </button>

          <button
            onClick={() => nav("/dashboard")}
            style={styles.backButton}
          >
            ⬅ الرجوع
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Styles =====
const styles = {
  paper: {
    width: "150mm",
    minHeight: "297mm",
    margin: "auto",
    padding: "10mm",
    border: "1px solid black",
    fontFamily: "Tahoma",
    fontSize: "13px",
    direction: "rtl",
    background: "#fff",
  },

  table: {
    width: "90%",
    borderCollapse: "collapse",
    marginBottom: 10,
  },

  cell: {
    border: "1px solid black",
    padding: "5px",
    textAlign: "center",
  },

  // ===== الأزرار =====
  buttonsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "20px",
    flexWrap: "wrap",
  },

  pdfButton: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
    color: "#fff",
    fontWeight: "600",
  },

  printButton: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(90deg, #10b981, #059669)",
    color: "#fff",
    fontWeight: "600",
  },

  backButton: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "#ef4444",
    color: "#fff",
    fontWeight: "600",
  },
};