import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface InputWithIconProps extends React.ComponentProps<"input"> {
  icon: React.ReactNode;
}

/**
 * InputWithIcon
 * Wrapper around standard Input to display a leading icon.
 * Used globally for forms where visual cues are needed inside inputs.
 */
export const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <div className="absolute left-4 text-muted-foreground flex items-center justify-center pointer-events-none">
          {icon}
        </div>
        <Input
          ref={ref}
          className={cn("pl-11 rounded-full h-12 bg-input-background", className)}
          {...props}
        />
      </div>
    );
  }
);
InputWithIcon.displayName = "InputWithIcon";
