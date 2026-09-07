"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function GoftinoWidget() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <Script
      id="goftino-widget"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `!function(){var i="jk2mec",a=window,d=document;function g(){var g=d.createElement("script"),s="https://www.goftino.com/widget/"+i,l=localStorage.getItem("goftino_"+i);g.async=!0,g.src=l?s+"?o="+l:s;d.getElementsByTagName("head")[0].appendChild(g);}"complete"===d.readyState?g():a.attachEvent?a.attachEvent("onload",g):a.addEventListener("load",g,!1);}();`,
      }}
    />
  );
}
