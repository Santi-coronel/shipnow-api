import deliveriesRepo from '../repositories/deliveries.repo.js';
import ordersRepo from '../repositories/orders.repo.js';
import usersRepo from '../repositories/users.repo.js';
import { USER_ROLES, DELIVERY_STATUS } from '../constants/index.js';
import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

class DeliveriesService {
  async findAll(filter = {}) {
    return deliveriesRepo.findAll(filter);
  }

  async findById(id) {
    const delivery = await deliveriesRepo.findById(id);
    if (!delivery) throw createError(ErrorDictionary.DELIVERY_NOT_FOUND);
    return delivery;
  }

  async create(deliveryData) {
    const order = await ordersRepo.findById(deliveryData.order);
    if (!order) throw createError(ErrorDictionary.ORDER_NOT_FOUND);

    if (deliveryData.driver) {
      const driver = await usersRepo.findById(deliveryData.driver);
      if (!driver) throw createError(ErrorDictionary.USER_NOT_FOUND);
      if (driver.role !== USER_ROLES.DRIVER) throw createError(ErrorDictionary.DRIVER_NOT_VALID);
    }

    const newDelivery = await deliveriesRepo.create({
      ...deliveryData,
      status: deliveryData.driver ? DELIVERY_STATUS.ASSIGNED : DELIVERY_STATUS.PENDING,
      assignedAt: deliveryData.driver ? new Date() : null,
    });

    if (!deliveryData.driver) {
      logger.warning(`Entrega ${newDelivery._id} creada sin repartidor asignado`);
    } else {
      logger.info(`Entrega ${newDelivery._id} asignada al repartidor ${deliveryData.driver}`);
    }

    return newDelivery;
  }

  async update(id, deliveryData) {
    const updateData = { ...deliveryData };

    if (updateData.driver) {
      const driver = await usersRepo.findById(updateData.driver);
      if (!driver) throw createError(ErrorDictionary.USER_NOT_FOUND);
      if (driver.role !== USER_ROLES.DRIVER) {
        throw createError(ErrorDictionary.DRIVER_NOT_VALID);
      }
    }

    if (updateData.status && !Object.values(DELIVERY_STATUS).includes(updateData.status)) {
      throw createError(ErrorDictionary.INVALID_DELIVERY_STATUS);
    }
    if (updateData.status === DELIVERY_STATUS.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    const updatedDelivery = await deliveriesRepo.update(id, updateData);
    if (!updatedDelivery) throw createError(ErrorDictionary.DELIVERY_NOT_FOUND);
    return updatedDelivery;
  }

  async delete(id) {
    const deletedDelivery = await deliveriesRepo.delete(id);
    if (!deletedDelivery) throw createError(ErrorDictionary.DELIVERY_NOT_FOUND);
    return deletedDelivery;
  }
}

export default new DeliveriesService();
