"use client"

import { SiteHeader } from "~/components/site-header"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import { AppSidebar } from "~/components/app-sidebar"
import { trpc } from "~/trpc/client"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function GeolocationPage() {
  const { data, isLoading } = trpc.gmail.geolocationData.useQuery()

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Geolocation Tracking</h1>
            <p className="text-steel mb-4">View the origin locations of your scanned emails. Markers indicate the IP geolocation of the sender.</p>
            
            <Card className="rounded-lg border-hairline bg-canvas overflow-hidden">
              <CardHeader>
                <CardTitle>Global Threat Map</CardTitle>
                <CardDescription>Red markers indicate high threat scores, green markers indicate safe emails.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-[#eaf4f4] dark:bg-[#111112] w-full" style={{ height: "600px" }}>
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center text-steel">Loading map data...</div>
                  ) : (
                    <ComposableMap projectionConfig={{ scale: 140 }}>
                      <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                          geographies.map((geo) => (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill="var(--surface)"
                              stroke="var(--hairline-soft)"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: "none" },
                                hover: { fill: "var(--hairline)", outline: "none" },
                                pressed: { outline: "none" },
                              }}
                            />
                          ))
                        }
                      </Geographies>
                      
                      {data?.locations.map((loc, i) => (
                        <Marker key={i} coordinates={[loc.lng, loc.lat]}>
                          <circle r={4} fill={loc.score > 50 ? "var(--threat)" : "var(--mint)"} stroke="#fff" strokeWidth={1} />
                        </Marker>
                      ))}
                    </ComposableMap>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
