import { initiateKhalti, verifyKhalti } from "./khaltiService.js";
import { initiateEsewa, verifyEsewa } from "./esewaService.js";
import { initiateImepay, verifyImepay } from "./imepayService.js";

export const initiatePayment = async (provider, user, order) => {
  switch (provider) {
    case "khalti": return initiateKhalti(user, order);
    case "esewa": return initiateEsewa(user, order);
    case "imepay": return initiateImepay(user, order);
    case "cod":
      return { paymentUrl: null, transactionId: `COD-${Date.now()}` };
    default:
      throw new Error("Unsupported payment provider");
  }
};

export const verifyPayment = async (provider, transactionId) => {
  switch (provider) {
    case "khalti": return verifyKhalti(transactionId);
    case "esewa": return verifyEsewa(transactionId);
    case "imepay": return verifyImepay(transactionId);
    case "cod": return true;
    default: return false;
  }
};
