import fs from "fs";

import SecretsManager from "../secrets-manager/SecretsManager.js";
import ChangeSet from "./ChangeSet.js";

export default class Action {
  constructor(keyId, secretKey, region, secretName, jsonFile) {
    this.validateData(keyId, secretKey, region, secretName, jsonFile);

    this.jsonFile = jsonFile;

    this.smClient = new SecretsManager(keyId, secretKey, region, secretName);
  }

  validateData(keyId, secretKey, region, secretName, jsonFile) {
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

  async run() {
    const existingSecretData = await this.smClient.getValues();
    const newSecretData = JSON.parse(fs.readFileSync(this.jsonFile, "utf8"));

    return new ChangeSet(this.smClient, newSecretData, existingSecretData);
  }
}
