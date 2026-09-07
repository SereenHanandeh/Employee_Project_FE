import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import {
  FaBuilding,
  FaArrowRight,
  FaSave,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";

import "./AddDepartment.css";

export default function AddDepartment() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const departmentName = name.trim();

    if (!departmentName) {
      alert("يرجى إدخال اسم القسم");
      return;
    }

    try {
      setSaving(true);

      await API.post("/departments", {
        name: departmentName,
      });

      setSuccess(true);
      setName("");

      setTimeout(() => {
        navigate("/departments");
      }, 1200);
    } catch (error) {
      console.error("Add Department Error:", error);

      alert(
        error.response?.data?.message ||
          "حدث خطأ أثناء إضافة القسم"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-department-page" dir="rtl">

      {/* Header */}
      <div className="add-department-header">
        <div className="header-right">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/departments")}
          >
            <FaArrowRight />
          </button>

          <div>
            <span className="page-label">
              إدارة الأقسام
            </span>

            <h1>إضافة قسم جديد</h1>

            <p>
              قم بإضافة قسم جديد إلى نظام إدارة الموظفين
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="add-department-container">
        <div className="add-department-card">

          {/* Card Header */}
          <div className="department-card-header">
            <div className="department-icon">
              <FaBuilding />
            </div>

            <div>
              <h2>بيانات القسم</h2>

              <p>
                أدخل اسم القسم الذي تريد إضافته
              </p>
            </div>
          </div>

          {/* Success */}
          {success && (
            <div className="success-message">
              <FaCheckCircle />

              <div>
                <strong>
                  تم إضافة القسم بنجاح
                </strong>

                <span>
                  سيتم تحويلك إلى قائمة الأقسام...
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="department-name">
                اسم القسم
                <span>*</span>
              </label>

              <div className="input-wrapper">
                <FaBuilding />

                <input
                  id="department-name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="مثال: الموارد البشرية"
                  disabled={saving || success}
                  autoComplete="off"
                />
              </div>

              <small>
                يجب أن يكون اسم القسم واضحًا وغير مكرر.
              </small>
            </div>

            {/* Actions */}
            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={() =>
                  navigate("/departments")
                }
                disabled={saving}
              >
                <FaTimes />
                إلغاء
              </button>

              <button
                type="submit"
                className="save-btn"
                disabled={
                  saving ||
                  success ||
                  !name.trim()
                }
              >
                <FaSave />

                {saving
                  ? "جاري الحفظ..."
                  : "حفظ القسم"}
              </button>

            </div>
          </form>
        </div>

        {/* Information Card */}
        <div className="department-info-card">
          <div className="info-icon">
            💡
          </div>

          <div>
            <h3>ملاحظة</h3>

            <p>
              بعد إضافة القسم سيظهر تلقائيًا في قائمة
              الأقسام، ويمكن استخدامه عند إضافة أو تعديل
              بيانات الموظفين.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}