import fs from "fs";
import core from "@actions/core";

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
   * Flag to create the secret before sync if not exists
   * @type {boolean}
   */
  #createSecretFlag;

  /**
   * Flag that marks the specified secret to be deleted
   */
  #deleteSecretFlag;

  /**
   * Creates a new Action instance.
   *
   * @param {string} keyId The AWS access key ID.
   * @param {string} secretKey The AWS secret access key.
   * @param {string} region The AWS region.
   * @param {string} secretName The name of the secret in AWS Secrets Manager.
   * @param {string} jsonFile The path to the JSON file containing the new secret values.
   * @param {string} skipPattern A regular expression that eval keys of the json file and if matched,
   *        that key should be omitted
   * @param {boolean} showValues If this flag is set to true all secret values will be displayed on logs,
   *        if false, a placeholder will be displayed.
   * @param {boolean} createSecret Flag to create the secret before sync if not exists
   * @param {boolean} deleteSecret Flag that marks the specified secret to be deleted.
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
    createSecret = false,
    deleteSecret = false,
  ) {
    this.#validateData(
      keyId,
      secretKey,
      region,
      secretName,
      jsonFile,
      deleteSecret,
    );

    this.#jsonFile = jsonFile;
    this.#skipPattern = skipPattern || defaultSkipPattern;
    this.#showValues = showValues;
    this.#createSecretFlag = createSecret;
    this.#deleteSecretFlag = deleteSecret;

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
   * Set the flag value after constructor.
   *
   * @param {boolean} flag value of the flag
   */
  setCreateSecretFlag(flag) {
    this.#createSecretFlag = flag;
  }

  /**
   * Set the deleteSecretFlag after constructor.
   *
   * @param {boolean} flag - Value of the flag
   */
  setDeleteSecretFlag(flag) {
    this.#deleteSecretFlag = flag;
  }

  /**
   * Runs the action to synchronize secrets by fetching existing secrets and creating a change set.
   *
   * @returns {Promise<ChangeSet>} A promise that resolves to a ChangeSet instance representing the changes to be applied.
   */
  async run() {
    await this.#createSecret();

    let existingSecretData = {};
    let newSecretData = {};

    if (!this.#deleteSecretFlag) {
      existingSecretData = await this.#smClient.getValues();
      newSecretData = JSON.parse(fs.readFileSync(this.#jsonFile, "utf8"));
    }

    return new ChangeSet(
      this.#smClient,
      newSecretData,
      existingSecretData,
      this.#skipPattern,
      this.#showValues,
      this.#deleteSecretFlag,
    );
  }

  /**
   * Execute secret creation if needed
   */
  async #createSecret() {
    if (this.#deleteSecretFlag || !this.#createSecretFlag) {
      core.info("secret creation skip...");
      return;
    }

    if (await this.#smClient.exists()) {
      return;
    }

    await this.#smClient.create();
  }

  /**
   * Validates input data, ensuring that required parameters are provided and the JSON file exists.
   *
   * @param {string} keyId - The AWS access key ID.
   * @param {string} secretKey - The AWS secret access key.
   * @param {string} region - The AWS region.
   * @param {string} secretName - The name of the secret in AWS Secrets Manager.
   * @param {string} jsonFile - The path to the JSON file containing the new secret values.
   * @param {boolean} deleteSecret - Flag to validate if the secret should be deleted.
   *
   * @throws {Error} Throws an error if any required parameter is missing or if the JSON file doesn't exist.
   */
  #validateData(keyId, secretKey, region, secretName, jsonFile, deleteSecret) {
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

    if (!deleteSecret) {
      if (!jsonFile) {
        throw new Error("Missing json_file_path");
      }

      // Check if the JSON file exists
      if (!fs.existsSync(jsonFile)) {
        throw new Error(`JSON file does not exist at path: ${jsonFile}`);
      }
    }
  }
}
