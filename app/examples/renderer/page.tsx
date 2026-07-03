import { SimpleLayerRenderer } from "../../platform/layer-renderer";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "UI Builder Example Renderer",
  };

export default function ExampleRendererPage() {
  return <SimpleLayerRenderer />;
}