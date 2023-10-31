import core from "@actions/core";
import Action from "./src/action/Action.js";

const getAction = () => {
  const exclude = core.getInput("exclude").split(",");

  return new Action(
    core.getInput("aws_access_key_id"),
    core.getInput("aws_secret_access_key"),
    core.getInput("aws_region"),
    core.getInput("secret_name"),
    core.getInput("json_file_path"),
    exclude,
  );
};

const run = async () => {
  try {
    const dryRun = core.getInput("dry_run") === "true";

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
