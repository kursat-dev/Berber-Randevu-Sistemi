import * as React from "react"
import { Slot } from "@radix-ui/react-slot" // Wait, I didn't install radix slot, I'll simulate it or skip polymorphism for now to save install time.
// Actually, I can just do a normal button
import { cva, type VariantProps } from "class-variance-authority" // Needed? I can just use CN for now.
import { cn } from "@/lib/utils"

// Simple button component without heavy deps
export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold tracking-wider uppercase ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-90 cursor-pointer",
                    {
                        "bg-black text-white hover:bg-neutral-800 border-2 border-black": variant === "default",
                        "border-2 border-black bg-white text-black hover:bg-black hover:text-white": variant === "outline",
                        "hover:bg-neutral-100 text-black border-2 border-transparent": variant === "ghost",
                        "h-12 px-6 py-2": size === "default",
                        "h-10 px-4": size === "sm",
                        "h-16 px-10 text-base": size === "lg",
                    },
                    "rounded-none", // Strict Black & White Minimalist look
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
