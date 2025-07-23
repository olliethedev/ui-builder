/* eslint-disable @next/next/no-sync-scripts */
import "@/styles/globals.css";

export const metadata = {
  title: "UI Builder",
  description: "An open source UI builder for building complex UIs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
