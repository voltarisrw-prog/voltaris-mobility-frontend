"use client";

import { useEffect } from "react";

export default function VoltarisScrollMotion() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    const selector = [
      "main > section",
      "main > div > section",
      "main article",
      "main [data-motion]",
      "main h1",
      "main h2",
      "main h3",
      "main p",
      "main img",
      "main picture",
      "main button",
      "main a",
      "main [class*='card']",
      "main [class*='Card']",
      "main [class*='vehicle']",
      "main [class*='Vehicle']",
    ].join(",");

    const prepare = (root: ParentNode = document) => {
      root.querySelectorAll(selector).forEach((element) => {
        const el = element as HTMLElement;

        if (
          el.dataset.motionReady === "true" ||
          el.closest("[data-motion-ignore]")
        ) {
          return;
        }

        el.dataset.motionReady = "true";
        el.classList.add("voltaris-motion");

        if (el.hasAttribute("data-motion")) {
          const motion = el.getAttribute("data-motion");
          if (motion) el.dataset.motionType = motion;
        }
      });
    };

    prepare();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            el.classList.add("voltaris-motion-visible");
            el.classList.remove("voltaris-motion-hidden");
          } else {
            el.classList.remove("voltaris-motion-visible");
            el.classList.add("voltaris-motion-hidden");
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "-8% 0px -8% 0px",
      }
    );

    document
      .querySelectorAll(".voltaris-motion")
      .forEach((el) => observer.observe(el));

    const mutationObserver = new MutationObserver((mutations) => {
      let changed = false;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) changed = true;
        });
      });

      if (!changed) return;

      prepare();

      document
        .querySelectorAll(
          ".voltaris-motion:not([data-motion-observed='true'])"
        )
        .forEach((el) => {
          el.setAttribute("data-motion-observed", "true");
          observer.observe(el);
        });
    });

    document
      .querySelectorAll(".voltaris-motion")
      .forEach((el) => el.setAttribute("data-motion-observed", "true"));

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
