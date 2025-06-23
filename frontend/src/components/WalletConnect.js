import React from 'react';
import { Wallet } from 'lucide-react';

const WalletConnect = ({ onConnect }) => {
  return (
    <button
      onClick={onConnect}
      className="btn-primary flex items-center"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </button>
  );
};

export default WalletConnect; 