import User from "../models/User.js";

export async function getUsers(req, res) {
  try {
    const filters = { isDeleted: false };
    if (req.query.q) {
      const keyword = req.query.q.trim();
      filters.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { phoneNumber: { $regex: keyword, $options: "i" } },
      ];
    }

    const users = await User.find(filters).sort({ createdAt: -1 }).lean();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng", error: error.message });
  }
}

export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin người dùng", error: error.message });
  }
}

export async function createUser(req, res) {
  try {
    const payload = { ...req.body };
    if (!payload.role) {
      payload.role = "STUDENT";
    }

    const user = await User.create(payload);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi tạo người dùng", error: error.message });
  }
}

export async function updateUser(req, res) {
  try {
    const payload = { ...req.body };
    const user = await User.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi cập nhật người dùng", error: error.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa người dùng", error: error.message });
  }
}
