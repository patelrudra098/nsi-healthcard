import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  [
    // Layout and structure - horizontal side-by-side with gap
    "relative w-full",
    "flex items-start gap-4",
    "rounded-[var(--radius-lg)]",
    "border",
    "p-4",
    
    // GROUP 4: STATE TRANSITION - Background color fade
    // Timing: 150ms (visual state change)
    // Curve: cubic-bezier(0, 0, 0.2, 1)
    "transition-colors duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    
    // Accessibility
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--card)] text-[var(--card-foreground)]",
          "border-[var(--border)]",
        ],
        
        info: [
          "bg-[var(--info-soft)] text-[var(--info)]",
          "border-[var(--info)]/20",
        ],
        
        success: [
          "bg-[var(--success-soft)] text-[var(--success)]",
          "border-[var(--success)]/20",
        ],
        
        warning: [
          "bg-[var(--warning-soft)] text-[var(--warning)]",
          "border-[var(--warning)]/20",
        ],
        
        error: [
          "bg-[var(--error-soft)] text-[var(--destructive)]",
          "border-[var(--destructive)]/20",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, children, ...props }, ref) => {
    // Check if first child is an icon (svg)
    const childrenArray = React.Children.toArray(children)
    const hasIcon = childrenArray.some(
      (child) => React.isValidElement(child) && child.type === 'svg'
    )

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          // If it's an SVG icon, wrap it properly
          if (React.isValidElement(child) && child.type === 'svg') {
            return (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                {React.cloneElement(child as React.ReactElement<{ className?: string }>, {
                  className: cn(
                    "h-4 w-4",
                    (child as React.ReactElement<{ className?: string }>).props.className
                  ),
                })}
              </div>
            )
          }
          
          // If it's content wrapper and we have icon, add gap
          if (index === 1 && hasIcon) {
            return <div className="flex-1 space-y-1 pl-3">{child}</div>
          }
          
          // Otherwise render as is
          return child
        })}
      </div>
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "font-semibold text-sm leading-5 tracking-tight",
      className
    )}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm leading-5",
      "[&_p]:leading-5",
      "opacity-90",
      className
    )}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription, alertVariants }