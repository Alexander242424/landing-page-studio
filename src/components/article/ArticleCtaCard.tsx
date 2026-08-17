import type { MouseEvent } from "react";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { openLeadChat } from "@/lib/askChat";
import {
  CLIENT_LOGOS,
  LOGO_STRIP_SEED_IDS,
} from "@/lib/clientLogos";

const CTA_LOGOS = LOGO_STRIP_SEED_IDS.map(
  (id) => CLIENT_LOGOS.find((logo) => logo.id === id) ?? CLIENT_LOGOS[0]!,
);

function onTalkClick(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  openLeadChat();
}

export function ArticleCtaCard() {
  return (
    <div className="rj-article-cta">
      <ul className="rj-article-cta__logos">
        {CTA_LOGOS.map((logo) => (
          <li key={logo.id}>
            <img
              src={logo.src}
              alt={logo.alt}
              width={72}
              height={18}
              decoding="async"
              loading="lazy"
              draggable={false}
            />
          </li>
        ))}
      </ul>
      <p className="rj-article-cta__heading">Your product growth partner</p>
      <p className="rj-article-cta__body">
        We improve conversion, activation, and retention through UX, CRO, and
        AI-native product work — a senior team for AI startups and product
        teams.
      </p>
      <ArrowLink
        href="#contact"
        className="rj-link-active rj-hero__cta rj-hero__cta--talk rj-article-cta__btn"
        onClick={onTalkClick}
      >
        Let&apos;s talk
      </ArrowLink>
    </div>
  );
}
