import { expect, should } from "chai";
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
      "SecretKey: [CHANGED] 'key1': '**********' => '**********'",
      "SecretKey: [CHANGED] 'key2': '**********' => '**********'",
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

    expect(descriptions).to.deep.equal(["SecretKey: [REMOVED] 'key2'"]);
  });

  it("should create descriptions for new keys", () => {
    const newValues = { key1: "value1", key2: "value2", key3: "value3" };
    const existingValues = { key1: "value1", key2: "value2" };

    const changeSet = new ChangeSet(
      secretsManagerStub,
      newValues,
      existingValues,
    );

    const descriptions = changeSet.changeDesc();

    expect(descriptions).to.deep.equal([
      "SecretKey: [ADDED] 'key3': '**********'",
    ]);
  });

  it("should exclude keys from patterns", () => {
    const newValues = {
      _excluded: "some",
      key1: "value1",
      key2: "value2",
      key3: "value3",
    };
    const existingValues = { key1: "value1", key2: "value2" };

    const changeSet = new ChangeSet(
      secretsManagerStub,
      newValues,
      existingValues,
      ["^_"],
    );

    const descriptions = changeSet.changeDesc();

    expect(descriptions).to.deep.equal([
      "SecretKey: [SKIP] '_excluded'",
      "SecretKey: [ADDED] 'key3': '**********'",
    ]);
  });

  it("should show real values on logs", () => {
    const newValues = {
      _excluded: "some",
      key1: "value1",
      key2: "value2",
      key3: "value3",
    };
    const existingValues = { key1: "value1", key2: "value2" };

    const changeSet = new ChangeSet(
      secretsManagerStub,
      newValues,
      existingValues,
      ["^_"],
      true,
    );

    const descriptions = changeSet.changeDesc();

    expect(descriptions).to.deep.equal([
      "SecretKey: [SKIP] '_excluded'",
      "SecretKey: [ADDED] 'key3': 'value3'",
    ]);
  });
});
