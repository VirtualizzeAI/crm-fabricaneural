"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"

interface DateRangeSelectorProps {
  onRangeChange: (days: number) => void
  selectedDays: number
}

export function DateRangeSelector({ onRangeChange, selectedDays }: DateRangeSelectorProps) {
  const [date, setDate] = useState<DateRange | undefined>()
  const [isCustom, setIsCustom] = useState(false)

  const presets = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 15 days", days: 15 },
    { label: "Last 30 days", days: 30 },
  ]

  const handlePresetClick = (days: number) => {
    setIsCustom(false)
    onRangeChange(days)
  }

  const handleCustomRange = (range: DateRange | undefined) => {
    setDate(range)
    if (range?.from && range?.to) {
      const days = Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
      setIsCustom(true)
      onRangeChange(days)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.days}
          variant={selectedDays === preset.days && !isCustom ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick(preset.days)}
          className={
            selectedDays === preset.days && !isCustom
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "border-slate-300 text-slate-700 hover:bg-slate-100"
          }
        >
          {preset.label}
        </Button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isCustom ? "default" : "outline"}
            size="sm"
            className={
              isCustom
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                </>
              ) : (
                format(date.from, "MMM dd, yyyy")
              )
            ) : (
              "Custom range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleCustomRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
