"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { getApiBaseUrl } from "@/lib/api-client";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white invert" dir="ltr">
      <SwaggerUI
        url={`${getApiBaseUrl()}/api/openapi`}
        docExpansion="list"
        defaultModelsExpandDepth={1}
        persistAuthorization
        tryItOutEnabled
      />
    </main>
  );
}
