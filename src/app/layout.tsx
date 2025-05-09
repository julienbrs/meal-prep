import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { FoodItemsProvider } from "@/context/FoodItemsContext";

import "@fontsource/inter/400.css"; // Regular
import "@fontsource/inter/500.css"; // Medium
import "@fontsource/inter/600.css"; // Semi-bold
import "@fontsource/inter/700.css"; // Bold
import { UserProvider } from "@/context/UserContext";
import UserSelector from "@/components/UserSelector";

export const metadata: Metadata = {
  title: "EasyMeals",
  description:
    "Planifiez vos repas hebdomadaires facilement et découvrez des recettes délicieuses avec des informations nutritionnelles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full">
        <UserProvider>
          <FoodItemsProvider>
            <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
              <header className="bg-white shadow-[0px_2px_20px_0px_rgba(0,0,0,0.12)] backdrop-blur-[40px]">
                <div className="container mx-auto px-4 py-4">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                      <Link href="/">
                        <Image
                          src="/images/easymeal-logo.svg"
                          alt="Logo EasyMeal"
                          width={150}
                          height={30}
                        />
                      </Link>
                    </div>
                    <nav className="flex items-center gap-16">
                      <Link
                        href="/recipes-list"
                        className="text-gray-800 font-inter text-base font-semibold leading-normal tracking-tighter flex items-center gap-2"
                      >
                        <svg
                          width="24"
                          height="25"
                          viewBox="0 0 24 25"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M21 5H15C14.4178 5 13.8437 5.13554 13.3229 5.3959C12.8022 5.65625 12.3493 6.03426 12 6.5C11.6507 6.03426 11.1978 5.65625 10.6771 5.3959C10.1563 5.13554 9.58217 5 9 5H3C2.60218 5 2.22064 5.15804 1.93934 5.43934C1.65804 5.72064 1.5 6.10218 1.5 6.5V18.5C1.5 18.8978 1.65804 19.2794 1.93934 19.5607C2.22064 19.842 2.60218 20 3 20H9C9.59674 20 10.169 20.2371 10.591 20.659C11.0129 21.081 11.25 21.6533 11.25 22.25C11.25 22.4489 11.329 22.6397 11.4697 22.7803C11.6103 22.921 11.8011 23 12 23C12.1989 23 12.3897 22.921 12.5303 22.7803C12.671 22.6397 12.75 22.4489 12.75 22.25C12.75 21.6533 12.9871 21.081 13.409 20.659C13.831 20.2371 14.4033 20 15 20H21C21.3978 20 21.7794 19.842 22.0607 19.5607C22.342 19.2794 22.5 18.8978 22.5 18.5V6.5C22.5 6.10218 22.342 5.72064 22.0607 5.43934C21.7794 5.15804 21.3978 5 21 5ZM9 18.5H3V6.5H9C9.59674 6.5 10.169 6.73705 10.591 7.15901C11.0129 7.58097 11.25 8.15326 11.25 8.75V19.25C10.6015 18.762 9.8116 18.4987 9 18.5ZM21 18.5H15C14.1884 18.4987 13.3985 18.762 12.75 19.25V8.75C12.75 8.15326 12.9871 7.58097 13.409 7.15901C13.831 6.73705 14.4033 6.5 15 6.5H21V18.5ZM15 8.75H18.75C18.9489 8.75 19.1397 8.82902 19.2803 8.96967C19.421 9.11032 19.5 9.30109 19.5 9.5C19.5 9.69891 19.421 9.88968 19.2803 10.0303C19.1397 10.171 18.9489 10.25 18.75 10.25H15C14.8011 10.25 14.6103 10.171 14.4697 10.0303C14.329 9.88968 14.25 9.69891 14.25 9.5C14.25 9.30109 14.329 9.11032 14.4697 8.96967C14.6103 8.82902 14.8011 8.75 15 8.75ZM19.5 12.5C19.5 12.6989 19.421 12.8897 19.2803 13.0303C19.1397 13.171 18.9489 13.25 18.75 13.25H15C14.8011 13.25 14.6103 13.171 14.4697 13.0303C14.329 12.8897 14.25 12.6989 14.25 12.5C14.25 12.3011 14.329 12.1103 14.4697 11.9697C14.6103 11.829 14.8011 11.75 15 11.75H18.75C18.9489 11.75 19.1397 11.829 19.2803 11.9697C19.421 12.1103 19.5 12.3011 19.5 12.5ZM19.5 15.5C19.5 15.6989 19.421 15.8897 19.2803 16.0303C19.1397 16.171 18.9489 16.25 18.75 16.25H15C14.8011 16.25 14.6103 16.171 14.4697 16.0303C14.329 15.8897 14.25 15.6989 14.25 15.5C14.25 15.3011 14.329 15.1103 14.4697 14.9697C14.6103 14.829 14.8011 14.75 15 14.75H18.75C18.9489 14.75 19.1397 14.829 19.2803 14.9697C19.421 15.1103 19.5 15.3011 19.5 15.5Z"
                            fill="#1F2A37"
                          />
                        </svg>
                        Mes recettes
                      </Link>
                      <Link
                        href="/"
                        className="flex justify-center items-center gap-2 px-8 py-4 bg-[#F85B1D] rounded-lg text-white font-inter text-base font-semibold leading-normal tracking-[-0.5px] hover:opacity-90 transition-opacity duration-200"
                      >
                        Générer Plan de Repas
                      </Link>
                      <UserSelector />
                    </nav>
                  </div>
                </div>
              </header>
              <main className="flex-grow">{children}</main>
              <footer className="bg-slate-800 text-white py-8 mt-auto">
                <div className="container mx-auto px-4 flex justify-center">
                  <a
                    href="https://github.com/julienbrs/meal-prep"
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">GitHub</span>
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </a>
                </div>
              </footer>
            </div>
          </FoodItemsProvider>
        </UserProvider>
      </body>
    </html>
  );
}
