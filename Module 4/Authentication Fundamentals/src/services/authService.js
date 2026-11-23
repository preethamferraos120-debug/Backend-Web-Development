const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

class AuthError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function bcryptCost() {
  const cost = Number(process.env.BCRYPT_COST || 12);
  return Number.isInteger(cost) && cost >= 4 && cost <= 31 ? cost : 12;
}

async function register(input) {
  if (!input || !isNonEmptyString(input.name) ||
      !isNonEmptyString(input.email) || !isNonEmptyString(input.password)) {
    throw new AuthError(400, 'INVALID_INPUT', 'Name, email, and password are required');
  }

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const passwordHash = await bcrypt.hash(input.password, bcryptCost());

  try {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AuthError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists');
    }
    const created = await userRepository.createUser({ name, email, passwordHash });
    return safeUser(created);
  } catch (error) {
    if (error instanceof AuthError) throw error;
    if (error && error.code === 'P2002') {
      throw new AuthError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists');
    }
    throw error;
  }
}

async function login(input) {
  if (!input || !isNonEmptyString(input.email) || !isNonEmptyString(input.password)) {
    throw new AuthError(400, 'INVALID_INPUT', 'Email and password are required');
  }

  const user = await userRepository.findByEmail(normalizeEmail(input.email));
  // Missing accounts and incorrect passwords share one generic response.
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AuthError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }
  return safeUser(user);
}

module.exports = { register, login, AuthError };
