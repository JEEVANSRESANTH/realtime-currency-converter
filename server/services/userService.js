import User from "../models/User.js";

export const getAllUsers = () => User.find().select("-password");

export const getUserById = (id) => User.findById(id).select("-password");

export const updateUserById = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select("-password");

export const deleteUserById = (id) => User.findByIdAndDelete(id);

export const setUserRole = (id, role) =>
  User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");

export const createUser = (data) => User.create(data);
