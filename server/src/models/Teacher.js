import mongoose from "mongoose";

const degreeSchema = new mongoose.Schema(
  {
    type: { type: String, trim: true },
    school: { type: String, trim: true },
    major: { type: String, trim: true },
    year: { type: Number },
    isGraduated: { type: Boolean, default: false },
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date },
    teacherPositionsId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Position" }],
    degrees: { type: [degreeSchema], default: [] },
    fullname: { type: String, trim: true },
    birthDate: { type: Date },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, unique: true, sparse: true },
    identity: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

teacherSchema.set("toJSON", { virtuals: true });
teacherSchema.set("toObject", { virtuals: true });

const Teacher = mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
export default Teacher;
