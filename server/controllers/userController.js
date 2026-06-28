import User from "../models/User.js";
import { getIO } from "../socket/index.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
    getIO().emit("user:event", { type: "updated", user, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
    getIO().emit("user:event", { type: "deleted", userId: req.params.id, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const promoteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User promoted to admin", user });
    getIO().emit("user:event", { type: "promoted", user, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const demoteAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "user" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Admin demoted to user", user });
    getIO().emit("user:event", { type: "demoted", user, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({ name, email, password, role: "admin" });
    res.status(201).json({ message: "Admin created successfully", user });
    getIO().emit("user:event", { type: "admin_created", user, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
