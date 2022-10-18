export function formatLargeNumber(num) {
  return Math.abs(Number(num)) >= 1.0e+9

  ? "$" + (Math.abs(Number(num))/ 1.0e+12).toFixed(2) + "T"
  : Math.abs(Number(num)) >= 1.0e+9

  ? (Math.abs(Number(num)) / 1.0e+9).toFixed(2) + "B"
  // Six Zeroes for Millions 
  : Math.abs(Number(num)) >= 1.0e+6

  ? (Math.abs(Number(num)) / 1.0e+6).toFixed(2) + "M"
  // Three Zeroes for Thousands
  : Math.abs(Number(num)) >= 1.0e+3

  ? (Math.abs(Number(num)) / 1.0e+3).toFixed(2) + "K"

  : Math.abs(Number(num));
}

