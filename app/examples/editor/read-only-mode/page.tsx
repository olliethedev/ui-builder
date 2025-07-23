import { ReadOnlyDemo } from "@/app/platform/read-only-demo";

export const metadata = {
  title: "UI Builder - Read-Only Mode Demo",
  description: "Interactive demonstration of UI Builder's read-only mode capabilities"
};

export default function ReadOnlyModePage() {
  return (
    <main className="h-dvh">
      <ReadOnlyDemo />
    </main>
  );
} 