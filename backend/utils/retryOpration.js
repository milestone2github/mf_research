/**
 * Retries the given asynchronous operation until it succeeds or max retries are reached.
 * @param {Function} operation - An async function representing the operation to retry.
 * @param {number} maxRetries - Maximum number of retries.
 * @param {number} delay - Delay between retries in milliseconds.
 * @returns {Promise<*>} - Resolves with the operation result or rejects with the last error.
 */
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed: ${error.message}`);
      if (attempts >= maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

module.exports = retryOperation;