import Position from "../models/Position.js";

function normalizePosition(position) {
  return {
    _id: position._id,
    code: position.code,
    name: position.name,
    des: position.des || "",
    isActive: position.isActive,
    isDeleted: position.isDeleted,
    status: position.isActive ? "Hoạt động" : "Ngừng",
    createdAt: position.createdAt,
    updatedAt: position.updatedAt,
  };
}

export async function getPositions(req, res) {
  try {
    const filters = { isDeleted: true };
    if (req.query.q) {
      const keyword = req.query.q.trim();
      filters.$or = [
        { code: { $regex: keyword, $options: "i" } },
        { name: { $regex: keyword, $options: "i" } },
        { des: { $regex: keyword, $options: "i" } },
      ];
    }

    const positions = await Position.find(filters)
      .select("code name des isActive isDeleted createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();
    const normalized = positions.map(normalizePosition);
    res.status(200).json(normalized);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách vị trí công tác", error: error.message });
  }
}

export async function getPositionById(req, res) {
  try {
    const position = await Position.findById(req.params.id).lean();
    if (!position || position.isDeleted) {
      return res.status(404).json({ message: "Không tìm thấy vị trí công tác" });
    }
    res.status(200).json(normalizePosition(position));
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin vị trí công tác", error: error.message });
  }
}

export async function createPosition(req, res) {
  try {
    const payload = { ...req.body };

    if (!payload.code) {
      payload.code = `POS${Date.now()}`;
    } else {
      const existingCode = await Position.findOne({ code: payload.code });
      if (existingCode) {
        return res.status(400).json({ message: "Mã này đã tồn tại" });
      }
    }

    if (payload.status !== undefined) {
      payload.isActive = payload.status === "Hoạt động";
      delete payload.status;
    }

    payload.isDeleted = true;
    const position = await Position.create(payload);
    res.status(201).json(normalizePosition(position));
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ message: "Mã này đã tồn tại", error: error.message });
    }
    res.status(400).json({ message: "Lỗi khi tạo vị trí công tác", error: error.message });
  }
}

export async function updatePosition(req, res) {
  try {
    const payload = { ...req.body };

    if (payload.status !== undefined) {
      payload.isActive = payload.status === "Hoạt động";
      delete payload.status;
    }

    const position = await Position.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!position) {
      return res.status(404).json({ message: "Không tìm thấy vị trí công tác" });
    }
    res.status(200).json(normalizePosition(position));
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi cập nhật vị trí công tác", error: error.message });
  }
}

export async function deletePosition(req, res) {
  try {
    const position = await Position.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, isActive: false },
      { new: true }
    );
    if (!position) {
      return res.status(404).json({ message: "Không tìm thấy vị trí công tác" });
    }
    res.status(200).json({ message: "Xóa vị trí công tác thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa vị trí công tác", error: error.message });
  }
}
