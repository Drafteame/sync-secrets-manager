import SecretsManager from "../secrets-manager/SecretsManager.js";

/**
 * ChangeSet is a class that represents a set of changes to be applied to secrets in AWS Secrets Manager.
 * It tracks the changes, provides descriptions, and allows applying those changes.
 */
export default class ChangeSet {
  #changeDesc; // Array of Change descriptions
  #updatedValues; // Final updated secrets as object
  #smClient; // SecretsManager object

  /**
   * Creates a new ChangeSet instance.
   *
   * @param {SecretsManager} smClient - An instance of the SecretsManager class for interacting with AWS Secrets Manager.
   * @param {Object} newValues - The new set of values to be applied to the secrets manager.
   * @param {Object} existingValues - The existing set of values to be replaced by the new ones.
   */
  constructor(smClient, newValues, existingValues) {
    this.#changeDesc = [];
    this.#updatedValues = { ...existingValues };
    this.#smClient = smClient;

    this.#eval(newValues, existingValues);
  }

  /**
   * Returns descriptions for the resultant change set.
   *
   * @returns {Array<string>} An array with change set descriptions.
   */
  changeDesc() {
    return this.#changeDesc;
  }

  /**
   * Applies the change set to update the given secrets in AWS Secrets Manager.
   *
   * @returns {Promise} A promise that resolves when the update is completed.
   */
  async apply() {
    await this.#smClient.update(this.#updatedValues);
  }

  /**
   * Evaluates the two given sets of values to create an update set for later application.
   *
   * @param {Object} newValues - The new set of values to be applied to secrets manager.
   * @param {Object} existingValues - The existing set of values to be replaced by the new ones.
   */
  #eval(newValues, existingValues) {
    // Check for changes and update the secret (or preview changes)
    for (const key in newValues) {
      if (existingValues[key] === newValues[key]) {
        continue;
      }

      this.#updatedValues[key] = newValues[key];

      if (existingValues[key] === undefined) {
        this.#changeDesc.push(
          `SecretKey: [ADDED] '${key}': '${newValues[key]}'`,
        );

        continue;
      }

      this.#changeDesc.push(
        `SecretKey: [CHANGE] '${key}': '${existingValues[key]}' => '${newValues[key]}'`,
      );
    }

    for (const key in existingValues) {
      if (newValues.hasOwnProperty(key)) {
        continue;
      }

      this.#changeDesc.push(`SecretKey: [REMOVED] '${key}'`);

      delete this.#updatedValues[key];
    }
  }
}