"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function formatSegment(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const currentSegment = segments.at(-1);

  return currentSegment ? formatSegment(currentSegment) : "Dashboard";
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link className="hover:text-foreground" href="/dashboard">
            Dashboard
          </Link>
        </li>
        {segments.slice(1).map((segment, index) => {
          const href = `/${segments.slice(0, index + 2).join("/")}`;
          const isLast = index === segments.length - 2;

          return (
            <li className="flex items-center gap-1.5" key={href}>
              <span aria-hidden="true">/</span>
              {isLast ? (
                <span className="text-foreground">{formatSegment(segment)}</span>
              ) : (
                <Link className="hover:text-foreground" href={href}>
                  {formatSegment(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
