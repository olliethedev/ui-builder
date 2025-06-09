import { BuilderWithImmutableBindings } from "app/platform/builder-with-immutable-bindings";

export const metadata = {
  title: "UI Builder - Immutable Bindings Example",
  description: "Showcase of immutable variable bindings feature in UI Builder"
};

export default function ImmutableBindingsEditorPage() {
  return (
    <main className="flex flex-col h-dvh">
      <BuilderWithImmutableBindings />
    </main>
  );
} 