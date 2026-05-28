"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false, trickleSpeed: 120, minimum: 0.15 });

export function ProgressBar() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const sameTab = !anchor.target || anchor.target === "_self";
      if (href && href.startsWith("/") && sameTab && href !== pathname) {
        NProgress.start();
      }
    };
    const handlePop = () => NProgress.start();

    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePop);
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handlePop);
    };
  }, [pathname]);

  return null;
}
