import fs from "fs";
import { expect } from "chai";
import sinon from "sinon";

import Action from "../../src/action/Action.js";
import SecretsManager from "../../src/secrets-manager/SecretsManager.js";
import ChangeSet from "../../src/action/ChangeSet.js";

describe("Action", () => {
  let action;
  let secretsManagerStub;

  let fsStub;

  beforeEach(() => {
    // Create a stub for SecretsManager
    secretsManagerStub = sinon.createStubInstance(SecretsManager);

    fsStub = sinon.stub(fs, "existsSync").returns(true);

    // Initialize Action instance with stubbed SecretsManager
    action = new Action(
      "keyId",
      "secretKey",
      "region",
      "secretName",
      "path/to/json/file.json",
    );

    action.smClient = secretsManagerStub;
  });

  afterEach(() => {
    fsStub.restore();
  });

  it("should create an Action instance", () => {
    expect(action).to.be.an.instanceOf(Action);
  });

  it("should throw an error if aws_access_key_id is missing", () => {
    expect(
      () =>
        new Action(
          "",
          "secretKey",
          "region",
          "secretName",
          "path/to/json/file.json",
        ),
    ).to.throw("Missing aws_access_key_id");
  });

  it("should throw an error if aws_secret_access_key is missing", () => {
    expect(
      () =>
        new Action(
          "keyId",
          "",
          "region",
          "secretName",
          "path/to/json/file.json",
        ),
    ).to.throw("Missing aws_secret_access_key");
  });

  it("should throw an error if aws_region is missing", () => {
    expect(
      () =>
        new Action(
          "keyId",
          "secretKey",
          "",
          "secretName",
          "path/to/json/file.json",
        ),
    ).to.throw("Missing aws_region");
  });

  it("should throw an error if secret_name is missing", () => {
    expect(
      () =>
        new Action(
          "keyId",
          "secretKey",
          "region",
          "",
          "path/to/json/file.json",
        ),
    ).to.throw("Missing secret_name");
  });

  it("should throw an error if json_file_path is missing", () => {
    expect(
      () => new Action("keyId", "secretKey", "region", "secretName", ""),
    ).to.throw("Missing json_file_path");
  });

  it("should throw an error if JSON file does not exist", () => {
    const nonExistentFilePath = "non-existent-file.json";

    fsStub.restore();

    expect(
      () =>
        new Action(
          "keyId",
          "secretKey",
          "region",
          "secretName",
          nonExistentFilePath,
        ),
    ).to.throw(`JSON file does not exist at path: ${nonExistentFilePath}`);
  });

  it("should call getValues and return a ChangeSet when run is called", async () => {
    const existingSecretData = { key1: "value1", key2: "value2" };
    const newSecretData = { key1: "new-value1", key2: "new-value2" };

    // Stub the behavior of SecretsManager.getValues
    secretsManagerStub.getValues.resolves(existingSecretData);

    // Stub fs.readFileSync to return the newSecretData JSON
    sinon.stub(fs, "readFileSync").returns(JSON.stringify(newSecretData));

    const changeSet = await action.run();

    expect(changeSet).to.be.an.instanceOf(ChangeSet);
    expect(secretsManagerStub.getValues.calledOnce).to.be.true;
    expect(fs.readFileSync.calledOnce).to.be.true;

    // Clean up the fs.readFileSync stub
    fs.readFileSync.restore();
  });
});
