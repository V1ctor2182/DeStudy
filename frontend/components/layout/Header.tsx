"use client";

import Link from "next/link";
import { ConnectButton } from "../wallet/ConnectButton";
import { Navigation } from "./Navigation";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          DeStudy
        </Link>
        <Navigation />
        <ConnectButton />
      </div>
    </header>
  );
}
