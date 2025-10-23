import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      maxlength: 15,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
      maxlength: 256,
    },
    password: {
      type: String,
      required: true,
    },
    contact: {
      type: Number,
    },
    role: {
      type: String,
      enum: ["user", "admin", "subadmin"],
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;