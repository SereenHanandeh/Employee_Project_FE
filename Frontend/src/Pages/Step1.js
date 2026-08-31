import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./Step1.css";

export default function Step1() {
  const nav = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [loading, setLoading] = useState(true);

  // =========================================================
  // FETCH DATA
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      nav("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const [empRes, leavesRes] = await Promise.all([
          API.get("/employees"),
          API.get("/leaves"),
        ]);

        setEmployees(
          Array.isArray(empRes.data) ? empRes.data : []
        );

        setLeaves(
          Array.isArray(leavesRes.data) ? leavesRes.data : []
        );
      } catch (err) {
        console.error("Step1 Fetch Error:", err);

        alert(
          err.response?.data?.message ||
            "فشل تحميل بيانات الموظفين والإجازات"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nav]);

  // =========================================================
  // TODAY
  // =========================================================

  const today = new Date().toISOString().split("T")[0];

  // =========================================================
  // CHECK EMPLOYEE LEAVE
  // =========================================================

  const isOnLeave = (id) => {
    if (!id) return false;

    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);

    return leaves.some((leave) => {
      const leaveEmployeeId =
        leave.employee_id ??
        leave.employee?.employee_id;

      if (String(leaveEmployeeId) !== String(id)) {
        return false;
      }

      if (leave.status !== "approved") {
        return false;
      }

      const fromDate = new Date(leave.from_date);
      const toDate = new Date(leave.to_date);

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      return (
        fromDate <= currentDate &&
        toDate >= currentDate
      );
    });
  };

  // =========================================================
  // SELECTED EMPLOYEE
  // =========================================================

  const selectedEmployee = useMemo(() => {
    return employees.find(
      (employee) =>
        String(employee.employee_id) === String(employeeId)
    );
  }, [employees, employeeId]);

  // =========================================================
  // SELECTED EMPLOYEE STATUS
  // =========================================================

  const selectedEmployeeOnLeave = selectedEmployee
    ? isOnLeave(selectedEmployee.employee_id)
    : false;

  // =========================================================
  // CALCULATE DAYS
  // =========================================================

  const calculateDays = () => {
    if (!from || !to) return 0;

    const start = new Date(from);
    const end = new Date(to);

    if (end < start) return 0;

    return (
      Math.ceil(
        (end.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  // =========================================================
  // NEXT
  // =========================================================

  const next = () => {
    if (!employeeId || !from || !to) {
      alert("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    if (new Date(to) < new Date(from)) {
      alert(
        "تاريخ نهاية فترة التقييم يجب أن يكون بعد أو يساوي تاريخ البداية"
      );
      return;
    }

    if (!selectedEmployee) {
      alert("لم يتم العثور على الموظف");
      return;
    }

    if (selectedEmployeeOnLeave) {
      alert("هذا الموظف في إجازة حالياً ولا يمكن بدء التقييم له");
      return;
    }

    nav("/performance", {
      state: {
        employee_id: selectedEmployee.employee_id,
        name: selectedEmployee.name,
        from_date: from,
        to_date: to,
      },
    });
  };

  // =========================================================
  // BACK
  // =========================================================

  const goBack = () => {
    nav(-1);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="step1-page">

      {/* Background Decorations */}
      <div className="step1-bg-circle circle-one" />
      <div className="step1-bg-circle circle-two" />

      {/* Main Card */}
      <div className="step1-card">

        {/* Header */}
        <div className="step1-header">

          <div className="step1-header-icon">
            👨‍💼
          </div>

          <div>
            <h1>بيانات الموظف</h1>

            <p>
              اختر الموظف وحدد فترة التقييم للمتابعة
            </p>
          </div>

        </div>

        {/* Progress */}
        <div className="step-progress">

          <div className="progress-step active">
            <div className="progress-number">
              1
            </div>

            <span>بيانات الموظف</span>
          </div>

          <div className="progress-line" />

          <div className="progress-step">
            <div className="progress-number">
              2
            </div>

            <span>الأداء</span>
          </div>

          <div className="progress-line" />

          <div className="progress-step">
            <div className="progress-number">
              3
            </div>

            <span>النتيجة</span>
          </div>

        </div>

        {/* Form */}
        <div className="step1-form">

          {/* Employee */}
          <div className="field-group">

            <label>
              الموظف
              <span>*</span>
            </label>

            <div className="select-wrapper">

              <span className="field-icon">
                👤
              </span>

              <select
                value={employeeId}
                onChange={(e) =>
                  setEmployeeId(e.target.value)
                }
                disabled={loading}
              >
                <option value="">
                  {loading
                    ? "جاري تحميل الموظفين..."
                    : "-- اختر الموظف --"}
                </option>

                {employees.map((employee) => {
                  const onLeave = isOnLeave(
                    employee.employee_id
                  );

                  return (
                    <option
                      key={employee.employee_id}
                      value={employee.employee_id}
                    >
                      {employee.name}
                      {onLeave
                        ? " — في إجازة حالياً"
                        : ""}
                    </option>
                  );
                })}
              </select>

              <span className="select-arrow">
                ⌄
              </span>

            </div>

          </div>

          {/* Selected Employee */}
          {selectedEmployee && (
            <div
              className={`employee-preview ${
                selectedEmployeeOnLeave
                  ? "employee-on-leave"
                  : ""
              }`}
            >

              <div className="preview-avatar">
                {String(
                  selectedEmployee.name || "م"
                ).charAt(0)}
              </div>

              <div className="preview-info">

                <strong>
                  {selectedEmployee.name}
                </strong>

                <span>
                  {selectedEmployee.position ||
                    selectedEmployee.job_title ||
                    "موظف"}
                </span>

              </div>

              <div
                className={`employee-status ${
                  selectedEmployeeOnLeave
                    ? "leave-status"
                    : "available-status"
                }`}
              >
                <span className="status-dot" />

                {selectedEmployeeOnLeave
                  ? "في إجازة"
                  : "متاح للتقييم"}
              </div>

            </div>
          )}

          {/* Dates */}
          <div className="date-fields">

            <div className="field-group">

              <label>
                من تاريخ
                <span>*</span>
              </label>

              <div className="date-input-wrapper">

                <span className="field-icon">
                  📅
                </span>

                <input
                  type="date"
                  value={from}
                  max={today}
                  onChange={(e) =>
                    setFrom(e.target.value)
                  }
                />

              </div>

            </div>

            <div className="field-group">

              <label>
                إلى تاريخ
                <span>*</span>
              </label>

              <div className="date-input-wrapper">

                <span className="field-icon">
                  📅
                </span>

                <input
                  type="date"
                  value={to}
                  min={from || undefined}
                  max={today}
                  onChange={(e) =>
                    setTo(e.target.value)
                  }
                />

              </div>

            </div>

          </div>

          {/* Days */}
          {calculateDays() > 0 && (
            <div className="days-summary">

              <div className="days-summary-icon">
                📊
              </div>

              <div>
                <span>
                  مدة فترة التقييم
                </span>

                <strong>
                  {calculateDays()}{" "}
                  <small>يوم</small>
                </strong>
              </div>

            </div>
          )}

          {/* Info */}
          <div className="step1-info">

            <span>💡</span>

            <p>
              سيتم استخدام الفترة المحددة لتقييم أداء
              الموظف خلال هذه المدة.
            </p>

          </div>

          {/* Buttons */}
          <div className="step1-actions">

            <button
              className="back-button"
              onClick={goBack}
              type="button"
            >
              <span>←</span>
              رجوع
            </button>

            <button
              className="next-button"
              onClick={next}
              disabled={
                loading ||
                !employeeId ||
                !from ||
                !to ||
                selectedEmployeeOnLeave
              }
              type="button"
            >
              <span>التالي</span>
              <span className="next-arrow">
                ←
              </span>
            </button>

          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="step1-footer">
        نظام الموارد البشرية
      </div>

    </div>
  );
}

