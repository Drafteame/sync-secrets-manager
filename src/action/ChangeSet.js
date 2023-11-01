import lodash from "lodash";
import chalk from "chalk";

import SecretsManager from "../secrets-manager/SecretsManager.js";

const logPrefix = chalk.cyan("SecretKey");
const skipTag = chalk.yellow("[SKIP]");
const addedTag = chalk.green("[ADDED]");
const changedTag = chalk.magenta("[CHANGED]");
const removedTag = chalk.red("[REMOVED]");
const valPlaceholder = "**********";

/**
 * ChangeSet is a class that represents a set of changes to be applied to secrets in AWS Secrets Manager.
 * It tracks the changes, provides descriptions, and allows applying those changes.
 */
export default class ChangeSet {
  /**
   * Array of change descriptions
   * @type {Array<string>}
   */
  #changeDesc;

  /**
   * Final updated secrets as object
   * @type {Object}
   */
  #updatedValues;

  /**
   * Secrets Manager client instance
   * @type {SecretsManager}
   */
  #smClient;

  /**
   * A regular expression to exclude keys
   * @type {string}
   */
  #skipPattern;

  /**
   * A flag to unhide secret values on log messages
   * @type {boolean}
   */
  #showValues;

  /**
   * Creates a new ChangeSet instance.
   *
   * @param {SecretsManager} smClient An instance of the SecretsManager class for interacting with AWS Secrets Manager.
   * @param {Object} newValues The new set of values to be applied to the secrets manager.
   * @param {Object} existingValues The existing set of values to be replaced by the new ones.
   * @param {string} skipPattern A regular expression to skip keys.
   * @param {boolean} showValues A flag to unhide secret values on log messages
   */
  constructor(
    smClient,
    newValues,
    existingValues,
    skipPattern,
    showValues = false,
  ) {
    this.#changeDesc = [];
    this.#updatedValues = { ...existingValues };
    this.#smClient = smClient;
    this.#skipPattern = skipPattern || "";
    this.#showValues = showValues;

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
      if (this.#shouldSkip(key)) {
        this.#skipDesc(key);
        continue;
      }

      if (existingValues[key] === newValues[key]) {
        continue;
      }

      this.#updatedValues[key] = newValues[key];

      if (existingValues[key] === undefined) {
        this.#addedDesc(key, newValues[key]);
        continue;
      }

      this.#changedDesc(key, existingValues[key], newValues[key]);
    }

    for (const key in existingValues) {
      if (newValues.hasOwnProperty(key)) {
        continue;
      }

      this.#removedDesc(key);

      delete this.#updatedValues[key];
    }
  }

  /**
   * Evaluate if the given key should skip the sync process by testing against the skip patterns.
   *
   * @param {string} key Single secret key to evaluate if it should be skipped.
   *
   * @returns {boolean}
   */
  #shouldSkip(key) {
    if (lodash.isEmpty(this.#skipPattern)) {
      return false;
    }

    let exp = new RegExp(this.#skipPattern);

    if (exp.test(key)) {
      return true;
    }

    return false;
  }

  /**
   * Create a skip message description and append to changeDesc array
   *
   * @param {string} key Name of the key
   */
  #skipDesc(key) {
    this.#changeDesc.push(`${logPrefix}: ${skipTag} '${key}'`);
  }

  /**
   * Create a skip message description and append to changeDesc array
   *
   * @param {string} key Name of the key
   */
  #removedDesc(key) {
    this.#changeDesc.push(`${logPrefix}: ${removedTag} '${key}'`);
  }

  /**
   * Create an added message description and append to changeDesc array
   *
   * @param {string} key Name of the key
   * @param {string} val Value that is set to the key
   */
  #addedDesc(key, val) {
    if (!this.#showValues) {
      val = valPlaceholder;
    }

    this.#changeDesc.push(`${logPrefix}: ${addedTag} '${key}': '${val}'`);
  }

  /**
   * Create a changed message description and append to changeDesc array
   *
   * @param {string} key Name of the key
   * @param {string} oldVal Las secret value before sync
   * @param {string} newVal New secret value after sync
   */
  #changedDesc(key, oldVal, newVal) {
    if (!this.#showValues) {
      oldVal = valPlaceholder;
      newVal = valPlaceholder;
    }

    this.#changeDesc.push(
      `${logPrefix}: ${changedTag} '${key}': '${oldVal}' => '${newVal}'`,
    );
  }
}
