"use client"

import * as React from "react"
import { trpc } from "~/trpc/client"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import {
  Globe2,
  AlertTriangle,
  ShieldCheck,
  Server,
  Info,
  MapPin,
  ExternalLink,
  Activity,
  Layers,
} from "lucide-react"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function GeolocationPage() {
  const { data, isLoading } = trpc.gmail.geolocationData.useQuery()
  const locations = data?.locations || []

  const [selectedLoc, setSelectedLoc] = React.useState<any | null>(null)

  // Auto-select first location if available
  React.useEffect(() => {
    if (!selectedLoc && locations.length > 0) {
      setSelectedLoc(locations[0])
    }
  }, [locations, selectedLoc])

  const safeLocations = locations.filter((l) => l.score <= 50)
  const threatLocations = locations.filter((l) => l.score > 50)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border/50 pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Sender Geolocation Intelligence
          </h1>
          <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
            Hop Telemetry
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Origin coordinates and routing infrastructure identified from scanned email hop headers.
        </p>
      </div>

      {/* Disclaimers & Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 flex items-start gap-3 text-xs">
          <Info className="size-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-foreground">Approximate Telemetry</span>
            <p className="text-[11px] text-muted-foreground">
              IP geolocation resolves network routing prefixes. Locations indicate regional ISP points of presence.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span className="text-muted-foreground">Verified Clean Origins</span>
          </div>
          <span className="font-mono text-base font-bold text-foreground">{safeLocations.length}</span>
        </div>

        <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-500/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-500" />
            <span className="text-muted-foreground">Suspicious Endpoints</span>
          </div>
          <span className="font-mono text-base font-bold text-foreground">{threatLocations.length}</span>
        </div>
      </div>

      {/* Map & Information Panel Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* World Map Container */}
        <Card className="lg:col-span-8 border border-border/60 bg-card overflow-hidden">
          <CardHeader className="p-4 pb-2 border-b border-border/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Global Threat Matrix</CardTitle>
              <CardDescription className="text-xs">
                Click any sender marker to inspect origin network forensics
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-foreground">
                <span className="size-2 rounded-full bg-emerald-500" /> Safe Hop
              </span>
              <span className="flex items-center gap-1 text-foreground">
                <span className="size-2 rounded-full bg-red-500" /> Malicious Flag
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-muted/10">
            <div className="w-full relative" style={{ height: "540px" }}>
              {isLoading ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Synchronizing global atlas routing data...
                </div>
              ) : (
                <ComposableMap
                  projectionConfig={{ scale: 145 }}
                  className="w-full h-full"
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="var(--surface)"
                          stroke="var(--hairline)"
                          strokeWidth={0.6}
                          style={{
                            default: { outline: "none" },
                            hover: { fill: "var(--hairline)", outline: "none", cursor: "pointer" },
                            pressed: { outline: "none" },
                          } as any}
                        />
                      ))
                    }
                  </Geographies>

                  {locations.map((loc, i) => {
                    const isThreat = loc.score > 50
                    const isSelected = selectedLoc?.ip === loc.ip

                    return (
                      <Marker
                        key={i}
                        coordinates={[loc.lng, loc.lat]}
                        onClick={() => setSelectedLoc(loc)}
                        className="cursor-pointer"
                      >
                        <circle
                          r={isSelected ? 6 : 4}
                          fill={isThreat ? "#ef4444" : "#00d4a4"}
                          stroke={isSelected ? "#ffffff" : "transparent"}
                          strokeWidth={isSelected ? 2 : 0}
                          className="transition-all duration-150"
                        />
                      </Marker>
                    )
                  })}
                </ComposableMap>
              )}
            </div>
          </CardContent>
        </Card>

        {/* IP Intelligence Inspector Panel */}
        <Card className="lg:col-span-4 border border-border/60 bg-card sticky top-20">
          <CardHeader className="p-4 pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Server className="size-4 text-emerald-500" />
              <span>Origin Host Intelligence</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Selected hop telemetry & network attributes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {selectedLoc ? (
              <div className="space-y-4">
                {/* IP & Verdict Pill */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-muted/20">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground">Target IP Address</span>
                    <p className="font-mono text-sm font-bold text-foreground">{selectedLoc.ip}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono uppercase font-semibold ${
                      selectedLoc.score > 50
                        ? "bg-red-500/10 text-red-500 border-red-500/30"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {selectedLoc.score > 50 ? "High Risk" : "Verified Clean"}
                  </Badge>
                </div>

                {/* Geo Metrics Grid */}
                <div className="space-y-2.5 text-xs font-mono divide-y divide-border/40">
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground font-sans">Country / Jurisdiction:</span>
                    <span className="font-semibold text-foreground">{selectedLoc.country || "Global Routing"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground font-sans">Coordinates:</span>
                    <span className="text-foreground">
                      {selectedLoc.lat?.toFixed(2)}°, {selectedLoc.lng?.toFixed(2)}°
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground font-sans">Threat Score:</span>
                    <span className={`font-bold ${selectedLoc.score > 50 ? "text-red-500" : "text-emerald-500"}`}>
                      {selectedLoc.score} / 100
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground font-sans">Network Route:</span>
                    <span className="text-foreground font-sans text-[11px]">BGP Autonomous System</span>
                  </div>
                </div>

                {/* Sender Origin Guidance */}
                <div className="p-3 rounded-lg border border-border/60 bg-muted/10 text-xs text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Layers className="size-3.5 text-emerald-500" /> Layer 2 Verification
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    This IP corresponds to the sender transport MTA extracted during Layer 2 header forensics.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No location selected. Click a marker on the map to inspect host telemetry.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
