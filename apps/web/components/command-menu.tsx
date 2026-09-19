"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  Mail,
  BarChart3,
  History,
  Globe2,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  ShieldCheck,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command"

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange]
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="MailForensix Command Menu"
      description="Quickly navigate and execute commands"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Dashboard</span>
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard/mailbox"))}
          >
            <Mail className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Mailbox & Forensic Inbox</span>
            <CommandShortcut>G M</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard/analytics"))}
          >
            <BarChart3 className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Analytics & Threat Metrics</span>
            <CommandShortcut>G A</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard/scans"))}
          >
            <History className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Past Scans Log</span>
            <CommandShortcut>G S</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard/geolocation"))}
          >
            <Globe2 className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Geolocation Tracking</span>
            <CommandShortcut>G G</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="System & Configuration">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard/help"))}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Documentation & Support</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          <CommandItem
            onSelect={() => runCommand(() => setTheme("light"))}
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>Light Mode</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setTheme("dark"))}
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark Mode</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
