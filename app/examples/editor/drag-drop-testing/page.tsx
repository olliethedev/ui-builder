import { BuilderDragDropTest } from "../../../platform/builder-drag-drop-test";

export const metadata = {
  title: "UI Builder - Drag & Drop Testing",
  description: "Comprehensive testing environment for drag and drop functionality across various layout types"
};

export default function DragDropTestingPage() {
  return (
    <main className="flex flex-col h-dvh">
      <BuilderDragDropTest />
    </main>
  );
} 