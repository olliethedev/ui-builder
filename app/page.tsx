import ComponentEditor from "@/components/ui/ui-builder/component-editor";

export const metadata = {
  title: "App Router",
};

export default function Page() {
  return (
    <main data-testid="main-page" className="flex flex-col h-screen">
      <ComponentEditor />
    </main>
  );
}
