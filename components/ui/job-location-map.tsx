"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation, ExternalLink } from "lucide-react"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Mapbox API configuration
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
if (!MAPBOX_ACCESS_TOKEN) {
  throw new Error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not defined in environment variables')
}
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

interface JobLocationMapProps {
  jobLocation: string
  jobLatitude?: number
  jobLongitude?: number
  className?: string
}

export default function JobLocationMap({
  jobLocation,
  jobLatitude,
  jobLongitude,
  className
}: JobLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  // Get user's current location for directions
  const getUserLocation = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.longitude, position.coords.latitude])
        },
        (error) => {
          reject(error)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    })
  }

  // Open Google Maps with directions
  const openDirections = async () => {
    try {
      let destinationQuery = jobLocation

      // If we have exact coordinates, use them for more accurate directions
      if (jobLatitude && jobLongitude) {
        destinationQuery = `${jobLatitude},${jobLongitude}`
      }

      // Try to get user's current location
      try {
        const userCoords = await getUserLocation()
        const userLocation = `${userCoords[1]},${userCoords[0]}` // lat,lng for Google Maps
        
        // Open Google Maps with turn-by-turn directions
        const directionsUrl = `https://www.google.com/maps/dir/${userLocation}/${encodeURIComponent(destinationQuery)}`
        window.open(directionsUrl, '_blank')
      } catch (locationError) {
        // If we can't get user location, just open the destination
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(destinationQuery)}`
        window.open(mapsUrl, '_blank')
      }
    } catch (error) {
      console.error('Error opening directions:', error)
      // Fallback to simple Google Maps search
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(jobLocation)}`
      window.open(mapsUrl, '_blank')
    }
  }

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || !jobLatitude || !jobLongitude) return

    // Clean up existing map
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    // Create new map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [jobLongitude, jobLatitude],
      zoom: 14
    })

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add marker for job location
    markerRef.current = new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([jobLongitude, jobLatitude])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">Job Location</h3>
          <p class="text-xs text-gray-600">${jobLocation}</p>
        </div>
      `))
      .addTo(mapRef.current)

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [jobLatitude, jobLongitude, jobLocation])

  // Don't render if no coordinates
  if (!jobLatitude || !jobLongitude) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Job Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Location: {jobLocation}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Exact coordinates not available for map display
            </p>
            <Button 
              onClick={openDirections}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View in Google Maps
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Job Location
          </CardTitle>
          <Button 
            onClick={openDirections}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Get Directions
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            📍 {jobLocation}
          </p>
          
          {/* Map Container */}
          <div
            ref={mapContainerRef}
            className="h-96 w-full rounded-lg border border-gray-200 dark:border-gray-700"
            style={{ minHeight: '384px' }}
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={openDirections}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Google Maps
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 