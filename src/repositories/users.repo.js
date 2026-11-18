import { PAGINATION } from '../constants/index.js';
import User from '../models/user.model.js';

class UsersRepository {
  async findAll(filter = {}, { skip = 0, limit = PAGINATION.MAX_LIMIT } = {}) {
    return User.find(filter).select('-password')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async count(filter = {}) {
    return User.countDocuments(filter);
  }

  async findById(id) {
    return User.findById(id).select('-password');
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async create(userData) {
    return User.create(userData);
  }

  async update(id, userData) {
    const updated = await User.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    });
    if (!updated) return null;
    return User.findById(id).select('-password');
  }

  async delete(id) {
    return User.findByIdAndDelete(id);
  }

  async insertMany(usersData) {
    return User.insertMany(usersData);
  }

  async addDocument(id, fileData) {
    await User.findByIdAndUpdate(id, { $push: { documents: fileData } });
    return this.findById(id);
  }
}

export default new UsersRepository();
