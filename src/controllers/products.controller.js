import productsService from '../services/products.service.js';

class ProductsController {
  async findAll(req, res, next) {
    try {
      const includeOutOfStock = req.query.includeOutOfStock === 'true';
      const products = await productsService.findAll({ includeOutOfStock });
      res.json({ status: 'success', payload: products });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const product = await productsService.findById(req.params.id);
      res.json({ status: 'success', payload: product });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newProduct = await productsService.create(req.body);
      res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updatedProduct = await productsService.update(req.params.id, req.body);
      res.json({ status: 'success', payload: updatedProduct });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await productsService.delete(req.params.id);
      res.json({ status: 'success', message: 'Producto eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductsController();
