import core from "@actions/core";

import { getInput, getBooleanInput } from "./src/utils.js";
import Action from "./src/action/Action.js";

const getAction = () => {
  return new Action(
    getInput("aws_access_key_id"),
    getInput("aws_secret_access_key"),
    getInput("aws_region"),
    getInput("secret_name"),
    getInput("json_file_path"),
    getInput("exclude"),
    getBooleanInput("show_values", false),
    getBooleanInput("create_secret", false),
  );
};

const run = async () => {
  try {
    const dryRun = getBooleanInput("dry_run", false);

    const changeSet = await getAction().run();

    for (const desc of changeSet.changeDesc()) {
      core.info(desc);
    }

    if (!dryRun) {
      await changeSet.apply();
      core.info("Secrets has been synced!!");
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
