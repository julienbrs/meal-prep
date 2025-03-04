import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weekly Meal Planner",
  description: "Plan your weekly meals with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-100">
          <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold text-green-600">
                Weekly Meal Planner
              </h1>
            </div>
          </header>

          <main>{children}</main>

          <footer className="bg-gray-800 text-white py-8">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; {new Date().getFullYear()} Meal Planner App</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
