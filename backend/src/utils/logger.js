/*
 * Minimal logger wrapper. Swap with Winston/Pino later without touching business logic.
 */
const info = (message, meta) => {
  if (meta) {
    console.log(message, meta);
  } else {
    console.log(message);
  }
};

const error = (message, meta) => {
  if (meta) {
    console.error(message, meta);
  } else {
    console.error(message);
  }
};

module.exports = { info, error };
