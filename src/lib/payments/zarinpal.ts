import { apiRequest } from "@/lib/api-client";

export type PaymentRequestInput = {
  orderId: string;
  amount: number;
  callbackUrl: string;
};

export type PaymentRequestResponse = {
  paymentUrl: string;
  authority: string;
};

export type PaymentVerifyResponse = {
  success: boolean;
  refId?: string;
  message?: string;
};

export async function requestZarinPalPayment(
  input: PaymentRequestInput,
): Promise<PaymentRequestResponse> {
  return apiRequest<PaymentRequestResponse>("/payments/zarinpal/request", {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });
}

export async function verifyZarinPalPayment(
  authority: string,
  orderId: string,
): Promise<PaymentVerifyResponse> {
  return apiRequest<PaymentVerifyResponse>(
    `/payments/zarinpal/verify?Authority=${encodeURIComponent(authority)}&orderId=${encodeURIComponent(orderId)}`,
    { auth: false },
  );
}
