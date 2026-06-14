"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-6" />
        ),
        info: (
          <InfoIcon className="size-6" />
        ),
        warning: (
          <TriangleAlertIcon className="size-6" />
        ),
        error: (
          <OctagonXIcon className="size-6" />
        ),
        loading: (
          <Loader2Icon className="size-6 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast group-[.toaster]:text-lg group-[.toaster]:p-6 group-[.toaster]:min-w-[280px] sm:group-[.toaster]:min-w-[400px] md:group-[.toaster]:min-w-[450px]",
          title: "group-[.toast]:text-lg group-[.toast]:font-semibold",
          description: "group-[.toast]:text-base group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-base",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:text-base",
          closeButton: "group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
