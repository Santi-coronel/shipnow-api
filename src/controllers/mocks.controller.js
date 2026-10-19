import mocksService from '../services/mocks.service.js';

class MocksController {
  getUsers(req, res, next) {
    try {
      const result = mocksService.getUsers(req.query.qty);
      res.json({ status: 'success', payload: result });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const result = await mocksService.getOrders(req.query.qty);
      res.json({ status: 'success', payload: result });
    } catch (error) {
      next(error);
    }
  }

  async getDeliveries(req, res, next) {
    try {
      const result = await mocksService.getDeliveries(req.query.qty);
      res.json({ status: 'success', payload: result });
    } catch (error) {
      next(error);
    }
  }

  async seedUsers(req, res, next) {
    try {
      const result = await mocksService.seedUsers(req.query.qty);
      res.json({ status: 'success', payload: result });
    } catch (error) {
      next(error);
    }
  }

  async seedOrders(req, res, next) {
    try {
      const result = await mocksService.seedOrders(req.query.qty);
      res.json({ status: 'success', payload: result });
    } catch (error) {
      next(error);
    }
  }

  async seedDeliveries(req, res, next) {
    try {
      const result = await mocksService.seedDeliveries(req.query.qty);
      res.json({ status: 'success', payload: result });
    } catch (error) {
      next(error);
    }
  }

  async seedAll(req, res, next) {
    try {
      const { usersQty, ordersQty, deliveriesQty } = req.query;
      const result = await mocksService.seedAll({ usersQty, ordersQty, deliveriesQty });
      res.json({ status: 'success', payload: result });
    } catch (error) {
      next(error);
    }
  }
}

export default new MocksController();
