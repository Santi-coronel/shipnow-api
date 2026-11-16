import Order from '../models/order.model.js';

class OrdersRepository {
  async findAll(filter = {}) {
    return Order.find(filter).populate('customer', 'firstName lastName email');
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
