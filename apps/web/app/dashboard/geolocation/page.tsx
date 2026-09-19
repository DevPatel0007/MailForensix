"use client"

import * as React from "react"
import { trpc } from "~/trpc/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import WorldMap from "~/components/ui/world-map"
import { Activity, Crosshair, Globe2, Info, MapPin, Server } from "lucide-react"

type LocationRecord = {
  ip: string
  country: string | null
  countryCode: string | null
  region: string | null
  city: string | null
  lat: number
  lng: number
  accuracyRadiusKm: number | null
  providerConfidence: string | null
  score: number
  source: string
  status: string
}

function locationName(location: LocationRecord) {
  return [location.city, location.region, location.countryCode].filter(Boolean).join(", ") || "Unresolved network"
}

function sourceLabel(source: string) {
  return source === "ipgeolocation.io" ? "IPGeolocation.io" : source === "ipinfo-fallback" ? "IPinfo" : source
}

export default function GeolocationPage() {
  const { data, isLoading, isError } = trpc.gmail.geolocationData.useQuery()

  const locations = React.useMemo(() => (data?.locations ?? []) as LocationRecord[], [data])

  const [selectedLoc, setSelectedLoc] = React.useState<LocationRecord | null>(null)

  React.useEffect(() => {
    if (!selectedLoc || !locations.some((location) => location.ip === selectedLoc.ip)) {
      setSelectedLoc(locations[0] ?? null)
    }
  }, [locations, selectedLoc])

  const threatCount = locations.filter((location) => location.score > 50).length
  const providerCount = new Set(locations.map((location) => location.source)).size

  const mapPoint = (location: LocationRecord) => ({
    lat: location.lat,
    lng: location.lng,
    label: `${location.score > 50 ? "Flagged" : "Normal"} · ${locationName(location)} · ${location.ip}`,
    color: location.score > 50 ? "#ef4444" : "#00a982",
    flagged: location.score > 50,
    selected: selectedLoc?.ip === location.ip,
    onClick: () => setSelectedLoc(location),
  })

  const mapDots = React.useMemo(() => {
    return locations.map((location) => {
      const point = mapPoint(location)
      return {
        start: point,
        end: point,
      }
    })
  }, [locations, selectedLoc])

  return (
    <main className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-xl border border-border/70 bg-[#101417] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-9">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_45%,rgba(0,212,164,0.18),transparent_62%)]" aria-hidden="true" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#7cebcb]"><Crosshair className="size-4" aria-hidden="true" /><span>Infrastructure evidence</span></div>
            <div className="space-y-2">
              <h1 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Where the message touched the network</h1>
              <p className="max-w-xl text-sm leading-6 text-white/60">Real coordinates from scanned mail hops, shown as network telemetry. They describe the relay or ISP, not a sender&apos;s exact address.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-5 text-left lg:min-w-85 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <Stat value={locations.length} label="mapped hops" />
            <Stat value={providerCount} label="providers" />
            <Stat value={threatCount} label="flagged" danger={threatCount > 0} />
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3.5 text-xs"><Info className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" /><div><span className="font-semibold text-foreground">Approximate network telemetry</span><p className="mt-1 max-w-3xl text-[11px] leading-5 text-muted-foreground">Locations come from the provider response for the selected mail-hop IP. They are not GPS evidence.</p></div></div>
        <div className="flex min-h-14 items-center justify-between gap-6 rounded-lg border border-border/70 bg-card px-4 py-3 text-xs"><span className="flex items-center gap-2 text-muted-foreground"><Activity className="size-4 text-emerald-500" aria-hidden="true" />Data status</span><span className="font-mono font-semibold text-foreground">{locations.length ? "LIVE" : "EMPTY"}</span></div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.7fr)]">
        {/* World Map Container */}
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 px-5 py-5">
            <div>
              <CardTitle className="flex items-center gap-2 text-base"><Globe2 className="size-4 text-emerald-500" aria-hidden="true" />Network map</CardTitle>
              <CardDescription className="mt-1 text-xs">The route follows persisted latitude and longitude from each mail hop.</CardDescription>
            </div>

            <Badge variant="outline" className="shrink-0 gap-1.5 border-emerald-500/30 bg-emerald-500/5 text-[10px] text-emerald-600 dark:text-emerald-400"><span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />{isLoading ? "Fetching coordinates" : locations.length ? `${locations.length} mapped` : "Awaiting evidence"}</Badge>
          </CardHeader>
          <CardContent className="relative bg-[#050b0d] p-0 dark:bg-[#111817]">
            <div className="relative h-100 w-full sm:h-135">
              <WorldMap dots={mapDots} lineColor="#00a982" />

              {isLoading || isError || !locations.length ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
                  <div className="rounded-lg border border-white/10 bg-[#101417]/90 px-4 py-3 text-sm text-white/70 shadow-lg backdrop-blur">
                    {isLoading ? "Fetching Layer 2 latitude and longitude..." : isError ? "Geolocation data could not be loaded." : "No Layer 2 coordinates are available yet."}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="absolute bottom-5 left-5 flex flex-wrap gap-3 rounded-lg border border-white/10 bg-[#101417]/90 px-3 py-2 text-[11px] text-white/70 shadow-sm backdrop-blur"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> normal</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-500" /> flagged</span></div>
          </CardContent>
        </Card>

        {/* IP Intelligence Inspector Panel */}
        <Card className="border-border/70 shadow-sm xl:sticky xl:top-20">
          <CardHeader className="border-b border-border/60 px-5 py-5">
            <CardTitle className="flex items-center gap-2 text-base"><Server className="size-4 text-emerald-500" aria-hidden="true" />Evidence inspector</CardTitle>
            <CardDescription className="text-xs">The network record behind the selected marker.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-5 py-5">
            {selectedLoc ? (
              <div className="space-y-4">
                <div className="border-l-2 border-emerald-500 bg-muted/30 px-4 py-3"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] text-muted-foreground">Selected network</p><p className="mt-1 text-lg font-semibold text-foreground">{locationName(selectedLoc)}</p></div><Badge className={selectedLoc.score > 50 ? "border-red-400/30 bg-red-400/10 text-red-600 dark:text-red-200" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-600 dark:text-emerald-200"}>{selectedLoc.score > 50 ? "Flagged" : "Normal"}</Badge></div><p className="mt-3 break-all font-mono text-xs text-emerald-600 dark:text-[#7cebcb]">{selectedLoc.ip}</p></div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  <Metric label="Country" value={[selectedLoc.country, selectedLoc.countryCode].filter(Boolean).join(" · ") || "Unknown"} />
                  <Metric label="Provider" value={sourceLabel(selectedLoc.source)} />
                  <Metric label="Latitude" value={selectedLoc.lat.toFixed(5)} mono />
                  <Metric label="Longitude" value={selectedLoc.lng.toFixed(5)} mono />
                  <Metric label="Radius" value={selectedLoc.accuracyRadiusKm ? `${selectedLoc.accuracyRadiusKm} km` : "Not supplied"} />
                  <Metric label="Confidence" value={selectedLoc.providerConfidence ?? "Not supplied"} />
                </div>
                <div className="flex gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" /><span>This is approximate network telemetry. It may identify a relay or ISP point of presence, not the sender&apos;s physical location.</span></div>
              </div>
            ) : (
              <div className="flex min-h-105 flex-col items-center justify-center px-5 text-center"><Activity className="mb-3 size-7 text-muted-foreground/50" aria-hidden="true" /><p className="text-sm font-medium">No location selected</p><p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">Only provider-backed coordinates are shown. Run a scan with a usable public mail-hop IP to populate this panel.</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4 border-t border-border/70 pt-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-base font-semibold tracking-tight">Location ledger</h2><p className="mt-1 text-xs text-muted-foreground">Select a record to inspect the exact coordinates used on the map.</p></div><span className="font-mono text-xs text-muted-foreground">{locations.length.toString().padStart(2, "0")} records</span></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {locations.map((location) => (
            <button key={`${location.ip}-ledger`} type="button" onClick={() => setSelectedLoc(location)} className={`flex min-h-18 items-center justify-between gap-4 rounded-lg border px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${selectedLoc?.ip === location.ip ? "border-emerald-500/50 bg-emerald-500/5" : "border-border/70 bg-card hover:bg-muted/40"}`}>
              <span className="min-w-0"><span className="flex items-center gap-2 truncate text-sm font-medium"><MapPin className="size-3.5 shrink-0 text-emerald-500" aria-hidden="true" />{locationName(location)}</span><span className="mt-1 block truncate font-mono text-[11px] text-muted-foreground">{location.ip}</span></span>
              <span className="shrink-0 text-right"><span className="block font-mono text-xs">{location.lat.toFixed(2)}, {location.lng.toFixed(2)}</span><span className="mt-1 block text-[10px] text-muted-foreground">{sourceLabel(location.source)}</span></span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

function Stat({ value, label, danger = false }: { value: number; label: string; danger?: boolean }) {
  return <div><div className={`text-2xl font-semibold tracking-tight ${danger ? "text-red-300" : "text-white"}`}>{value}</div><div className="mt-1 text-[11px] text-white/45">{label}</div></div>
}

function Metric({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><div className="text-[11px] text-muted-foreground">{label}</div><div className={`mt-1 truncate font-medium text-foreground ${mono ? "font-mono text-xs" : "text-sm"}`}>{value}</div></div>
}
