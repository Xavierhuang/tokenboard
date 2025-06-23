import React, { useState, useEffect } from 'react';
import { pyusdService, PYUSDBalance, PYUSDTransaction } from '@/lib/pyusd';
import { formatCurrency } from '@/lib/utils';

interface PYUSDWalletProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export default function PYUSDWallet({ onConnect, onDisconnect }: PYUSDWalletProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<PYUSDBalance | null>(null);
  const [transactions, setTransactions] = useState<PYUSDTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (pyusdService.isWalletConnected()) {
        const connectedAddress = await pyusdService.getConnectedAddress();
        if (connectedAddress) {
          setIsConnected(true);
          setAddress(connectedAddress);
          await loadBalance(connectedAddress);
          await loadTransactions(connectedAddress);
        }
      }
    };

    checkConnection();
  }, []);

  const loadBalance = async (walletAddress: string) => {
    try {
      const balanceData = await pyusdService.getBalance(walletAddress);
      setBalance(balanceData);
    } catch (error) {
      console.error('Failed to load balance:', error);
      setError('Failed to load balance');
    }
  };

  const loadTransactions = async (walletAddress: string) => {
    try {
      const txHistory = await pyusdService.getTransactionHistory(walletAddress, 5);
      setTransactions(txHistory);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await pyusdService.connectWallet();
      if (success) {
        const connectedAddress = await pyusdService.getConnectedAddress();
        if (connectedAddress) {
          setIsConnected(true);
          setAddress(connectedAddress);
          await loadBalance(connectedAddress);
          await loadTransactions(connectedAddress);
          onConnect?.(connectedAddress);
        }
      } else {
        setError('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setError('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await pyusdService.disconnectWallet();
      setIsConnected(false);
      setAddress(null);
      setBalance(null);
      setTransactions([]);
      onDisconnect?.();
    } catch (error) {
      console.error('Disconnect error:', error);
      setError('Failed to disconnect wallet');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const handleSendPYUSD = async () => {
    setSendError(null);
    setSendSuccess(null);
    if (!sendTo || !/^0x[a-fA-F0-9]{40}$/.test(sendTo)) {
      setSendError('Please enter a valid Ethereum address.');
      return;
    }
    if (!sendAmount || isNaN(Number(sendAmount)) || Number(sendAmount) <= 0) {
      setSendError('Please enter a valid amount.');
      return;
    }
    if (balance && Number(sendAmount) > parseFloat(balance.formatted)) {
      setSendError('Insufficient balance.');
      return;
    }
    try {
      setSendLoading(true);
      const tx = await pyusdService.transfer(sendTo, sendAmount);
      await tx.wait();
      setSendSuccess('Transaction sent!');
      setSendAmount('');
      setSendTo('');
      await loadBalance(address!);
      await loadTransactions(address!);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Failed to send PYUSD');
    } finally {
      setSendLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect PYUSD Wallet</h3>
          <p className="text-gray-600 mb-6">Connect your wallet to use PayPal USD for tokenized asset purchases</p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
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
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">PYUSD Wallet</h3>
              <p className="text-sm text-gray-500">{address && formatAddress(address)}</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="p-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">PYUSD Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {balance ? formatCurrency(parseFloat(balance.formatted), 'USD') : 'Loading...'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">$</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
            onClick={() => setShowSendModal(true)}
          >
            Send PYUSD
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200">
            Buy PYUSD
          </button>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Recent Transactions</h4>
            <button
              onClick={() => setShowTransactions(!showTransactions)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {showTransactions ? 'Hide' : 'Show'}
            </button>
          </div>

          {showTransactions && (
            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.from === address ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        <svg className={`w-4 h-4 ${tx.from === address ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tx.from === address ? "M20 12H4" : "M12 4l8 8-8 8"} />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {tx.from === address ? 'Sent' : 'Received'}
                        </p>
                        <p className="text-xs text-gray-500">{formatTimestamp(tx.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {tx.from === address ? '-' : '+'}{formatCurrency(parseFloat(tx.value), 'USD')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatAddress(tx.from === address ? tx.to : tx.from)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No recent transactions</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setShowSendModal(false);
                setSendError(null);
                setSendSuccess(null);
                setSendAmount('');
                setSendTo('');
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send PYUSD</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
              <input
                type="text"
                value={sendTo}
                onChange={e => setSendTo(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PYUSD)</label>
              <input
                type="number"
                value={sendAmount}
                onChange={e => setSendAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {sendError && <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2 text-red-800 text-sm">{sendError}</div>}
            {sendSuccess && <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2 text-green-800 text-sm">{sendSuccess}</div>}
            <button
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSendPYUSD}
              disabled={sendLoading}
            >
              {sendLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 