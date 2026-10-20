import ordersRepo from '../repositories/orders.repo.js';
import usersRepo from '../repositories/users.repo.js';
import deliveriesRepo from '../repositories/deliveries.repo.js';
import { ORDER_STATUS, DELIVERY_PRIORITY } from '../constants/index.js';
import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

class OrdersService {
  async findAll(filter = {}) {
    return ordersRepo.findAll(filter);
  }

  async findById(id) {
    const order = await ordersRepo.findById(id);
    if (!order) throw createError(ErrorDictionary.ORDER_NOT_FOUND);
    return order;
  }

  async create(orderData) {
    const customer = await usersRepo.findById(orderData.customer);
    if (!customer) throw createError(ErrorDictionary.USER_NOT_FOUND);

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw createError(ErrorDictionary.INVALID_ORDER_ITEMS);
    }

    // Logica de negocio: el total se calcula en el Service, nunca en el Repository.
    const total = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = await ordersRepo.create({
      ...orderData,
      total,
      status: ORDER_STATUS.CREATED,
      priority: orderData.priority || DELIVERY_PRIORITY.NORMAL,
    });

    logger.info(`Pedido creado: ${newOrder._id} (total: ${total})`);
    return newOrder;
  }

  async update(id, orderData) {
  if (orderData.status && !Object.values(ORDER_STATUS).includes(orderData.status)) {
    throw createError(ErrorDictionary.INVALID_ORDER_STATUS);
  }

  const updateData = { ...orderData };

  if (Object.prototype.hasOwnProperty.call(updateData, 'items')) {
    if (!Array.isArray(updateData.items) || updateData.items.length === 0) {
      throw createError(ErrorDictionary.INVALID_ORDER_ITEMS);
    }

    updateData.total = updateData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  const updatedOrder = await ordersRepo.update(id, updateData);

  if (!updatedOrder) {
    throw createError(ErrorDictionary.ORDER_NOT_FOUND);
  }

  if (updateData.status === ORDER_STATUS.CANCELLED) {
    logger.warning(`Pedido #${id} cancelado`);
  }

  return updatedOrder;
}

  async delete(id) {
    const deletedOrder = await ordersRepo.delete(id);
    if (!deletedOrder) throw createError(ErrorDictionary.ORDER_NOT_FOUND);
    return deletedOrder;
  }

  // Usado por el modulo de mocks: chequea que un pedido no tenga
  // entrega asociada antes de generarle una.
  async hasDelivery(orderId) {
    const deliveries = await deliveriesRepo.findAll({ order: orderId });
    return deliveries.length > 0;
  }
}

export default new OrdersService();
