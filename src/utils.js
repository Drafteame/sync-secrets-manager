import core from "@actions/core";
import lodash from "lodash";

/**
 * Get action input with default value
 * @param {string} input input name to retrieve
 * @param {string} value string default value
 * @returns {string} The value of input, if is empty it return the default one
 */
export function getInput(input, value = "") {
  const inputValue = core.getInput(input);

  if (lodash.isEmpty(inputValue)) {
    return value;
  }

  return inputValue;
}

/**
 * Get action boolean input
 * @param {string} input input name to retrieve
 * @param {boolean} value boolean default value
 * @returns {boolean} The value of the input, if it is empty ir return the default one
 */
export function getBooleanInput(input, value = false) {
  const inputValue = core.getInput(input);

  if (lodash.isEmpty(inputValue)) {
    return value;
  }

  return inputValue.trim().toLowerCase() === "true";
}
