import { describe, expect, it } from "vitest"; // or jest
import { truncateBalance } from "../balance.ts";

describe("truncateBalance", () => {
  describe("zero values", () => {
    it("should handle exact zero", () => {
      expect(truncateBalance("0")).toBe("0");
    });

    it("should handle zero with decimals", () => {
      expect(truncateBalance("0.00000000000000")).toBe("0");
    });

    it("should handle zero string", () => {
      expect(truncateBalance("0.0")).toBe("0");
    });
  });

  describe("integer values", () => {
    it("should handle small integers", () => {
      expect(truncateBalance("1")).toBe("1");
      expect(truncateBalance("5")).toBe("5");
    });

    it("should handle large integers", () => {
      expect(truncateBalance("1000")).toBe("1000");
      expect(truncateBalance("999999")).toBe("999999");
    });

    it("should handle integers with trailing zeros", () => {
      expect(truncateBalance("1.00000000000000")).toBe("1");
      expect(truncateBalance("42.0000")).toBe("42");
    });
  });

  describe("very small numbers (< 0.0001)", () => {
    it("should preserve precision for very small numbers", () => {
      expect(truncateBalance("0.00000060004872")).toBe("0.00000060");
      expect(truncateBalance("0.0000001")).toBe("0.0000001");
    });

    it("should handle extremely small numbers", () => {
      expect(truncateBalance("0.000000001")).toBe("0.000000001");
      expect(truncateBalance("0.00000000123")).toBe("0.0000000012");
    });

    it("should handle scientific notation inputs", () => {
      expect(truncateBalance("1e-8")).toBe("1e-8");
      expect(truncateBalance("5e-7")).toBe("5e-7");
    });

    it("should use toPrecision fallback for edge cases", () => {
      expect(truncateBalance("0.00000000000001")).toBe("0.00000000000001");
    });
  });

  describe("numbers >= 1", () => {
    it("should truncate to 6 decimal places", () => {
      expect(truncateBalance("1.1234567890")).toBe("1.123457");
      expect(truncateBalance("5.9999999")).toBe("6");
    });

    it("should remove trailing zeros", () => {
      expect(truncateBalance("1.123000")).toBe("1.123");
      expect(truncateBalance("2.500000")).toBe("2.5");
    });

    it("should handle floating point noise", () => {
      expect(truncateBalance("1.05000000004872")).toBe("1.05");
    });

    it("should handle large numbers", () => {
      expect(truncateBalance("123.456789")).toBe("123.456789");
      expect(truncateBalance("999.999999")).toBe("999.999999");
    });
  });

  describe("numbers between 0.01 and 1", () => {
    it("should truncate to 8 decimal places", () => {
      expect(truncateBalance("0.123456789012")).toBe("0.12345679");
      expect(truncateBalance("0.99999999")).toBe("0.99999999");
    });

    it("should remove trailing zeros", () => {
      expect(truncateBalance("0.12300000")).toBe("0.123");
      expect(truncateBalance("0.50000000")).toBe("0.5");
    });

    it("should handle floating point noise", () => {
      expect(truncateBalance("0.05000000004872")).toBe("0.05");
    });
  });

  describe("numbers between 0.0001 and 0.01", () => {
    it("should truncate to 10 decimal places", () => {
      expect(truncateBalance("0.001234567890123")).toBe("0.0012345679");
      expect(truncateBalance("0.009999999999")).toBe("0.01");
    });

    it("should remove trailing zeros", () => {
      expect(truncateBalance("0.00123000000")).toBe("0.00123");
      expect(truncateBalance("0.00500000000")).toBe("0.005");
    });
  });

  describe("edge cases", () => {
    it("should handle boundary values", () => {
      expect(truncateBalance("0.0001")).toBe("0.0001");
      expect(truncateBalance("0.01")).toBe("0.01");
      expect(truncateBalance("1.0")).toBe("1");
    });

    it("should handle numbers that round to empty string", () => {
      expect(truncateBalance("0.0000000000001")).toBe("0.0000000000001");
    });

    it("should handle decimal points at the end", () => {
      expect(truncateBalance("1.000000")).toBe("1");
      expect(truncateBalance("0.010000")).toBe("0.01");
    });

    it("should handle very long decimal strings", () => {
      expect(truncateBalance("0.123456789012345678901234567890")).toBe(
        "0.12345679",
      );
    });
  });
});
