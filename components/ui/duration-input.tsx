"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"

interface DurationInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
}

const timeUnits = [
  { value: "minutes", label: "Minutes", singular: "minute" },
  { value: "hours", label: "Hours", singular: "hour" },
  { value: "days", label: "Days", singular: "day" },
  { value: "weeks", label: "Weeks", singular: "week" },
]

const durationType = [
  { value: "exact", label: "Exactly" },
  { value: "about", label: "About" },
  { value: "upto", label: "Up to" },
  { value: "atleast", label: "At least" },
  { value: "flexible", label: "Flexible" },
]

export default function DurationInput({ value, onChange, disabled, required }: DurationInputProps) {
  // Parse existing value to extract amount, unit, and type
  const parseValue = (val: string) => {
    if (!val) return { amount: "", unit: "hours", type: "exact" }
    
    const lowerVal = val.toLowerCase()
    
    // Determine type
    let type = "exact"
    if (lowerVal.includes("about") || lowerVal.includes("approximately")) type = "about"
    else if (lowerVal.includes("up to") || lowerVal.includes("maximum")) type = "upto"
    else if (lowerVal.includes("at least") || lowerVal.includes("minimum")) type = "atleast"
    else if (lowerVal.includes("flexible") || lowerVal.includes("negotiable")) type = "flexible"
    
    // Extract number
    const numberMatch = val.match(/(\d+(?:\.\d+)?)/);
    let amount = ""
    if (numberMatch) {
      amount = numberMatch[1]
    }
    
    // Determine unit
    let unit = "hours"
    if (lowerVal.includes("minute")) unit = "minutes"
    else if (lowerVal.includes("hour")) unit = "hours"
    else if (lowerVal.includes("day")) unit = "days"
    else if (lowerVal.includes("week")) unit = "weeks"
    
    return { amount, unit, type }
  }

  const { amount: initialAmount, unit: initialUnit, type: initialType } = parseValue(value)
  
  const [amount, setAmount] = useState(initialAmount)
  const [unit, setUnit] = useState(initialUnit)
  const [type, setType] = useState(initialType)

  const updateValue = (newAmount: string, newUnit: string, newType: string) => {
    if (!newAmount) {
      onChange("")
      return
    }

    const unitData = timeUnits.find(u => u.value === newUnit)
    const typeData = durationType.find(t => t.value === newType)
    
    if (!unitData || !typeData) return

    const numAmount = parseFloat(newAmount)
    const unitLabel = numAmount === 1 ? unitData.singular : unitData.label.toLowerCase()
    
    let formattedValue = ""
    
    switch (newType) {
      case "exact":
        formattedValue = `${newAmount} ${unitLabel}`
        break
      case "about":
        formattedValue = `About ${newAmount} ${unitLabel}`
        break
      case "upto":
        formattedValue = `Up to ${newAmount} ${unitLabel}`
        break
      case "atleast":
        formattedValue = `At least ${newAmount} ${unitLabel}`
        break
      case "flexible":
        formattedValue = `${newAmount} ${unitLabel} (flexible)`
        break
      default:
        formattedValue = `${newAmount} ${unitLabel}`
    }

    onChange(formattedValue)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value.replace(/[^\d.]/g, "") // Only allow numbers and decimal
    setAmount(newAmount)
    updateValue(newAmount, unit, type)
  }

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit)
    updateValue(amount, newUnit, type)
  }

  const handleTypeChange = (newType: string) => {
    setType(newType)
    updateValue(amount, unit, newType)
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Duration {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="flex gap-2">
        {/* Duration Type */}
        <Select value={type} onValueChange={handleTypeChange} disabled={disabled}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {durationType.map((dt) => (
              <SelectItem key={dt.value} value={dt.value}>
                {dt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Amount Input */}
        <div className="flex-1">
          <Input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            disabled={disabled}
            required={required}
          />
        </div>

        {/* Time Unit Selection */}
        <Select value={unit} onValueChange={handleUnitChange} disabled={disabled}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeUnits.map((timeUnit) => (
              <SelectItem key={timeUnit.value} value={timeUnit.value}>
                {timeUnit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Preview */}
      {amount && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Preview: {value || "Enter amount to see preview"}
        </div>
      )}
    </div>
  )
} 