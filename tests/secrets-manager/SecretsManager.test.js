import { expect } from "chai";
import sinon from "sinon";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import SecretsManager from "../../src/secrets-manager/SecretsManager.js";

describe("SecretsManager", () => {
  let secretsManagerClientStub;

  beforeEach(() => {
    secretsManagerClientStub = sinon.stub(
      SecretsManagerClient.prototype,
      "send",
    );
  });

  afterEach(() => {
    secretsManagerClientStub.restore();
  });

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

  describe("exists", () => {
    it("should return true", async () => {
      const secretName = "my-secret";

      secretsManagerClientStub.resolves({ SecretList: [{ Name: secretName }] });

      const secretsManager = new SecretsManager(
        "keyId",
        "secretKey",
        "region",
        secretName,
      );

      let exists = await secretsManager.exists();

      expect(exists).to.be.true;
    });

    it("should return false", async () => {
      const secretName = "my-secret";

      secretsManagerClientStub.resolves({ SecretList: [] });

      const secretsManager = new SecretsManager(
        "keyId",
        "secretKey",
        "region",
        secretName,
      );

      let exists = await secretsManager.exists();

      expect(exists).to.be.false;
    });
  });

  describe("create", () => {
    it("should create secret", async () => {
      const secretName = "my-secret";

      secretsManagerClientStub.resolves({ Name: secretName });

      const secretsManager = new SecretsManager(
        "keyId",
        "secretKey",
        "region",
        secretName,
      );

      await secretsManager.create();
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

      secretsManagerClientStub.resolves({ SecretString: expectedSecretString });

      const secretsManager = new SecretsManager(
        "keyId",
        "secretKey",
        "region",
        secretName,
      );

      const secretValues = await secretsManager.getValues();

      expect(secretValues).to.deep.equal(secrets);
    });

    it("should handle errors when fetching secret values", async () => {
      const secretName = "my-secret";

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
    });
  });

  describe("update", () => {
    it("should update secret values", async () => {
      const secretName = "my-secret";

      const newValues = { key1: "new-value1", key2: "new-value2" };

      secretsManagerClientStub.resolves({});

      const secretsManager = new SecretsManager(
        "keyId",
        "secretKey",
        "region",
        secretName,
      );

      await secretsManager.update(newValues);

      expect(secretsManagerClientStub.calledOnce).to.be.true;
    });

    it("should handle errors when updating secret values", async () => {
      const secretName = "my-secret";

      const newValues = { key1: "new-value1", key2: "new-value2" };

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

  describe("delete", async () => {
    it("should delete secret", async () => {
      const secretName = "my-secret";

      secretsManagerClientStub.resolves({});

      const secretsManager = new SecretsManager(
        "keyId",
        "secretKey",
        "region",
        secretName,
      );

      await secretsManager.delete();
    });

    it("should handle errors when deleting secret", async () => {
      const secretName = "my-secret";

      secretsManagerClientStub.rejects(new Error("Failed to delete secret"));

      const secretsManager = new SecretsManager(
        "keyId",
        "secretKey",
        "region",
        secretName,
      );

      try {
        await secretsManager.delete();
      } catch (error) {
        expect(error.message).to.equal("Failed to delete secret");
      }
    });
  });
});
