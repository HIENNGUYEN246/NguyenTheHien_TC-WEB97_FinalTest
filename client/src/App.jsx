import { useState, useEffect } from "react";
import "./App.css";

const initialTeacherForm = {
  code: "",
  fullname: "",
  birthDate: "",
  phone: "",
  email: "",
  cccd: "",
  address: "",
  position: "",
  degrees: [
    { type: "", school: "", major: "", status: "Hoàn thành", year: "" },
  ],
};

const initialPositionForm = {
  code: "",
  name: "",
  des: "",
  status: "Hoạt động",
};

function App() {
  const [page, setPage] = useState("teachers");
  const [showModal, setShowModal] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [teacherForm, setTeacherForm] = useState(initialTeacherForm);
  const [positionForm, setPositionForm] = useState(initialPositionForm);
  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherTotalPages, setTeacherTotalPages] = useState(1);
  const [notification, setNotification] = useState({ text: "", type: "" });
  const teacherLimit = 10;

  useEffect(() => {
    fetchTeachers();
  }, [teacherPage]);

  useEffect(() => {
    if (!notification.text) return;
    const timer = setTimeout(() => {
      setNotification({ text: "", type: "" });
    }, 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    fetchPositions();
  }, []);

  async function fetchTeachers() {
    try {
      const response = await fetch(`/api/teachers?page=${teacherPage}&limit=${teacherLimit}`);
      if (!response.ok) throw new Error("Không thể lấy danh sách giáo viên");
      const result = await response.json();
      setTeachers(Array.isArray(result.data) ? result.data : result);
      if (result.totalPages) {
        setTeacherTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchPositions() {
    try {
      const response = await fetch("/api/teacher-positions");
      if (!response.ok) throw new Error("Không thể lấy danh sách vị trí công tác");
      const data = await response.json();
      setPositions(data);
    } catch (error) {
      console.error(error);
    }
  }

  function handleTeacherChange(event) {
    const { name, value } = event.target;
    setTeacherForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleDegreeChange(index, name, value) {
    setTeacherForm((prev) => {
      const degrees = prev.degrees ? [...prev.degrees] : [];
      degrees[index] = { ...degrees[index], [name]: value };
      return { ...prev, degrees };
    });
  }

  function handlePositionChange(event) {
    const { name, value } = event.target;
    setPositionForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePositionStatus(status) {
    setPositionForm((prev) => ({ ...prev, status }));
  }

  function handleOpenModal() {
    setShowModal(true);
    if (page === "teachers") {
      setTeacherForm(initialTeacherForm);
    } else {
      setPositionForm(initialPositionForm);
    }
  }

  function handleCloseModal() {
    setShowModal(false);
    setTeacherForm(initialTeacherForm);
    setPositionForm(initialPositionForm);
  }

  async function handleCreateTeacher() {
    try {
      const payload = {
        ...teacherForm,
        code: teacherForm.code || `GV${Date.now()}`,
        status: teacherForm.status || "Đang công tác",
        degrees: teacherForm.degrees || [],
      };
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Không thể tạo giáo viên");
      }
      await fetchTeachers();
      handleCloseModal();
      setNotification({ text: "Tạo giáo viên thành công", type: "success" });
    } catch (error) {
      console.error(error);
      setNotification({ text: error.message || "Lỗi khi tạo giáo viên", type: "error" });
    }
  }

  async function handleCreatePosition() {
    try {
      const response = await fetch("/api/teacher-positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(positionForm),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Không thể tạo vị trí công tác");
      }
      await fetchPositions();
      handleCloseModal();
      setNotification({ text: "Tạo vị trí công tác thành công", type: "success" });
    } catch (error) {
      console.error(error);
      setNotification({ text: error.message || "Lỗi khi tạo vị trí công tác", type: "error" });
    }
  }

  return (
    <div className="app-page">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">S</div>
          <div>
            <strong>School System</strong>
            <div className="brand-subtitle">Hệ thống quản lý</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-link ${page === "teachers" ? "active" : ""}`} onClick={() => setPage("teachers")}>
            Giáo viên
          </button>
          <button className={`nav-link ${page === "positions" ? "active" : ""}`} onClick={() => setPage("positions")}>
            Vị trí công tác
          </button>
        </nav>
      </aside>

      <div className="content-wrapper">
        <div className="toast-container">
          {notification.text && (
            <div className={`toast ${notification.type}`}>
              {notification.text}
            </div>
          )}
        </div>
        <header className="top-header">
          <div>
            <div className="header-title">School System</div>
            <div className="header-meta">22/07/2026</div>
          </div>
          <div className="header-user">
            <div className="user-avatar">A</div>
            <div>
              <div className="user-name">Admin</div>
              <div className="user-role">ADMIN</div>
            </div>
          </div>
        </header>

        <main className="page-content">
          <section className="page-panel">
            <div className="panel-header">
              <h2>{page === "teachers" ? "Giáo viên" : "Vị trí công tác"}</h2>
              <div className="panel-actions">
                <div className="search-box">
                  <input placeholder="Tìm kiếm thông tin" />
                </div>
                <button className="button-secondary" type="button" onClick={() => { fetchTeachers(); fetchPositions(); }}>
                  Tải lại
                </button>
                <button className="button" type="button" onClick={handleOpenModal}>
                  Tạo mới
                </button>
              </div>
            </div>
            {page === "teachers" ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Giáo viên</th>
                      <th>Trình độ (cao nhất)</th>
                      <th>Bộ môn</th>
                      <th>TT công tác</th>
                      <th>Địa chỉ</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher) => (
                      <tr key={teacher._id || teacher.id}>
                        <td>{teacher.code}</td>
                        <td>
                          <div className="teacher-cell">
                            <img
                              className="teacher-avatar"
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.fullname || teacher.name)}&background=7c3aed&color=fff&rounded=true`}
                              alt={teacher.fullname || teacher.name}
                            />
                            <div>
                              <div className="teacher-name">{teacher.fullname || teacher.name}</div>
                              <div className="teacher-detail">{teacher.email}</div>
                              <div className="teacher-detail">{teacher.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>{teacher.title || "N/A"}</div>
                          <div className="teacher-detail">Chuyên ngành: {teacher.major || "N/A"}</div>
                        </td>
                        <td>{teacher.duty || teacher.position || "N/A"}</td>
                        <td>{teacher.status || "N/A"}</td>
                        <td>{teacher.address || "N/A"}</td>
                        <td>
                          <span className={teacher.status === "Đang công tác" ? "status-badge active" : "status-badge"}>
                            {teacher.status || "N/A"}
                          </span>
                        </td>
                        <td>
                          <button className="detail-button" type="button">Chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination-bar">
                  <button
                    className="button-secondary"
                    type="button"
                    disabled={teacherPage <= 1}
                    onClick={() => setTeacherPage((prev) => Math.max(1, prev - 1))}
                  >
                    Trang trước
                  </button>
                  <span>
                    Trang {teacherPage} / {teacherTotalPages}
                  </span>
                  <button
                    className="button-secondary"
                    type="button"
                    disabled={teacherPage >= teacherTotalPages}
                    onClick={() => setTeacherPage((prev) => Math.min(teacherTotalPages, prev + 1))}
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Mã</th>
                      <th>Tên</th>
                      <th>Trạng thái</th>
                      <th>Mô tả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position, index) => (
                      <tr key={position._id || position.id}>
                        <td>{index + 1}</td>
                        <td>{position.code}</td>
                        <td>{position.name}</td>
                        <td>
                          <span className={position.status === "Hoạt động" ? "status-badge active" : "status-badge"}>
                            {position.status}
                          </span>
                        </td>
                        <td>{position.des}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className={`modal-content ${page === "positions" ? "modal-content-small" : "modal-content-large"}`} onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{page === "teachers" ? "Tạo thông tin giáo viên" : "Vị trí công tác"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            {page === "teachers" ? (
              <div className="modal-body">
                <div className="teacher-form-grid">
                  <div className="photo-card compact-photo-card">
                    <img src="https://api.dicebear.com/6.x/avataaars/svg?seed=student" alt="Avatar" className="photo-preview" />
                    <div className="upload-label">Upload file</div>
                    <div className="upload-text">Chọn ảnh</div>
                  </div>

                  <div className="form-panel">
                    <div className="section-title">Thông tin cá nhân</div>
                    <div className="form-grid">
                            <div className="field">
                        <label>Họ và tên</label>
                        <input name="fullname" placeholder="VD: Nguyễn Văn A" value={teacherForm.fullname} onChange={handleTeacherChange} />
                      </div>
                      <div className="field">
                        <label>Ngày sinh</label>
                        <input
                          type="date"
                          name="birthDate"
                          value={teacherForm.birthDate}
                          onChange={handleTeacherChange}
                        />
                      </div>
                      <div className="field">
                        <label>Số điện thoại</label>
                        <input name="phone" placeholder="Nhập số điện thoại" value={teacherForm.phone} onChange={handleTeacherChange} />
                      </div>
                      <div className="field">
                        <label>Email</label>
                        <input name="email" placeholder="example@school.edu.vn" value={teacherForm.email} onChange={handleTeacherChange} />
                      </div>
                      <div className="field">
                        <label>Số CCCD</label>
                        <input name="cccd" placeholder="Nhập số CCCD" value={teacherForm.cccd} onChange={handleTeacherChange} />
                      </div>
                      <div className="field">
                        <label>Địa chỉ</label>
                        <input name="address" placeholder="Địa chỉ thường trú" value={teacherForm.address} onChange={handleTeacherChange} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="teacher-work-section">
                  <div className="section-title">Thông tin công tác</div>
                  <div className="field full-width">
                    <label>Vị trí công tác</label>
                    <select name="position" value={teacherForm.position} onChange={handleTeacherChange}>
                      <option value="">Chọn các vị trí công tác</option>
                      {positions.map((position) => (
                        <option key={position._id || position.id} value={position.name}>
                          {position.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="section-title">Học vị</div>
                  <div className="education-table-wrapper">
                    <table className="education-table">
                      <thead>
                        <tr>
                          <th>Bậc</th>
                          <th>Trường</th>
                          <th>Chuyên ngành</th>
                          <th>Trạng thái</th>
                          <th>Tốt nghiệp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teacherForm.degrees.map((degree, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                value={degree.type}
                                onChange={(event) => handleDegreeChange(index, "type", event.target.value)}
                                placeholder="Chọn học vị"
                              />
                            </td>
                            <td>
                              <input
                                value={degree.school}
                                onChange={(event) => handleDegreeChange(index, "school", event.target.value)}
                                placeholder="Trường theo học"
                              />
                            </td>
                            <td>
                              <input
                                value={degree.major}
                                onChange={(event) => handleDegreeChange(index, "major", event.target.value)}
                                placeholder="Chuyên ngành"
                              />
                            </td>
                            <td>
                              <input
                                value={degree.status}
                                onChange={(event) => handleDegreeChange(index, "status", event.target.value)}
                                placeholder="Status"
                              />
                            </td>
                            <td>
                              <input
                                value={degree.year}
                                onChange={(event) => handleDegreeChange(index, "year", event.target.value)}
                                placeholder="Năm/Dự kiến"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="button-secondary" type="button" onClick={handleCreateTeacher}>Lưu</button>
                </div>
              </div>
            ) : (
              <div className="modal-body">
                <div className="position-form compact-position-form">
                  <div className="field full-width">
                    <label>Mã</label>
                    <input name="code" placeholder="Nhập mã" value={positionForm.code} onChange={handlePositionChange} />
                  </div>
                  <div className="field full-width">
                    <label>Tên</label>
                    <input name="name" placeholder="Nhập tên" value={positionForm.name} onChange={handlePositionChange} />
                  </div>
                  <div className="field full-width">
                    <label>Mô tả</label>
                    <textarea name="des" placeholder="Nhập mô tả" value={positionForm.des} onChange={handlePositionChange} />
                  </div>
                  <div className="field full-width status-field">
                    <label>Trạng thái</label>
                    <div className="status-switch compact-status-switch">
                      <button className={positionForm.status === "Hoạt động" ? "active" : ""} type="button" onClick={() => handlePositionStatus("Hoạt động")}>
                        Hoạt động
                      </button>
                      <button className={positionForm.status === "Ngừng" ? "active" : ""} type="button" onClick={() => handlePositionStatus("Ngừng")}>
                        Ngừng
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="button-secondary" type="button" onClick={handleCreatePosition}>Lưu</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
