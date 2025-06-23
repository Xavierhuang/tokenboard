import React, { useState, useEffect } from 'react';
import { pyusdService, PYUSDBalance } from '@/lib/pyusd';
import { TokenizedAsset } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface PYUSDPaymentProps {
  asset: TokenizedAsset;
  onPaymentSuccess?: (txHash: string) => void;
  onPaymentError?: (error: string) => void;
  onCancel?: () => void;
}

export default function PYUSDPayment({ 
  asset, 
  onPaymentSuccess, 
  onPaymentError, 
  onCancel 
}: PYUSDPaymentProps) {
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState<PYUSDBalance | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    const connected = pyusdService.isWalletConnected();
    setIsWalletConnected(connected);
    
    if (connected) {
      const address = await pyusdService.getConnectedAddress();
      setWalletAddress(address);
      if (address) {
        await loadBalance(address);
      }
    }
  };

  const loadBalance = async (address: string) => {
    try {
      const balanceData = await pyusdService.getBalance(address);
      setBalance(balanceData);
    } catch (error) {
      console.error('Failed to load balance:', error);
      setError('Failed to load wallet balance');
    }
  };

  const handleConnectWallet = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const success = await pyusdService.connectWallet();
      if (success) {
        const address = await pyusdService.getConnectedAddress();
        setWalletAddress(address);
        setIsWalletConnected(true);
        if (address) {
          await loadBalance(address);
        }
      } else {
        setError('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setError('Failed to connect wallet');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!balance || parseFloat(amount) > parseFloat(balance.formatted)) {
      setError('Insufficient PYUSD balance');
      return;
    }

    if (parseFloat(amount) < asset.minInvestment) {
      setError(`Minimum investment is ${formatCurrency(asset.minInvestment)}`);
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // For demo purposes, we'll transfer to a demo address
      // In a real implementation, this would be the asset issuer's address
      const demoRecipientAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      
      const tx = await pyusdService.transfer(demoRecipientAddress, amount);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt) {
        console.log('Payment successful:', receipt);
        onPaymentSuccess?.(receipt.hash);
      } else {
        throw new Error('Transaction failed - no receipt received');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setError(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getAvailableBalance = () => {
    return balance ? parseFloat(balance.formatted) : 0;
  };

  const getMaxPurchaseAmount = () => {
    const available = getAvailableBalance();
    return Math.min(available, asset.maxInvestment || available);
  };

  const setMaxAmount = () => {
    const maxAmount = getMaxPurchaseAmount();
    setAmount(maxAmount.toString());
  };

  if (!isWalletConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect PYUSD Wallet</h3>
          <p className="text-gray-600 mb-6">Connect your wallet to purchase {asset.name}</p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleConnectWallet}
            disabled={isProcessing}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </div>
            ) : (
              'Connect Wallet'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Purchase with PYUSD</h3>
            <p className="text-sm text-gray-500">Buy {asset.name} using PayPal USD</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Asset Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {asset.imageUrl && (
            <img 
              src={asset.imageUrl} 
              alt={asset.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">{asset.name}</h4>
            <p className="text-sm text-gray-500">{asset.symbol}</p>
            <p className="text-sm text-gray-600">Current Price: {formatCurrency(asset.currentPrice)}</p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="p-6">
        {/* Balance Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Available PYUSD Balance</span>
            <span className="text-lg font-semibold text-gray-900">
              {balance ? formatCurrency(parseFloat(balance.formatted), 'USD') : 'Loading...'}
            </span>
          </div>
          {walletAddress && (
            <p className="text-xs text-gray-500 mt-1">{formatAddress(walletAddress)}</p>
          )}
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Amount (PYUSD)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min={asset.minInvestment}
              max={getMaxPurchaseAmount()}
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={setMaxAmount}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              MAX
            </button>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Min: {formatCurrency(asset.minInvestment)}</span>
            <span>Max: {formatCurrency(getMaxPurchaseAmount())}</span>
          </div>
        </div>

        {/* Investment Summary */}
        {amount && parseFloat(amount) > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Investment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{formatCurrency(parseFloat(amount), 'USD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tokens to receive:</span>
                <span className="font-medium">
                  {(parseFloat(amount) / asset.currentPrice).toFixed(6)} {asset.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Asset price:</span>
                <span className="font-medium">{formatCurrency(asset.currentPrice)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Purchase with PYUSD'
            )}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          By proceeding, you agree to purchase {asset.symbol} tokens using PYUSD. 
          This transaction is irreversible once confirmed on the blockchain.
        </p>
      </div>
    </div>
  );
} 