export function truncateBalance(balanceStr: string): string {
  const num = Number.parseFloat(balanceStr);
  if (num === 0) return "0";

  if (Number.isInteger(num)) {
    return num.toString();
  }

  // For very small numbers, preserve meaningful precision
  if (num < 0.0001) {
    const match = balanceStr.match(/^0\.(0*)([1-9]\d?)/);
    if (match) {
      return `0.${match[1]}${match[2]}`;
    }
    return Number.parseFloat(num.toPrecision(3)).toString();
  }

  const normalized = Number.parseFloat(num.toPrecision(12));

  let result: string;
  if (normalized >= 1) {
    result = normalized.toFixed(6);
  } else if (normalized >= 0.01) {
    result = normalized.toFixed(8);
  } else {
    result = normalized.toFixed(10);
  }

  result = result.replace(/\.?0+$/, "");

  if (result.endsWith(".")) {
    result = result.slice(0, -1);
  }

  return result || "0";
}
