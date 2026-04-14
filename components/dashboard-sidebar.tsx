import Link from "next/link";
import { FolderGit2, Rocket, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Projects", icon: FolderGit2 },
  { href: "/deploy/dep_7n3h9a", label: "Deployments", icon: Rocket },
  { href: "/repos", label: "Settings", icon: Settings },
];

type DashboardSidebarProps = {
  activeLabel: string;
};

export function DashboardSidebar({ activeLabel }: DashboardSidebarProps) {
  return (
    <aside className="w-full max-w-64 rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-sm">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = item.label === activeLabel;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                isActive && "bg-muted text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
