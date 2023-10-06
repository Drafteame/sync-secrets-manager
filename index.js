import core from "@actions/core";
import Action from "./src/action/Action.js";

async function run() {
  try {
    const dryRun = core.getInput("dry_run") === "true";

    const action = new Action(
      core.getInput("aws_access_key_id"),
      core.getInput("aws_secret_access_key"),
      core.getInput("aws_region"),
      core.getInput("secret_name"),
      core.getInput("json_file_path"),
    );

    const changeSet = await action.run();

    for (const desc of changeSet.changeDesc()) {
      core.info(desc);
    }

    if (!dryRun) {
      await changeSet.apply();
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
