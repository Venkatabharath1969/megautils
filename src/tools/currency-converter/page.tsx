'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩' },
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
]

const COMMON_PAIRS = [
  ['USD', 'EUR'], ['USD', 'GBP'], ['USD', 'INR'], ['USD', 'JPY'],
  ['EUR', 'GBP'], ['GBP', 'INR'], ['USD', 'CAD'], ['EUR', 'CHF'],
]

const QUICK_AMOUNTS = [1, 10, 100, 1000, 10000]

export default function CurrencyConverterTool() {
  const [rates, setRates] = useState<Record<string, number>>({})
  const [lastUpdated, setLastUpdated] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [amount, setAmount] = useState('1')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(data => {
        if (data.rates) {
          setRates(data.rates)
          setLastUpdated(data.time_last_update_utc || new Date().toUTCString())
        } else {
          setError('Failed to load exchange rates.')
        }
      })
      .catch(() => setError('Failed to fetch exchange rates. Please check your connection.'))
      .finally(() => setLoading(false))
  }, [])

  const convert = useCallback((val: number, from: string, to: string) => {
    if (!rates[from] || !rates[to]) return 0
    return (val / rates[from]) * rates[to]
  }, [rates])

  const result = useMemo(() => {
    const val = parseFloat(amount)
    if (isNaN(val) || val < 0) return null
    return convert(val, fromCurrency, toCurrency)
  }, [amount, fromCurrency, toCurrency, convert])

  const reverseResult = useMemo(() => {
    const val = parseFloat(amount)
    if (isNaN(val) || val < 0 || !result) return null
    return convert(result, toCurrency, fromCurrency)
  }, [amount, result, toCurrency, fromCurrency, convert])

  const exchangeRate = useMemo(() => {
    return convert(1, fromCurrency, toCurrency)
  }, [fromCurrency, toCurrency, convert])

  const reverseRate = useMemo(() => {
    return convert(1, toCurrency, fromCurrency)
  }, [fromCurrency, toCurrency, convert])

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const getCurrencyInfo = (code: string) => CURRENCIES.find(c => c.code === code)

  const formatCurrency = (value: number, code: string) => {
    const decimals = ['JPY', 'KRW', 'IDR', 'HUF'].includes(code) ? 0 : 2
    return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }

  return (
    <ToolPage
      title="Currency Converter"
      description="Convert between 30+ world currencies with live exchange rates updated daily. Free, fast, no sign-up."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Currency Converter is a free browser-based tool that lets you convert amounts between 30+ major world currencies using real-time exchange rates. Rates are fetched from a reliable open API and updated daily. Your data never leaves your browser — no sign-up, no installation, no server uploads required.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Select the source currency (From) and the target currency (To) from the dropdown menus.</li>
            <li>Enter an amount to convert in the input field, or use the quick amount buttons (1, 10, 100, 1,000, 10,000).</li>
            <li>The converted amount is displayed instantly along with the exchange rate and reverse rate.</li>
            <li>Click the swap button to reverse the conversion direction.</li>
            <li>Use the common pairs section to quickly select popular currency pairs.</li>
            <li>Copy the result using the copy button next to the converted amount.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Use this tool when you need to quickly check exchange rates for travel planning, international shopping, freelance invoicing, remittance estimates, or financial comparisons. It supports all major currencies including USD, EUR, GBP, INR, JPY, AUD, CAD, and 23 more. Since it runs entirely in your browser after the initial rate fetch, it works fast and keeps your data private.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Exchange rates are updated daily and may differ slightly from real-time market rates used by banks and brokers.</li>
            <li>For large transactions, always verify the rate with your bank or financial institution.</li>
            <li>The last-updated timestamp shows when the rates were most recently refreshed.</li>
            <li>Use the quick amount buttons to rapidly check conversions at common amounts.</li>
            <li>The reverse conversion display lets you see the rate in both directions simultaneously.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How often are exchange rates updated?', answer: 'Exchange rates are updated daily from a reliable open API source. The last-updated timestamp is displayed below the converter so you always know how fresh the data is.' },
        { question: 'Are these rates the same as my bank offers?', answer: 'These are mid-market exchange rates (the midpoint between buy and sell prices). Banks and money transfer services typically add a markup or spread, so the actual rate you receive may differ.' },
        { question: 'Which currencies are supported?', answer: 'This tool supports 30+ major currencies including USD, EUR, GBP, INR, JPY, AUD, CAD, CHF, CNY, BRL, MXN, KRW, SGD, HKD, and many more.' },
        { question: 'Does this tool work offline?', answer: 'The tool needs an internet connection on first load to fetch current exchange rates. After the rates are loaded, you can convert between currencies without additional network requests during your session.' },
        { question: 'How accurate are the conversions?', answer: 'Conversions use rates from a well-known open exchange rate API. While highly accurate for informational purposes, they should not replace official rates for financial transactions.' },
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Loading / Error states */}
        {loading && (
          <div className="p-4 rounded-xl bg-muted/30 border border-border text-center text-muted-foreground">
            Loading exchange rates...
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Currency selectors + amount */}
            <div className="space-y-4">
              {/* From / Swap / To */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                {/* From */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">From</label>
                  <select
                    value={fromCurrency}
                    onChange={e => setFromCurrency(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap button */}
                <button
                  onClick={swapCurrencies}
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-colors"
                  title="Swap currencies"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16l-4-4 4-4" /><path d="M3 12h18" /><path d="M17 8l4 4-4 4" /></svg>
                </button>

                {/* To */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">To</label>
                  <select
                    value={toCurrency}
                    onChange={e => setToCurrency(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min={0}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Quick amounts */}
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map(qa => (
                  <button
                    key={qa}
                    onClick={() => setAmount(qa.toString())}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      amount === qa.toString()
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80'
                    }`}
                  >
                    {qa.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            {result !== null && (
              <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">
                  {getCurrencyInfo(fromCurrency)?.flag} {formatCurrency(parseFloat(amount) || 0, fromCurrency)} {fromCurrency} =
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-primary">
                    {getCurrencyInfo(toCurrency)?.flag} {formatCurrency(result, toCurrency)} {toCurrency}
                  </div>
                  <CopyButton text={result.toFixed(['JPY', 'KRW', 'IDR', 'HUF'].includes(toCurrency) ? 0 : 2)} />
                </div>

                {/* Exchange rate info */}
                <div className="mt-4 pt-3 border-t border-primary/10 space-y-1 text-sm text-muted-foreground">
                  <div>1 {fromCurrency} = {formatCurrency(exchangeRate, toCurrency)} {toCurrency}</div>
                  <div>1 {toCurrency} = {formatCurrency(reverseRate, fromCurrency)} {fromCurrency}</div>
                </div>

                {/* Reverse conversion */}
                {reverseResult !== null && (
                  <div className="mt-3 pt-3 border-t border-primary/10 text-sm text-muted-foreground">
                    Reverse: {formatCurrency(result, toCurrency)} {toCurrency} = {formatCurrency(reverseResult, fromCurrency)} {fromCurrency}
                  </div>
                )}
              </div>
            )}

            {/* Common pairs */}
            <div>
              <div className="text-sm font-medium mb-2">Common Pairs</div>
              <div className="flex flex-wrap gap-2">
                {COMMON_PAIRS.map(([from, to]) => (
                  <button
                    key={`${from}-${to}`}
                    onClick={() => { setFromCurrency(from); setToCurrency(to) }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      fromCurrency === from && toCurrency === to
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80'
                    }`}
                  >
                    {getCurrencyInfo(from)?.flag} {from} → {getCurrencyInfo(to)?.flag} {to}
                  </button>
                ))}
              </div>
            </div>

            {/* Last updated */}
            {lastUpdated && (
              <div className="text-xs text-muted-foreground text-center">
                Rates last updated: {lastUpdated}
              </div>
            )}
          </>
        )}
      </div>
    </ToolPage>
  )
}
