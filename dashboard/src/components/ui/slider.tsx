import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'onChange'> {
  defaultValue?: number[]
  onValueChange?: (values: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, defaultValue = [0], onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value)
      if (onValueChange) {
        onValueChange([value])
      }
    }

    return (
      <div className={cn("relative w-full", className)}>
        <input
          type="range"
          ref={ref}
          className={cn(
            "w-full h-2 appearance-none bg-secondary rounded-lg cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
            "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0",
          )}
          min={props.min || 0}
          max={props.max || 100}
          defaultValue={defaultValue[0].toString()}
          onChange={handleChange}
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
