import { faker } from '@faker-js/faker';
import { USER_ROLES, MOCKING_PARAMETERS } from '../constants/index.js';

// Roles que tiene sentido generar de forma simulada (ADMIN queda afuera
// a proposito, igual que en el endpoint real de creacion de usuarios).
const MOCKEABLE_ROLES = [USER_ROLES.CUSTOMER, USER_ROLES.DRIVER, USER_ROLES.STORE];

export const generateMockUser = () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName }).toLowerCase();
  const role = faker.helpers.arrayElement(MOCKEABLE_ROLES);

  return {
    firstName,
    lastName,
    email,
    password: MOCKING_PARAMETERS.DEFAULT_PASSWORD,
    role,
    isAvailable: role === USER_ROLES.DRIVER ? faker.datatype.boolean() : true,
  };
};

export const generateMockUsers = (qty) => Array.from({ length: qty }, generateMockUser);
