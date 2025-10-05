import { faker } from '@faker-js/faker';

/**
 * Generate random user data for sign-up.
 * Matches Conduit form fields.
 */
export function generateNewUserData() {
  const username = faker.internet.userName().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const email = faker.internet.email(username).toLowerCase();
  const password = faker.internet.password(10);

  return { username, email, password };
}
