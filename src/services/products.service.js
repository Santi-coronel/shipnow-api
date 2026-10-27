import productsRepo from '../repositories/products.repo.js';
import { PRODUCT_STATUS } from '../constants/index.js';
import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

const isValidPrice = (price) => typeof price === 'number' && Number.isFinite(price) && price >= 0;
const isValidStock = (stock) => Number.isInteger(stock) && stock >= 0;
const statusFromStock = (stock) => (stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK);

class ProductsService {
  async findAll({ includeOutOfStock = false } = {}) {
    const filter = includeOutOfStock ? {} : { status: PRODUCT_STATUS.AVAILABLE };
    return productsRepo.findAll(filter);
  }

  async findById(id) {
    const product = await productsRepo.findById(id);
    if (!product) throw createError(ErrorDictionary.PRODUCT_NOT_FOUND);
    return product;
  }

  async create(productData) {
    const { name, description, price, stock } = productData;

    if (typeof name !== 'string' || !name.trim() || !isValidPrice(price) || !isValidStock(stock)) {
      throw createError(ErrorDictionary.INVALID_PRODUCT_DATA);
    }

    const newProduct = await productsRepo.create({
      name,
      description,
      price,
      stock,
      status: statusFromStock(stock),
    });

    logger.info(`Producto creado: ${newProduct._id} (stock: ${stock})`);
    return newProduct;
  }

  async update(id, productData) {
    const updateData = { ...productData };

    if ('price' in updateData && !isValidPrice(updateData.price)) {
      throw createError(ErrorDictionary.INVALID_PRODUCT_DATA);
    }
    if ('stock' in updateData && !isValidStock(updateData.stock)) {
      throw createError(ErrorDictionary.INVALID_PRODUCT_DATA);
    }
    if ('name' in updateData && (typeof updateData.name !== 'string' || !updateData.name.trim())) {
      throw createError(ErrorDictionary.INVALID_PRODUCT_DATA);
    }
    if (updateData.status && !Object.values(PRODUCT_STATUS).includes(updateData.status)) {
      throw createError(ErrorDictionary.INVALID_PRODUCT_STATUS);
    }

    if ('stock' in updateData) {
      updateData.status = statusFromStock(updateData.stock);
    }

    const updatedProduct = await productsRepo.update(id, updateData);
    if (!updatedProduct) throw createError(ErrorDictionary.PRODUCT_NOT_FOUND);

    if (updatedProduct.status === PRODUCT_STATUS.OUT_OF_STOCK) {
      logger.warning(`Producto ${id} sin stock`);
    }
    return updatedProduct;
  }

  async delete(id) {
    const deletedProduct = await productsRepo.delete(id);
    if (!deletedProduct) throw createError(ErrorDictionary.PRODUCT_NOT_FOUND);
    return deletedProduct;
  }
}

export default new ProductsService();
