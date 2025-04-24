'use client';

import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, DollarSign, TrendingUp, ArrowUpDown } from 'lucide-react';

// const currencies = ['USD', 'INR', 'EUR', 'JPY', 'GBP'];

const currencies = [
  'USD', 'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG',
  'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB',
  'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP',
  'CNY', 'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD',
  'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'FOK', 'GBP', 'GEL', 'GGP',
  'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG',
  'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD',
  'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KID', 'KMF', 'KRW', 'KWD', 'KYD',
  'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA',
  'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR',
  'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN',
  'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF',
  'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL', 'SOS',
  'SRD', 'SSP', 'STN', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP',
  'TRY', 'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'UYU', 'UZS', 'VES',
  'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XCG', 'XDR', 'XOF', 'XPF', 'YER',
  'ZAR', 'ZMW', 'ZWL'
];


export default function Home() {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [fromAmount, setFromAmount] = useState(1);
  const [toAmount, setToAmount] = useState('');
  const [conversionRate, setConversionRate] = useState('');
  const [news, setNews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState('from'); // Tracks which field was last edited

  // Fetch conversion data
  // Fix for the fetchConversion function to properly set news data
  const fetchConversion = async (from: string, to: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/get-currency-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_currency: from, to_currency: to }),
      });

      const data = await response.json();

      // Always set news data regardless of conversion rate
      setNews(data.news || []);

      if (data.conversion_rate && !isNaN(data.conversion_rate)) {
        setConversionRate(data.conversion_rate);
        return Number(data.conversion_rate);
      }
      return null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handle conversion
  const handleConvert = async () => {
    const rate = await fetchConversion(fromCurrency, toCurrency);
    if (rate !== null) {
      if (activeField === 'from') {
        setToAmount((Number(fromAmount) * rate).toFixed(2));
      } else {
        setFromAmount(Number((Number(toAmount) / rate).toFixed(2)));
      }
    } else {
      setToAmount('N/A');
    }
  };

  // Handle from amount change
  const handleFromAmountChange = (value: number) => {
    setActiveField('from');
    setFromAmount(value);
    if (conversionRate && !isNaN(Number(conversionRate))) {
      setToAmount((value * Number(conversionRate)).toFixed(2));
    }
  };

  // Handle to amount change
  const handleToAmountChange = (value: number) => {
    setActiveField('to');
    setToAmount(value.toString());
    if (conversionRate && !isNaN(Number(conversionRate))) {
      setFromAmount(Number((value / Number(conversionRate)).toFixed(2)));
    }
  };

  // Handle currency changes
  const handleCurrencyChange = async (type: 'from' | 'to', currency: string) => {
    if (type === 'from') {
      setFromCurrency(currency);
      // If we already have the other currency, recalculate
      if (toCurrency) {
        const rate = await fetchConversion(currency, toCurrency);
        if (rate !== null && activeField === 'from') {
          setToAmount((Number(fromAmount) * rate).toFixed(2));
        } else if (rate !== null && activeField === 'to') {
          setFromAmount(Number((Number(toAmount) / rate).toFixed(2)));
        }
      }
    } else {
      setToCurrency(currency);
      // If we already have the other currency, recalculate
      if (fromCurrency) {
        const rate = await fetchConversion(fromCurrency, currency);
        if (rate !== null && activeField === 'from') {
          setToAmount((Number(fromAmount) * rate).toFixed(2));
        } else if (rate !== null && activeField === 'to') {
          setFromAmount(Number((Number(toAmount) / rate).toFixed(2)));
        }
      }
    }
  };

  // Swap currencies and values
  const handleSwap = () => {
    const tempCurrency = fromCurrency;
    const tempAmount = fromAmount;

    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);

    setFromAmount(Number(toAmount));
    setToAmount(tempAmount.toString());

    // Invert conversion rate if we have one
    if (conversionRate && !isNaN(Number(conversionRate))) {
      const invertedRate = (1 / Number(conversionRate)).toFixed(6);
      setConversionRate(invertedRate);
    }
  };

  // Initial conversion on component mount
  useEffect(() => {
    handleConvert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex flex-col items-center justify-center px-4 py-10">
      {/* Enhanced CurrencyPulse Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center mb-2">
          <TrendingUp className="h-8 w-8 text-blue-400 mr-2" />
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
            CurrencyPulse
          </h1>
        </div>
        <p className="text-cyan-200 text-sm italic">Real-time currency insights at your fingertips</p>
      </div>

      {/* Glowing Container */}
      <div className="relative bg-gray-900 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/20 backdrop-blur-sm p-8 w-full max-w-md mb-8">
        <div className="absolute inset-0 bg-blue-600/5 rounded-2xl"></div>

        {/* Title Section with Animated Rate Display */}
        <div className="text-center relative z-10 mb-6">
          <h2 className="text-lg text-blue-200 mb-2">1 {fromCurrency} equals</h2>
          <h3 className="text-5xl font-bold text-white mb-1 transition-all duration-300">
            {loading ?
              <span className="opacity-50">--</span> :
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-200">
                {conversionRate || '--'} <span className="text-blue-400">{toCurrency}</span>
              </span>
            }
          </h3>
          <p className="text-sm text-blue-300/70">Based on latest exchange data</p>
        </div>

        {/* Currency Conversion Form */}
        <div className="space-y-6 relative z-10">
          {/* From Section */}
          <div className="flex items-center justify-between space-x-3">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-3 h-5 w-5 text-blue-400/70" />
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(Number(e.target.value))}
                className="w-full pl-10 p-3 bg-gray-800/80 text-white rounded-lg border border-blue-500/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
              />
            </div>
            <select
              value={fromCurrency}
              onChange={(e) => handleCurrencyChange('from', e.target.value)}
              className="w-2/5 p-3 bg-gray-800/80 text-white rounded-lg border border-blue-500/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
            >
              {currencies.map((cur) => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>

          {/* Exchange Icon */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="bg-blue-600/30 hover:bg-blue-600/40 p-2 rounded-full transition-all transform hover:scale-110"
            >
              <ArrowUpDown className="h-5 w-5 text-blue-300" />
            </button>
          </div>

          {/* To Section */}
          <div className="flex items-center justify-between space-x-3">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-3 h-5 w-5 text-blue-400/70" />
              <input
                type="number"
                value={toAmount}
                onChange={(e) => handleToAmountChange(Number(e.target.value))}
                className="w-full pl-10 p-3 bg-gray-800/80 text-white rounded-lg border border-blue-500/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
              />
            </div>
            <select
              value={toCurrency}
              onChange={(e) => handleCurrencyChange('to', e.target.value)}
              className="w-2/5 p-3 bg-gray-800/80 text-white rounded-lg border border-blue-500/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
            >
              {currencies.map((cur) => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition-all py-3 rounded-lg font-medium text-white shadow-lg shadow-blue-600/30 disabled:opacity-50 transform hover:scale-105 duration-200 relative overflow-hidden group"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Converting...
              </div>
            ) : (
              'Convert'
            )}
          </button>
        </div>
      </div>

      {!loading && news.length > 0 && (
        <div className="w-full max-w-md bg-gradient-to-b from-gray-900/90 to-blue-900/40 backdrop-blur-lg rounded-xl border border-blue-400/20 p-6 shadow-xl overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-xl transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full filter blur-xl transform -translate-x-8 translate-y-8"></div>

          {/* Header */}
          <div className="flex items-center mb-6 relative z-10">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full mr-4"></div>
            <div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">
                Latest Currency News
              </h3>
              <p className="text-xs text-blue-300/70 mt-1">Financial insights that matter</p>
            </div>
          </div>

          {/* News items */}
          <div className="space-y-4 relative z-10 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {news.filter(item => item.trim() !== "").map((item, index) => (
              <div
                key={index}
                className="bg-blue-900/20 backdrop-blur-sm border border-blue-500/10 rounded-lg p-4 hover:border-blue-400/30 transition-all duration-300 transform hover:translate-x-1"
              >
                <div className="flex items-start">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 mt-1.5 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-200 text-sm">{item}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional styling for scrollbar */}
          <style jsx global>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(30, 41, 59, 0.2);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #60a5fa, #22d3ee);
        border-radius: 10px;
      }
    `}</style>
        </div>
      )}
    </main>
  );
}