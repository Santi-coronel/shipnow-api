import { PAGINATION } from '../constants/index.js';
import Order from '../models/order.model.js';

class OrdersRepository {
  async findAll(filter = {}, { skip = 0, limit = PAGINATION.MAX_LIMIT } = {}) {
    return Order.find(filter).populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async count(filter = {}) {
    return Order.countDocuments(filter);
  }

  async findById(id) {
    return Order.findById(id).populate('customer', 'firstName lastName email');
  }

  async create(orderData) {
    return Order.create(orderData);
  }

  async update(id, orderData) {
    return Order.findByIdAndUpdate(id, orderData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Order.findByIdAndDelete(id);
  }

  async insertMany(ordersData) {
    return Order.insertMany(ordersData);
  }

  async addReceipt(id, fileData) {
    await Order.findByIdAndUpdate(id, { $push: { receipts: fileData } });
    return this.findById(id);
  }
}

export default new OrdersRepository();
