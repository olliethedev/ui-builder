import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmailTailwindThemePanel } from "@/lib/ui-builder/email/email-tailwind-theme-panel";

jest.mock("@react-email/components", () => ({
  pixelBasedPreset: { preset: true },
}));

jest.mock("lucide-react", () => ({
  CheckIcon: () => <span>check</span>,
  InfoIcon: () => <span>info</span>,
  MoonIcon: () => <span>moon</span>,
  SunIcon: () => <span>sun</span>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children }: any) => <label>{children}</label>,
}));

jest.mock("@/components/ui/toggle", () => ({
  Toggle: ({ children, onPressedChange, pressed }: any) => (
    <button onClick={() => onPressedChange?.(!pressed)}>{children}</button>
  ),
}));

const updateLayerMock = jest.fn();

const pageWithoutTailwind = {
  id: "page-1",
  type: "Html",
  props: {},
  children: [],
};

const pageWithTailwind = {
  id: "page-1",
  type: "Html",
  props: {},
  children: [
    {
      id: "tw-1",
      type: "Tailwind",
      props: {
        config: {
          presets: [{ preset: true }],
          theme: { extend: {} },
        },
      },
      children: [],
    },
  ],
};

let activePage: any = pageWithTailwind;

jest.mock("@/lib/ui-builder/store/layer-store", () => ({
  useLayerStore: (selector: any) =>
    selector({
      selectedPageId: "page-1",
      updateLayer: updateLayerMock,
      findLayerById: () => activePage,
    }),
}));

describe("EmailTailwindThemePanel", () => {
  beforeEach(() => {
    updateLayerMock.mockClear();
    activePage = pageWithTailwind;
  });

  it("shows helper message when page has no Tailwind layer", () => {
    activePage = pageWithoutTailwind;
    render(<EmailTailwindThemePanel />);
    expect(
      screen.getByText("Add a Tailwind layer to enable email theme controls.")
    ).toBeInTheDocument();
  });

  it("renders custom theme controls when toggled on and updates Tailwind config", async () => {
    render(<EmailTailwindThemePanel />);

    fireEvent.click(screen.getAllByRole("button")[0] as HTMLElement);

    await waitFor(() => {
      expect(updateLayerMock).toHaveBeenCalledWith(
        "tw-1",
        expect.objectContaining({
          config: expect.objectContaining({
            presets: [{ preset: true }],
            theme: expect.objectContaining({
              extend: expect.objectContaining({
                colors: expect.objectContaining({
                  primary: expect.any(String),
                }),
                borderRadius: expect.any(Object),
              }),
            }),
          }),
        })
      );
    });
  });
});
