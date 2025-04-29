import React from "react";
import { Flexbox } from "@/components/ui/ui-builder/flexbox";
import { Icon } from "@/components/ui/ui-builder/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid } from "@/components/ui/ui-builder/grid";
import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { AccordionItem } from "@/components/ui/accordion";
import { AccordionTrigger } from "@/components/ui/accordion";
import { AccordionContent } from "@/components/ui/accordion";
import { Markdown } from "@/components/ui/ui-builder/markdown";

const Page = () => {
  return (
    <div className="flex flex-col gap-6 bg-background px-4">
      <Flexbox direction="row" justify="between" align="center" wrap="nowrap" gap={1} className="p-2 bg-secondary mx-[-4]">
        <Flexbox direction="row" justify="start" align="center" wrap="nowrap" gap={1}>
          <Icon iconName="Apple" size="medium" rotate="none" />
          <span className="text-lg font-bold">
    {"My App"}
          </span>
        </Flexbox>
        <Flexbox direction="row" justify="start" align="start" wrap="nowrap" gap={1}>
          <Button variant="ghost" size="sm">
            <span>
    {"Blog"}
            </span>
          </Button>
          <Button variant="ghost" size="sm">
            <span>
    {"Docs"}
            </span>
          </Button>
          <Button variant="ghost" size="sm">
            <span>
    {"Pricing"}
            </span>
          </Button>
          <Button variant="default" size="sm">
            <span>
    {"Login"}
            </span>
          </Button>
        </Flexbox>
      </Flexbox>
      <Flexbox direction="row" justify="center" align="center" wrap="nowrap" gap={4} className="mx-auto md:flex-row flex-col items-center max-w-6xl">
        <Flexbox direction="column" justify="start" align="start" wrap="wrap" gap={8} className="md:w-1/2">
          <span className="text-4xl">
    {"No-Code UI Builder for React Developers!"}
          </span>
          <span>
    {"Unlock the power of rapid UI development with UI Builder, a versatile React component that transforms the way you create and edit user interfaces. "}
          </span>
          <Flexbox direction="row" justify="start" align="start" wrap="wrap" gap={1}>
            <Badge variant="outline">
              <span>
    {"ReactJS"}
              </span>
            </Badge>
            <Badge variant="outline">
              <span>
    {"ShadCN"}
              </span>
            </Badge>
            <Badge variant="outline">
              <span>
    {"No-Code"}
              </span>
            </Badge>
            <Badge variant="outline">
              <span>
    {"TailwindCSS"}
              </span>
            </Badge>
          </Flexbox>
          <Flexbox direction="row" justify="center" align="center" wrap="nowrap" gap={2} className="w-full">
            <Button variant="default" size="default" className="w-full">
              <span>
    {"Github"}
              </span>
              <Icon size="medium" color="secondary" rotate="none" iconName="Github" className="" />
            </Button>
            <Button variant="secondary" size="default" className="w-full gap-2">
              <span>
    {"Button"}
              </span>
              <Icon iconName="Image" size="medium" rotate="none" />
            </Button>
          </Flexbox>
        </Flexbox>
        <a target="_blank" href="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExamVtbm1wdGhpazFoY2VkMDc0d2VkMWNjajJmNjkxMmxnYnpvZGd0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/11ISwbgCxEzMyY/giphy.gif" className="max-w-xl flex w-full md:w-1/2" download={false}>
          <img src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExamVtbm1wdGhpazFoY2VkMDc0d2VkMWNjajJmNjkxMmxnYnpvZGd0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/11ISwbgCxEzMyY/giphy.gif" className="w-full" />
        </a>
      </Flexbox>
      <Grid columns={2} autoRows="min" justify="end" align="center" templateRows={2} gap={4} className="md:grid-cols-2 grid-cols-1 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              <span>
    {"Visual No-Code Editing"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span>
    {"Build stunning interfaces through an intuitive, customizable editor that's as powerful as it is easy to use."}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <span>
    {"Seamless Integration"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span>
    {"Effortlessly integrate with your existing shadcn/ui or plain React projects for a smooth, uninterrupted workflow."}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <span>
    {"Bring Your Own Components"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span>
    {"Start with a rich library of core components and expand it with your own custom elements to suit any project."}
            </span>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              <span>
    {"Versatile Use Cases"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span>
    {"From landing pages and forms to dashboards and complex applications—the possibilities are endless."}
            </span>
          </CardContent>
        </Card>
      </Grid>
      <Flexbox direction="column" justify="start" align="start" wrap="nowrap" gap={4} className="mx-auto w-full max-w-4xl overflow-hidden">
        <span className="text-4xl">
    {"Easy Setup"}
        </span>
        <Markdown className="overflow-hidden w-full">
    {"\nIf you are using the latest shadcn/ui in your project, you can install the component directly from the registry. \n\n```bash\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json\n```\n\nOr you can start a new project with the UI Builder:\n\n```bash\nnpx shadcn@latest init https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json\n```\n\nNote: You need to use [style variables](https://ui.shadcn.com/docs/theming) to have page theming working correctly.\n\nIf you are not using shadcn/ui, you can install the component simply by copying the files in this repo into your project.\n\n### Fixing Dependencies after shadcn `init` or `add`\nAdd dev dependencies, since there currently seems to be an issue with shadcn/ui not installing them from the registry:\n\n```bash\nnpm install -D @types/lodash.template @tailwindcss/typography @types/react-syntax-highlighter react-docgen-typescript tailwindcss-animate ts-morph ts-to-zod\n```\n\nFix zustand dependency to use latest stable version as opposed to default RC release that gets installed:\n\n```bash\nnpm install zustand@4.5.5\n```\n\nAnd that's it! You have a UI Builder that you can use to build your UI.\n\n## Usage\n\n```tsx\nimport UIBuilder from \"@/components/ui/ui-builder\";\n\nexport function MyApp() {\n  return <UIBuilder initialLayers={initialPages} onChange={handleChange} />;\n}\n```\n\n- `initialLayers`: Optional prop to set up initial pages and layers. Useful for setting the initial state of the builder, from a database for example.\n- `onChange`: Optional callback triggered when the editor state changes, providing the updated pages. Can be used to persist the state to a database.\n\n\nYou can also render the page without editor functionality by using the LayerRenderer component:\n\n```tsx\nimport LayerRenderer from \"@/components/ui/ui-builder/layer-renderer\";\n\nexport function MyPage() {\n  return <LayerRenderer page={page} />;\n}\n```\n\nThis is useful when you want to render the finished page in a non-editable fashion."}
        </Markdown>
      </Flexbox>
      <Flexbox direction="column" justify="start" align="start" wrap="nowrap" gap={4} className="max-w-4xl mx-auto w-full">
        <span className="text-4xl">
    {"FAQ"}
        </span>
        <span>
    {"You can add shadcn/ui components easily like the Accordion component below"}
        </span>
        <Accordion type="single" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <span>
    {"How to Rick Roll?"}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <span>
    {"Like this:"}
              </span>
              <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=oc74qTYUBuCsOJwL" referrerPolicy="strict-origin-when-cross-origin" frameBorder="0" width="560" height="315" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" title="Rick Roll" className="mx-auto" />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <span>
    {"Who is Satoshi Nakamoto?"}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <span>
    {"You are 😏"}
              </span>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <span>
    {"When is Christmas?"}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <span>
    {"Oct 9th 🎄"}
              </span>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Flexbox>
      <Flexbox direction="row" justify="between" align="start" wrap="nowrap" gap={1} className="bg-secondary py-10 px-6">
        <Flexbox direction="row" justify="start" align="start" wrap="nowrap" gap={1}>
          <Icon iconName="Settings" size="medium" rotate="none" />
          <span className="text-secondary-foreground font-semibold">
    {"UI Builder"}
          </span>
        </Flexbox>
        <Flexbox direction="column" justify="start" align="start" wrap="nowrap" gap={1}>
          <a target="_blank" download={false} href="https://github.com/olliethedev/ui-builder">
            <span className="text-secondary-foreground">
    {"Github"}
            </span>
          </a>
          <a target="_blank" download={false} href="https://twitter.com/olliethedev">
            <span className="text-secondary-foreground">
    {"Twitter"}
            </span>
          </a>
          <a target="_self" download={false} href="#">
            <span className="text-secondary-foreground">
    {"Blog"}
            </span>
          </a>
          <a target="_self" download={false} href="#">
            <span className="text-secondary-foreground">
    {"Terms"}
            </span>
          </a>
        </Flexbox>
        <div className="md:block hidden" />
      </Flexbox>
    </div>
  );
};

export default Page;
