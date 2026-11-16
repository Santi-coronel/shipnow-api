import Delivery from '../models/delivery.model.js';

class DeliveriesRepository {
  async findAll(filter = {}) {
    return Delivery.find(filter).populate('order').populate('driver', 'firstName lastName email role');
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
