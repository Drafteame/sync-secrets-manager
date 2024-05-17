#! /usr/bin/env node

import { program } from "commander";

import Action from "../src/action/Action.js";

const sync = async (secret, options) => {
  console.log(secret);
  console.log(options);

  const action = new Action(
    options.awsAccessKey,
    options.awsSecretKey,
    options.awsRegion,
    secret,
    options.file,
    options.exclude || "^_",
    options.showValues,
    options.createSecret,
  );

  const changeSet = await action.run();

  for (const desc of changeSet.changeDesc()) {
    console.log(desc);
  }

  if (!dryRun) {
    await changeSet.apply();
    console.log("Secrets has been synced!!");
  }
};

program
  .command("sync")
  .argument("<secret-name>", "Secret name")
  .option("--file <string>", "Path to json file to be synced", "")
  .option("--create-secret", "Create secret if not exists")
  .option("--show-values", "Show secret values when viewing change set")
  .option("--dry-run", "Preview changes without modifying the secret")
  .option("--aws-access-key <string>", "AWS Access key id", "")
  .option("--aws-secret-key <string>", "AWS Secret access key", "")
  .option("--aws-region <string>", "AWS region", "")
  .option(
    "--exclude <string>",
    "Regular expression to match keys to be excluded from sync",
  )
  .description("Sync secrets file")
  .action(sync);

program.parse();
