import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createAwardsCharReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

const FAQS = [
  {
    q: "What does UXLAB actually do?",
    a: "We grow revenue by improving product performance—UX, journeys, and the metrics behind conversion, activation, retention, and LTV. Strategy and craft in one loop, not slides that die in a deck.",
  },
  {
    q: "Who do you partner with?",
    a: "Product-led teams and founders who already have traction and need sharper experience systems—SaaS, marketplaces, consumer apps, and growth-stage brands ready to compound.",
  },
  {
    q: "How do engagements usually start?",
    a: "Share your product or landing page. We diagnose the highest-friction moments, align on the growth lever, then move into focused design, validation, and shipping—not a months-long discovery theater.",
  },
  {
    q: "Do you only design, or do you ship?",
    a: "We design to ship. We partner closely with your eng and product teams so changes land in production, get measured, and feed the next iteration.",
  },
  {
    q: "How do you measure success?",
    a: "Against the metrics that matter for your model—conversion, activation, retention, ARPU, LTV. Every intervention is framed as a hypothesis with a clear read on impact.",
  },
  {
    q: "How many clients do you take?",
    a: "A small number each year. Limited capacity is intentional: deeper focus, faster loops, and outcomes that compound instead of parallelized agency output.",
  },
] as const;

/**
 * FAQ accordion — large awards-style headline + Rejouice-token list.
 */
export function FaqSection() {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const headline = headlineRef.current;
    if (!root || !headline) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      cleanups.push(
        createAwardsCharReveal(headline, {
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
  }, []);

  return (
    <section
      ref={rootRef}
      id="faq"
      className="rj-faq"
      aria-label="Frequently asked questions"
    >
      <div className="rj-faq__headline-wrap">
        <h2 ref={headlineRef} className="rj-faq__headline rj-awards-title">
          FAQ
        </h2>
      </div>

      <Accordion type="single" collapsible className="rj-faq__list">
        {FAQS.map((item, index) => (
          <AccordionItem
            key={item.q}
            value={`item-${index}`}
            className="rj-faq__item"
          >
            <AccordionTrigger className="rj-faq__trigger">
              <span className="rj-faq__question">{item.q}</span>
            </AccordionTrigger>
            <AccordionContent className="rj-faq__answer">
              <p>{item.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
