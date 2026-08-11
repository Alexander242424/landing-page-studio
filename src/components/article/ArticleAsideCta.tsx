import { ArrowLink } from "@/components/ui/ArrowLink";
import { openLeadChat } from "@/lib/askChat";
import { cn } from "@/lib/utils";

type ArticleAsideCtaProps = {
  /** Compact sticky rail vs full-width end-of-article block. */
  variant: "rail" | "footer";
  className?: string;
};

export function ArticleAsideCta({ variant, className }: ArticleAsideCtaProps) {
  const isRail = variant === "rail";

  return (
    <aside
      className={cn(
        isRail ? "rj-article-cta-rail" : "rj-article__cta",
        className,
      )}
      aria-label="Talk to UXLAB"
    >
      <h2>{isRail ? "Want this applied?" : "Want this applied to your product?"}</h2>
      {isRail ? (
        <p>Order a service or talk through your product goals with UXLAB.</p>
      ) : (
        <p>
          UXLAB helps teams ship activation, CRO, and AI-native product work
          that moves conversion—not slide decks.
        </p>
      )}
      <ArrowLink
        href="#contact"
        className={cn(
          "rj-link-active",
          isRail ? "rj-article-cta-rail__btn" : "rj-article__cta-btn",
        )}
        onClick={(event) => {
          event.preventDefault();
          openLeadChat();
        }}
      >
        Let&apos;s talk
      </ArrowLink>
    </aside>
  );
}
