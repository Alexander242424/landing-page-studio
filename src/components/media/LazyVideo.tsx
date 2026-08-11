import {
  forwardRef,
  useEffect,
  useRef,
  type VideoHTMLAttributes,
} from "react";
import { useNearViewport } from "@/hooks/useNearViewport";

type LazyVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "src" | "preload"
> & {
  src: string;
  /** Poster shown before the video source attaches. */
  poster?: string;
  /** How far ahead of the viewport to start loading. */
  rootMargin?: string;
  /** When true, call play() once media can play. */
  autoPlayWhenVisible?: boolean;
  /** preload once attached — default metadata. */
  preload?: "none" | "metadata" | "auto";
};

/**
 * Defers attaching `src` until near the viewport so large MP4s never
 * compete with LCP / first-paint bandwidth.
 */
export const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(
  function LazyVideo(
    {
      src,
      poster,
      className,
      rootMargin = "400px 0px",
      autoPlayWhenVisible = true,
      preload = "metadata",
      muted = true,
      playsInline = true,
      loop,
      ...rest
    },
    forwardedRef,
  ) {
    const localRef = useRef<HTMLVideoElement | null>(null);
    const near = useNearViewport(localRef, { rootMargin });

    const setRefs = (node: HTMLVideoElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    useEffect(() => {
      const video = localRef.current;
      if (!video || !near) return;

      if (video.dataset.srcAttached !== "1") {
        video.src = src;
        video.dataset.srcAttached = "1";
        video.load();
      }

      if (!autoPlayWhenVisible) return;

      const play = () => {
        void video.play().catch(() => undefined);
      };

      if (video.readyState >= 2) play();
      video.addEventListener("loadeddata", play);
      return () => video.removeEventListener("loadeddata", play);
    }, [near, src, autoPlayWhenVisible]);

    return (
      <video
        ref={setRefs}
        className={className}
        poster={poster}
        muted={muted}
        playsInline={playsInline}
        loop={loop}
        preload={near ? preload : "none"}
        draggable={false}
        {...rest}
      />
    );
  },
);
