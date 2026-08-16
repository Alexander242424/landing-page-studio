import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HOME_FAQS, type HomeFaq } from "@/lib/faq";
import { createAwardsCharReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * FAQ accordion — large awards-style headline + Rejouice-token list.
 */
export function FaqSection({
  faqs = HOME_FAQS,
  headline = "FAQ",
}: {
  faqs?: HomeFaq[];
  headline?: string;
} = {}) {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const headlineEl = headlineRef.current;
    if (!root || !headlineEl) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      cleanups.push(
        createAwardsCharReveal(headlineEl, {
          start: "top 85%",
        }),
      );

      const items = root.querySelectorAll(".rj-faq__item");
      items.forEach((item, index) => {
        gsap.fromTo(
          item,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            delay: Math.min(index * 0.06, 0.3),
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 92%",
              once: true,
            },
          },
        );
      });
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [faqs]);

  return (
    <section
      ref={rootRef}
      id="faq"
      className="rj-faq theme-light"
      aria-label="Frequently asked questions"
    >
      <div className="rj-faq__headline-wrap">
        <h2 ref={headlineRef} className="rj-faq__headline rj-awards-title">
          {headline}
        </h2>
      </div>

      <Accordion type="single" collapsible className="rj-faq__list">
        {faqs.map((item, index) => (
          <AccordionItem
            key={item.question}
            value={`item-${index}`}
            className="rj-faq__item"
          >
            <AccordionTrigger className="rj-faq__trigger">
              <span className="rj-faq__question">{item.question}</span>
            </AccordionTrigger>
            <AccordionContent className="rj-faq__answer">
              <p>{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
