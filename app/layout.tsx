import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "LaunchDarkly OAuth Framework",
    description: "A framework for handling OAuth authentication with LaunchDarkly services.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body suppressHydrationWarning={true}>{children}</body>
        </html>
    );
}