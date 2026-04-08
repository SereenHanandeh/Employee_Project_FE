import html2pdf from "html2pdf.js";
import { useRef, useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate, useLocation } from "react-router-dom";
import { performance, personality, relations } from "../data/criteria";

export default function Print() {
  const printRef = useRef();
  // eslint-disable-next-line no-unused-vars
  const nav = useNavigate();
  const { state } = useLocation();

  const [data, setData] = useState(null);

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
    name: data.name || "غير متوفر",
    major: data.major || "-",
    degree: data.degree || "-",
  };

  const perf = data.performance_details || {};
  const pers = data.personality_details || {};
  const rel = data.relations_details || {};

  const pTotal = data.performance || 0;
  const peTotal = data.personality || 0;
  const rTotal = data.relations || 0;
  const total = data.total || 0;
  const grade = data.grade || "لا يوجد";

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
    <div ref={printRef} style={styles.paper}>
      <h3 style={{ textAlign: "center" }}>بسم الله الرحمن الرحيم</h3>
      <h2 style={{ textAlign: "center" }}>الأداء الوظيفي في قسم Blackboard</h2>

      {/* ===== بيانات الموظف ===== */}
      <table style={styles.table}>
        <tbody>
          <tr>
            <td>القسم</td>
            <td>Blackboard</td>
            <td>فترة التقييم</td>
            <td>
              {data.from_date} - {data.to_date}
            </td>
          </tr>

          <tr>
            <td>الاسم</td>
            <td>{emp.name}</td>
            <td>المؤهل</td>
            <td>{emp.degree || "-"}</td>
          </tr>

          <tr>
            <td>التخصص</td>
            <td>{emp.major || "-"}</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* ===== الجسم الرئيسي ===== */}
      <div style={{ display: "flex", gap: "10px" }}>
        {/* ===== اليسار ===== */}
        <div style={{ width: "40%" }}>
          {/* المجاميع */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th>الأداء</th>
                <th>الشخصية</th>
                <th>العلاقات</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{pTotal}</td>
                <td>{peTotal}</td>
                <td>{rTotal}</td>
                <td>{total}</td>
              </tr>
            </tbody>
          </table>

          {/* التقدير */}
          <table style={styles.table}>
            <tbody>
              <tr>
                <td>ممتاز (100-90)</td>
                <td>{mark("ممتاز")}</td>
              </tr>
              <tr>
                <td>جيد جداً (89-75)</td>
                <td>{mark("جيد جدا")}</td>
              </tr>
              <tr>
                <td>جيد (74-60)</td>
                <td>{mark("جيد")}</td>
              </tr>
              <tr>
                <td>ضعيف</td>
                <td>{mark("ضعيف")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== اليمين ===== */}
        <div style={{ width: "60%" }}>
          {/* الأداء */}
          <h4>الأداء الوظيفي</h4>
          <TableSection dataList={performance} values={perf} />

          {/* الشخصية */}
          <h4>الصفات الشخصية</h4>
          <TableSection dataList={personality} values={pers} />

          {/* العلاقات */}
          <h4>العلاقات</h4>
          <TableSection dataList={relations} values={rel} />
        </div>
      </div>

      <h3>المجموع الكلي: {total}</h3>
      <h3>التقدير: {grade}</h3>

      <h3>الملاحظات</h3>
      <p>{data.notes || "لا يوجد ملاحظات"}</p>

      <div style={styles.buttonsContainer}>
        <button onClick={downloadPDF} style={styles.pdfButton}>
          📄 تحميل PDF
        </button>

        <button onClick={() => window.print()} style={styles.printButton}>
          🖨 طباعة
        </button>
      </div>
    </div>
  );
}

// ===== Styles =====
const styles = {
  paper: {
    width: "180mm",
    margin: "auto",
    padding: "10mm",
    border: "2px solid black",
    fontFamily: "Tahoma",
    fontSize: "13px",
    direction: "rtl",
    background: "#fff",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "10px",
  },

  cell: {
    border: "1px solid black",
    padding: "6px",
    textAlign: "center",
  },
};
