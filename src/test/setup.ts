import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
import "@testing-library/jest-dom";

expect.extend(matchers);

// runs a cleanup after each test case
afterEach(() => {
  cleanup();
});
