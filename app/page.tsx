import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GithubIcon, ChevronDown } from "lucide-react";
import Image from "next/image";

const exampleRoutes = [
  { label: "Basic", href: "/examples/basic" },
  { label: "Editor", href: "/examples/editor" },
  { label: "Editor - Drag & Drop Testing", href: "/examples/editor/drag-drop-testing" },
  { label: "Editor - Immutable Bindings", href: "/examples/editor/immutable-bindings" },
  { label: "Editor - Immutable Pages", href: "/examples/editor/immutable-pages" },
  { label: "Editor - Panel Config", href: "/examples/editor/panel-config" },
  { label: "Editor - Read Only Mode", href: "/examples/editor/read-only-mode" },
  { label: "Renderer", href: "/examples/renderer" },
  { label: "Renderer - Variables", href: "/examples/renderer/variables" },
  { label: "SSR", href: "/examples/ssr" },
];

const smokeRoutes = [
  { label: "Functions", href: "/smoke/functions" },
  { label: "New (Empty)", href: "/smoke/new" },
  { label: "Populated", href: "/smoke/populated" },
  { label: "With Blocks", href: "/smoke/with-blocks" },
];

export default function Page() {
  return (
    <main
      data-testid="main-page"
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex flex-row items-center justify-center gap-1">
            <Image
              src="/logo.svg"
              alt="UI Builder"
              width={32}
              height={32}
              className="dark:invert"
            />
            <span className="sr-only">UI</span> Builder
          </CardTitle>
          <CardDescription>
            Get started by exploring the documentation or trying out a basic
            example.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/docs">View Documentation</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                Browse Examples
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Examples</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {exampleRoutes.map((route) => (
                <DropdownMenuItem key={route.href} asChild>
                  <Link href={route.href}>{route.label}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Smoke Tests</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {smokeRoutes.map((route) => (
                <DropdownMenuItem key={route.href} asChild>
                  <Link href={route.href}>{route.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild variant="outline" className="w-full">
            <Link
              href="https://github.com/olliethedev/ui-builder"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="w-4 h-4" />
              View on GitHub
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
