"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion"
import {
  Search,
  BookOpen,
  ShieldCheck,
  ScanLine,
  Globe2,
  Lock,
  Layers,
  HelpCircle,
  Activity,
  FileCode,
} from "lucide-react"

const categories = [
  {
    title: "Getting Started",
    icon: BookOpen,
    description: "Connect your first mailbox and explore the forensic investigation interface.",
  },
  {
    title: "Email Scanning Pipeline",
    icon: ScanLine,
    description: "Understand asynchronous Inngest layer execution from raw message to verdict.",
  },
  {
    title: "Cryptographic Authentication",
    icon: ShieldCheck,
    description: "How SPF IP validation, DKIM signature verification, and DMARC policies operate.",
  },
  {
    title: "Threat Scores & AI NLP",
    icon: Activity,
    description: "Interpretation of risk scores (0–100), BEC detection patterns, and tone markers.",
  },
  {
    title: "Sender Geolocation",
    icon: Globe2,
    description: "How hop tracing resolves IP networks and ISP autonomous system numbers (ASNs).",
  },
  {
    title: "Artifacts & VirusTotal",
    icon: FileCode,
    description: "Attachment SHA-256 hash checking and URL reputation telemetry.",
  },
]

const faqs = [
  {
    q: "How does MailForensix score email threats?",
    a: "MailForensix uses a 4-layer forensic engine. Layer 1 validates headers and authentication (SPF, DKIM, DMARC). Layer 2 evaluates sender IP reputation, domain age, WHOIS privacy, and MX records. Layer 3 evaluates linguistic sentiment, urgency, and BEC impersonation patterns. Layer 4 sandboxes URLs and attachment hashes.",
  },
  {
    q: "Is Gmail access read-only?",
    a: "Yes. MailForensix requests minimal read-only OAuth scopes strictly required to retrieve raw message headers, bodies, and attachment metadata for forensic analysis. No emails are deleted or modified.",
  },
  {
    q: "Why is geolocation marked as approximate?",
    a: "IP addresses route through internet service provider nodes and BGP routing prefixes. Geolocation markers indicate the regional data center or ISP point of presence rather than a physical individual GPS coordinate.",
  },
  {
    q: "Can I export forensic evidence reports?",
    a: "Yes. Every analyzed email features a 'Download JSON' button that packages full Layer 1–4 telemetry, extracted headers, hashes, and timestamps into a standardized forensic evidence file.",
  },
]

export default function HelpPage() {
  const [search, setSearch] = React.useState("")

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border/50 pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Documentation & Forensic Guide
          </h1>
          <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
            Knowledge Base
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Reference manuals on cryptographic email validation, deception techniques, and detection layers.
        </p>

        {/* Search Bar */}
        <div className="relative mt-2 max-w-xl">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search forensic guides, SPF/DKIM docs, FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-xs bg-muted/20 border-border/70"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => {
          const Icon = cat.icon
          return (
            <Card key={i} className="border border-border/60 bg-card hover:border-border/90 hover:shadow-xs transition-all duration-150">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Icon className="size-4" />
                  </div>
                  <CardTitle className="text-sm font-semibold">{cat.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQs Section */}
      <Card className="border border-border/60 bg-card">
        <CardHeader className="p-4 pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <HelpCircle className="size-4 text-emerald-500" />
            <span>Frequently Asked Forensic Questions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Accordion type="single" collapsible className="w-full text-xs">
            {filteredFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border/50">
                <AccordionTrigger className="text-xs font-semibold hover:text-emerald-500 py-3">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-3">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
