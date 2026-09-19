"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"
import {
  ChevronsUpDown,
  User,
  Settings,
  Keyboard,
  Moon,
  Sun,
  LogOut,
  Shield,
} from "lucide-react"
import { trpc } from "~/trpc/client"
import { CommandMenu } from "~/components/command-menu"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [commandOpen, setCommandOpen] = useState(false)

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      router.push("/login")
    },
  })

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "MF"

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="h-12 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-border/40 hover:border-border/80 transition-colors rounded-lg px-2.5"
              >
                <Avatar className="h-8 w-8 rounded-md border border-border/50 shrink-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight ml-1 overflow-hidden">
                  <span className="truncate font-semibold text-foreground">{user.name}</span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground shrink-0" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-60 rounded-xl p-1.5 shadow-xl border border-border/80"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={8}
            >
              <DropdownMenuLabel className="p-1.5 font-normal">
                <div className="flex items-center gap-2.5 text-left text-xs">
                  <Avatar className="h-8 w-8 rounded-md border border-border/50">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-md bg-emerald-500/15 text-emerald-500 text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 leading-tight overflow-hidden">
                    <span className="truncate font-semibold text-foreground">{user.name}</span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="my-1" />
              
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/settings")}
                  className="text-xs cursor-pointer py-1.5"
                >
                  <User className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/settings")}
                  className="text-xs cursor-pointer py-1.5"
                >
                  <Settings className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-xs cursor-pointer py-1.5"
                >
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Moon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  Toggle Theme
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setCommandOpen(true)}
                  className="text-xs cursor-pointer py-1.5"
                >
                  <Keyboard className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  Keyboard Shortcuts
                  <span className="ml-auto text-[10px] text-muted-foreground font-mono">⌘K</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator className="my-1" />
              
              <DropdownMenuItem
                onClick={() => logout.mutate({})}
                disabled={logout.isPending}
                className="text-xs cursor-pointer py-1.5 text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                {logout.isPending ? "Signing out..." : "Sign Out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}
