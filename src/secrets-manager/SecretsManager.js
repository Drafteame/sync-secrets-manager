import {
  SecretsManagerClient,
  GetSecretValueCommand,
  UpdateSecretCommand,
} from "@aws-sdk/client-secrets-manager";

import lodash from "lodash";

/**
 * SecretsManager creates wrapped methods to execute actions over a configured
 * secrets manager instance.
 */
export default class SecretsManager {
  constructor(keyId, secretKey, region, secretName) {
    this.secretName = secretName;

    this.client = new SecretsManagerClient({
      region: region,
      credentials: {
        accessKeyId: keyId,
        secretAccessKey: secretKey,
      },
    });
  }

  /**
   * Obtain the current values of the configured secrets manager.
   *
   * @returns {Object}
   */
  async getValues() {
    const getSecretParams = { SecretId: this.secretName };
    const getSecretCommand = new GetSecretValueCommand(getSecretParams);
    const currentSecretValue = await this.client.send(getSecretCommand);

    return JSON.parse(currentSecretValue.SecretString);
  }

  /**
   * Take a new set of values an replace the current values for the configured secrets manager.
   *
   * @param {Object} newValues Object with new values to replace existing ones on secrets manager
   */
  async update(newValues) {
    if (lodash.isEmpty(newValues)) {
      throw new Error("empty new secrets");
    }

    const updateSecretParams = {
      SecretId: this.secretName,
      SecretString: JSON.stringify(newValues),
    };

    const updateSecretCommand = new UpdateSecretCommand(updateSecretParams);
    await this.client.send(updateSecretCommand);
  }
}
