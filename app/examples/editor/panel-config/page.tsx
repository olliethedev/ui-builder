import { PanelConfigDemo } from "app/platform/panel-config-demo";

export const metadata = {
  title: "Panel Configuration - UI Builder",
  description: "Demonstrates custom panel configuration options"
};

export default function Page() {
  return (
    <main className="flex flex-col h-dvh">
      <PanelConfigDemo />
    </main>
  );
}