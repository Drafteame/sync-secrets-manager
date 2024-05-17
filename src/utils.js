import core from "@actions/core";

/**
 * Checks if a given value is empty.
 *
 * @param {*} value - The value to check for emptiness.
 * @returns {boolean} - Returns true if the value is empty, false otherwise.
 */
export function isEmpty(value) {
  if (value == null || value == undefined) {
    // Handles null and undefined
    return true;
  }

  if (typeof value === "boolean") {
    // Boolean values are never empty
    return false;
  }

  if (typeof value === "number") {
    // Number values are never empty
    return false;
  }

  if (typeof value === "string") {
    // Check if the string is empty
    return value.trim().length === 0;
  }

  // For any other types, assume it's not empty
  return false;
}

/**
 * Get action input with default value
 * @param {string} input input name to retrieve
 * @param {string} value string default value
 * @returns {string} The value of input, if is empty it return the default one
 */
export function getInput(input, value = "") {
  const inputValue = core.getInput(input);

  if (isEmpty(inputValue)) {
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

  if (isEmpty(inputValue)) {
    return value;
  }

  return inputValue.trim().toLowerCase() === "true";
}
