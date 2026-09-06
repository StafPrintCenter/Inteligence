import logos from "@/assets/logos.json";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { cn } from "@/lib/utils";

/**
 * Logo STAF PRINT CENTER.
 * `mc` = version thème clair, `mw` = version thème sombre.
 */
export function SpcLogo({ className }: { className?: string }) {
  const dark = useDarkMode();
  return (
    <img
      src={dark ? logos.mw : logos.mc}
      alt="Logo STAF PRINT CENTER"
      className={cn("object-contain", className)}
      loading="eager"
      decoding="async"
    />
  );
}

export function SpcDeskLogo({ className }: { className?: string }) {
  const dark = useDarkMode();

  return (
    <img
      src={dark ? logos.dw : logos.dc}
      alt="Logo STAF PRINT CENTER"
      className={cn("object-contain", className)}
      loading="eager"
      decoding="async"
    />
  );
}