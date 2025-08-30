"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props =
  | ({ href: string; onClick?: never } & React.ComponentProps<typeof Button>)
  | ({ href?: never; onClick: () => void } & React.ComponentProps<typeof Button>);

export default function TileButton({ href, onClick, children, className = "", ...rest }: Props) {
  const base = "h-24 w-full text-lg md:text-xl rounded-2xl";
  if (href) {
    return (
      <Link href={href} className="block">
        <Button className={`${base} ${className}`} {...rest}>
          {children}
        </Button>
      </Link>
    );
  }
  return (
    <Button onClick={onClick} className={`${base} ${className}`} {...rest}>
      {children}
    </Button>
  );
}
