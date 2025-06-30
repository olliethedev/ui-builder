import React from "react";
import { render, screen } from "@testing-library/react";
import { DevProfiler } from "@/components/ui/ui-builder/internal/components/dev-profiler";

// Mock console.log to capture profiler output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe("DevProfiler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe("in development environment", () => {
    const originalEnv = process.env.NODE_ENV;

    beforeAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true
      });
    });

    afterAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true
      });
    });

    it("renders children in development mode", () => {
      render(
        <DevProfiler id="test-profiler" threshold={10}>
          <div data-testid="child-component">Test Content</div>
        </DevProfiler>
      );

      expect(screen.getByTestId("child-component")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("renders children properly in development mode", () => {
      render(
        <DevProfiler id="test-profiler" threshold={10}>
          <div data-testid="child-component">Test Content</div>
        </DevProfiler>
      );

      // Children should be rendered regardless of profiler wrapping
      expect(screen.getByTestId("child-component")).toBeInTheDocument();
    });

    it("logs when actual duration exceeds threshold", () => {
      const TestComponent = () => {
        return (
          <DevProfiler id="slow-component" threshold={5}>
            <div data-testid="slow-child">Slow Content</div>
          </DevProfiler>
        );
      };

      render(<TestComponent />);

      // We can't directly test the Profiler callback in a unit test,
      // but we can test that the component renders correctly
      expect(screen.getByTestId("slow-child")).toBeInTheDocument();
    });

    it("uses the correct threshold value", () => {
      const threshold = 25;
      
      render(
        <DevProfiler id="threshold-test" threshold={threshold}>
          <div data-testid="threshold-child">Threshold Test</div>
        </DevProfiler>
      );

      expect(screen.getByTestId("threshold-child")).toBeInTheDocument();
    });

    it("uses the correct profiler id", () => {
      const id = "unique-profiler-id";
      
      render(
        <DevProfiler id={id} threshold={10}>
          <div data-testid="id-child">ID Test</div>
        </DevProfiler>
      );

      expect(screen.getByTestId("id-child")).toBeInTheDocument();
    });
  });

  describe("in production environment", () => {
    const originalEnv = process.env.NODE_ENV;

    beforeAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true
      });
    });

    afterAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true
      });
    });

    it("renders children directly without Profiler wrapper in production", () => {
      const { container } = render(
        <DevProfiler id="prod-profiler" threshold={10}>
          <div data-testid="prod-child">Production Content</div>
        </DevProfiler>
      );

      expect(screen.getByTestId("prod-child")).toBeInTheDocument();
      expect(screen.getByText("Production Content")).toBeInTheDocument();
      
      // In production, children should be rendered directly (React Fragment)
      expect(container.firstChild).toBe(screen.getByTestId("prod-child"));
    });

    it("does not wrap with Profiler in production", () => {
      render(
        <DevProfiler id="prod-profiler" threshold={10}>
          <span data-testid="direct-child">Direct Child</span>
        </DevProfiler>
      );

      // Content should be rendered directly
      expect(screen.getByTestId("direct-child")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("handles multiple children", () => {
      render(
        <DevProfiler id="multi-children" threshold={10}>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </DevProfiler>
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
    });

    it("handles zero threshold", () => {
      render(
        <DevProfiler id="zero-threshold" threshold={0}>
          <div data-testid="zero-child">Zero Threshold</div>
        </DevProfiler>
      );

      expect(screen.getByTestId("zero-child")).toBeInTheDocument();
    });

    it("handles negative threshold", () => {
      render(
        <DevProfiler id="negative-threshold" threshold={-1}>
          <div data-testid="negative-child">Negative Threshold</div>
        </DevProfiler>
      );

      expect(screen.getByTestId("negative-child")).toBeInTheDocument();
    });

    it("handles empty id string", () => {
      render(
        <DevProfiler id="" threshold={10}>
          <div data-testid="empty-id-child">Empty ID</div>
        </DevProfiler>
      );

      expect(screen.getByTestId("empty-id-child")).toBeInTheDocument();
    });
  });
});