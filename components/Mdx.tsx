import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { MovieCard } from "./MovieCard";
import { AdSlot } from "./AdSlot";

type Props = {
  source: string;
  /** Number every <Movie> in document order (for ranked lists). */
  ordered?: boolean;
  /** Insert an in-feed ad after every N movies (0 = never). */
  adEvery?: number;
};

function baseComponents(): MDXComponents {
  return {
    a: ({ href = "", children, ...rest }) => {
      if (href.startsWith("/")) {
        return (
          <Link href={href} {...rest}>
            {children}
          </Link>
        );
      }
      const external = /^https?:\/\//.test(href);
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
          {children}
        </a>
      );
    },
    img: ({ src = "", alt = "", ...rest }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={typeof src === "string" ? src : ""} alt={alt} loading="lazy" decoding="async" className="rounded-xl" {...rest} />
    ),
  };
}

/** Renders MDX content from `content/` with the site's component set. */
export async function Mdx({ source, ordered = false, adEvery = 5 }: Props) {
  let count = 0;
  const components: MDXComponents = {
    ...baseComponents(),
    // next-mdx-remote drops JS expression attributes, so ids are written as strings: <Movie id="745">
    Movie: ({ id, children }: { id: string | number; children?: ReactNode }) => {
      count += 1;
      const n = count;
      return (
        <>
          <MovieCard id={Number(id)} rank={ordered ? n : undefined}>
            {children}
          </MovieCard>
          {adEvery > 0 && n % adEvery === 0 && <AdSlot kind="infeed" className="not-prose" />}
        </>
      );
    },
    Ad: () => <AdSlot kind="article" className="not-prose" />,
  };

  const { content } = await compileMDX({
    source,
    components,
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
  });
  return content;
}
