import History from "../models/History.js";

export const getUserHistory = (userId) =>
  History.find({ userId }).populate("userId", "name email").sort({ timestamp: -1 });

export const getAllHistory = () =>
  History.find().populate("userId", "name email").sort({ timestamp: -1 });

export const createHistory = (data) => History.create(data);

export const deleteHistoryById = (id) => History.findByIdAndDelete(id);

export const getHistoryById = (id) => History.findById(id);
