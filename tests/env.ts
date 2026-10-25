import { TEST_URL } from "./db-url";

Object.assign(process.env, {
  APP_URL: "https://yayo.test",
  DATABASE_URL: TEST_URL,
  AUTH_SECRET: "unit-test-secret-unit-test-secret-unit-test-secret",
  EMAIL_TRANSPORT: "file",
  EMAIL_FILE_DIR: `${process.cwd()}/.mail-unit`,
  AUTH_PASSWORD_BREACH_CHECK: "off",
  GOOGLE_CLIENT_ID: "client-123.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "test-secret",
});
