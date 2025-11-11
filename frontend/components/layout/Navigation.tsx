"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/upload", label: "Upload" },
    { href: "/explore", label: "Explore" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <nav className="flex gap-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-medium transition ${
            pathname === link.href
              ? "text-primary-600"
              : "text-gray-600 hover:text-primary-600"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
