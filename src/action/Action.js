import fs from "fs";

import SecretsManager from "../secrets-manager/SecretsManager.js";
import ChangeSet from "./ChangeSet.js";

const defaultSkipPattern = "^_";

/**
 * Action is a class representing an action to synchronize secrets with AWS Secrets Manager.
 * It validates input data, fetches existing secrets, and creates a change set for updates.
 */
export default class Action {
  /**
   * Path to json file
   * @type {string}
   */
  #jsonFile;

  /**
   * Regexp to that evaluates if a kip should skip the sync process
   * @type {string}
   */
  #skipPattern;

  /**
   * Flag to hide or not secret values on logs
   * @type {boolean}
   */
  #showValues;

  /**
   * Secrets Manager client instance
   * @type {SecretsManager}
   */
  #smClient;

  /**
   * Creates a new Action instance.
   *
   * @param {string} keyId The AWS access key ID.
   * @param {string} secretKey The AWS secret access key.
   * @param {string} region The AWS region.
   * @param {string} secretName The name of the secret in AWS Secrets Manager.
   * @param {string} jsonFile The path to the JSON file containing the new secret values.
   * @param {string} skipPattern A regular expression that eval keys of the json file and if match,
   *        that key should be omitted
   * @param {string} showValues If this flag is set to true all secret values will be displayed on logs,
   *        if false, a place holder will be displayed.
   *
   * @throws {Error} Throws an error if any required parameter is missing or if the JSON file doesn't exist.
   */
  constructor(
    keyId,
    secretKey,
    region,
    secretName,
    jsonFile,
    skipPattern,
    showValues = false,
  ) {
    this.#validateData(keyId, secretKey, region, secretName, jsonFile);

    this.#jsonFile = jsonFile;
    this.#skipPattern = skipPattern || defaultSkipPattern;
    this.#showValues = showValues;

    this.#smClient = new SecretsManager(keyId, secretKey, region, secretName);
  }

  /**
   * Set the secrets manager client
   *
   * @param {SecretsManager} client Instance of a secrets manager object
   */
  setSmClient(client) {
    this.#smClient = client;
  }

  /**
   * Runs the action to synchronize secrets by fetching existing secrets and creating a change set.
   *
   * @returns {Promise<ChangeSet>} A promise that resolves to a ChangeSet instance representing the changes to be applied.
   */
  async run() {
    const existingSecretData = await this.#smClient.getValues();
    const newSecretData = JSON.parse(fs.readFileSync(this.#jsonFile, "utf8"));

    return new ChangeSet(
      this.#smClient,
      newSecretData,
      existingSecretData,
      this.#skipPattern,
      this.#showValues,
    );
  }

  /**
   * Validates input data, ensuring that required parameters are provided and the JSON file exists.
   *
   * @param {string} keyId - The AWS access key ID.
   * @param {string} secretKey - The AWS secret access key.
   * @param {string} region - The AWS region.
   * @param {string} secretName - The name of the secret in AWS Secrets Manager.
   * @param {string} jsonFile - The path to the JSON file containing the new secret values.
   *
   * @throws {Error} Throws an error if any required parameter is missing or if the JSON file doesn't exist.
   */
  #validateData(keyId, secretKey, region, secretName, jsonFile) {
    if (!keyId) {
      throw new Error("Missing aws_access_key_id");
    }

    if (!secretKey) {
      throw new Error("Missing aws_secret_access_key");
    }

    if (!region) {
      throw new Error("Missing aws_region");
    }

    if (!secretName) {
      throw new Error("Missing secret_name");
    }

    if (!jsonFile) {
      throw new Error("Missing json_file_path");
    }

    // Check if the JSON file exists
    if (!fs.existsSync(jsonFile)) {
      throw new Error(`JSON file does not exist at path: ${jsonFile}`);
    }
  }
}
