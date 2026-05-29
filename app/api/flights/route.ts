import { NextRequest, NextResponse } from "next/server"

// Interface for flight data
interface FlightInfo {
  origin: string
  originCode: string
  originCity: string
  destination: string
  destinationCode: string
  departureDate: string
  returnDate: string
  estimatedPrice: {
    min: number
    max: number
    currency: string
  }
  airlines: string[]
  bookingUrl: string
  provider: string
}

// Interface for location data
interface LocationData {
  city: string
  country: string
  countryCode: string
  airportCode: string
}

// Airport codes database (common cities)
const airportCodes: Record<string, { code: string; city: string; country: string }> = {
  // Colombia
  "bogota": { code: "BOG", city: "Bogotá", country: "Colombia" },
  "bogotá": { code: "BOG", city: "Bogotá", country: "Colombia" },
  "medellin": { code: "MDE", city: "Medellín", country: "Colombia" },
  "medellín": { code: "MDE", city: "Medellín", country: "Colombia" },
  "cali": { code: "CLO", city: "Cali", country: "Colombia" },
  "cartagena": { code: "CTG", city: "Cartagena", country: "Colombia" },
  "barranquilla": { code: "BAQ", city: "Barranquilla", country: "Colombia" },
  "barranquil​la": { code: "BAQ", city: "Barranquilla", country: "Colombia" },
  // México
  "mexico city": { code: "MEX", city: "Ciudad de México", country: "México" },
  "ciudad de mexico": { code: "MEX", city: "Ciudad de México", country: "México" },
  "ciudad de méxico": { code: "MEX", city: "Ciudad de México", country: "México" },
  "cdmx": { code: "MEX", city: "Ciudad de México", country: "México" },
  "guadalajara": { code: "GDL", city: "Guadalajara", country: "México" },
  "cancun": { code: "CUN", city: "Cancún", country: "México" },
  "cancún": { code: "CUN", city: "Cancún", country: "México" },
  "monterrey": { code: "MTY", city: "Monterrey", country: "México" },
  // España
  "madrid": { code: "MAD", city: "Madrid", country: "España" },
  "barcelona": { code: "BCN", city: "Barcelona", country: "España" },
  "valencia": { code: "VLC", city: "Valencia", country: "España" },
  "sevilla": { code: "SVQ", city: "Sevilla", country: "España" },
  // USA
  "new york": { code: "JFK", city: "New York", country: "USA" },
  "los angeles": { code: "LAX", city: "Los Angeles", country: "USA" },
  "miami": { code: "MIA", city: "Miami", country: "USA" },
  "chicago": { code: "ORD", city: "Chicago", country: "USA" },
  "houston": { code: "IAH", city: "Houston", country: "USA" },
  // Argentina
  "buenos aires": { code: "EZE", city: "Buenos Aires", country: "Argentina" },
  // Perú
  "lima": { code: "LIM", city: "Lima", country: "Perú" },
  "peru": { code: "LIM", city: "Lima", country: "Perú" },
  "cusco": { code: "CUZ", city: "Cusco", country: "Perú" },
  "cuzco": { code: "CUZ", city: "Cusco", country: "Perú" },
  "machu picchu": { code: "CUZ", city: "Machu Picchu", country: "Perú" },
  "machu pichu": { code: "CUZ", city: "Machu Picchu", country: "Perú" },
  // Chile
  "santiago": { code: "SCL", city: "Santiago", country: "Chile" },
  // Brasil
  "sao paulo": { code: "GRU", city: "São Paulo", country: "Brasil" },
  "rio de janeiro": { code: "GIG", city: "Rio de Janeiro", country: "Brasil" },
  // Bolivia
  "bolivia": { code: "LPB", city: "La Paz", country: "Bolivia" },
  "bolivia (la paz)": { code: "LPB", city: "La Paz", country: "Bolivia" },
  "la paz": { code: "LPB", city: "La Paz", country: "Bolivia" },
  // Destinos del sistema
  "kioto": { code: "KIX", city: "Kioto", country: "Japón" },
  "kyoto": { code: "KIX", city: "Kioto", country: "Japón" },
  "bali": { code: "DPS", city: "Bali", country: "Indonesia" },
  "estambul": { code: "IST", city: "Estambul", country: "Turquía" },
  "estambúl": { code: "IST", city: "Estambul", country: "Turquía" },
  "istanbul": { code: "IST", city: "Estambul", country: "Turquía" },
  "reikiavik": { code: "KEF", city: "Reikiavik", country: "Islandia" },
  "reykjavik": { code: "KEF", city: "Reikiavik", country: "Islandia" },
  "praga": { code: "PRG", city: "Praga", country: "República Checa" },
  "prague": { code: "PRG", city: "Praga", country: "República Checa" },
  "marrakech": { code: "RAK", city: "Marrakech", country: "Marruecos" },
  "queenstown": { code: "ZQN", city: "Queenstown", country: "Nueva Zelanda" },
  "ciudad del cabo": { code: "CPT", city: "Ciudad del Cabo", country: "Sudáfrica" },
  "cape town": { code: "CPT", city: "Ciudad del Cabo", country: "Sudáfrica" },
  "hanoi": { code: "HAN", city: "Hanói", country: "Vietnam" },
  "hanói": { code: "HAN", city: "Hanói", country: "Vietnam" },
  "lisboa": { code: "LIS", city: "Lisboa", country: "Portugal" },
  "lisbon": { code: "LIS", city: "Lisboa", country: "Portugal" },
  "dubai": { code: "DXB", city: "Dubái", country: "Emiratos Árabes" },
  "dubái": { code: "DXB", city: "Dubái", country: "Emiratos Árabes" },
  // Polinesia Francesa
  "bora bora": { code: "BOB", city: "Bora Bora", country: "Polinesia Francesa" },
  "tahiti": { code: "PPT", city: "Tahití", country: "Polinesia Francesa" },
  "tahití": { code: "PPT", city: "Tahití", country: "Polinesia Francesa" },
  "papeete": { code: "PPT", city: "Papeete", country: "Polinesia Francesa" },
  // Francia (como respaldo para Polinesia)
  "paris": { code: "CDG", city: "París", country: "Francia" },
  "parís": { code: "CDG", city: "París", country: "Francia" },
  "paris-cdg": { code: "CDG", city: "París", country: "Francia" },
  "orly": { code: "ORY", city: "París Orly", country: "Francia" },
  // Europa - Destinos faltantes
  "atenas": { code: "ATH", city: "Atenas", country: "Grecia" },
  "athens": { code: "ATH", city: "Atenas", country: "Grecia" },
  "creta": { code: "HER", city: "Creta", country: "Grecia" },
  "heraklion": { code: "HER", city: "Creta", country: "Grecia" },
  "santorini": { code: "JTR", city: "Santorini", country: "Grecia" },
  "budapest": { code: "BUD", city: "Budapest", country: "Hungría" },
  "estocolmo": { code: "ARN", city: "Estocolmo", country: "Suecia" },
  "stockholm": { code: "ARN", city: "Estocolmo", country: "Suecia" },
  "copenhague": { code: "CPH", city: "Copenhague", country: "Dinamarca" },
  "copenhagen": { code: "CPH", city: "Copenhague", country: "Dinamarca" },
  "amsterdam": { code: "AMS", city: "Ámsterdam", country: "Países Bajos" },
  "ámsterdam": { code: "AMS", city: "Ámsterdam", country: "Países Bajos" },
  "edimburgo": { code: "EDI", city: "Edimburgo", country: "Escocia" },
  "edinburgh": { code: "EDI", city: "Edimburgo", country: "Escocia" },
  "florencia": { code: "FLR", city: "Florencia", country: "Italia" },
  "florence": { code: "FLR", city: "Florencia", country: "Italia" },
  "venecia": { code: "VCE", city: "Venecia", country: "Italia" },
  "venice": { code: "VCE", city: "Venecia", country: "Italia" },
  "palermo": { code: "PMO", city: "Palermo", country: "Italia" },
  "sicilia": { code: "CTA", city: "Sicilia", country: "Italia" },
  "catania": { code: "CTA", city: "Sicilia", country: "Italia" },
  "croacia": { code: "ZAG", city: "Croacia", country: "Croacia" },
  "zagreb": { code: "ZAG", city: "Croacia", country: "Croacia" },
  "dubrovnik": { code: "DBV", city: "Dubrovnik", country: "Croacia" },
  "eslovenia": { code: "LJU", city: "Eslovenia", country: "Eslovenia" },
  "liubliana": { code: "LJU", city: "Eslovenia", country: "Eslovenia" },
  "marruecos": { code: "CMN", city: "Casablanca", country: "Marruecos" },
  "casablanca": { code: "CMN", city: "Casablanca", country: "Marruecos" },
  "suiza": { code: "ZRH", city: "Zúrich", country: "Suiza" },
  "zurich": { code: "ZRH", city: "Zúrich", country: "Suiza" },
  "zúrich": { code: "ZRH", city: "Zúrich", country: "Suiza" },
  "noruega": { code: "OSL", city: "Oslo", country: "Noruega" },
  "oslo": { code: "OSL", city: "Oslo", country: "Noruega" },
  "irlanda": { code: "DUB", city: "Dublín", country: "Irlanda" },
  "dublin": { code: "DUB", city: "Dublín", country: "Irlanda" },
  "dublín": { code: "DUB", city: "Dublín", country: "Irlanda" },
  "groenlandia": { code: "GOH", city: "Groenlandia", country: "Groenlandia" },
  "greenland": { code: "GOH", city: "Groenlandia", country: "Groenlandia" },
  "islandia (oeste)": { code: "KEF", city: "Islandia", country: "Islandia" },
  "islandia": { code: "KEF", city: "Reikiavik", country: "Islandia" },
  // Asia - Destinos faltantes
  "bangkok": { code: "BKK", city: "Bangkok", country: "Tailandia" },
  "tailandia": { code: "BKK", city: "Bangkok", country: "Tailandia" },
  "phuket": { code: "HKT", city: "Phuket", country: "Tailandia" },
  "camboya": { code: "PNH", city: "Phnom Penh", country: "Camboya" },
  "phnom penh": { code: "PNH", city: "Phnom Penh", country: "Camboya" },
  "myanmar": { code: "YGN", city: "Yangón", country: "Myanmar" },
  "bagan": { code: "NYU", city: "Bagan", country: "Myanmar" },
  "yangon": { code: "YGN", city: "Yangón", country: "Myanmar" },
  "corea del sur": { code: "ICN", city: "Seúl", country: "Corea del Sur" },
  "seúl": { code: "ICN", city: "Seúl", country: "Corea del Sur" },
  "seoul": { code: "ICN", city: "Seúl", country: "Corea del Sur" },
  "vietnam (ha long)": { code: "HAN", city: "Ha Long", country: "Vietnam" },
  "ha long": { code: "HAN", city: "Ha Long", country: "Vietnam" },
  "halong": { code: "HAN", city: "Ha Long", country: "Vietnam" },
  "maldivas": { code: "MLE", city: "Maldivas", country: "Maldivas" },
  "male": { code: "MLE", city: "Male", country: "Maldivas" },
  // América del Norte - Destinos faltantes
  "toronto": { code: "YYZ", city: "Toronto", country: "Canadá" },
  "montreal": { code: "YUL", city: "Montreal", country: "Canadá" },
  // América del Sur - Destinos faltantes
  "perú (arequipa)": { code: "AQP", city: "Arequipa", country: "Perú" },
  "arequipa": { code: "AQP", city: "Arequipa", country: "Perú" },
  "ecuador (galápagos)": { code: "GPS", city: "Galápagos", country: "Ecuador" },
  "galápagos": { code: "GPS", city: "Galápagos", country: "Ecuador" },
  "galapagos": { code: "GPS", city: "Galápagos", country: "Ecuador" },
  "venezuela (ángel)": { code: "CIW", city: "Ángel", country: "Venezuela" },
  "salto ángel": { code: "CIW", city: "Ángel", country: "Venezuela" },
  // Turquía
  "turquía (capadocia)": { code: "GNY", city: "Capadocia", country: "Turquía" },
  "capadocia": { code: "GNY", city: "Capadocia", country: "Turquía" },
  "cappadocia": { code: "GNY", city: "Capadocia", country: "Turquía" },
  // Fiji
  "fiji": { code: "NAN", city: "Fiji", country: "Fiji" },
  "nadi": { code: "NAN", city: "Nadi", country: "Fiji" },
  // Ucrania
  "kyiv": { code: "KBP", city: "Kyiv", country: "Ucrania" },
  "kiev": { code: "KBP", city: "Kyiv", country: "Ucrania" },
}

// Default origin when IP geolocation fails
const DEFAULT_ORIGIN = { code: "BOG", city: "Bogotá", country: "Colombia" }

// Get airport code from city name
function getAirportFromCity(cityName: string): { code: string; city: string; country: string } | null {
  const normalized = cityName.toLowerCase().trim()
  
  // Buscar exacto primero
  if (airportCodes[normalized]) {
    return airportCodes[normalized]
  }
  
  // Si no encuentra, intentar removiendo acentos
  const deaccented = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  if (airportCodes[deaccented]) {
    return airportCodes[deaccented]
  }
  
  // Buscar parcialmente removiendo acentos de ambos
  for (const [key, value] of Object.entries(airportCodes)) {
    const keyDeaccented = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (keyDeaccented === deaccented) {
      return value
    }
  }
  
  return null
}

// Get user location from IP
async function getUserLocationFromIP(ip: string): Promise<LocationData | null> {
  try {
    // Try ip-api.com (free, no API key required)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city`, {
      signal: AbortSignal.timeout(5000),
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.status !== "success") return null
    
    // Try to find airport code for the city
    const airport = getAirportFromCity(data.city)
    
    return {
      city: data.city,
      country: data.country,
      countryCode: data.countryCode,
      airportCode: airport?.code || DEFAULT_ORIGIN.code,
    }
  } catch (error) {
    console.error("[WanderIA] IP Geolocation error:", error)
    return null
  }
}

// Generate Skyscanner booking URL
function generateSkyscannerUrl(
  originCode: string,
  destinationCode: string,
  departureDate: string,
  returnDate?: string
): string {
  // Format dates as YYMMDD
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const yy = date.getFullYear().toString().slice(-2)
    const mm = (date.getMonth() + 1).toString().padStart(2, "0")
    const dd = date.getDate().toString().padStart(2, "0")
    return `${yy}${mm}${dd}`
  }

  const depDate = formatDate(departureDate)
  const retDate = returnDate ? formatDate(returnDate) : ""

  // Skyscanner referral link format
  // Note: mediaPartnerId would be your actual Skyscanner affiliate ID in production
  const baseUrl = "https://www.skyscanner.com/transport/flights"
  const route = retDate
    ? `${originCode.toLowerCase()}/${destinationCode.toLowerCase()}/${depDate}/${retDate}/`
    : `${originCode.toLowerCase()}/${destinationCode.toLowerCase()}/${depDate}/`

  return `${baseUrl}/${route}?adultsv2=1&cabinclass=economy&childrenv2=&ref=home&rtn=${retDate ? 1 : 0}&preferdirects=false&outboundaltsen498d=false&inboundaltsenabled=false`
}

// Estimate flight prices based on destination and origin
function estimateFlightPrice(originCode: string, destinationCode: string): { min: number; max: number } {
  // Simple distance-based estimation (rough approximation)
  const priceMatrix: Record<string, Record<string, { min: number; max: number }>> = {
    // From South America
    BOG: {
      KIX: { min: 1200, max: 2000 }, // Japan
      BCN: { min: 600, max: 1100 }, // Spain
      DPS: { min: 1400, max: 2200 }, // Bali
      IST: { min: 800, max: 1400 }, // Istanbul
      CUZ: { min: 200, max: 400 }, // Cusco
      KEF: { min: 900, max: 1500 }, // Iceland
      CTG: { min: 100, max: 200 }, // Cartagena
      PRG: { min: 700, max: 1200 }, // Prague
      RAK: { min: 600, max: 1000 }, // Marrakech
      ZQN: { min: 1800, max: 2800 }, // Queenstown
      CPT: { min: 1200, max: 1900 }, // Cape Town
      HAN: { min: 1300, max: 2100 }, // Hanoi
      LIS: { min: 550, max: 950 }, // Lisbon
      DXB: { min: 900, max: 1500 }, // Dubai
      EZE: { min: 400, max: 700 }, // Buenos Aires
    },
    // From Madrid
    MAD: {
      KIX: { min: 700, max: 1200 },
      BCN: { min: 50, max: 150 },
      DPS: { min: 800, max: 1400 },
      IST: { min: 150, max: 350 },
      CUZ: { min: 800, max: 1400 },
      KEF: { min: 200, max: 450 },
      CTG: { min: 600, max: 1000 },
      PRG: { min: 100, max: 250 },
      RAK: { min: 80, max: 180 },
      ZQN: { min: 1400, max: 2200 },
      CPT: { min: 500, max: 900 },
      HAN: { min: 600, max: 1100 },
      LIS: { min: 50, max: 150 },
      DXB: { min: 300, max: 550 },
      EZE: { min: 700, max: 1200 },
    },
    // From Mexico City
    MEX: {
      KIX: { min: 1100, max: 1800 },
      BCN: { min: 600, max: 1000 },
      DPS: { min: 1300, max: 2000 },
      IST: { min: 900, max: 1500 },
      CUZ: { min: 400, max: 700 },
      KEF: { min: 800, max: 1300 },
      CTG: { min: 350, max: 600 },
      PRG: { min: 700, max: 1200 },
      RAK: { min: 700, max: 1100 },
      ZQN: { min: 1600, max: 2500 },
      CPT: { min: 1300, max: 2000 },
      HAN: { min: 1200, max: 1900 },
      LIS: { min: 550, max: 950 },
      DXB: { min: 1000, max: 1600 },
      EZE: { min: 800, max: 1300 },
    },
  }

  // Default prices if no specific route found
  const defaultPrices = { min: 500, max: 1200 }

  const originPrices = priceMatrix[originCode]
  if (originPrices && originPrices[destinationCode]) {
    return originPrices[destinationCode]
  }

  return defaultPrices
}

// Get airlines for route
function getAirlinesForRoute(originCode: string, destinationCode: string): string[] {
  const airlinesByRegion: Record<string, string[]> = {
    // Latin America routes
    BOG: ["Avianca", "LATAM", "Copa Airlines", "JetSmart"],
    MEX: ["Aeroméxico", "Volaris", "VivaAerobus", "American Airlines"],
    // Europe routes
    MAD: ["Iberia", "Air Europa", "Vueling", "Ryanair"],
    BCN: ["Vueling", "Iberia", "Ryanair", "EasyJet"],
    // Asia routes
    KIX: ["Japan Airlines", "ANA", "Turkish Airlines", "Emirates"],
    DPS: ["Garuda Indonesia", "Singapore Airlines", "Qatar Airways"],
    // Default
    DEFAULT: ["American Airlines", "Delta", "United", "LATAM"],
  }

  const originAirlines = airlinesByRegion[originCode] || airlinesByRegion.DEFAULT
  const destAirlines = airlinesByRegion[destinationCode] || []

  // Combine and deduplicate
  const combined = [...new Set([...originAirlines, ...destAirlines])]
  return combined.slice(0, 4)
}

// GET /api/flights - Get flight information for a destination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const destination = searchParams.get("destination")
    const departureDate = searchParams.get("departureDate")
    const returnDate = searchParams.get("returnDate")

    if (!destination) {
      return NextResponse.json(
        { error: "Destino requerido" },
        { status: 400 }
      )
    }

    // Get client IP from headers
    const forwardedFor = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const clientIp = forwardedFor?.split(",")[0].trim() || realIp || ""

    // Get user location from IP
    let userLocation = await getUserLocationFromIP(clientIp)

    // Use default if IP lookup fails
    if (!userLocation) {
      userLocation = {
        city: DEFAULT_ORIGIN.city,
        country: DEFAULT_ORIGIN.country,
        countryCode: "CO",
        airportCode: DEFAULT_ORIGIN.code,
      }
    }

    // Get destination airport code
    const destAirport = getAirportFromCity(destination)
    if (!destAirport) {
      return NextResponse.json(
        { error: `No se encontró código de aeropuerto para: ${destination}` },
        { status: 404 }
      )
    }

    // Calculate default dates if not provided
    const today = new Date()
    const defaultDeparture = new Date(today)
    defaultDeparture.setDate(today.getDate() + 30) // 30 days from now

    const defaultReturn = new Date(defaultDeparture)
    defaultReturn.setDate(defaultDeparture.getDate() + 7) // 7 day trip

    const depDate = departureDate || defaultDeparture.toISOString().split("T")[0]
    const retDate = returnDate || defaultReturn.toISOString().split("T")[0]

    // Estimate prices
    const prices = estimateFlightPrice(userLocation.airportCode, destAirport.code)

    // Get airlines
    const airlines = getAirlinesForRoute(userLocation.airportCode, destAirport.code)

    // Generate booking URL
    const bookingUrl = generateSkyscannerUrl(
      userLocation.airportCode,
      destAirport.code,
      depDate,
      retDate
    )

    const flightInfo: FlightInfo = {
      origin: `${userLocation.city}, ${userLocation.country}`,
      originCode: userLocation.airportCode,
      originCity: userLocation.city,
      destination: `${destAirport.city}, ${destAirport.country}`,
      destinationCode: destAirport.code,
      departureDate: depDate,
      returnDate: retDate,
      estimatedPrice: {
        min: prices.min,
        max: prices.max,
        currency: "USD",
      },
      airlines,
      bookingUrl,
      provider: "Skyscanner",
    }

    return NextResponse.json({
      success: true,
      flight: flightInfo,
      userLocation: {
        detectedCity: userLocation.city,
        detectedCountry: userLocation.country,
        airportCode: userLocation.airportCode,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("[WanderIA] Flights API error:", message)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
