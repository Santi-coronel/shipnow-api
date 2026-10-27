import User from '../models/user.model.js';

// Unico archivo del proyecto que conoce Mongoose para la entidad User.
// Encapsula defaults de proyeccion (nunca devuelve el password).
class UsersRepository {
  async findAll(filter = {}) {
    return User.find(filter).select('-password');
  }

  async findById(id) {
    return User.findById(id).select('-password');
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async create(userData) {
    return User.create(userData);
  }

  async update(id, userData) {
    const updated = await User.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    });
    if (!updated) return null;
    return User.findById(id).select('-password');
  }

  async delete(id) {
    return User.findByIdAndDelete(id);
  }

  async insertMany(usersData) {
    return User.insertMany(usersData);
  }
}

export default new UsersRepository();
