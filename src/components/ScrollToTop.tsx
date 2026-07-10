"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowDownIcon } from "@/components/icons";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-5 right-5 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md border border-gray-200 transition-all duration-300 hover:bg-white",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
      )}
      aria-label="Scroll to Top"
    >
      <ArrowDownIcon className="rotate-180" width={14} height={14} />
    </button>
  );
}
