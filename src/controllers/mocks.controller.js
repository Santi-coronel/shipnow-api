import mocksService from '../services/mocks.service.js';

class MocksController {
  getUsers(req, res, next) {
    try {
      const result = mocksService.getUsers(req.query.qty);

      res.json({
        status: 'success',
        payload: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const result = await mocksService.getOrders(req.query.qty);

      res.json({
        status: 'success',
        payload: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeliveries(req, res, next) {
    try {
      const result = await mocksService.getDeliveries(req.query.qty);

      res.json({
        status: 'success',
        payload: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async seedUsers(req, res, next) {
    try {
      const qty = req.body?.qty ?? req.query.qty;
      const result = await mocksService.seedUsers(qty);

      res.json({
        status: 'success',
        payload: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async seedOrders(req, res, next) {
    try {
      const qty = req.body?.qty ?? req.query.qty;
      const result = await mocksService.seedOrders(qty);

      res.json({
        status: 'success',
        payload: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async seedDeliveries(req, res, next) {
    try {
      const qty = req.body?.qty ?? req.query.qty;
      const result = await mocksService.seedDeliveries(qty);

      res.json({
        status: 'success',
        payload: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async seedAll(req, res, next) {
    try {
      const usersQty = req.body?.usersQty ?? req.query.usersQty;
      const ordersQty = req.body?.ordersQty ?? req.query.ordersQty;
      const deliveriesQty =
        req.body?.deliveriesQty ?? req.query.deliveriesQty;

      const result = await mocksService.seedAll({
        usersQty,
        ordersQty,
        deliveriesQty,
      });

      res.json({
        status: 'success',
        payload: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MocksController();