import { expect } from "chai";
import sinon from "sinon";

import ChangeSet from "../../src/action/ChangeSet.js";
import SecretsManager from "../../src/secrets-manager/SecretsManager.js";

describe("ChangeSet", () => {
  let secretsManagerStub;

  beforeEach(() => {
    secretsManagerStub = sinon.createStubInstance(SecretsManager);
  });

  it("should create a ChangeSet instance", () => {
    const newValues = { key1: "new-value1", key2: "new-value2" };
    const existingValues = { key1: "value1", key2: "value2" };

    const changeSet = new ChangeSet(
      secretsManagerStub,
      newValues,
      existingValues,
    );

    expect(changeSet).to.be.an.instanceOf(ChangeSet);
  });

  it("should return change descriptions when changeDesc is called", () => {
    const newValues = { key1: "new-value1", key2: "new-value2" };
    const existingValues = { key1: "value1", key2: "value2" };

    const changeSet = new ChangeSet(
      secretsManagerStub,
      newValues,
      existingValues,
    );

    const descriptions = changeSet.changeDesc();

    expect(descriptions).to.be.an("array");
    expect(descriptions).to.have.lengthOf(2); // Two changes: key1 and key2
  });

  it("should apply changes when apply is called", async () => {
    const newValues = { key1: "new-value1", key2: "new-value2" };
    const existingValues = { key1: "value1", key2: "value2" };

    secretsManagerStub.update.resolves({});

    const changeSet = new ChangeSet(
      secretsManagerStub,
      newValues,
      existingValues,
    );

    await changeSet.apply();
  });

  it("should create change descriptions for modifications", () => {
    const newValues = { key1: "new-value1", key2: "new-value2" };
    const existingValues = { key1: "value1", key2: "value2" };

    const changeSet = new ChangeSet(
      secretsManagerStub,
      newValues,
      existingValues,
    );

    const descriptions = changeSet.changeDesc();

    expect(descriptions).to.deep.equal([
      "Key: key1, New Value: new-value1, Old Value: value1",
      "Key: key2, New Value: new-value2, Old Value: value2",
    ]);
  });

  it("should create change descriptions for removals", () => {
    const newValues = { key1: "value1" }; // Key2 is removed
    const existingValues = { key1: "value1", key2: "value2" };

    const changeSet = new ChangeSet(
      secretsManagerStub,
      newValues,
      existingValues,
    );

    const descriptions = changeSet.changeDesc();

    expect(descriptions).to.deep.equal(["Key: key2, Removed"]);
  });
});
