import UserModel from "../modal/usermodal.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const getUserRecords = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const role = req.query.role;
  const status = req.query.status;

  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  try {
    const totalCount = await UserModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);
    const userData = await UserModel.find(filter).skip((page - 1) * limit).limit(limit);

    return res.status(200).json({ data: userData, totalPages, currentPage: page, message: "Success" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await UserModel.findById(userId);
    return userData
      ? res.status(200).json({ data: userData, message: "Success" })
      : res.status(404).json({ message: "User not found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const signUp = async (req, res) => {
  try {
    const { username, email, password, contact, role } = req.body;
    if (await UserModel.findOne({ email })) return res.status(400).json({ message: "User already exists" });
    
    const newUser = new UserModel({
      username,
      email,
      password: bcrypt.hashSync(password, 10),
      contact,
      role: role || "user",
      status: 0,
    });

    await newUser.save();
    return res.status(201).json({ message: "Successfully registered.", redirect: "/login" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existUser = await UserModel.findOne({ email });
    if (!existUser || !(await bcrypt.compare(password, existUser.password))) return res.status(400).json({ message: "Invalid email or password" });
    
    const token = jwt.sign({ id: existUser._id, email: existUser.email, role: existUser.role }, process.env.JWT_SECRET, { expiresIn: "6h" });
    return res.status(200).json({ data: existUser, token, message: "Successfully logged in" });
  } catch (error) {
    return res.status(500).json({ message: "Sign in failed. Please try again later." });
  }
};

const logout = (req, res) => res.status(200).json({ message: "Logout successful" });

const updateUser = async (req, res) => {
  try {
    const id = req.params.user_id;
    const { username, email, password, contact } = req.body;
    const updatedUser = await UserModel.updateOne({ _id: id }, { $set: { username, email, password, contact } });
    return updatedUser.acknowledged ? res.status(200).json({ message: "Updated" }) : res.status(400).json({ message: "Update failed" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.user_id;
    const deletedUser = await UserModel.deleteOne({ _id: id });
    return deletedUser.acknowledged ? res.status(200).json({ message: "Deleted" }) : res.status(400).json({ message: "Delete failed" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { deleteUser, getUserInfo, getUserRecords, signIn, signUp, updateUser };
