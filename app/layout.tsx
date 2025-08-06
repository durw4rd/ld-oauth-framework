import type { Metadata } from "next";
import "./globals.css";
import Navigation from "../components/Navigation";

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
            <body suppressHydrationWarning={true}>
                <Navigation />
                {children}
            </body>
        </html>
    );
}