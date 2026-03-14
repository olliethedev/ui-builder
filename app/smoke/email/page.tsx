"use client";

/**
 * Smoke test route for the email builder.
 * Mounted at /smoke/email — used by Playwright e2e tests.
 *
 * web-streams-polyfill is imported here (at the entry point) for Safari/iOS
 * compatibility with @react-email/render's async rendering API.
 */
import "web-streams-polyfill/polyfill";

import React from "react";
import { EmailBuilder } from "@/app/platform/email-builder";

export default function SmokeEmailPage() {
  return (
    <main data-testid="smoke-email-page" className="flex flex-col h-dvh">
      <EmailBuilder />
    </main>
  );
}
