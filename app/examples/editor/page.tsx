
import { BuilderWithPages } from "app/platform/builder-with-pages";

export const metadata = {
  title: "UI Builder",
};

export default function Page() {
  return (
    <main className="flex flex-col h-dvh">
      <BuilderWithPages />
    </main>
  );
}
