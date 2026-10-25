import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link>;

export default function BrowseLink({ scroll = false, ...props }: Props) {
  return <Link scroll={scroll} data-route-loader-ignore="true" {...props} />;
}
