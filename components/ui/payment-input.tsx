"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DollarSign } from "lucide-react"

interface PaymentInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
}

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
]

const paymentTypes = [
  { value: "hourly", label: "Per Hour" },
  { value: "total", label: "Total Amount" },
  { value: "daily", label: "Per Day" },
  { value: "weekly", label: "Per Week" },
]

export default function PaymentInput({ value, onChange, disabled, required }: PaymentInputProps) {
  // Parse existing value to extract amount, currency, and type
  const parseValue = (val: string) => {
    if (!val) return { amount: "", currency: "USD", type: "total" }
    
    // Try to extract currency symbol and amount
    const usdMatch = val.match(/\$(\d+(?:\.\d{2})?)/);
    const eurMatch = val.match(/€(\d+(?:\.\d{2})?)/);
    const gbpMatch = val.match(/£(\d+(?:\.\d{2})?)/);
    
    let amount = "";
    let currency = "USD";
    
    if (usdMatch) {
      amount = usdMatch[1];
      currency = "USD";
    } else if (eurMatch) {
      amount = eurMatch[1];
      currency = "EUR";
    } else if (gbpMatch) {
      amount = gbpMatch[1];
      currency = "GBP";
    } else {
      // Try to extract just numbers
      const numberMatch = val.match(/(\d+(?:\.\d{2})?)/);
      if (numberMatch) {
        amount = numberMatch[1];
      }
    }
    
    // Determine payment type
    let type = "total";
    if (val.includes("/hour") || val.includes("hour")) type = "hourly";
    else if (val.includes("/day") || val.includes("day")) type = "daily";
    else if (val.includes("/week") || val.includes("week")) type = "weekly";
    
    return { amount, currency, type };
  }

  const { amount: initialAmount, currency: initialCurrency, type: initialType } = parseValue(value);
  
  const [amount, setAmount] = useState(initialAmount);
  const [currency, setCurrency] = useState(initialCurrency);
  const [paymentType, setPaymentType] = useState(initialType);

  const updateValue = (newAmount: string, newCurrency: string, newType: string) => {
    if (!newAmount) {
      onChange("");
      return;
    }

    const currencyData = currencies.find(c => c.code === newCurrency);
    const typeData = paymentTypes.find(t => t.value === newType);
    
    if (!currencyData || !typeData) return;

    let formattedValue = `${currencyData.symbol}${newAmount}`;
    if (newType !== "total") {
      formattedValue += ` ${typeData.label.toLowerCase()}`;
    }

    onChange(formattedValue);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value.replace(/[^\d.]/g, ""); // Only allow numbers and decimal
    setAmount(newAmount);
    updateValue(newAmount, currency, paymentType);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    updateValue(amount, newCurrency, paymentType);
  };

  const handleTypeChange = (newType: string) => {
    setPaymentType(newType);
    updateValue(amount, currency, newType);
  };

  const selectedCurrency = currencies.find(c => c.code === currency);

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Pay {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="flex gap-2">
        {/* Amount Input */}
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {selectedCurrency?.symbol}
          </div>
          <Input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            className="pl-8"
            disabled={disabled}
            required={required}
          />
        </div>

        {/* Currency Selection */}
        <Select value={currency} onValueChange={handleCurrencyChange} disabled={disabled}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((curr) => (
              <SelectItem key={curr.code} value={curr.code}>
                {curr.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment Type Selection */}
        <Select value={paymentType} onValueChange={handleTypeChange} disabled={disabled}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {paymentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Preview */}
      {amount && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Preview: {selectedCurrency?.symbol}{amount} {paymentType !== "total" && paymentTypes.find(t => t.value === paymentType)?.label.toLowerCase()}
        </div>
      )}
    </div>
  )
} 