import {
  SecretsManagerClient,
  GetSecretValueCommand,
  UpdateSecretCommand,
} from "@aws-sdk/client-secrets-manager";

import lodash from "lodash";

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

  async getValues() {
    const getSecretParams = { SecretId: this.secretName };
    const getSecretCommand = new GetSecretValueCommand(getSecretParams);
    const currentSecretValue = await this.client.send(getSecretCommand);

    return JSON.parse(currentSecretValue.SecretString);
  }

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
