import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";
import Image from "next/image";


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
          <Button asChild variant="outline" className="w-full">
            <Link href="/examples/basic">Try Basic Example</Link>
          </Button>
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
