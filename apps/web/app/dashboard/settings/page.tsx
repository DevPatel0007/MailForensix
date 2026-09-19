"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Badge } from "~/components/ui/badge"
import { Switch } from "~/components/ui/switch"
import { Separator } from "~/components/ui/separator"
import { trpc } from "~/trpc/client"
import {
  User,
  Shield,
  Palette,
  Bell,
  Lock,
  Link as LinkIcon,
  CheckCircle2,
  Mail,
  Moon,
  Sun,
  Laptop,
} from "lucide-react"

type SettingsTab = "profile" | "account" | "security" | "appearance" | "notifications" | "integrations"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile")
  const { theme, setTheme } = useTheme()

  const { data: user } = trpc.auth.me.useQuery()
  const connection = trpc.gmail.connection.useQuery()
  const disconnect = trpc.gmail.disconnect.useMutation({
    onSuccess: () => {
      void connection.refetch()
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border/50 pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Settings & Preferences
          </h1>
          <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
            Configuration
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your analyst credentials, detection parameters, platform appearance, and connected mailboxes.
        </p>
      </div>

      {/* Main Grid: Left Sub-navigation + Right Content */}
      <div className="grid gap-6 md:grid-cols-12 items-start">
        {/* Left Sub-nav */}
        <div className="md:col-span-3 space-y-1">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === "profile"
                  ? "bg-emerald-500/10 text-foreground border border-emerald-500/20 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <User className="size-4" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === "account"
                  ? "bg-emerald-500/10 text-foreground border border-emerald-500/20 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Lock className="size-4" />
              <span>Account & Password</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === "security"
                  ? "bg-emerald-500/10 text-foreground border border-emerald-500/20 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Shield className="size-4" />
              <span>Security & Policies</span>
            </button>

            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === "appearance"
                  ? "bg-emerald-500/10 text-foreground border border-emerald-500/20 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Palette className="size-4" />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === "notifications"
                  ? "bg-emerald-500/10 text-foreground border border-emerald-500/20 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Bell className="size-4" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab("integrations")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === "integrations"
                  ? "bg-emerald-500/10 text-foreground border border-emerald-500/20 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <LinkIcon className="size-4" />
              <span>Integrations & Mailbox</span>
            </button>
          </nav>
        </div>

        {/* Right Settings Cards */}
        <div className="md:col-span-9 space-y-4">
          {/* PROFILE */}
          {activeTab === "profile" && (
            <Card className="border border-border/60 bg-card">
              <CardHeader className="p-4 pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">Analyst Profile</CardTitle>
                <CardDescription className="text-xs">
                  Your identity across security reports and scan logs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullname" className="text-xs">Full Name</Label>
                    <Input id="fullname" defaultValue={user?.fullName || "Forensic Analyst"} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Email Address</Label>
                    <Input id="email" defaultValue={user?.email || "analyst@mailforensix.internal"} disabled className="h-8 text-xs bg-muted/40 font-mono" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="org" className="text-xs">SOC Organization</Label>
                  <Input id="org" defaultValue="MailForensix Cyber Intelligence" className="h-8 text-xs" />
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t border-border/50 flex justify-end">
                <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-zinc-950 font-semibold">
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* APPEARANCE */}
          {activeTab === "appearance" && (
            <Card className="border border-border/60 bg-card">
              <CardHeader className="p-4 pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">Appearance & Interface</CardTitle>
                <CardDescription className="text-xs">
                  Choose your theme preference and interface contrast
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                      theme === "light"
                        ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Sun className="size-6 mb-2" />
                    <span className="text-xs font-semibold">Light</span>
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                      theme === "dark"
                        ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Moon className="size-6 mb-2" />
                    <span className="text-xs font-semibold">Dark (SOC Mode)</span>
                  </button>

                  <button
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                      theme === "system"
                        ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Laptop className="size-6 mb-2" />
                    <span className="text-xs font-semibold">System</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* INTEGRATIONS */}
          {activeTab === "integrations" && (
            <Card className="border border-border/60 bg-card">
              <CardHeader className="p-4 pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">Mailbox Connections</CardTitle>
                <CardDescription className="text-xs">
                  Connected Gmail credentials used for live ingestion and forensic evaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <Mail className="size-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">Google Workspace / Gmail</span>
                        {connection.data?.connected && (
                          <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 border-emerald-500/30">
                            Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {connection.data?.connected
                          ? connection.data.email
                          : "No Google account linked"}
                      </p>
                    </div>
                  </div>

                  {connection.data?.connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnect.mutate()}
                      disabled={disconnect.isPending}
                      className="h-8 text-xs text-red-500 hover:text-red-600 border-red-500/30"
                    >
                      {disconnect.isPending ? "Disconnecting..." : "Disconnect"}
                    </Button>
                  ) : (
                    <Button asChild size="sm" className="h-8 text-xs bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950 font-semibold">
                      <a href="/dashboard/mailbox">Connect</a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ACCOUNT, SECURITY, NOTIFICATIONS default views */}
          {(activeTab === "account" || activeTab === "security" || activeTab === "notifications") && (
            <Card className="border border-border/60 bg-card">
              <CardHeader className="p-4 pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold capitalize">{activeTab} Parameters</CardTitle>
                <CardDescription className="text-xs">
                  Enterprise security policies, threat notification thresholds, and active tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded border border-border/60 bg-muted/20">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground">Automated Incident Alerting</span>
                    <p className="text-[11px] text-muted-foreground">
                      Dispatch immediate webhooks when risk scores exceed threshold of 75.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 rounded border border-border/60 bg-muted/20">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground">Deep Attachment Sandboxing</span>
                    <p className="text-[11px] text-muted-foreground">
                      Calculate SHA-256 hashes and cross-reference VirusTotal threat feeds.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
