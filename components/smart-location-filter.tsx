"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { MapPin, X, Loader2, Map, Navigation, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Job } from "@/lib/database-types"

// Mapbox API configuration
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoicmF6bTk2NyIsImEiOiJjbWM2MzA0ZXQwazloMmtzY3Ryd3IydnZuIn0.s1VVHgIDU4h-DUn51rEVvA"
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

interface LocationSuggestion {
  id: string
  place_name: string
  place_name_en?: string
  place_name_he?: string
  center: [number, number]
}

interface SmartLocationFilterProps {
  value?: string
  userLocation?: { name: string; coordinates: [number, number] }
  maxDistance?: number
  jobs?: Job[]
  onChange: (location?: string) => void
  onUserLocationChange: (userLocation?: { name: string; coordinates: [number, number] }) => void
  onDistanceChange: (distance?: number) => void
  disabled?: boolean
}

export default function SmartLocationFilter({
  value,
  userLocation,
  maxDistance = 10,
  jobs = [],
  onChange,
  onUserLocationChange,
  onDistanceChange,
  disabled = false
}: SmartLocationFilterProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [localDistance, setLocalDistance] = useState([maxDistance])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const radiusSourceRef = useRef<string | null>(null)
  const jobMarkersRef = useRef<mapboxgl.Marker[]>([])
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize map
  const initializeMap = () => {
    if (!mapContainerRef.current) return

    // Clean up existing map
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    // Default to Israel center or user location
    const defaultCenter: [number, number] = userLocation?.coordinates || [34.7818, 32.0853]
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter,
      zoom: 10
    })

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Fix Hebrew text direction after style loads
    mapRef.current.on('style.load', () => {
      updateMapDisplay()
    })

    // Add click handler for setting user location
    mapRef.current.on('click', (e) => {
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat]
      reverseGeocode(coordinates)
    })
  }

  // Update map display with user location, radius, and job pins
  const updateMapDisplay = () => {
    if (!mapRef.current || !userLocation) return

    // Add/update user location marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
    }
    
    userMarkerRef.current = new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat(userLocation.coordinates)
      .addTo(mapRef.current)

    // Add radius circle
    addRadiusCircle(userLocation.coordinates, localDistance[0])
    
    // Add job pins
    addJobPins()

    // Fit map to show radius
    const bounds = new mapboxgl.LngLatBounds()
    const radiusInDegrees = (localDistance[0] * 1000) / 111320 // Rough conversion
    bounds.extend([
      userLocation.coordinates[0] - radiusInDegrees,
      userLocation.coordinates[1] - radiusInDegrees
    ])
    bounds.extend([
      userLocation.coordinates[0] + radiusInDegrees,
      userLocation.coordinates[1] + radiusInDegrees
    ])
    
    mapRef.current.fitBounds(bounds, { padding: 50 })
  }

  // Add radius circle to map
  const addRadiusCircle = (center: [number, number], radiusKm: number) => {
    if (!mapRef.current) return

    // Remove existing radius source and layer
    if (radiusSourceRef.current) {
      try {
        if (mapRef.current.getLayer('radius-fill')) {
          mapRef.current.removeLayer('radius-fill')
        }
        if (mapRef.current.getLayer('radius-line')) {
          mapRef.current.removeLayer('radius-line')
        }
        if (mapRef.current.getSource(radiusSourceRef.current)) {
          mapRef.current.removeSource(radiusSourceRef.current)
        }
      } catch (error) {
        // Ignore errors if layers don't exist
      }
    }

    // Create circle polygon
    const radiusInMeters = radiusKm * 1000
    const points = 64
    const coords = []
    
    for (let i = 0; i < points; i++) {
      const angle = (i * 360) / points
      const lat = center[1] + (radiusInMeters / 111320) * Math.cos(angle * Math.PI / 180)
      const lng = center[0] + (radiusInMeters / (111320 * Math.cos(center[1] * Math.PI / 180))) * Math.sin(angle * Math.PI / 180)
      coords.push([lng, lat])
    }
    coords.push(coords[0]) // Close the polygon

    const sourceId = `radius-${Date.now()}`
    radiusSourceRef.current = sourceId

    mapRef.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        }
      }
    })

    // Add fill layer
    mapRef.current.addLayer({
      id: 'radius-fill',
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.1
      }
    })

    // Add border layer
    mapRef.current.addLayer({
      id: 'radius-line',
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-opacity': 0.8
      }
    })
  }

  // Add job pins to map
  const addJobPins = () => {
    if (!mapRef.current) return

    // Remove existing job markers
    jobMarkersRef.current.forEach(marker => marker.remove())
    jobMarkersRef.current = []

    // Add markers for jobs with coordinates
    jobs.forEach(job => {
      if (job.latitude && job.longitude) {
        const isInRadius = userLocation ? 
          calculateDistance(userLocation.coordinates, [job.longitude, job.latitude]) <= localDistance[0] : 
          true

        const marker = new mapboxgl.Marker({ 
          color: isInRadius ? '#10b981' : '#ef4444',
          scale: 0.8
        })
          .setLngLat([job.longitude, job.latitude])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${job.title}</h3>
              <p class="text-xs text-gray-600">${job.location || 'Location not specified'}</p>
              <p class="text-xs font-medium text-green-600">${job.pay}</p>
            </div>
          `))
          .addTo(mapRef.current!)

        jobMarkersRef.current.push(marker)
      }
    })
  }

  // Calculate distance between two coordinates in km
  const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Reverse geocoding to get place name from coordinates
  const reverseGeocode = async (coordinates: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?` +
        new URLSearchParams({
          access_token: MAPBOX_ACCESS_TOKEN,
          language: 'he,en',
          types: 'place,locality,neighborhood,address,poi'
        })
      )

      if (!response.ok) throw new Error('Reverse geocoding failed')

      const data = await response.json()
      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        const displayName = feature.place_name_he || feature.place_name
        onUserLocationChange({ name: displayName, coordinates })
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      onUserLocationChange({ 
        name: `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`, 
        coordinates 
      })
    }
  }

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates: [number, number] = [position.coords.longitude, position.coords.latitude]
        reverseGeocode(coordinates)
        setIsLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to retrieve your location. Please allow location access or enter manually.')
        setIsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }

  // Debounced search function
  const searchLocation = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        new URLSearchParams({
          access_token: MAPBOX_ACCESS_TOKEN,
          country: 'il',
          language: 'he,en',
          types: 'place,locality,neighborhood,address,poi',
          limit: '8',
          autocomplete: 'true'
        })
      )

      if (!response.ok) throw new Error('Failed to fetch suggestions')

      const data = await response.json()
      const locationSuggestions: LocationSuggestion[] = data.features.map((feature: any) => ({
        id: feature.id,
        place_name: feature.place_name,
        place_name_en: feature.place_name_en,
        place_name_he: feature.place_name_he,
        center: feature.center
      }))

      setSuggestions(locationSuggestions)
      setShowSuggestions(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Error fetching location suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      searchLocation(newValue)
    }, 300)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    const displayName = suggestion.place_name_he || suggestion.place_name
    onChange(displayName)
    onUserLocationChange({ name: displayName, coordinates: suggestion.center })
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  // Handle distance change
  const handleDistanceChange = (newDistance: number[]) => {
    setLocalDistance(newDistance)
    onDistanceChange(newDistance[0])
  }

  // Toggle map visibility
  const toggleMap = () => {
    setShowMap(!showMap)
    if (!showMap) {
      setTimeout(initializeMap, 100)
    }
  }

  // Update map when user location or distance changes
  useEffect(() => {
    if (mapRef.current && userLocation) {
      updateMapDisplay()
    }
  }, [userLocation, localDistance, jobs])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Location Search */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location Search
        </Label>
        
        <div className="relative">
          <Input
            ref={inputRef}
            value={value || ""}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            placeholder="Search for a location..."
            disabled={disabled}
            className="pr-20"
            dir="auto"
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}

          {/* Clear button */}
          {value && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => onChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
            >
              {suggestions.map((suggestion, index) => {
                const displayName = suggestion.place_name_he || suggestion.place_name
                const secondaryName = suggestion.place_name_he ? suggestion.place_name_en : undefined
                
                return (
                  <button
                    key={suggestion.id}
                    type="button"
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0",
                      selectedIndex === index && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate" dir="auto">
                          {displayName}
                        </div>
                        {secondaryName && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate" dir="auto">
                            {secondaryName}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Distance from Me Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Distance from Me
          </Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={disabled || isLoading}
              className="text-xs"
            >
              <Navigation className="h-3 w-3 mr-1" />
              Use My Location
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleMap}
              disabled={disabled}
              className="text-xs"
            >
              <Map className="h-3 w-3 mr-1" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          </div>
        </div>

        {userLocation && (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              📍 {userLocation.name}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Max Distance</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {localDistance[0]} km
                </span>
              </div>
              <Slider
                value={localDistance}
                onValueChange={handleDistanceChange}
                max={50}
                min={1}
                step={1}
                className="w-full"
                disabled={disabled}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Map */}
        {showMap && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click map to set your location • Green pins: jobs within range • Red pins: jobs outside range
                  </span>
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={toggleMap}
                  className="h-7 px-3 text-xs"
                >
                  Confirm
                </Button>
              </div>
            </div>
            <div
              ref={mapContainerRef}
              className="h-80 w-full"
              style={{ minHeight: '320px' }}
            />
          </div>
        )}
      </div>
    </div>
  )
} 