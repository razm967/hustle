"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MapPin, X, Loader2, Map, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Mapbox API configuration
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
if (!MAPBOX_ACCESS_TOKEN) {
  throw new Error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not defined in environment variables')
}
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

interface LocationSuggestion {
  id: string
  place_name: string
  place_name_en?: string
  place_name_he?: string
  center: [number, number] // [longitude, latitude]
  context?: Array<{
    id: string
    text: string
    text_en?: string
    text_he?: string
  }>
}

interface LocationInputProps {
  value: string
  onChange: (value: string, coordinates?: [number, number]) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export default function LocationInput({
  value,
  onChange,
  placeholder = "Enter location...",
  disabled = false,
  required = false,
  className
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null)
  const [originalLocation, setOriginalLocation] = useState<{ value: string; coordinates: [number, number] | null }>({ value: '', coordinates: null })
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize map
  const initializeMap = () => {
    if (!mapContainerRef.current) return

    // Clean up existing map
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    // Default to Israel center
    const defaultCenter: [number, number] = [34.7818, 32.0853] // Tel Aviv coordinates
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: selectedCoordinates || defaultCenter,
      zoom: selectedCoordinates ? 14 : 8,
      locale: {
        'NavigationControl.ResetBearing': 'Reset bearing to north',
        'NavigationControl.ZoomIn': 'Zoom in',
        'NavigationControl.ZoomOut': 'Zoom out'
      }
    })

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Fix Hebrew text direction after style loads
    mapRef.current.on('style.load', () => {
      if (mapRef.current) {
        // Try to set English labels for common layer types, ignore errors for missing layers
        const layersToUpdate = ['country-label', 'state-label', 'settlement-label', 'place-label', 'poi-label']
        layersToUpdate.forEach(layerId => {
          try {
            if (mapRef.current!.getLayer(layerId)) {
              mapRef.current!.setLayoutProperty(layerId, 'text-field', ['get', 'name_en'])
            }
          } catch (error) {
            // Ignore errors for missing layers
          }
        })
      }
    })

    // Add click handler for pin dropping
    mapRef.current.on('click', (e) => {
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat]
      
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove()
      }

      // Add new marker
      markerRef.current = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(coordinates)
        .addTo(mapRef.current!)

      // Reverse geocode to get location name
      reverseGeocode(coordinates)
      setSelectedCoordinates(coordinates)
    })

    // Add existing marker if coordinates are available
    if (selectedCoordinates) {
      markerRef.current = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(selectedCoordinates)
        .addTo(mapRef.current)
    }
  }

  // Reverse geocoding to get place name from coordinates
  const reverseGeocode = async (coordinates: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?` +
        new URLSearchParams({
          access_token: MAPBOX_ACCESS_TOKEN as string,
          language: 'he,en',
          types: 'place,locality,neighborhood,address,poi'
        })
      )

      if (!response.ok) throw new Error('Reverse geocoding failed')

      const data = await response.json()
      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        const displayName = feature.place_name_he || feature.place_name
        onChange(displayName, coordinates)
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      onChange(`${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`, coordinates)
    }
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
      // Use Mapbox Geocoding API with support for Hebrew and English
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        new URLSearchParams({
          access_token: MAPBOX_ACCESS_TOKEN as string,
          country: 'il', // Focus on Israel for Hebrew support
          language: 'he,en', // Support both Hebrew and English
          types: 'place,locality,neighborhood,address,poi', // Various location types
          limit: '8', // Limit suggestions
          autocomplete: 'true'
        })
      )

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const data = await response.json()
      const locationSuggestions: LocationSuggestion[] = data.features.map((feature: any) => ({
        id: feature.id,
        place_name: feature.place_name,
        place_name_en: feature.place_name_en,
        place_name_he: feature.place_name_he,
        center: feature.center,
        context: feature.context
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
    // Use Hebrew name if available, otherwise use the main place name
    const displayName = suggestion.place_name_he || suggestion.place_name
    onChange(displayName, suggestion.center)
    setSelectedCoordinates(suggestion.center)
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()

    // Update map if it's open
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: suggestion.center,
        zoom: 14
      })

      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove()
      }

      // Add new marker
      markerRef.current = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(suggestion.center)
        .addTo(mapRef.current)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Clear input
  const handleClear = () => {
    onChange('')
    setSelectedCoordinates(null)
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()

    // Remove marker from map
    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
  }

  // Toggle map visibility
  const toggleMap = () => {
    setShowMap(!showMap)
    if (!showMap) {
      // Store original location when opening map
      setOriginalLocation({ value, coordinates: selectedCoordinates })
      // Initialize map when opening
      setTimeout(initializeMap, 100)
    }
  }

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
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Location {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={cn("pr-24", className)}
            dir="auto" // Auto-detect text direction for Hebrew/English
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}

          {/* Map toggle button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-9 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
            onClick={toggleMap}
            title="Open map to drop pin"
          >
            <Map className="h-4 w-4" />
          </Button>
          
          {/* Clear button */}
          {value && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

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

        {/* Interactive Map */}
        {showMap && (
          <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click on map to drop pin
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={toggleMap}
                    className="h-7 px-3 text-xs"
                  >
                    Confirm
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Revert to original location and close map
                      onChange(originalLocation.value, originalLocation.coordinates || undefined)
                      setSelectedCoordinates(originalLocation.coordinates)
                      setShowMap(false)
                    }}
                    className="h-6 w-6 p-0"
                    title="Cancel and revert to original location"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div
              ref={mapContainerRef}
              className="h-64 w-full"
              style={{ minHeight: '256px' }}
            />
          </div>
        )}
      </div>
      
      {/* Helper text - removed "Powered by Mapbox" */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Search in Hebrew or English • Click map icon to drop pin
      </p>
    </div>
  )
} 