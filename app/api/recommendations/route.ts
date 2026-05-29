import { NextRequest, NextResponse } from "next/server"
import { verifyJWT, getDestinationsForRecommendations } from "@/lib/database"

interface TestAnswers {
  climate: string
  budget: string
  duration: string
  interests: string[]
  travelStyle: string
  continent: string
  activities: string[]
  food: string
  accommodation: string
  companion: string
  safety?: string
  language?: string
  season?: string
  nightlife?: string
  natureType?: string
  cultureType?: string
  adventureLevel?: string
  transport?: string
  connectivity?: string
  health?: string
  photography?: string
  crowdPreference?: string
  shopping?: string
  sustainability?: string
  waterActivities?: string
}

interface Weights {
  climate: number
  budget: number
  interests: number
  travelStyle: number
  continent: number
  activities: number
  food: number
  accommodation: number
  companion: number
  safety: number
  language: number
  season: number
  nightlife: number
  nature: number
  culture: number
  adventureLevel: number
  connectivity: number
  photography: number
  crowdPreference: number
  shopping: number
  sustainability: number
  waterActivities: number
}

interface Destination {
  name: string
  country: string
  description: string
  culture: string
  gastronomy: string
  climate: { spring: string; summer: string; autumn: string; winter: string; best_season: string }
  estimated_cost: { min: number; max: number; currency: string; budget_level: number }
  flights: { from: string; min_price: number; currency: string; airlines: string[] }
  tips: string[]
  image_query: string
  // Extended properties for matching
  tags: {
    climate: string[]
    safety: string
    language: string[]
    seasons: string[]
    nightlife: string
    nature: string[]
    culture: string[]
    adventure: string
    connectivity: string
    transport: string[]
  }
}

// Destinations are now loaded from database at runtime
// This variable is deprecated and kept only for reference
const DESTINATIONS_FROM_DB_INSTEAD = true

// Destinations are loaded from database - See POST handler below
const destinations: Destination[] = [
  // NOTE: This array is no longer used. Destinations are fetched from database via getDestinationsForRecommendations()
  // Legacy data structure preserved for reference only
  {
    name: "Kioto",
    country: "Japón",
    description: "Antigua capital imperial de Japón, Kioto alberga más de 2.000 templos, santuarios y jardines. Es el corazón cultural del país, donde las tradiciones milenarias conviven con la modernidad.",
    culture: "Un destino donde el cambio se mezcla con tradiciones culturales, maravillas y una rica gastronomía. La escena artística y la convivialidad en sus calles lo hacen único.",
    gastronomy: "Ramen, sushi artesanal, kaiseki (cocina tradicional multi-plato), matcha, tofu de Kioto y dulces wagashi.",
    climate: { spring: "15-20°C", summer: "25-35°C", autumn: "15-25°C", winter: "2-10°C", best_season: "Primavera (marzo-mayo) para los cerezos en flor" },
    estimated_cost: { min: 600, max: 1000, currency: "USD", budget_level: 3 },
    flights: { from: "Madrid/CDMX", min_price: 800, currency: "USD", airlines: ["ANA", "Japan Airlines", "KLM", "Turkish Airlines"] },
    tips: ["Comprar el Japan Rail Pass antes de llegar", "Visitar Fushimi Inari al amanecer para evitar multitudes", "Alquilar un kimono para pasear por Gion"],
    image_query: "kyoto japan cherry blossoms temple",
    tags: {
      climate: ["templado"],
      safety: "muy_seguro",
      language: ["ingles", "aprender"],
      seasons: ["primavera", "otono"],
      nightlife: "cenas",
      nature: ["bosques", "montanas"],
      culture: ["arquitectura", "religion", "tradiciones"],
      adventure: "relajado",
      connectivity: "esencial",
      transport: ["transporte", "caminando"],
    }
  },
  {
    name: "Barcelona",
    country: "España",
    description: "Ciudad cosmopolita bañada por el Mediterráneo. Su arquitectura modernista de Gaudí, playas urbanas, y vibrante vida nocturna la convierten en un destino completo para todo tipo de viajeros.",
    culture: "Mezcla única de cultura catalana y española, con una rica tradición artística que va desde Gaudí hasta Picasso. Las Ramblas, el Barrio Gótico y la Sagrada Familia son imperdibles.",
    gastronomy: "Tapas, paella, crema catalana, jamón ibérico, pa amb tomàquet y mariscos frescos del Mediterráneo.",
    climate: { spring: "15-22°C", summer: "25-32°C", autumn: "15-24°C", winter: "8-15°C", best_season: "Primavera y otoño para clima ideal" },
    estimated_cost: { min: 400, max: 800, currency: "USD", budget_level: 2 },
    flights: { from: "Bogotá/CDMX", min_price: 500, currency: "USD", airlines: ["Iberia", "Air Europa", "Avianca", "LATAM"] },
    tips: ["Reservar entradas a la Sagrada Familia con anticipación", "Usar el metro con tarjeta T-Casual para ahorrar", "Cenar después de las 21:00 como los locales"],
    image_query: "barcelona spain sagrada familia",
    tags: {
      climate: ["templado", "calido"],
      safety: "seguro",
      language: ["espanol", "ingles"],
      seasons: ["primavera", "verano", "otono"],
      nightlife: "fiestas",
      nature: ["playas"],
      culture: ["arquitectura", "arte"],
      adventure: "moderado",
      connectivity: "esencial",
      transport: ["transporte", "caminando"],
    }
  },
  {
    name: "Bali",
    country: "Indonesia",
    description: "La Isla de los Dioses ofrece una combinación perfecta de playas paradisíacas, templos hindúes milenarios, arrozales en terrazas y una espiritualidad que se siente en cada rincón.",
    culture: "Cultura hindú-balinesa única con ceremonias diarias, ofrendas florales y danzas tradicionales. Los templos como Tanah Lot y Uluwatu ofrecen experiencias espirituales al atardecer.",
    gastronomy: "Nasi goreng, satay, babi guling (cerdo asado), smoothie bowls tropicales y café Luwak.",
    climate: { spring: "27-30°C", summer: "26-29°C", autumn: "27-30°C", winter: "27-30°C", best_season: "Abril a octubre (temporada seca)" },
    estimated_cost: { min: 300, max: 600, currency: "USD", budget_level: 1 },
    flights: { from: "Madrid/CDMX", min_price: 700, currency: "USD", airlines: ["Qatar Airways", "Emirates", "Singapore Airlines", "Turkish Airlines"] },
    tips: ["Alquilar una moto para explorar libremente", "Visitar Ubud para la experiencia cultural completa", "Respetar las ceremonias locales en los templos"],
    image_query: "bali indonesia rice terraces temple",
    tags: {
      climate: ["tropical"],
      safety: "seguro",
      language: ["ingles", "aprender"],
      seasons: ["primavera", "verano", "otono", "invierno"],
      nightlife: "bares",
      nature: ["playas", "selva", "montanas"],
      culture: ["religion", "tradiciones"],
      adventure: "moderado",
      connectivity: "importante",
      transport: ["auto", "caminando"],
    }
  },
  {
    name: "Estambul",
    country: "Turquía",
    description: "La única ciudad del mundo que se extiende entre dos continentes. Estambul es un crisol de culturas donde Oriente y Occidente se encuentran en sus bazares, mezquitas y palacios.",
    culture: "Herencia bizantina y otomana fusionada con la modernidad turca. Santa Sofía, la Mezquita Azul y el Palacio Topkapi cuentan siglos de historia en cada piedra.",
    gastronomy: "Kebab, baklava, lahmacun, pide, çay (té turco), café turco y deliciosos mezes en los restaurantes junto al Bósforo.",
    climate: { spring: "12-20°C", summer: "22-30°C", autumn: "12-22°C", winter: "3-9°C", best_season: "Primavera y otoño para clima agradable" },
    estimated_cost: { min: 350, max: 700, currency: "USD", budget_level: 2 },
    flights: { from: "Bogotá/Madrid", min_price: 450, currency: "USD", airlines: ["Turkish Airlines", "Avianca", "Iberia", "Pegasus"] },
    tips: ["Regatear en el Gran Bazar es parte de la experiencia", "Tomar un ferry por el Bósforo al atardecer", "Probar un hammam turco tradicional"],
    image_query: "istanbul turkey blue mosque bosphorus",
    tags: {
      climate: ["templado", "calido"],
      safety: "seguro",
      language: ["ingles", "aprender"],
      seasons: ["primavera", "otono"],
      nightlife: "cenas",
      nature: [],
      culture: ["arquitectura", "religion", "tradiciones"],
      adventure: "moderado",
      connectivity: "esencial",
      transport: ["transporte", "caminando"],
    }
  },
  {
    name: "Cusco",
    country: "Perú",
    description: "Ombligo del mundo inca y puerta de entrada a Machu Picchu. Cusco combina ruinas incas con arquitectura colonial española en una ciudad vibrante a 3.400 metros de altitud.",
    culture: "Capital del antiguo Imperio Inca con una fusión cultural única entre tradiciones indígenas y coloniales. Cada piedra cuenta la historia de civilizaciones milenarias.",
    gastronomy: "Ceviche andino, lomo saltado, cuy, alpaca, chicha morada y la exquisita cocina novoandina reconocida mundialmente.",
    climate: { spring: "5-20°C", summer: "5-18°C", autumn: "3-20°C", winter: "0-19°C", best_season: "Mayo a septiembre (temporada seca)" },
    estimated_cost: { min: 250, max: 500, currency: "USD", budget_level: 1 },
    flights: { from: "Bogotá/CDMX", min_price: 300, currency: "USD", airlines: ["LATAM", "Avianca", "JetSMART", "Viva Air"] },
    tips: ["Aclimatarse a la altitud los primeros dos días", "Reservar el ingreso a Machu Picchu con meses de anticipación", "Tomar mate de coca para el soroche"],
    image_query: "cusco peru machu picchu andes",
    tags: {
      climate: ["templado", "frio"],
      safety: "seguro",
      language: ["espanol"],
      seasons: ["primavera", "verano", "otono"],
      nightlife: "bares",
      nature: ["montanas"],
      culture: ["arquitectura", "tradiciones", "religion"],
      adventure: "activo",
      connectivity: "importante",
      transport: ["tours", "caminando"],
    }
  },
  {
    name: "Reikiavik",
    country: "Islandia",
    description: "Capital más septentrional del mundo. Islandia ofrece paisajes de otro planeta: glaciares, géiseres, volcanes, auroras boreales y aguas termales naturales en una naturaleza indómita.",
    culture: "Cultura vikinga con una sociedad moderna e igualitaria. Rica tradición literaria con las sagas islandesas y una escena musical única que dio al mundo a Björk y Sigur Rós.",
    gastronomy: "Cordero islandés, skyr, pescado fresco del Atlántico Norte, pan de centeno cocido geotérmicamente y hot dogs islandeses.",
    climate: { spring: "0-8°C", summer: "8-15°C", autumn: "0-8°C", winter: "-5-2°C", best_season: "Junio-agosto para sol de medianoche, sept-marzo para auroras boreales" },
    estimated_cost: { min: 800, max: 1500, currency: "USD", budget_level: 4 },
    flights: { from: "Madrid/NYC", min_price: 400, currency: "USD", airlines: ["Icelandair", "PLAY", "Iberia", "Transavia"] },
    tips: ["Alquilar un coche para recorrer la Ring Road", "Reservar la Blue Lagoon con anticipación", "Llevar ropa impermeable y de abrigo en capas"],
    image_query: "iceland reykjavik northern lights glacier",
    tags: {
      climate: ["frio"],
      safety: "muy_seguro",
      language: ["ingles"],
      seasons: ["verano", "invierno"],
      nightlife: "tranquila",
      nature: ["montanas", "desiertos"],
      culture: ["tradiciones", "literatura"],
      adventure: "activo",
      connectivity: "importante",
      transport: ["auto"],
    }
  },
  {
    name: "Cartagena",
    country: "Colombia",
    description: "Ciudad amurallada del Caribe colombiano declarada Patrimonio de la Humanidad. Sus calles coloniales coloridas, playas de arena blanca y vibrante vida cultural la hacen mágica.",
    culture: "Herencia colonial española fusionada con influencias africanas y caribeñas. La ciudad amurallada, Getsemaní y las Islas del Rosario cuentan historias de piratas y libertadores.",
    gastronomy: "Ceviche de camarón, arepa de huevo, patacón, cocadas, jugos de frutas tropicales y la famosa bandeja paisa.",
    climate: { spring: "27-32°C", summer: "28-33°C", autumn: "27-31°C", winter: "26-31°C", best_season: "Diciembre a abril (temporada seca)" },
    estimated_cost: { min: 200, max: 450, currency: "USD", budget_level: 1 },
    flights: { from: "Bogotá/CDMX", min_price: 150, currency: "USD", airlines: ["Avianca", "LATAM", "Wingo", "Copa Airlines"] },
    tips: ["Caminar por la ciudad amurallada al atardecer", "Visitar las Islas del Rosario en lancha", "Negociar precios antes de subir a un taxi"],
    image_query: "cartagena colombia colonial old town",
    tags: {
      climate: ["tropical", "calido"],
      safety: "moderado",
      language: ["espanol"],
      seasons: ["invierno", "primavera"],
      nightlife: "fiestas",
      nature: ["playas"],
      culture: ["arquitectura", "tradiciones"],
      adventure: "relajado",
      connectivity: "importante",
      transport: ["caminando", "tours"],
    }
  },
  {
    name: "Praga",
    country: "República Checa",
    description: "La Ciudad de las Cien Torres fascina con su arquitectura gótica, barroca y art nouveau. Puentes, castillos y cervecerías centenarias la convierten en un cuento de hadas europeo.",
    culture: "Capital cultural de Europa Central con una rica tradición en literatura (Kafka), música clásica y cerveza artesanal. El Castillo de Praga y el Puente de Carlos son icónicos.",
    gastronomy: "Trdelník, svíčková (solomillo en salsa de crema), goulash checo, cerveza Pilsner y vino Moravo.",
    climate: { spring: "5-18°C", summer: "15-27°C", autumn: "5-18°C", winter: "-3-3°C", best_season: "Primavera y otoño para clima agradable y menos turistas" },
    estimated_cost: { min: 300, max: 600, currency: "USD", budget_level: 2 },
    flights: { from: "Madrid/Bogotá", min_price: 350, currency: "USD", airlines: ["Ryanair", "Vueling", "Czech Airlines", "Lufthansa"] },
    tips: ["Subir a la Torre del Reloj Astronómico para vistas panorámicas", "Explorar el barrio de Malá Strana a pie", "Probar la cerveza checa en una pivnice local"],
    image_query: "prague czech republic charles bridge castle",
    tags: {
      climate: ["templado", "frio"],
      safety: "muy_seguro",
      language: ["ingles"],
      seasons: ["primavera", "otono"],
      nightlife: "bares",
      nature: [],
      culture: ["arquitectura", "arte", "literatura"],
      adventure: "relajado",
      connectivity: "esencial",
      transport: ["transporte", "caminando"],
    }
  },
  {
    name: "Marrakech",
    country: "Marruecos",
    description: "La Ciudad Roja cautiva con sus zocos laberínticos, palacios ornamentados y la embriagadora plaza Jemaa el-Fna. Una puerta de entrada a la cultura bereber y al desierto del Sahara.",
    culture: "Fusión de culturas bereber, árabe y francesa. Los riads tradicionales, los hammams y el arte del regateo en los zocos son experiencias culturales inmersivas.",
    gastronomy: "Tagine, cuscús, pastilla, harira, té de menta con hierbabuena y dulces de almendra y miel.",
    climate: { spring: "15-28°C", summer: "22-40°C", autumn: "15-30°C", winter: "5-18°C", best_season: "Marzo a mayo y octubre a noviembre" },
    estimated_cost: { min: 250, max: 500, currency: "USD", budget_level: 1 },
    flights: { from: "Madrid/París", min_price: 100, currency: "USD", airlines: ["Ryanair", "Royal Air Maroc", "EasyJet", "Vueling"] },
    tips: ["Contratar un guía local para los zocos", "Regatear siempre comenzando por la mitad del precio", "Llevar ropa que cubra hombros y rodillas"],
    image_query: "marrakech morocco medina jemaa el fna",
    tags: {
      climate: ["calido"],
      safety: "moderado",
      language: ["aprender"],
      seasons: ["primavera", "otono"],
      nightlife: "cenas",
      nature: ["desiertos"],
      culture: ["arquitectura", "tradiciones"],
      adventure: "moderado",
      connectivity: "ocasional",
      transport: ["caminando", "tours"],
    }
  },
  {
    name: "Queenstown",
    country: "Nueva Zelanda",
    description: "Capital mundial de la aventura, rodeada de montañas nevadas y lagos cristalinos. Bungy jumping, esquí, senderismo y paisajes de película (El Señor de los Anillos) te esperan.",
    culture: "Cultura maorí ancestral combinada con un espíritu aventurero moderno. La hospitalidad kiwi y el respeto por la naturaleza definen el estilo de vida neozelandés.",
    gastronomy: "Cordero neozelandés, pavlova, fish and chips, vinos de Central Otago y la cocina fusion kiwi.",
    climate: { spring: "5-15°C", summer: "12-25°C", autumn: "5-15°C", winter: "-2-8°C", best_season: "Diciembre a febrero para aventura, junio a agosto para esquí" },
    estimated_cost: { min: 700, max: 1200, currency: "USD", budget_level: 3 },
    flights: { from: "Santiago/CDMX", min_price: 900, currency: "USD", airlines: ["Air New Zealand", "LATAM", "Qantas", "Emirates"] },
    tips: ["Alquilar un coche o campervan para explorar", "Reservar actividades de aventura con anticipación", "Visitar Milford Sound en una excursión de un día"],
    image_query: "queenstown new zealand mountains lake",
    tags: {
      climate: ["templado", "frio"],
      safety: "muy_seguro",
      language: ["ingles"],
      seasons: ["verano", "invierno"],
      nightlife: "bares",
      nature: ["montanas", "bosques"],
      culture: ["tradiciones"],
      adventure: "extremo",
      connectivity: "importante",
      transport: ["auto"],
    }
  },
  // Additional destinations for more variety
  {
    name: "Ciudad del Cabo",
    country: "Sudáfrica",
    description: "Donde el océano Atlántico y el Índico se encuentran bajo la majestuosa Table Mountain. Una ciudad de contrastes con viñedos, safaris cercanos y una escena cultural vibrante.",
    culture: "Crisol de culturas africanas, europeas y asiáticas. La historia del apartheid, los coloridos barrios como Bo-Kaap y la nueva escena artística definen esta ciudad renaciente.",
    gastronomy: "Braai (barbacoa sudafricana), bobotie, bunny chow, vinos de Stellenbosch y Franschhoek, y la cocina Cape Malay.",
    climate: { spring: "12-20°C", summer: "18-28°C", autumn: "14-22°C", winter: "8-16°C", best_season: "Noviembre a marzo (verano austral)" },
    estimated_cost: { min: 400, max: 800, currency: "USD", budget_level: 2 },
    flights: { from: "Madrid/Bogotá", min_price: 600, currency: "USD", airlines: ["Emirates", "Qatar Airways", "British Airways", "KLM"] },
    tips: ["Madrugar para subir a Table Mountain sin colas", "Visitar Robben Island para entender la historia", "Hacer la Ruta de los Vinos en Stellenbosch"],
    image_query: "cape town south africa table mountain",
    tags: {
      climate: ["templado", "calido"],
      safety: "moderado",
      language: ["ingles"],
      seasons: ["verano", "primavera"],
      nightlife: "bares",
      nature: ["montanas", "playas"],
      culture: ["tradiciones", "arte"],
      adventure: "activo",
      connectivity: "importante",
      transport: ["auto", "tours"],
    }
  },
  {
    name: "Hanói",
    country: "Vietnam",
    description: "La milenaria capital vietnamita mezcla templos ancestrales con el bullicio de motocicletas y vendedores ambulantes. El Casco Antiguo es un laberinto de calles donde cada esquina cuenta una historia.",
    culture: "Tradiciones confucianas y budistas fusionadas con influencias francesas coloniales. El culto a los ancestros, los templos y la vida callejera son el alma de la ciudad.",
    gastronomy: "Pho, banh mi, bun cha, egg coffee, spring rolls y la incomparable cerveza bia hoi en las esquinas.",
    climate: { spring: "20-28°C", summer: "28-35°C", autumn: "22-30°C", winter: "14-22°C", best_season: "Octubre a diciembre y marzo a abril" },
    estimated_cost: { min: 200, max: 400, currency: "USD", budget_level: 1 },
    flights: { from: "Madrid/CDMX", min_price: 600, currency: "USD", airlines: ["Vietnam Airlines", "Qatar Airways", "Emirates", "Korean Air"] },
    tips: ["Cruzar la calle con confianza, el tráfico fluye alrededor", "Probar el café con huevo en Giang Cafe", "Visitar la Bahía de Ha Long en una excursión de 2 días"],
    image_query: "hanoi vietnam old quarter temple",
    tags: {
      climate: ["calido", "tropical"],
      safety: "seguro",
      language: ["aprender"],
      seasons: ["otono", "primavera"],
      nightlife: "bares",
      nature: ["bosques"],
      culture: ["tradiciones", "religion"],
      adventure: "moderado",
      connectivity: "importante",
      transport: ["transporte", "caminando"],
    }
  },
  {
    name: "Lisboa",
    country: "Portugal",
    description: "La ciudad de las siete colinas encanta con sus tranvías amarillos, azulejos pintados a mano y miradores con vistas al Tajo. Una capital europea accesible, melancólica y acogedora.",
    culture: "El fado, la saudade y los descubrimientos marítimos definen el alma portuguesa. Barrios como Alfama, Bairro Alto y Belém cuentan siglos de historia.",
    gastronomy: "Pastéis de nata, bacalhau en mil formas, sardinas asadas, ginjinha y los vinos de Porto y el Alentejo.",
    climate: { spring: "14-22°C", summer: "20-30°C", autumn: "15-24°C", winter: "10-16°C", best_season: "Primavera y otoño para clima perfecto" },
    estimated_cost: { min: 350, max: 700, currency: "USD", budget_level: 2 },
    flights: { from: "Bogotá/CDMX", min_price: 450, currency: "USD", airlines: ["TAP Portugal", "Iberia", "Avianca", "Air Europa"] },
    tips: ["Usar el tranvía 28 como tour turístico barato", "Ver el atardecer desde un miradouro", "Escaparse a Sintra para un día de castillos"],
    image_query: "lisbon portugal tram belem tower",
    tags: {
      climate: ["templado", "calido"],
      safety: "muy_seguro",
      language: ["espanol", "ingles"],
      seasons: ["primavera", "verano", "otono"],
      nightlife: "bares",
      nature: ["playas"],
      culture: ["arquitectura", "arte", "tradiciones"],
      adventure: "relajado",
      connectivity: "esencial",
      transport: ["transporte", "caminando"],
    }
  },
  {
    name: "Dubái",
    country: "Emiratos Árabes Unidos",
    description: "La ciudad del futuro donde los rascacielos más altos del mundo compiten con islas artificiales y centros comerciales gigantescos. Lujo, extravagancia y ambición sin límites.",
    culture: "Tradiciones beduinas árabes en contraste con una modernidad desenfrenada. El zoco del oro, las mezquitas y el desierto conviven con la arquitectura más vanguardista.",
    gastronomy: "Shawarma, hummus, falafel, mariscos premium, brunch de lujo en hoteles y la cocina fusion internacional de los mejores chefs.",
    climate: { spring: "25-35°C", summer: "35-45°C", autumn: "28-38°C", winter: "18-26°C", best_season: "Noviembre a marzo para clima agradable" },
    estimated_cost: { min: 500, max: 1500, currency: "USD", budget_level: 4 },
    flights: { from: "MAD,BOG,DXB", min_price: 400, currency: "USD", airlines: ["Emirates", "Etihad", "Flydubai", "Turkish Airlines"] },
    tips: ["Reservar entradas al Burj Khalifa con anticipación", "Negociar en los zocos tradicionales", "Hacer un safari en el desierto al atardecer"],
    image_query: "dubai burj khalifa skyline desert",
    tags: {
      climate: ["calido"],
      safety: "muy_seguro",
      language: ["ingles"],
      seasons: ["invierno", "primavera"],
      nightlife: "cenas",
      nature: ["desiertos"],
      culture: ["arquitectura"],
      adventure: "moderado",
      connectivity: "esencial",
      transport: ["auto", "transporte"],
    }
  },
  {
    name: "Buenos Aires",
    country: "Argentina",
    description: "La París de Sudamérica seduce con su arquitectura europea, el tango en cada esquina, la pasión por el fútbol y la mejor carne del mundo. Una ciudad que nunca duerme.",
    culture: "El tango, el mate, el fútbol y la literatura definen el alma porteña. Barrios como San Telmo, La Boca, Palermo y Recoleta tienen personalidades únicas.",
    gastronomy: "Asado, empanadas, dulce de leche, alfajores, pizza argentina, helado artesanal y el vino Malbec.",
    climate: { spring: "15-25°C", summer: "25-35°C", autumn: "15-24°C", winter: "8-16°C", best_season: "Primavera y otoño (marzo-mayo, sept-nov)" },
    estimated_cost: { min: 250, max: 500, currency: "USD", budget_level: 1 },
    flights: { from: "Bogotá/CDMX", min_price: 350, currency: "USD", airlines: ["Aerolíneas Argentinas", "LATAM", "Avianca", "Copa"] },
    tips: ["Ver un show de tango en San Telmo", "Visitar el mercado de San Telmo los domingos", "Ir a una cancha de fútbol para vivir la pasión"],
    image_query: "buenos aires argentina la boca tango",
    tags: {
      climate: ["templado"],
      safety: "moderado",
      language: ["espanol"],
      seasons: ["primavera", "otono"],
      nightlife: "fiestas",
      nature: [],
      culture: ["arte", "tradiciones", "literatura"],
      adventure: "relajado",
      connectivity: "esencial",
      transport: ["transporte", "caminando"],
    }
  },
  {
    name: "Edimburgo",
    country: "Escocia",
    description: "Ciudad medieval con un imponente castillo sobre una colina volcánica, calles empedradas y el famoso festival Fringe. Hogar del whisky escocés y de paisajes dramáticos cercanos.",
    culture: "Herencia celta y victoriana con tradiciones como el gaitero y el Hogmanay. El Royal Mile y el Castillo de Edimburgo son icónicos.",
    gastronomy: "Haggis, salmón ahumado, whisky single malt, shortbread y fish and chips.",
    climate: { spring: "6-12°C", summer: "12-18°C", autumn: "8-14°C", winter: "2-7°C", best_season: "Verano para festivales" },
    estimated_cost: { min: 500, max: 1000, currency: "USD", budget_level: 2 },
    flights: { from: "Madrid/Londres", min_price: 300, currency: "USD", airlines: ["Ryanair", "EasyJet", "British Airways"] },
    tips: ["Subir a Arthur's Seat al amanecer", "Asistir al Edinburgh Fringe Festival en agosto", "Hacer un tour de fantasmas en la ciudad vieja"],
    image_query: "edinburgh scotland castle royal mile sunset unsplash",
    tags: {
      climate: ["templado", "frio"],
      safety: "muy_seguro",
      language: ["ingles"],
      seasons: ["verano", "primavera"],
      nightlife: "bares",
      nature: ["colinas", "costas"],
      culture: ["historia", "festivales", "literatura"],
      adventure: "moderado",
      connectivity: "esencial",
      transport: ["caminando", "transporte"],
    }
  },
  {
    name: "Budapest",
    country: "Hungría",
    description: "La Perla del Danubio, dividida por el río en Buda y Pest. Baños termales, arquitectura art nouveau y vistas panorámicas desde el Bastión de los Pescadores.",
    culture: "Fusión de influencias otomanas, austrohúngaras y modernas. El Parlamento y la Basílica de San Esteban son emblemáticos.",
    gastronomy: "Goulash, lángos, chimney cake, paprika en todo y vinos de Tokaj.",
    climate: { spring: "10-18°C", summer: "20-30°C", autumn: "10-20°C", winter: "-2-5°C", best_season: "Primavera y otoño" },
    estimated_cost: { min: 350, max: 700, currency: "USD", budget_level: 2 },
    flights: { from: "Madrid", min_price: 150, currency: "USD", airlines: ["Ryanair", "Wizz Air"] },
    tips: ["Relajarse en los baños Széchenyi", "Cruzar el Puente de las Cadenas al atardecer", "Subir al Bastión de los Pescadores"],
    image_query: "budapest hungary parliament danube night unsplash",
    tags: {
      climate: ["templado"],
      safety: "seguro",
      language: ["hungaro", "ingles"],
      seasons: ["primavera", "otono"],
      nightlife: "bares",
      nature: ["rios"],
      culture: ["arquitectura", "baños termales"],
      adventure: "relajado",
      connectivity: "esencial",
      transport: ["transporte", "caminando"],
    }
  },
  {
    name: "Creta",
    country: "Grecia",
    description: "La isla más grande de Grecia, cuna de la civilización minoica con playas impresionantes, montañas y pueblos blancos encantadores.",
    culture: "Herencia mitológica y minoica. Knossos, Chania y Rethymno son joyas arqueológicas y culturales.",
    gastronomy: "Dakos, souvlaki, queso feta, aceitunas, raki y mariscos frescos.",
    climate: { spring: "15-22°C", summer: "25-35°C", autumn: "18-28°C", winter: "10-18°C", best_season: "Primavera y otoño" },
    estimated_cost: { min: 400, max: 900, currency: "USD", budget_level: 2 },
    flights: { from: "Atenas/Madrid", min_price: 200, currency: "USD", airlines: ["Aegean", "Ryanair"] },
    tips: ["Visitar el Palacio de Knossos", "Explorar la garganta de Samaria", "Disfrutar playas como Elafonisi o Balos"],
    image_query: "crete greece chania harbor beach mountains unsplash",
    tags: {
      climate: ["templado", "calido"],
      safety: "muy_seguro",
      language: ["griego", "ingles"],
      seasons: ["primavera", "verano", "otono"],
      nightlife: "bares",
      nature: ["playas", "montanas", "gargantas"],
      culture: ["historia", "arqueologia"],
      adventure: "activo",
      connectivity: "importante",
      transport: ["auto", "caminando"],
    }
  },
  {
    name: "Maldivas",
    country: "Maldivas",
    description: "Paraíso de atolones con aguas turquesas, arrecifes de coral y resorts sobre el agua. El destino soñado para luna de miel y relax total.",
    culture: "Cultura islámica con influencias del sur de Asia. Vida sencilla en islas locales y lujo en resorts privados.",
    gastronomy: "Atún fresco, curry de coco, pescado a la parrilla y cocina internacional en resorts.",
    climate: { spring: "28-30°C", summer: "27-30°C", autumn: "27-30°C", winter: "27-30°C", best_season: "Diciembre a abril (estación seca)" },
    estimated_cost: { min: 1200, max: 3000, currency: "USD", budget_level: 4 },
    flights: { from: "Dubái/Singapur", min_price: 600, currency: "USD", airlines: ["Emirates", "Qatar Airways"] },
    tips: ["Hacer snorkel o buceo en la barrera de coral", "Elegir resort con overwater villa", "Visitar una isla local para cultura auténtica"],
    image_query: "maldives overwater bungalow turquoise water sunset unsplash",
    tags: {
      climate: ["tropical"],
      safety: "muy_seguro",
      language: ["divehi", "ingles"],
      seasons: ["invierno", "primavera"],
      nightlife: "tranquila",
      nature: ["playas", "arrecifes", "océano"],
      culture: ["islas", "tradiciones"],
      adventure: "relajado",
      connectivity: "importante",
      transport: ["barco", "hidroavion"],
    }
  },
  {
    name: "Copenhague",
    country: "Dinamarca",
    description: "Ciudad escandinava moderna y ciclista con canales, diseño nórdico y gastronomía de vanguardia. La Sirenita y Nyhavn son icónicos.",
    culture: "Hygge, diseño minimalista y sostenibilidad. Tivoli Gardens y Christiania son experiencias únicas.",
    gastronomy: "Smørrebrød, salmón, pasteles daneses, cocina nórdica nueva y cervezas artesanales.",
    climate: { spring: "5-15°C", summer: "15-22°C", autumn: "8-14°C", winter: "-2-5°C", best_season: "Verano" },
    estimated_cost: { min: 700, max: 1300, currency: "USD", budget_level: 3 },
    flights: { from: "Madrid", min_price: 200, currency: "USD", airlines: ["SAS", "Ryanair"] },
    tips: ["Alquilar bicicleta para recorrer la ciudad", "Visitar Tivoli por la noche", "Probar smørrebrød en Torvehallerne"],
    image_query: "copenhagen denmark nyhavn colorful houses canal unsplash",
    tags: {
      climate: ["templado", "frio"],
      safety: "muy_seguro",
      language: ["danes", "ingles"],
      seasons: ["verano", "primavera"],
      nightlife: "bares",
      nature: ["canales", "parques"],
      culture: ["diseno", "arquitectura"],
      adventure: "relajado",
      connectivity: "esencial",
      transport: ["bicicleta", "caminando"],
    }
  },
  {
    name: "Machu Picchu",
    country: "Perú",
    description: "Ciudadela inca en las alturas de los Andes, una de las siete maravillas del mundo moderno. Acceso desde Cusco (ya incluido en tu base).",
    culture: "Herencia inca con misterios arqueológicos y conexión espiritual andina.",
    gastronomy: "Cocina andina: quinoa, papa, cuy, alpaca y chicha.",
    climate: { spring: "10-20°C", summer: "10-18°C", autumn: "8-20°C", winter: "5-18°C", best_season: "Mayo a septiembre (seca)" },
    estimated_cost: { min: 400, max: 900, currency: "USD", budget_level: 2 },
    flights: { from: "Cusco", min_price: 100, currency: "USD", airlines: ["LATAM", "Sky Airline"] },
    tips: ["Reservar tren y entrada con meses de anticipación", "Hacer el Camino Inca si estás en forma", "Llegar temprano para evitar multitudes"],
    image_query: "machu picchu peru inca ruins andes sunrise unsplash",
    tags: {
      climate: ["templado", "frio"],
      safety: "seguro",
      language: ["espanol", "quechua"],
      seasons: ["primavera", "verano", "otono"],
      nightlife: "tranquila",
      nature: ["montanas", "ruinas"],
      culture: ["arqueologia", "historia"],
      adventure: "activo",
      connectivity: "importante",
      transport: ["tren", "caminando"],
    }
  },
  {
    name: "Sicilia",
    country: "Italia",
    description: "Isla mediterránea con volcanes activos, playas, ruinas griegas y una gastronomía rica en influencias árabes y normandas.",
    culture: "Fusión griega, romana, árabe y barroca. Taormina, Palermo y el Etna son imprescindibles.",
    gastronomy: "Arancini, pasta alla norma, cannoli, granita, mariscos y vinos sicilianos.",
    climate: { spring: "15-22°C", summer: "25-35°C", autumn: "18-28°C", winter: "10-16°C", best_season: "Primavera y otoño" },
    estimated_cost: { min: 500, max: 1000, currency: "USD", budget_level: 2 },
    flights: { from: "Roma/Madrid", min_price: 150, currency: "USD", airlines: ["Ryanair", "Alitalia"] },
    tips: ["Subir al Etna en tour guiado", "Visitar el Valle de los Templos", "Probar cannoli en Palermo"],
    image_query: "sicily italy taormina greek theater sea unsplash",
    tags: {
      climate: ["templado", "calido"],
      safety: "seguro",
      language: ["italiano", "ingles"],
      seasons: ["primavera", "otono"],
      nightlife: "cenas",
      nature: ["playas", "volcanes"],
      culture: ["historia", "arquitectura"],
      adventure: "moderado",
      connectivity: "importante",
      transport: ["auto", "caminando"],
    }
  },
  {
    name: "Bora Bora",
    country: "Polinesia Francesa",
    description: "Isla paradisíaca con laguna turquesa, motus y bungalows sobre el agua. El destino definitivo para lujo y relajación.",
    culture: "Cultura polinesia con danzas, tatuajes y hospitalidad maorí.",
    gastronomy: "Pescado crudo (poisson cru), coco, vainilla y cocina francesa-polinesia.",
    climate: { spring: "26-30°C", summer: "27-31°C", autumn: "26-30°C", winter: "25-29°C", best_season: "Mayo a octubre" },
    estimated_cost: { min: 1500, max: 3500, currency: "USD", budget_level: 4 },
    flights: { from: "BOB,PPT,CDG", min_price: 400, currency: "USD", airlines: ["Air Tahiti", "Air France"] },
    tips: ["Hacer snorkel con tiburones y rayas", "Paseo en helicóptero sobre la isla", "Disfrutar atardecer desde overwater bungalow"],
    image_query: "bora bora french polynesia overwater bungalow lagoon unsplash",
    tags: {
      climate: ["tropical"],
      safety: "muy_seguro",
      language: ["frances", "ingles"],
      seasons: ["invierno", "primavera"],
      nightlife: "tranquila",
      nature: ["laguna", "playas"],
      culture: ["polinesia", "tradiciones"],
      adventure: "relajado",
      connectivity: "importante",
      transport: ["barco"],
    }
  },
  {
    name: "Toronto",
    country: "Canadá",
    description: "Ciudad multicultural con la CN Tower, barrios vibrantes y cercanía a las Cataratas del Niágara. La más grande de Canadá.",
    culture: "Diversidad extrema: Chinatown, Little Italy, Kensington Market y festivales todo el año.",
    gastronomy: "Poutine, peameal bacon sandwich, dim sum, comida caribeña y craft beer.",
    climate: { spring: "5-15°C", summer: "18-28°C", autumn: "8-18°C", winter: "-8-2°C", best_season: "Verano y otoño" },
    estimated_cost: { min: 600, max: 1100, currency: "USD", budget_level: 3 },
    flights: { from: "Bogotá/NYC", min_price: 500, currency: "USD", airlines: ["Air Canada", "Porter"] },
    tips: ["Subir a la CN Tower", "Visitar las Cataratas del Niágara en día trip", "Explorar Distillery District"],
    image_query: "toronto canada cn tower skyline lake ontario unsplash",
    tags: {
      climate: ["templado", "frio"],
      safety: "muy_seguro",
      language: ["ingles"],
      seasons: ["verano", "otono"],
      nightlife: "fiestas",
      nature: ["lagos"],
      culture: ["multicultural", "arte"],
      adventure: "moderado",
      connectivity: "esencial",
      transport: ["transporte", "caminando"],
    }
  },
  {
    name: "Palermo",
    country: "Italia",
    description: "Capital de Sicilia con mercados caóticos, catedral normanda, palacios árabes y una energía vibrante mediterránea.",
    culture: "Mezcla árabe-normanda-bizantina. Mercados como Ballarò y Vucciria son pura vida siciliana.",
    gastronomy: "Street food: arancini, panelle, sfincione, cannoli y mariscos.",
    climate: { spring: "15-22°C", summer: "25-35°C", autumn: "18-28°C", winter: "10-16°C", best_season: "Primavera y otoño" },
    estimated_cost: { min: 400, max: 800, currency: "USD", budget_level: 2 },
    flights: { from: "Roma/Madrid", min_price: 120, currency: "USD", airlines: ["Ryanair"] },
    tips: ["Visitar mercados al mediodía", "Explorar Quattro Canti", "Hacer tour de street food"],
    image_query: "palermo sicily italy cathedral market street unsplash",
    tags: {
      climate: ["templado", "calido"],
      safety: "seguro",
      language: ["italiano", "ingles"],
      seasons: ["primavera", "otono"],
      nightlife: "cenas",
      nature: ["costas"],
      culture: ["mercados", "arquitectura"],
      adventure: "relajado",
      connectivity: "esencial",
      transport: ["caminando"],
    }
  },
  {
    name: "Kyiv",
    country: "Ucrania",
    description: "Capital histórica con iglesias de cúpulas doradas, calles empedradas y una escena cultural renaciente (verificar situación actual antes de viajar).",
    culture: "Herencia eslava con influencia bizantina. La Catedral de Santa Sofía y el Monasterio de las Cuevas son patrimonio UNESCO.",
    gastronomy: "Borscht, varenyky, holubtsi y vodka ucraniano.",
    climate: { spring: "8-18°C", summer: "18-28°C", autumn: "8-18°C", winter: "-5-5°C", best_season: "Primavera y verano" },
    estimated_cost: { min: 300, max: 600, currency: "USD", budget_level: 1 },
    flights: { from: "Varsovia", min_price: 150, currency: "USD", airlines: ["Ryanair", "Wizz Air"] },
    tips: ["Visitar Maidan Nezalezhnosti", "Explorar Podil", "Probar comida local en mercados"],
    image_query: "kyiv ukraine saint sophia cathedral golden domes unsplash",
    tags: {
      climate: ["templado"],
      safety: "moderado",
      language: ["ucraniano", "ingles"],
      seasons: ["primavera", "verano"],
      nightlife: "bares",
      nature: ["rios"],
      culture: ["arquitectura", "religion"],
      adventure: "moderado",
      connectivity: "importante",
      transport: ["transporte", "caminando"],
    }
  },
  {
    name: "Montreal",
    country: "Canadá",
    description: "Ciudad bilingüe con encanto europeo, festivales todo el año y gastronomía excelente. Old Montreal es como caminar por Francia.",
    culture: "Mezcla francesa y norteamericana. Festival de Jazz, Just for Laughs y comida callejera.",
    gastronomy: "Poutine, bagels de Montreal, smoked meat, croissants y microcervecerías.",
    climate: { spring: "5-15°C", summer: "18-28°C", autumn: "8-18°C", winter: "-10-0°C", best_season: "Verano y otoño" },
    estimated_cost: { min: 600, max: 1100, currency: "USD", budget_level: 3 },
    flights: { from: "NYC/Toronto", min_price: 200, currency: "USD", airlines: ["Air Canada", "Porter"] },
    tips: ["Pasear por Old Port", "Asistir al Festival de Jazz", "Probar poutine auténtica"],
    image_query: "montreal canada old port notre dame basilica unsplash",
    tags: {
      climate: ["templado", "frio"],
      safety: "muy_seguro",
      language: ["frances", "ingles"],
      seasons: ["verano", "otono"],
      nightlife: "fiestas",
      nature: ["parques"],
      culture: ["festivales", "arte"],
      adventure: "moderado",
      connectivity: "esencial",
      transport: ["bicicleta", "caminando"],
    }
  }
]

// ════════════════════════════════════════════════════════════════════════════════
// DEPRECATED: This destinations array is no longer used in production
// All destinations are now fetched from the database at runtime via:
//   getDestinationsForRecommendations() from @/lib/database
// 
// The array below is kept only for reference and documentation purposes.
// To add/modify destinations, use the Admin Panel at /admin
// ════════════════════════════════════════════════════════════════════════════════

const DEFAULT_WEIGHTS: Weights = {
  climate: 5,
  budget: 5,
  interests: 5,
  travelStyle: 5,
  continent: 5,
  activities: 5,
  food: 5,
  accommodation: 5,
  companion: 5,
  safety: 5,
  language: 5,
  season: 5,
  nightlife: 5,
  nature: 5,
  culture: 5,
  adventureLevel: 5,
  connectivity: 5,
  photography: 5,
  crowdPreference: 5,
  shopping: 5,
  sustainability: 5,
  waterActivities: 5,
}

function normalizeWeight(weight: number): number {
  // Normalize weight from 1-10 to a multiplier (0.1 to 1.0)
  return weight / 10
}

function scoreDestination(destination: Destination, answers: TestAnswers, weights: Weights): number {
  let score = 0
  let maxPossibleScore = 0

  // Helper: only score a criterion if the answer is non-empty
  function addCriterion(base: number, weight: number, matched: boolean, partial = 0) {
    const w = normalizeWeight(weight)
    if (w === 0) return
    maxPossibleScore += base * w
    if (matched) score += base * w
    else if (partial > 0) score += base * w * partial
  }

  // ── 1. CLIMA (30 pts) — también acepta valores en inglés y sinónimos ──
  if (answers.climate) {
    const climateAliases: Record<string, string[]> = {
      frio:     ["frio", "cold", "fría", "frío"],
      templado: ["templado", "temperate", "mild"],
      calido:   ["calido", "warm", "hot", "cálido"],
      tropical: ["tropical", "humid"],
    }
    const normalizedClimate = Object.entries(climateAliases).find(([, aliases]) =>
      aliases.includes(answers.climate.toLowerCase())
    )?.[0] ?? answers.climate.toLowerCase()

    const match = destination.tags.climate.includes(normalizedClimate)
    // Partial match: if user wants templado and dest has calido (adjacent climates)
    const adjacent: Record<string, string[]> = {
      templado: ["calido", "frio"],
      calido: ["templado", "tropical"],
      frio: ["templado"],
      tropical: ["calido"],
    }
    const partial = !match && adjacent[normalizedClimate]?.some(c => destination.tags.climate.includes(c)) ? 0.4 : 0
    addCriterion(30, weights.climate, match, partial)
  }

  // ── 2. PRESUPUESTO (25 pts) ──
  if (answers.budget) {
    const budgetMap: Record<string, number[]> = {
      bajo:    [1],
      economico: [1],
      medio:   [1, 2],
      moderado: [1, 2],
      alto:    [2, 3],
      comodo:  [2, 3],
      premium: [3, 4],
      lujo:    [3, 4],
    }
    const budgetKey = answers.budget.toLowerCase()
    const match = budgetMap[budgetKey]?.includes(destination.estimated_cost.budget_level) ?? false
    // Adjacent budget: 1 level off = partial
    const partial = !match && Math.abs(
      (budgetMap[budgetKey]?.[0] ?? 2) - destination.estimated_cost.budget_level
    ) === 1 ? 0.4 : 0
    addCriterion(25, weights.budget, match, partial)
  }

  // ── 3. INTERESES (20 pts) ──
  const interestsList = Array.isArray(answers.interests) ? answers.interests : []
  if (interestsList.length > 0) {
    const interestMap: Record<string, { culture?: string[]; adventure?: string[]; nature?: string[] }> = {
      cultura:       { culture: ["arquitectura", "arte", "tradiciones", "religion", "literatura"] },
      culture:       { culture: ["arquitectura", "arte", "tradiciones", "religion", "literatura"] },
      naturaleza:    { nature: destination.tags.nature },
      nature:        { nature: destination.tags.nature },
      aventura:      { adventure: ["activo", "extremo"] },
      adventure:     { adventure: ["activo", "extremo"] },
      gastronomia:   { culture: [] }, // any dest matches food
      food:          { culture: [] },
      relax:         { adventure: ["relajado"] },
      relaxation:    { adventure: ["relajado"] },
      historia:      { culture: ["arquitectura", "religion", "tradiciones"] },
      history:       { culture: ["arquitectura", "religion", "tradiciones"] },
      playa:         { nature: ["playas"] },
      beach:         { nature: ["playas"] },
      montana:       { nature: ["montanas"] },
      mountain:      { nature: ["montanas"] },
      arte:          { culture: ["arte"] },
      art:           { culture: ["arte"] },
    }
    const matchCount = interestsList.filter(interest => {
      const iKey = interest.toLowerCase()
      const mapping = interestMap[iKey]
      if (!mapping) return false
      if (mapping.culture !== undefined) {
        if (mapping.culture.length === 0) return true
        return mapping.culture.some(t => destination.tags.culture.includes(t))
      }
      if (mapping.adventure) return mapping.adventure.includes(destination.tags.adventure)
      if (mapping.nature) return mapping.nature.some(t => destination.tags.nature.includes(t))
      return false
    }).length
    const ratio = matchCount / interestsList.length
    const w = normalizeWeight(weights.interests)
    maxPossibleScore += 20 * w
    score += 20 * w * ratio
  }

  // ── 4. ESTILO DE VIAJE (15 pts) ──
  if (answers.travelStyle) {
    const styleMap: Record<string, { budget: number[]; adventure: string[] }> = {
      mochilero:   { budget: [1], adventure: ["moderado", "activo", "extremo"] },
      backpacker:  { budget: [1], adventure: ["moderado", "activo", "extremo"] },
      comfort:     { budget: [2, 3], adventure: ["relajado", "moderado"] },
      comfortable: { budget: [2, 3], adventure: ["relajado", "moderado"] },
      lujo:        { budget: [3, 4], adventure: ["relajado"] },
      luxury:      { budget: [3, 4], adventure: ["relajado"] },
      cultural:    { budget: [1, 2, 3], adventure: ["relajado", "moderado"] },
      aventurero:  { budget: [1, 2], adventure: ["activo", "extremo"] },
      adventurer:  { budget: [1, 2], adventure: ["activo", "extremo"] },
      familiar:    { budget: [2, 3], adventure: ["relajado", "moderado"] },
      family:      { budget: [2, 3], adventure: ["relajado", "moderado"] },
    }
    const style = styleMap[answers.travelStyle.toLowerCase()]
    if (style) {
      const budgetMatch = style.budget.includes(destination.estimated_cost.budget_level)
      const adventureMatch = style.adventure.includes(destination.tags.adventure)
      addCriterion(15, weights.travelStyle, budgetMatch && adventureMatch,
        (budgetMatch || adventureMatch) ? 0.5 : 0)
    } else {
      addCriterion(15, weights.travelStyle, false)
    }
  }

  // ── 5. CONTINENTE / REGIÓN (20 pts) ──
  if (answers.continent) {
    const continentMap: Record<string, string[]> = {
      europa:   ["España", "República Checa", "Portugal", "Islandia"],
      europe:   ["España", "República Checa", "Portugal", "Islandia"],
      asia:     ["Japón", "Indonesia", "Turquía", "Vietnam", "Emiratos Árabes Unidos"],
      americas: ["Perú", "Colombia", "Argentina"],
      america:  ["Perú", "Colombia", "Argentina"],
      latinoamerica: ["Perú", "Colombia", "Argentina"],
      africa:   ["Marruecos", "Sudáfrica"],
      oceania:  ["Nueva Zelanda"],
      cualquiera: [], // any continent = full score
      any:      [],
      indiferente: [],
    }
    const key = answers.continent.toLowerCase()
    if (key === "cualquiera" || key === "any" || key === "indiferente") {
      addCriterion(20, weights.continent, true)
    } else {
      addCriterion(20, weights.continent, continentMap[key]?.includes(destination.country) ?? false)
    }
  }

  // ── 6. ACTIVIDADES (15 pts) ──
  const activitiesList = Array.isArray(answers.activities) ? answers.activities : []
  if (activitiesList.length > 0) {
    const activityMap: Record<string, (d: Destination) => boolean> = {
      senderismo:     (d) => d.tags.adventure === "activo" || d.tags.adventure === "extremo",
      hiking:         (d) => d.tags.adventure === "activo" || d.tags.adventure === "extremo",
      playa:          (d) => d.tags.nature.includes("playas"),
      beach:          (d) => d.tags.nature.includes("playas"),
      museos:         (d) => d.tags.culture.includes("arte") || d.tags.culture.includes("arquitectura"),
      museums:        (d) => d.tags.culture.includes("arte") || d.tags.culture.includes("arquitectura"),
      compras:        () => true,
      shopping:       () => true,
      fotografia:     () => true,
      photography:    () => true,
      vida_nocturna:  (d) => d.tags.nightlife === "fiestas" || d.tags.nightlife === "bares",
      nightlife:      (d) => d.tags.nightlife === "fiestas" || d.tags.nightlife === "bares",
      gastronomia:    () => true,
      gastronomy:     () => true,
      surf:           (d) => d.tags.nature.includes("playas"),
      ski:            (d) => d.tags.nature.includes("montanas"),
      cultura:        (d) => d.tags.culture.length > 0,
    }
    const matchCount = activitiesList.filter(a => activityMap[a.toLowerCase()]?.(destination)).length
    const ratio = matchCount / activitiesList.length
    const w = normalizeWeight(weights.activities)
    maxPossibleScore += 15 * w
    score += 15 * w * ratio
  }

  // ── 7. SEGURIDAD (10 pts) ──
  if (answers.safety) {
    const safetyOrder: Record<string, number> = { muy_seguro: 3, seguro: 2, moderado: 1, riesgo: 0 }
    const wantedLevel = safetyOrder[answers.safety] ?? safetyOrder["seguro"]
    const destLevel = safetyOrder[destination.tags.safety] ?? 1
    if (destLevel >= wantedLevel) {
      addCriterion(10, weights.safety, true)
    } else {
      addCriterion(10, weights.safety, false, destLevel / Math.max(wantedLevel, 1) * 0.5)
    }
  }

  // ── 8. IDIOMA (10 pts) ──
  if (answers.language) {
    const langAliases: Record<string, string[]> = {
      espanol:  ["espanol", "español", "spanish"],
      ingles:   ["ingles", "inglés", "english"],
      aprender: ["aprender", "learn", "otro", "other"],
      frances:  ["frances", "francés", "french"],
    }
    const normalized = Object.entries(langAliases).find(([, aliases]) =>
      aliases.includes(answers.language!.toLowerCase())
    )?.[0] ?? answers.language.toLowerCase()
    addCriterion(10, weights.language,
      destination.tags.language.includes(normalized) ||
      destination.tags.language.includes("aprender"))
  }

  // ── 9. TEMPORADA (10 pts) ──
  if (answers.season) {
    const seasonAliases: Record<string, string[]> = {
      primavera: ["primavera", "spring"],
      verano:    ["verano", "summer"],
      otono:     ["otono", "otoño", "autumn", "fall"],
      invierno:  ["invierno", "winter"],
      cualquiera: ["cualquiera", "any"],
    }
    const normalized = Object.entries(seasonAliases).find(([, aliases]) =>
      aliases.includes(answers.season!.toLowerCase())
    )?.[0] ?? answers.season.toLowerCase()
    if (normalized === "cualquiera") {
      addCriterion(10, weights.season, true)
    } else {
      addCriterion(10, weights.season, destination.tags.seasons.includes(normalized))
    }
  }

  // ── 10. VIDA NOCTURNA (8 pts) ──
  if (answers.nightlife) {
    const nightlifeAliases: Record<string, string[]> = {
      fiestas:   ["fiestas", "clubs", "party", "nightclubs"],
      bares:     ["bares", "bars", "pubs"],
      cenas:     ["cenas", "dinner", "restaurantes", "restaurants"],
      tranquila: ["tranquila", "quiet", "calm", "relax"],
    }
    const normalized = Object.entries(nightlifeAliases).find(([, aliases]) =>
      aliases.includes(answers.nightlife!.toLowerCase())
    )?.[0] ?? answers.nightlife.toLowerCase()
    addCriterion(8, weights.nightlife,
      destination.tags.nightlife === normalized,
      // partial: bares ↔ fiestas are close
      normalized === "bares" && destination.tags.nightlife === "fiestas" ? 0.5 :
      normalized === "fiestas" && destination.tags.nightlife === "bares" ? 0.5 : 0)
  }

  // ── 11. TIPO DE NATURALEZA (12 pts) ──
  if (answers.natureType) {
    const natureAliases: Record<string, string[]> = {
      montanas: ["montanas", "montañas", "mountains", "mountain"],
      playas:   ["playas", "playa", "beach", "beaches", "costa", "coast"],
      bosques:  ["bosques", "bosque", "forest", "forests"],
      desiertos:["desiertos", "desierto", "desert"],
      selva:    ["selva", "jungle", "rainforest"],
    }
    const normalized = Object.entries(natureAliases).find(([, aliases]) =>
      aliases.includes(answers.natureType!.toLowerCase())
    )?.[0] ?? answers.natureType.toLowerCase()
    addCriterion(12, weights.nature, destination.tags.nature.includes(normalized))
  }

  // ── 12. TIPO DE CULTURA (12 pts) ──
  if (answers.cultureType) {
    const cultureAliases: Record<string, string[]> = {
      arquitectura: ["arquitectura", "architecture"],
      arte:         ["arte", "art"],
      tradiciones:  ["tradiciones", "traditions", "traditional"],
      religion:     ["religion", "religious", "temples", "templos"],
      literatura:   ["literatura", "literature"],
      gastronomia:  ["gastronomia", "gastronomy", "food", "cuisine"],
    }
    const normalized = Object.entries(cultureAliases).find(([, aliases]) =>
      aliases.includes(answers.cultureType!.toLowerCase())
    )?.[0] ?? answers.cultureType.toLowerCase()
    addCriterion(12, weights.culture, destination.tags.culture.includes(normalized))
  }

  // ── 13. NIVEL DE AVENTURA (10 pts) ──
  if (answers.adventureLevel) {
    const adventureAliases: Record<string, string[]> = {
      relajado: ["relajado", "relaxed", "tranquilo", "calm"],
      moderado: ["moderado", "moderate", "medium"],
      activo:   ["activo", "active", "sporty"],
      extremo:  ["extremo", "extreme", "adrenaline"],
    }
    const normalized = Object.entries(adventureAliases).find(([, aliases]) =>
      aliases.includes(answers.adventureLevel!.toLowerCase())
    )?.[0] ?? answers.adventureLevel.toLowerCase()
    const adventureOrder = ["relajado", "moderado", "activo", "extremo"]
    const wantedIdx = adventureOrder.indexOf(normalized)
    const destIdx = adventureOrder.indexOf(destination.tags.adventure)
    if (wantedIdx === destIdx) {
      addCriterion(10, weights.adventureLevel, true)
    } else if (Math.abs(wantedIdx - destIdx) === 1) {
      addCriterion(10, weights.adventureLevel, false, 0.5)
    } else {
      addCriterion(10, weights.adventureLevel, false)
    }
  }

  // ── 14. CONECTIVIDAD (8 pts) ──
  if (answers.connectivity) {
    const connOrder: Record<string, number> = { esencial: 3, importante: 2, ocasional: 1, sin_internet: 0 }
    const wantedConn = connOrder[answers.connectivity] ?? connOrder["importante"]
    const destConn = connOrder[destination.tags.connectivity] ?? 2
    if (destConn >= wantedConn) {
      addCriterion(8, weights.connectivity, true)
    } else {
      addCriterion(8, weights.connectivity, false, 0.3)
    }
  }

  // ── 15. TRANSPORTE (8 pts) ──
  if (answers.transport) {
    const transportAliases: Record<string, string[]> = {
      transporte: ["transporte", "public_transport", "metro", "bus"],
      auto:       ["auto", "car", "driving", "coche"],
      caminando:  ["caminando", "walking", "a_pie"],
      tours:      ["tours", "guided", "guiado"],
    }
    const normalized = Object.entries(transportAliases).find(([, aliases]) =>
      aliases.includes(answers.transport!.toLowerCase())
    )?.[0] ?? answers.transport.toLowerCase()
    addCriterion(8, weights.travelStyle, destination.tags.transport.includes(normalized))
  }

  // ── Calcular porcentaje final ──
  if (maxPossibleScore === 0) return 70  // fallback si no hay criterios

  const raw = Math.round((score / maxPossibleScore) * 100)

  // Escalar para que el rango útil sea 60-97 (diferencias más visibles)
  // raw 0-100 -> mapped 60-97
  const scaled = Math.round(60 + (raw / 100) * 37)
  return Math.min(97, Math.max(60, scaled))
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    console.log("Authorization Header:", authHeader) // Log the authorization header for debugging
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    console.log("Extracted Token:", token) // Log the extracted token for debugging
    const payload = verifyJWT(token)
    if (!payload) {
      console.log("Invalid or expired token") // Log invalid token
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
    }

    const body = await request.json() as { 
      answers: TestAnswers
      weights?: Partial<Weights>
    }

    const answers = body.answers
    const userWeights = body.weights

    if (!answers) {
      return NextResponse.json({ error: "Respuestas del test requeridas" }, { status: 400 })
    }

    // Convierte cualquier valor a string[]  — protege contra string, undefined, null
    function toArray(val: unknown): string[] {
      if (!val) return []
      if (Array.isArray(val)) return val.map(String)
      if (typeof val === "string") {
        if (val.startsWith("[")) {
          try { return JSON.parse(val) as string[] } catch { /* nada */ }
        }
        return [val]
      }
      return []
    }

    // Convierte cualquier valor a string — si es array toma el primer elemento
    function toString1(val: unknown): string {
      if (!val) return ""
      if (Array.isArray(val)) return val.length > 0 ? String(val[0]) : ""
      if (typeof val === "string") return val
      return String(val)
    }

    // Igual que toString1 pero devuelve undefined si vacío (para campos opcionales)
    function toStr(val: unknown): string | undefined {
      const s = toString1(val)
      return s === "" ? undefined : s
    }

    // Normalize answers: handle camelCase, snake_case, arrays from AI questions
    const normalizedAnswers: TestAnswers = {
      climate:        toString1(answers.climate ?? answers["climate" as keyof typeof answers]),
      budget:         toString1(answers.budget),
      duration:       toString1(answers.duration),
      interests:      toArray(answers.interests ?? answers["interests" as keyof typeof answers]),
      travelStyle:    toString1(answers.travelStyle ?? answers["travel_style" as keyof typeof answers]),
      continent:      toString1(answers.continent),
      activities:     toArray(answers.activities ?? answers["activities" as keyof typeof answers]),
      food:           toString1(answers.food),
      accommodation:  toString1(answers.accommodation),
      companion:      toString1(answers.companion),
      safety:         toStr(answers.safety ?? answers["safety" as keyof typeof answers]),
      language:       toStr(answers.language ?? answers["idioma" as keyof typeof answers] ?? answers["language" as keyof typeof answers]),
      season:         toStr(answers.season ?? answers["temporada" as keyof typeof answers]),
      nightlife:      toStr(answers.nightlife ?? answers["vida_nocturna" as keyof typeof answers]),
      natureType:     toStr(answers.natureType ?? answers["nature" as keyof typeof answers] ?? answers["naturaleza" as keyof typeof answers]),
      cultureType:    toStr(answers.cultureType ?? answers["culture" as keyof typeof answers] ?? answers["cultura" as keyof typeof answers]),
      adventureLevel: toStr(answers.adventureLevel ?? answers["adventure_level" as keyof typeof answers]),
      transport:      toStr(answers.transport),
      connectivity:   toStr(answers.connectivity),
      photography:    toStr(answers.photography),
      crowdPreference:toStr(answers.crowdPreference ?? answers["crowds" as keyof typeof answers]),
      shopping:       toStr(answers.shopping),
      sustainability: toStr(answers.sustainability),
      waterActivities:toStr(answers.waterActivities ?? answers["water_activities" as keyof typeof answers]),
    }

    // Merge user weights with defaults
    const weights: Weights = { ...DEFAULT_WEIGHTS, ...userWeights }

    // ════ LOAD DESTINATIONS FROM DATABASE ════
    // Instead of using the hardcoded array, fetch from database
    const dbDestinations = getDestinationsForRecommendations()
    console.log(`[WanderIA] Loaded ${dbDestinations.length} destinations from database`)

    // Score all destinations
    const scored = dbDestinations.map((dest) => ({
      destination: dest,
      score: scoreDestination(dest, normalizedAnswers, weights),
    }))

    // Sort by score descending and take top 3
    scored.sort((a, b) => b.score - a.score)
    const topDestinations = scored.slice(0, 3)

    // Format the response
    const recommendations = topDestinations.map((item, index) => ({
      rank: index + 1,
      match_percentage: item.score,
      name: item.destination.name,
      country: item.destination.country,
      description: item.destination.description,
      culture: item.destination.culture,
      gastronomy: item.destination.gastronomy,
      climate: item.destination.climate,
      estimated_cost: item.destination.estimated_cost,
      flights: item.destination.flights,
      tips: item.destination.tips,
      image_query: item.destination.image_query,
    }))

    // Crear sesión de test para este usuario y guardar las recomendaciones
    let sessionId: string | null = null
    try {
      const { createTestSession, saveRecommendation, completeTestSession } = await import("@/lib/database")
      const userId = payload.id as string
      const session = createTestSession(userId)
      sessionId = session.id

      recommendations.forEach((rec, idx) => {
        saveRecommendation(
          session.id,
          rec.name,
          rec.country,
          rec.match_percentage,
          idx + 1
        )
      })

      completeTestSession(session.id)
    } catch (e) {
      console.error("[WanderIA] Error saving session:", e)
    }

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      recommendations,
      profile_summary: {
        climate: normalizedAnswers.climate,
        budget: normalizedAnswers.budget,
        interests: normalizedAnswers.interests,
        travel_style: normalizedAnswers.travelStyle,
      },
      weights_used: weights,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("[WanderIA] Recommendations error:", message)
    return NextResponse.json(
      { error: "Error al generar recomendaciones", detail: message },
      { status: 500 }
    )
  }
}
