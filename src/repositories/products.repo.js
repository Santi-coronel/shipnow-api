import { PAGINATION } from '../constants/index.js';
import Product from '../models/product.model.js';

class ProductsRepository {
  async findAll(filter = {}, { skip = 0, limit = PAGINATION.MAX_LIMIT } = {}) {
    return Product.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async count(filter = {}) {
    return Product.countDocuments(filter);
  }

  async findById(id) {
    return Product.findById(id);
  }

  async create(productData) {
    return Product.create(productData);
  }

  async update(id, productData) {
    return Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Product.findByIdAndDelete(id);
  }
}

export default new ProductsRepository();
