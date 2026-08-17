type ArticleShareBarProps = {
  title: string;
  url: string;
};

export function articleShareUrls(title: string, url: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    x: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.833L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M7.12 9.5H4.1V20h3.02V9.5zM5.61 4.2a1.76 1.76 0 1 0 0 3.52 1.76 1.76 0 0 0 0-3.52zM20.4 13.4c0-2.72-1.45-3.98-3.39-3.98-1.56 0-2.26.86-2.65 1.46V9.5h-3.02c.04 1.16 0 10.5 0 10.5h3.02v-5.86c0-.31.02-.63.12-.85.25-.63.83-1.29 1.8-1.29 1.27 0 1.78.97 1.78 2.39V20h3.02v-6.6z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M14.8 8.2h-2.2V6.85c0-.62.26-.95.98-.95H14.8V3.7s-.86-.15-1.68-.15c-1.66 0-2.81 1.02-2.81 2.9v1.75H8.3v2.55h2.01V20.3h2.5V10.75h2.16l.03-2.55z"
      />
    </svg>
  );
}

const LINK_REL = "noopener noreferrer";

/**
 * Share this article — X / LinkedIn / Facebook.
 * Lives in the left rail above the TOC (and above the mobile TOC).
 */
export function ArticleShareBar({ title, url }: ArticleShareBarProps) {
  const share = articleShareUrls(title, url);

  return (
    <div className="rj-article__share">
      <p className="rj-article__share-label">Share this article</p>
      <ul className="rj-article__share-list">
        <li>
          <a
            className="rj-article__share-btn"
            href={share.x}
            target="_blank"
            rel={LINK_REL}
            aria-label="Share on X"
          >
            <XIcon />
          </a>
        </li>
        <li>
          <a
            className="rj-article__share-btn"
            href={share.linkedin}
            target="_blank"
            rel={LINK_REL}
            aria-label="Share on LinkedIn"
          >
            <LinkedInIcon />
          </a>
        </li>
        <li>
          <a
            className="rj-article__share-btn"
            href={share.facebook}
            target="_blank"
            rel={LINK_REL}
            aria-label="Share on Facebook"
          >
            <FacebookIcon />
          </a>
        </li>
      </ul>
    </div>
  );
}
