/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  blockDefinitions,
  getBlocksByCategory,
  getBlockCategories,
  getAllBlocks,
  BlockDefinition,
} from "../lib/ui-builder/registry/block-definitions";

describe("blockDefinitions", () => {
  it("should export a non-empty registry object", () => {
    expect(blockDefinitions).toBeDefined();
    expect(typeof blockDefinitions).toBe("object");
    expect(Object.keys(blockDefinitions).length).toBeGreaterThan(0);
  });

  it("should have valid structure for each block", () => {
    for (const [name, block] of Object.entries(blockDefinitions)) {
      expect(block.name).toBe(name);
      expect(typeof block.name).toBe("string");
      expect(typeof block.category).toBe("string");
      expect(block.template).toBeDefined();
      expect(block.template.id).toBeDefined();
      expect(block.template.type).toBeDefined();
      expect(block.template.props).toBeDefined();
    }
  });

  it("should have valid template structures", () => {
    for (const [name, block] of Object.entries(blockDefinitions)) {
      validateLayer(block.template, `${name}.template`);
    }
  });
});

// Recursive helper to validate layer structure
function validateLayer(layer: any, path: string) {
  expect(layer.id).toBeDefined();
  expect(typeof layer.id).toBe("string");
  expect(layer.type).toBeDefined();
  expect(typeof layer.type).toBe("string");
  expect(layer.props).toBeDefined();
  expect(typeof layer.props).toBe("object");

  if (Array.isArray(layer.children)) {
    layer.children.forEach((child: any, index: number) => {
      validateLayer(child, `${path}.children[${index}]`);
    });
  } else if (typeof layer.children === "string") {
    // String children are valid
  } else if (layer.children === undefined || layer.children === null) {
    // No children is valid
  }
}

describe("getBlocksByCategory", () => {
  it("should return login blocks", () => {
    const loginBlocks = getBlocksByCategory("login");
    expect(loginBlocks.length).toBe(5);
    loginBlocks.forEach((block) => {
      expect(block.category).toBe("login");
    });
  });

  it("should return sidebar blocks", () => {
    const sidebarBlocks = getBlocksByCategory("sidebar");
    expect(sidebarBlocks.length).toBe(16);
    sidebarBlocks.forEach((block) => {
      expect(block.category).toBe("sidebar");
    });
  });

  it("should return dashboard blocks", () => {
    const dashboardBlocks = getBlocksByCategory("dashboard");
    expect(dashboardBlocks.length).toBe(1);
    dashboardBlocks.forEach((block) => {
      expect(block.category).toBe("dashboard");
    });
  });

  it("should return calendar blocks", () => {
    const calendarBlocks = getBlocksByCategory("calendar");
    expect(calendarBlocks.length).toBe(32);
    calendarBlocks.forEach((block) => {
      expect(block.category).toBe("calendar");
    });
  });

  it("should return chart blocks", () => {
    const chartBlocks = getBlocksByCategory("chart");
    expect(chartBlocks.length).toBeGreaterThan(0);
    chartBlocks.forEach((block) => {
      expect(block.category).toBe("chart");
    });
  });

  it("should return empty array for non-existent category", () => {
    const blocks = getBlocksByCategory("non-existent");
    expect(blocks).toEqual([]);
  });
});

describe("getBlockCategories", () => {
  it("should return an array of unique categories", () => {
    const categories = getBlockCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);

    // Check for expected categories
    expect(categories).toContain("login");
    expect(categories).toContain("sidebar");
    expect(categories).toContain("dashboard");
    expect(categories).toContain("calendar");
    expect(categories).toContain("chart");
  });

  it("should have no duplicate categories", () => {
    const categories = getBlockCategories();
    const uniqueCategories = [...new Set(categories)];
    expect(categories.length).toBe(uniqueCategories.length);
  });
});

describe("getAllBlocks", () => {
  it("should return an array of all blocks", () => {
    const blocks = getAllBlocks();
    expect(Array.isArray(blocks)).toBe(true);
    expect(blocks.length).toBeGreaterThan(100); // We have 124 blocks
  });

  it("should match the blockDefinitions object", () => {
    const blocks = getAllBlocks();
    expect(blocks.length).toBe(Object.keys(blockDefinitions).length);

    blocks.forEach((block) => {
      expect(blockDefinitions[block.name]).toBe(block);
    });
  });
});

describe("specific block templates", () => {
  describe("login-01", () => {
    it("should have a Card as the root template", () => {
      const block = blockDefinitions["login-01"];
      expect(block).toBeDefined();
      expect(block.template.type).toBe("Card");
    });

    it("should have required login form elements", () => {
      const block = blockDefinitions["login-01"];
      const templateStr = JSON.stringify(block.template);
      
      // Check for key form elements
      expect(templateStr).toContain("CardHeader");
      expect(templateStr).toContain("CardContent");
      expect(templateStr).toContain("Input");
      expect(templateStr).toContain("Button");
    });
  });

  describe("dashboard-01", () => {
    it("should have dashboard stats cards", () => {
      const block = blockDefinitions["dashboard-01"];
      expect(block).toBeDefined();
      expect(block.category).toBe("dashboard");
      
      const templateStr = JSON.stringify(block.template);
      expect(templateStr).toContain("Card");
      expect(templateStr).toContain("CardTitle");
    });
  });

  describe("sidebar blocks", () => {
    it("should use SidebarProvider as root", () => {
      const block = blockDefinitions["sidebar-01"];
      expect(block).toBeDefined();
      expect(block.template.type).toBe("SidebarProvider");
    });
  });
});
