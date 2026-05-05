interface AdSlotProps {
  slot?: string;
  format?: "horizontal" | "rectangle" | "vertical";
  className?: string;
}

export function AdSlot({ format = "horizontal", className = "" }: AdSlotProps) {
  const dims: Record<string, string> = {
    horizontal: "h-[90px] w-full max-w-[728px]",
    rectangle: "h-[250px] w-[300px]",
    vertical: "h-[600px] w-[160px]",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-md border border-border/30 bg-muted/20 text-muted-foreground/30 text-xs font-mono select-none ${dims[format]} ${className}`}
      aria-label="Advertisement"
      role="complementary"
    >
      AD
    </div>
  );
}
