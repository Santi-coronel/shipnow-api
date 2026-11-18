import { PAGINATION } from '../constants/index.js';
import Delivery from '../models/delivery.model.js';

class DeliveriesRepository {
  async findAll(filter = {}, { skip = 0, limit = PAGINATION.MAX_LIMIT } = {}) {
    return Delivery.find(filter).populate('order').populate('driver', 'firstName lastName email role')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async count(filter = {}) {
    return Delivery.countDocuments(filter);
  }

  async findById(id) {
    return Delivery.findById(id).populate('order').populate('driver', 'firstName lastName email role');
  }

  async create(deliveryData) {
    return Delivery.create(deliveryData);
  }

  async update(id, deliveryData) {
    return Delivery.findByIdAndUpdate(id, deliveryData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Delivery.findByIdAndDelete(id);
  }

  async insertMany(deliveriesData) {
    return Delivery.insertMany(deliveriesData);
  }

  async addReceipt(id, fileData) {
    await Delivery.findByIdAndUpdate(id, { $push: { receipts: fileData } });
    return this.findById(id);
  }
}

export default new DeliveriesRepository();
