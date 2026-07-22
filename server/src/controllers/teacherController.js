import Teacher from "../models/Teacher.js";
import Position from "../models/Position.js";
import User from "../models/User.js";

function normalizeTeacher(teacher) {
  const positionNames = (teacher.teacherPositionsId || []).map((position) => position.name).filter(Boolean);
  const highestDegree = Array.isArray(teacher.degrees) && teacher.degrees.length > 0
    ? teacher.degrees.reduce((best, current) => {
        if (!best) return current;
        if ((current.year || 0) > (best.year || 0)) return current;
        return best;
      }, null)
    : null;

  return {
    ...teacher,
    fullname: teacher.fullname || teacher.userId?.name || "",
    email: teacher.email || teacher.userId?.email || "",
    phone: teacher.phone || teacher.userId?.phoneNumber || "",
    address: teacher.address || teacher.userId?.address || "",
    position: teacher.position || positionNames[0] || "",
    positions: positionNames,
    positionNames: positionNames.join(", "),
    status: teacher.status || "Đang công tác",
    title: highestDegree?.type || "",
    major: highestDegree?.major || "",
    user: teacher.userId
      ? {
          _id: teacher.userId._id,
          name: teacher.userId.name,
          email: teacher.userId.email,
          phoneNumber: teacher.userId.phoneNumber,
          address: teacher.userId.address,
        }
      : null,
  };
}

async function generateUniqueTeacherCode() {
  let code;
  let exists = true;
  while (exists) {
    code = `GV${Math.floor(100000000 + Math.random() * 900000000)}`;
    exists = await Teacher.exists({ code });
  }
  return code;
}

export async function getTeachers(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const filters = { isDeleted: true };

    if (req.query.q) {
      const keyword = req.query.q.trim();
      filters.$or = [
        { code: { $regex: keyword, $options: "i" } },
        { fullname: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }

    const total = await Teacher.countDocuments(filters);
    const teachers = await Teacher.find(filters)
      .populate("userId", "name email phoneNumber address")
      .populate("teacherPositionsId", "name code des status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({
      data: teachers.map(normalizeTeacher),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách giáo viên", error: error.message });
  }
}

export async function getTeacherById(req, res) {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate("userId", "name email phoneNumber address")
      .populate("teacherPositionsId", "name code des status");

    if (!teacher) {
      return res.status(404).json({ message: "Không tìm thấy giáo viên" });
    }

    res.status(200).json(normalizeTeacher(teacher.toObject()));
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin giáo viên", error: error.message });
  }
}

export async function createTeacher(req, res) {
  try {
    const payload = { ...req.body };

    if (payload.email) {
      const existingEmail = await Teacher.findOne({ email: payload.email });
      const existingUser = await User.findOne({ email: payload.email });
      if (existingEmail || existingUser) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }
    }

    if (payload.cccd) {
      payload.identity = payload.cccd;
      delete payload.cccd;
    }

    if (payload.position && !payload.teacherPositionsId) {
      const position = await Position.findOne({ name: payload.position });
      if (position) {
        payload.teacherPositionsId = [position._id];
      }
    }


    if (!payload.code) {
      payload.code = await generateUniqueTeacherCode();
    } else {
      const existingCode = await Teacher.findOne({ code: payload.code });
      if (existingCode) {
        return res.status(400).json({ message: "Mã giáo viên đã tồn tại" });
      }
    }

    if (!payload.status) {
      payload.status = "Đang công tác";
    }

    const userPayload = {
      name: payload.fullname,
      email: payload.email,
      phoneNumber: payload.phone,
      address: payload.address,
      identity: payload.identity,
      dob: payload.birthDate,
      role: "TEACHER",
      isDeleted: true,
    };

    const user = await User.create(userPayload);
    payload.userId = user._id;
    delete payload.fullname;
    delete payload.phone;
    delete payload.email;
    delete payload.identity;
    delete payload.address;
    delete payload.birthDate;

    payload.isDeleted = true;

    const teacher = await Teacher.create(payload);
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi tạo giáo viên", error: error.message });
  }
}

export async function updateTeacher(req, res) {
  try {
    const payload = { ...req.body };
    if (payload.position && !payload.teacherPositionsId) {
      const position = await Position.findOne({ name: payload.position, isDeleted: true });
      if (position) {
        payload.teacherPositionsId = [position._id];
      }
    }

    const teacher = await Teacher.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!teacher) {
      return res.status(404).json({ message: "Không tìm thấy giáo viên" });
    }

    res.status(200).json(teacher);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi cập nhật giáo viên", error: error.message });
  }
}

export async function deleteTeacher(req, res) {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: "Không tìm thấy giáo viên" });
    }

    res.status(200).json({ message: "Xóa giáo viên thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa giáo viên", error: error.message });
  }
}
