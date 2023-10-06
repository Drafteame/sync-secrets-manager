/**
 * ChangeSet is a class that receives a SecretsManager instance, a new set of values and an existing set of values
 * to be compared and create a new updated set to be applied.
 */
export default class ChangeSet {
  #changeDesc; // Array of Change descriptions
  #updatedValues; // Final updated secrets as object
  #smClient; // SecretsManager object

  constructor(smClient, newValues, existingValues) {
    this.#changeDesc = [];
    this.#updatedValues = { ...existingValues };
    this.#smClient = smClient;

    this.#eval(newValues, existingValues);
  }

  /**
   * Return descriptions for the resultant change set.
   *
   * @returns {Array<string>} Array with change set descriptions.
   */
  changeDesc() {
    return this.#changeDesc;
  }

  /**
   * Apply change set to update the given secrets manager.
   * @return {Promise}
   */
  async apply() {
    await this.#smClient.update(this.#updatedValues);
  }

  /**
   * Evaluate the two given set of values to create an update set for latter application.
   *
   * @param {Object} newValues New set of values to be applied to secrets manager
   * @param {Object} existingValues Existing set of values to be replaced by the new ones.
   */
  #eval(newValues, existingValues) {
    // Check for changes and update the secret (or preview changes)
    for (const key in newValues) {
      if (existingValues[key] === newValues[key]) {
        continue;
      }

      this.#changeDesc.push(
        `Key: ${key}, New Value: ${newValues[key]}, Old Value: ${existingValues[key]}`,
      );

      this.#updatedValues[key] = newValues[key];
    }

    for (const key in existingValues) {
      if (newValues.hasOwnProperty(key)) {
        continue;
      }

      this.#changeDesc.push(`Key: ${key}, Removed`);

      delete this.#updatedValues[key];
    }
  }
}
