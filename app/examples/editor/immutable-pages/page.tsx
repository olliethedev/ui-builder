
import { BuilderWithPages } from "app/platform/builder-with-pages";

export const metadata = {
  title: "UI Builder",
};

export default function ImmutablePagesExample() {
  return (
    <main className="flex flex-col h-dvh">
      <BuilderWithPages fixedPages={true} />
    </main>
  );
}
