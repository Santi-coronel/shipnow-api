import bcrypt from 'bcrypt';
import { generateMockUsers } from '../mocks/user.mocks.js';
import { generateMockOrders } from '../mocks/order.mocks.js';
import { generateMockDeliveries } from '../mocks/delivery.mocks.js';
import usersRepo from '../repositories/users.repo.js';
import ordersRepo from '../repositories/orders.repo.js';
import deliveriesRepo from '../repositories/deliveries.repo.js';
import { MOCKING_PARAMETERS } from '../constants/index.js';
import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

// Valida que qty sea un entero positivo dentro del rango permitido.
// La validacion vive en el Service, no en el router ni en el controller.
function parseQty(qty) {
  const parsedQty = qty === undefined ? MOCKING_PARAMETERS.DEFAULT_QTY : Number(qty);
  if (!Number.isInteger(parsedQty) || parsedQty < MOCKING_PARAMETERS.MIN_QTY) {
    throw createError(ErrorDictionary.INVALID_QUANTITY);
  }
  if (parsedQty > MOCKING_PARAMETERS.MAX_QTY) {
    throw createError({
      ...ErrorDictionary.INVALID_QUANTITY,
      message: `La cantidad maxima permitida es ${MOCKING_PARAMETERS.MAX_QTY}`,
    });
  }
  return parsedQty;
}

class MocksService {
  // ---- Generacion sin persistir ----

  getUsers(qty) {
    return generateMockUsers(parseQty(qty));
  }

  async getOrders(qty) {
    const parsedQty = parseQty(qty);
    const existingCustomers = await usersRepo.findAll();
    if (existingCustomers.length === 0) {
      throw createError({
        ...ErrorDictionary.MOCK_DEPENDENCY_MISSING,
        message: 'No hay usuarios en la base para generar pedidos simulados. Primero sembra usuarios.',
      });
    }
    return generateMockOrders(parsedQty, existingCustomers);
  }

  async getDeliveries(qty) {
    const parsedQty = parseQty(qty);
    const existingOrders = await ordersRepo.findAll();
    const existingUsers = await usersRepo.findAll();
    if (existingOrders.length === 0) {
      throw createError({
        ...ErrorDictionary.MOCK_DEPENDENCY_MISSING,
        message: 'No hay pedidos en la base para generar entregas simuladas. Primero sembra pedidos.',
      });
    }
    return generateMockDeliveries(parsedQty, existingOrders, existingUsers);
  }

  // ---- Generacion + persistencia controlada ----

  async seedUsers(qty) {
    const users = this.getUsers(qty);
    try {
      const usersToInsert = await Promise.all(
        users.map(async (user) => ({ ...user, password: await bcrypt.hash(user.password, 10) }))
      );
      const inserted = await usersRepo.insertMany(usersToInsert);
      logger.info(`Mocks: ${inserted.length} usuarios insertados`);
      return { insertados: inserted.length, coleccion: 'usuarios', usuarios: inserted };
    } catch (error) {
      logger.error(`Mocks: fallo la carga de usuarios - ${error.message}`);
      throw createError(ErrorDictionary.MOCK_SEED_FAILED);
    }
  }

  async seedOrders(qty) {
    const orders = await this.getOrders(qty);
    try {
      const inserted = await ordersRepo.insertMany(orders);
      logger.info(`Mocks: ${inserted.length} pedidos insertados`);
      return { insertados: inserted.length, coleccion: 'pedidos', pedidos: inserted };
    } catch (error) {
      logger.error(`Mocks: fallo la carga de pedidos - ${error.message}`);
      throw createError(ErrorDictionary.MOCK_SEED_FAILED);
    }
  }

  async seedDeliveries(qty) {
    const deliveries = await this.getDeliveries(qty);
    try {
      const inserted = await deliveriesRepo.insertMany(deliveries);
      logger.info(`Mocks: ${inserted.length} entregas insertadas`);
      return { insertados: inserted.length, coleccion: 'entregas', entregas: inserted };
    } catch (error) {
      logger.error(`Mocks: fallo la carga de entregas - ${error.message}`);
      throw createError(ErrorDictionary.MOCK_SEED_FAILED);
    }
  }

  // Siembra en cascada: usuarios -> pedidos -> entregas, respetando
  // las relaciones de punta a punta en una sola llamada.
  async seedAll({ usersQty, ordersQty, deliveriesQty }) {
    const usersResult = await this.seedUsers(usersQty);
    const ordersResult = await this.seedOrders(ordersQty);
    const deliveriesResult = await this.seedDeliveries(deliveriesQty);

    return {
      usuarios: usersResult.insertados,
      pedidos: ordersResult.insertados,
      entregas: deliveriesResult.insertados,
    };
  }
}

export default new MocksService();
