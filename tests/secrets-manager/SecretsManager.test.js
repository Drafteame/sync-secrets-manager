// test/SecretsManager.test.js
import chai, { expect } from "chai";
import sinon from "sinon";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  UpdateSecretCommand,
} from "@aws-sdk/client-secrets-manager";
import SecretsManager from "../../src/secrets-manager/SecretsManager.js";

describe("SecretsManager", () => {
  describe("Constructor", () => {
    it("should create a SecretsManager instance", () => {
      const secretsManager = new SecretsManager(
        "keyId",
        "secretKey",
        "region",
        "secretName",
      );

      expect(secretsManager).to.be.an.instanceOf(SecretsManager);
    });
  });

  describe("getValues", () => {
    it("should fetch and parse secret values", async () => {
      const secretName = "my-secret";

      const secrets = {
        key1: "value1",
        key2: "value2",
      };

      const expectedSecretString = JSON.stringify(secrets);

      const secretsManagerClientStub = sinon.stub(
        SecretsManagerClient.prototype,
        "send",
      );

      secretsManagerClientStub.resolves({ SecretString: expectedSecretString });

      const secretsManager = new SecretsManager(
        "keyId",
        "secretKey",
        "region",
        secretName,
      );

      const secretValues = await secretsManager.getValues();

      expect(secretValues).to.deep.equal(secrets);

      secretsManagerClientStub.restore();
    });

    it("should handle errors when fetching secret values", async () => {
      const secretName = "my-secret";

      const secretsManagerClientStub = sinon.stub(
        SecretsManagerClient.prototype,
        "send",
      );

      secretsManagerClientStub.rejects(new Error("Failed to fetch secret"));

      const secretsManager = new SecretsManager(
        "keyId",
        "secretKey",
        "region",
        secretName,
      );

      try {
        await secretsManager.getValues();
      } catch (error) {
        expect(error.message).to.equal("Failed to fetch secret");
      }

      secretsManagerClientStub.restore();
    });
  });

  describe("update", () => {
    it("should update secret values", async () => {
      const secretName = "my-secret";

      const newValues = { key1: "new-value1", key2: "new-value2" };

      const secretsManagerClientStub = sinon.stub(
        SecretsManagerClient.prototype,
        "send",
      );

      secretsManagerClientStub.resolves({});

      const secretsManager = new SecretsManager(
        "keyId",
        "secretKey",
        "region",
        secretName,
      );

      await secretsManager.update(newValues);

      expect(secretsManagerClientStub.calledOnce).to.be.true;

      secretsManagerClientStub.restore();
    });

    it("should handle errors when updating secret values", async () => {
      const secretName = "my-secret";

      const newValues = { key1: "new-value1", key2: "new-value2" };

      const secretsManagerClientStub = sinon.stub(
        SecretsManagerClient.prototype,
        "send",
      );

      secretsManagerClientStub.rejects(new Error("Failed to update secret"));

      const secretsManager = new SecretsManager(
        "keyId",
        "secretKey",
        "region",
        secretName,
      );

      try {
        await secretsManager.update(newValues);
      } catch (error) {
        expect(error.message).to.equal("Failed to update secret");
      }

      secretsManagerClientStub.restore();
    });

    it("should throw an error for empty new values", async () => {
      const secretName = "my-secret";

      const newValues = {};

      const secretsManager = new SecretsManager(
        "keyId",
        "secretKey",
        "region",
        secretName,
      );

      try {
        await secretsManager.update(newValues);
      } catch (error) {
        expect(error.message).to.equal("empty new secrets");
      }
    });
  });
});
