import { CryptoSymbol, MultiSigWallet, TransactionProposal } from "../types";

export class MultiSigWalletManager {
  private wallets: Record<string, MultiSigWallet> = {
    "0xInstitutionalTreasuryMultisig": {
      address: "0xInstitutionalTreasuryMultisig",
      owners: ["0xOwner1", "0xOwner2", "0xOwner3"],
      requiredSignatures: 2,
      balanceUSD: 1650000,
      assets: [
        { symbol: "BTC", amount: 15.5 },
        { symbol: "ETH", amount: 150 },
        { symbol: "USDT", amount: 125000 }
      ]
    }
  };

  private proposals: TransactionProposal[] = [];

  public async getWallet(address: string): Promise<MultiSigWallet> {
    const wallet = this.wallets[address];
    if (!wallet) {
      throw new Error(`Multisig wallet ${address} not found.`);
    }
    return wallet;
  }

  public createProposal(
    walletAddress: string,
    toAddress: string,
    symbol: CryptoSymbol,
    amount: number,
    creatorAddress: string
  ): TransactionProposal {
    const wallet = this.wallets[walletAddress];
    if (!wallet) throw new Error("Wallet not found.");
    if (!wallet.owners.includes(creatorAddress)) {
      throw new Error("Only owners can create transaction proposals.");
    }

    const proposal: TransactionProposal = {
      id: `prop-${Math.random().toString(36).substr(2, 9)}`,
      walletAddress,
      toAddress,
      symbol,
      amount,
      signatures: [creatorAddress],
      executed: false,
      createdAt: new Date()
    };

    this.proposals.push(proposal);
    return proposal;
  }

  public getProposal(id: string): TransactionProposal {
    const p = this.proposals.find(item => item.id === id);
    if (!p) throw new Error("Proposal not found.");
    return p;
  }

  public signProposal(proposalId: string, signerAddress: string): TransactionProposal {
    const proposal = this.getProposal(proposalId);
    const wallet = this.wallets[proposal.walletAddress];
    
    if (!wallet.owners.includes(signerAddress)) {
      throw new Error("Signer is not an owner of the wallet.");
    }
    if (proposal.signatures.includes(signerAddress)) {
      throw new Error("Signer has already signed this proposal.");
    }
    if (proposal.executed) {
      throw new Error("Proposal has already been executed.");
    }

    proposal.signatures.push(signerAddress);

    // Auto-execute if required signatures met
    if (proposal.signatures.length >= wallet.requiredSignatures) {
      this.executeProposal(proposal);
    }

    return proposal;
  }

  private executeProposal(proposal: TransactionProposal) {
    const wallet = this.wallets[proposal.walletAddress];
    const asset = wallet.assets.find(a => a.symbol === proposal.symbol);
    
    if (!asset || asset.amount < proposal.amount) {
      throw new Error("Insufficient balance inside MultiSig wallet.");
    }

    asset.amount -= proposal.amount;
    proposal.executed = true;
  }
}
