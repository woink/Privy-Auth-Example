// Function to truncate ETH balance to remove unnecessary trailing zeros and noise
export function truncateBalance(balanceStr: string): string {
  const num = Number.parseFloat(balanceStr);
  if (num === 0) return '0';

  // Handle edge case for whole numbers
  if (Number.isInteger(num)) {
    return num.toString();
  }

  // For very small numbers (< 0.0001), preserve meaningful precision
  if (num < 0.0001) {
    // For numbers like 0.00000060004872 -> 0.00000060
    const match = balanceStr.match(/^0\.(0*)([1-9]\d?)/);
    if (match) {
      return `0.${match[1]}${match[2]}`;
    }
    // Fallback for very small numbers
    return Number.parseFloat(num.toPrecision(3)).toString();
  }
  // For regular decimal numbers, handle floating point noise
  // Use parseFloat to normalize the number and remove noise
  const normalized = Number.parseFloat(num.toPrecision(12));

  // Format with appropriate decimal places
  let result: string;
  if (normalized >= 1) {
    // For numbers >= 1, keep up to 6 decimal places
    result = normalized.toFixed(6);
  } else if (normalized >= 0.01) {
    // For numbers >= 0.01, keep up to 8 decimal places
    result = normalized.toFixed(8);
  } else {
    // For small numbers, keep up to 10 decimal places
    result = normalized.toFixed(10);
  }

  // Remove trailing zeros
  result = result.replace(/\.?0+$/, '');

  // Special handling: if we removed everything after decimal, ensure we don't end with just "0."
  if (result.endsWith('.')) {
    result = result.slice(0, -1);
  }

  return result || '0';
}

// Test function to verify truncation works correctly
export function testTruncateBalance(): void {
  const testCases = [
    { input: '0.05000000004872', expected: '0.05' },
    { input: '0.00000060004872', expected: '0.00000060' },
    { input: '1.00000000000000', expected: '1' },
    { input: '0.10000000000000', expected: '0.1' },
    { input: '0.00000000000000', expected: '0' },
    { input: '5.50000000000000', expected: '5.5' },
    { input: '0.12345000000000', expected: '0.12345' },
  ];

  for (const { input, expected } of testCases) {
    const result = truncateBalance(input);
    console.log(
      `Input: ${input} | Expected: ${expected} | Got: ${result} | ${result === expected ? '✅' : '❌'}`,
    );
  }
}
