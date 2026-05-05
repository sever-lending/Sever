import { useEffect } from "react";

interface AdSlotProps {
  slot?: string;
  format?: "horizontal" | "rectangle" | "vertical";
  className?: string;
}

const PUBLISHER_ID = "ca-pub-2000477545504161";

export function AdSlot({ slot = "auto", format = "horizontal", className = "" }: AdSlotProps) {
  const dims: Record<string, string> = {
    horizontal: "h-[90px] w-full max-w-[728px]",
    rectangle: "h-[250px] w-[300px]",
    vertical: "h-[600px] w-[160px]",
  };

  useEffect(() => {
    try {
      const w = window as any;
      if (w.adsbygoogle) {
        w.adsbygoogle.push({});
      }
    } catch {}
  }, []);

  return (
    <div className={`${dims[format]} ${className} overflow-hidden`} aria-label="Advertisement" role="complementary">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
