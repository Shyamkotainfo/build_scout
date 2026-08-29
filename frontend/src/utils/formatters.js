/**
 * Formats a confidence value into a valid percentage string.
 * Handles both normalized (0-1) and percentage (0-100) inputs.
 * Ensures the output is between 0% and 100%.
 * 
 * @param {number|string} value - The confidence value
 * @returns {string} - Formatted percentage string (e.g. '72%')
 */
export const formatConfidence = (value) => {
  if (value === undefined || value === null) {
    return '0%';
  }
  
  let numericValue;
  
  // If the value is a string with a percent sign, parse it
  if (typeof value === 'string' && value.endsWith('%')) {
    numericValue = Number(value.replace('%', ''));
  } else {
    numericValue = Number(value);
  }

  if (isNaN(numericValue)) {
    return '0%';
  }

  // Determine if the value is on a 0-1 scale or 0-100 scale
  // If it's a decimal <= 1 (and > 0), treat it as normalized
  // If it's exactly 1, it could be either 1% or 100%, but 1 is usually 100% in normalized scale.
  // Wait, if backend returns 1 for 1%, the logic might be ambiguous.
  // The safest way: if it's > 1, it's definitely 0-100 scale.
  // If it's between 0 and 1 (exclusive), it's normalized.
  // If it's 1, we assume it's 100% if the system uses normalized, but since backend uses 0-100, 1 could mean 1%.
  // The requirement says:
  // 72 -> 72%
  // 76 -> 76%
  // 100 -> 100%
  // 0.72 -> 72%
  // 0.76 -> 76%
  // 1 -> 100%
  
  // So if value is <= 1 and value > 0, we treat it as 0-1 scale, EXCEPT if it's an integer 1?
  // Wait, if it's 1 -> 100%. If it's 0 -> 0%.
  
  let percentage = 0;
  
  if (numericValue <= 1 && numericValue >= 0) {
    // It's in the 0-1 range (e.g., 0.72 or 1)
    percentage = numericValue * 100;
  } else {
    // It's in the 0-100 range (e.g., 72 or 100)
    percentage = numericValue;
  }
  
  // Clamp between 0 and 100
  percentage = Math.max(0, Math.min(100, percentage));
  
  return `${Math.round(percentage)}%`;
};

/**
 * Returns the raw percentage number (0-100) for use in progress bars or logic
 */
export const getConfidencePercent = (value) => {
  if (value === undefined || value === null) {
    return 0;
  }
  
  let numericValue;
  
  if (typeof value === 'string' && value.endsWith('%')) {
    numericValue = Number(value.replace('%', ''));
  } else {
    numericValue = Number(value);
  }

  if (isNaN(numericValue)) {
    return 0;
  }
  
  let percentage = 0;
  if (numericValue <= 1 && numericValue >= 0) {
    percentage = numericValue * 100;
  } else {
    percentage = numericValue;
  }
  
  return Math.round(Math.max(0, Math.min(100, percentage)));
};
