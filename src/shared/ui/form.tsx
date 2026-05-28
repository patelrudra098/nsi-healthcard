"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/shared/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const fieldState = getFieldState(fieldContext.name, formState)

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(
        // GROUP 6: FORM FOCUS - Color transitions for validation
        // Timing: 150ms (instant feedback)
        // Curve: cubic-bezier(0, 0, 0.2, 1)
        "transition-colors duration-150",
        "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
        
        // Error state using design tokens
        error && "text-[var(--destructive)]",
        
        // Accessibility
        "motion-reduce:transition-none",
        
        className
      )}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn(
        "text-sm text-[var(--muted-foreground)]",
        className
      )}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        // Base styles using design tokens
        "text-sm text-[var(--destructive)]",
        
        // GROUP 6: FORM FOCUS - Validation feedback with shake + color
        // Timing: 150ms (instant feedback)
        // Curve: cubic-bezier(0, 0, 0.2, 1)
        "transition-colors duration-150",
        "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
        
        // Shake animation for validation feedback (uses Tailwind utility)
        error && "animate-pulse",
        
        // Accessibility
        "motion-reduce:transition-none motion-reduce:animate-none",
        
        className
      )}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

// Enhanced form message with shake animation
const FormError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    /** Show shake animation for new errors */
    shake?: boolean
  }
>(({ className, children, shake = true, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const [isShaking, setIsShaking] = React.useState(false)
  
  // Trigger shake animation when error appears
  React.useEffect(() => {
    if (error && shake) {
      setIsShaking(true)
      const timer = setTimeout(() => setIsShaking(false), 150) // Match animation duration
      return () => clearTimeout(timer)
    }
  }, [error, shake])

  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        // Base styles using design tokens
        "text-sm text-[var(--destructive)]",
        
        // GROUP 6: FORM FOCUS - Color + shake for validation feedback
        "transition-colors duration-150",
        "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
        
        // Shake animation (custom utility)
        isShaking && "animate-shake",
        
        // Accessibility
        "motion-reduce:transition-none motion-reduce:animate-none",
        
        className
      )}
      {...props}
    >
      {body}
    </p>
  )
})
FormError.displayName = "FormError"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormError,
  FormField,
}