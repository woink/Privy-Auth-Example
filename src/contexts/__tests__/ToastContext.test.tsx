import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "@/contexts/ToastContext";

// Test component that uses the toast hook
function TestComponent() {
  const { toast, success, error, toasts, removeToast } = useToast();

  return (
    <div>
      <button
        type="button"
        onClick={() => toast({ description: "Test toast", title: "Test" })}
        data-testid="add-toast"
      >
        Add Toast
      </button>
      <button
        type="button"
        onClick={() => success("Success message", "Success Title")}
        data-testid="add-success"
      >
        Add Success
      </button>
      <button
        type="button"
        onClick={() => error("Error message", "Error Title")}
        data-testid="add-error"
      >
        Add Error
      </button>
      <div data-testid="toast-count">{toasts.length}</div>
      {toasts.map((toast) => (
        <div key={toast.id} data-testid={`toast-${toast.id}`}>
          <span data-testid={`toast-title-${toast.id}`}>{toast.title}</span>
          <span data-testid={`toast-description-${toast.id}`}>
            {toast.description}
          </span>
          <span data-testid={`toast-variant-${toast.id}`}>
            {toast.variant || "default"}
          </span>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            data-testid={`remove-toast-${toast.id}`}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function TestComponentWithProvider() {
  return (
    <ToastProvider>
      <TestComponent />
    </ToastProvider>
  );
}

describe("ToastContext", () => {
  beforeEach(() => {
    // Reset any timers between tests
    vi.clearAllTimers();
  });

  it("should throw error when useToast is used outside ToastProvider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "useToast must be used within a ToastProvider",
    );

    consoleSpy.mockRestore();
  });

  it("should provide initial empty toast state", () => {
    render(<TestComponentWithProvider />);

    expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
  });

  it("should add a toast with custom properties", async () => {
    const user = userEvent.setup();
    render(<TestComponentWithProvider />);

    await user.click(screen.getByTestId("add-toast"));

    expect(screen.getByTestId("toast-count")).toHaveTextContent("1");

    // Find the first toast element (ID will vary based on test execution order)
    const toastElements = screen.getAllByTestId(/^toast-\d+$/);
    expect(toastElements).toHaveLength(1);

    const toastId = toastElements[0].getAttribute("data-testid")?.split("-")[1];
    expect(screen.getByTestId(`toast-title-${toastId}`)).toHaveTextContent(
      "Test",
    );
    expect(
      screen.getByTestId(`toast-description-${toastId}`),
    ).toHaveTextContent("Test toast");
    expect(screen.getByTestId(`toast-variant-${toastId}`)).toHaveTextContent(
      "default",
    );
  });

  it("should add success toast with correct variant", async () => {
    const user = userEvent.setup();
    render(<TestComponentWithProvider />);

    await user.click(screen.getByTestId("add-success"));

    expect(screen.getByTestId("toast-count")).toHaveTextContent("1");

    const toastElements = screen.getAllByTestId(/^toast-\d+$/);
    expect(toastElements).toHaveLength(1);

    const toastId = toastElements[0].getAttribute("data-testid")?.split("-")[1];
    expect(screen.getByTestId(`toast-title-${toastId}`)).toHaveTextContent(
      "Success Title",
    );
    expect(
      screen.getByTestId(`toast-description-${toastId}`),
    ).toHaveTextContent("Success message");
    expect(screen.getByTestId(`toast-variant-${toastId}`)).toHaveTextContent(
      "success",
    );
  });

  it("should add error toast with correct variant", async () => {
    const user = userEvent.setup();
    render(<TestComponentWithProvider />);

    await user.click(screen.getByTestId("add-error"));

    expect(screen.getByTestId("toast-count")).toHaveTextContent("1");

    const toastElements = screen.getAllByTestId(/^toast-\d+$/);
    expect(toastElements).toHaveLength(1);

    const toastId = toastElements[0].getAttribute("data-testid")?.split("-")[1];
    expect(screen.getByTestId(`toast-title-${toastId}`)).toHaveTextContent(
      "Error Title",
    );
    expect(
      screen.getByTestId(`toast-description-${toastId}`),
    ).toHaveTextContent("Error message");
    expect(screen.getByTestId(`toast-variant-${toastId}`)).toHaveTextContent(
      "destructive",
    );
  });

  it("should remove toast when removeToast is called", async () => {
    const user = userEvent.setup();
    render(<TestComponentWithProvider />);

    await user.click(screen.getByTestId("add-toast"));
    expect(screen.getByTestId("toast-count")).toHaveTextContent("1");

    const toastElements = screen.getAllByTestId(/^toast-\d+$/);
    const toastId = toastElements[0].getAttribute("data-testid")?.split("-")[1];

    await user.click(screen.getByTestId(`remove-toast-${toastId}`));
    expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
  });

  it("should handle multiple toasts", async () => {
    render(<TestComponentWithProvider />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId("add-toast"));
    await user.click(screen.getByTestId("add-success"));
    await user.click(screen.getByTestId("add-error"));

    expect(screen.getByTestId("toast-count")).toHaveTextContent("3");

    const toastElements = screen.getAllByTestId(/^toast-\d+$/);
    expect(toastElements).toHaveLength(3);
  });

  it("should assign unique IDs to toasts", async () => {
    render(<TestComponentWithProvider />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId("add-toast"));
    await user.click(screen.getByTestId("add-toast"));

    const toastElements = screen.getAllByTestId(/^toast-\d+$/);
    expect(toastElements).toHaveLength(2);

    // Check that the IDs are different
    const ids = toastElements.map((el) => el.getAttribute("data-testid"));
    expect(new Set(ids).size).toBe(2); // All IDs should be unique
  });
});
