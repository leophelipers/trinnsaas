import {
  MercadoPagoConfig,
  Payment,
  CardToken,
  Customer,
  CustomerCard,
  PreApproval,
} from "mercadopago";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";

export const mpClient = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 8000,
  },
});

export const mpPayment = new Payment(mpClient);
export const mpCardToken = new CardToken(mpClient);
export const mpCustomer = new Customer(mpClient);
export const mpCustomerCard = new CustomerCard(mpClient);
export const mpPreApproval = new PreApproval(mpClient);
