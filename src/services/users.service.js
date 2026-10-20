import bcrypt from 'bcrypt';
import usersRepo from '../repositories/users.repo.js';
import { USER_ROLES } from '../constants/index.js';
import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

class UsersService {
  async findAll() {
    return usersRepo.findAll();
  }

  async findById(id) {
    const user = await usersRepo.findById(id);
    if (!user) throw createError(ErrorDictionary.USER_NOT_FOUND);
    return user;
  }

  async create(userData) {
    if (userData.role === USER_ROLES.ADMIN) {
      throw createError(ErrorDictionary.ADMIN_CREATION_FORBIDDEN);
    }
    if (userData.role && !Object.values(USER_ROLES).includes(userData.role)) {
      throw createError(ErrorDictionary.INVALID_ROLE);
    }

    const normalizedEmail = userData.email.trim().toLowerCase();
    const existingUser = await usersRepo.findByEmail(normalizedEmail);
    if (existingUser) throw createError(ErrorDictionary.USER_ALREADY_EXISTS);

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await usersRepo.create({
      ...userData,
      email: normalizedEmail,
      password: hashedPassword,
    });
    logger.info(`Usuario creado: ${newUser.email} (rol: ${newUser.role})`);

    const { password, ...safeUser } = newUser.toObject();
    return safeUser;
  }

  async update(id, userData) {
    if (userData.role === USER_ROLES.ADMIN) {
      throw createError(ErrorDictionary.ADMIN_CREATION_FORBIDDEN);
    }

    if (userData.role && !Object.values(USER_ROLES).includes(userData.role)) {
      throw createError(ErrorDictionary.INVALID_ROLE);
    }

    const updateData = { ...userData };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await usersRepo.update(id, updateData);

    if (!updatedUser) {
      throw createError(ErrorDictionary.USER_NOT_FOUND);
    }

    return updatedUser;
  }

  async delete(id) {
    const deletedUser = await usersRepo.delete(id);
    if (!deletedUser) throw createError(ErrorDictionary.USER_NOT_FOUND);
    return deletedUser;
  }
}

export default new UsersService();
