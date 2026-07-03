import { SimpleBuilder } from "@/app/platform/simple-builder";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "UI Builder",
};

export default function Page() {
  return (
    <main data-testid="main-page" className="flex flex-col h-dvh">
      <SimpleBuilder />
    </main>
  );
}
