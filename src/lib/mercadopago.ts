import { MercadoPagoConfig, Payment, CardToken } from "mercadopago";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";

export const mpClient = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 8000,
  },
});

export const mpPayment = new Payment(mpClient);
export const mpCardToken = new CardToken(mpClient);
