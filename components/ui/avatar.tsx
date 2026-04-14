import Image from "next/image";

import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string;
  alt?: string;
  fallback: string;
  className?: string;
};

export function Avatar({ src, alt, fallback, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "grid size-9 place-items-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold text-foreground",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? "User avatar"}
          width={36}
          height={36}
          className="size-full object-cover"
        />
      ) : (
        fallback
      )}
    </div>
  );
}
