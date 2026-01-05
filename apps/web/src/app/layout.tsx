import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Ticket Concurrency Challenge",
	description: "Experience the next generation of event ticketing.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html className={`${outfit.variable} ${geistMono.variable}`} lang="en">
			<body className="bg-background text-foreground antialiased selection:bg-primary/20">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
