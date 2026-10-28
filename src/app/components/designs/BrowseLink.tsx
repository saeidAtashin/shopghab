import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
  showLoader?: boolean;
  loaderAccent?: string;
};

export default function BrowseLink({
  scroll = false,
  showLoader = false,
  loaderAccent,
  ...props
}: Props) {
  return (
    <Link
      scroll={scroll}
      {...props}
      data-route-loader-ignore={showLoader ? undefined : "true"}
      data-route-loader-show={showLoader ? "true" : undefined}
      data-loader-accent={loaderAccent}
    />
  );
}
