import { KYCUser } from "../types";

export class KycAmlService {
  private mockUsers: Record<string, KYCUser> = {
    "user-1": {
      id: "user-1",
      fullName: "Roberto Silva",
      documentNumber: "123.456.789-00",
      documentType: "CPF",
      riskScore: 12,
      status: "APPROVED",
      amlCheckedAt: new Date(),
      sanctionListMatch: false
    },
    "user-2": {
      id: "user-2",
      fullName: "Global Trading Ltd",
      documentNumber: "12.345.678/0001-99",
      documentType: "CNPJ",
      riskScore: 85,
      status: "PENDING",
      amlCheckedAt: new Date(),
      sanctionListMatch: true
    }
  };

  public async getKYCStatus(userId: string): Promise<KYCUser> {
    const user = this.mockUsers[userId];
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    return user;
  }

  public async registerUser(
    fullName: string,
    documentNumber: string,
    documentType: "CPF" | "CNPJ" | "PASSPORT"
  ): Promise<KYCUser> {
    const id = `user-${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate AML verification checks
    const sanctionListMatch = documentNumber.includes("999") || fullName.toLowerCase().includes("oligarch");
    const riskScore = sanctionListMatch ? 99 : Math.floor(Math.random() * 40) + 5;
    const status = sanctionListMatch ? "REJECTED" : riskScore > 75 ? "SUSPENDED" : "APPROVED";

    const newUser: KYCUser = {
      id,
      fullName,
      documentNumber,
      documentType,
      riskScore,
      status,
      amlCheckedAt: new Date(),
      sanctionListMatch
    };

    this.mockUsers[id] = newUser;
    return newUser;
  }

  public async monitorTransaction(fromAddress: string, toAddress: string, amountUSD: number): Promise<{ alert: boolean; reason?: string }> {
    // AML check logic: trigger alert for values over 50,000 USD
    if (amountUSD >= 50000) {
      return {
        alert: true,
        reason: `High value transaction: $${amountUSD.toLocaleString()} USD exceeds threshold.`
      };
    }
    return { alert: false };
  }
}
