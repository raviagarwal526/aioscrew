/**
 * Aviation Data Service
 * 
 * Loads real aviation data from OpenFlights.org (open source, free)
 * Provides real airports, airlines, and routes for realistic test data generation
 * 
 * Data Source: https://openflights.org/data.html
 * License: Open Database License (ODbL)
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Airport {
  id: number;
  name: string;
  city: string;
  country: string;
  iata: string;  // 3-letter code (e.g., PTY, MIA)
  icao: string;  // 4-letter code (e.g., MPTO, KMIA)
  latitude: number;
  longitude: number;
  altitude: number;
  timezone: string;
}

export interface Route {
  airline: string;  // IATA code (e.g., CM for Copa)
  airlineId: number;
  sourceAirport: string;  // IATA code
  sourceAirportId: number;
  destinationAirport: string;  // IATA code
  destinationAirportId: number;
  codeshare: string;
  stops: number;
  equipment: string;  // Aircraft types (e.g., "737 787")
}

export interface Airline {
  id: number;
  name: string;
  alias: string;
  iata: string;  // 2-letter code (e.g., CM)
  icao: string;  // 3-letter code (e.g., CMP)
  callsign: string;
  country: string;
  active: string;  // 'Y' or 'N'
}

class AviationDataService {
  private airports: Airport[] = [];
  private routes: Route[] = [];
  private airlines: Airline[] = [];
  private loaded = false;
  private dataPath: string;

  constructor() {
    // Try multiple possible paths
    const possiblePaths = [
      join(__dirname, '../data'),
      join(__dirname, '../../data'),
      join(process.cwd(), 'backend/data'),
      join(process.cwd(), 'data')
    ];

    this.dataPath = possiblePaths.find(path => 
      existsSync(join(path, 'airports.dat'))
    ) || possiblePaths[0];
  }

  /**
   * Load OpenFlights data from CSV files
   * Data source: https://openflights.org/data.html
   */
  loadOpenFlightsData(): boolean {
    if (this.loaded) return true;

    try {
      const airportsPath = join(this.dataPath, 'airports.dat');
      const routesPath = join(this.dataPath, 'routes.dat');
      const airlinesPath = join(this.dataPath, 'airlines.dat');

      // Check if files exist
      if (!existsSync(airportsPath) || !existsSync(routesPath)) {
        console.warn('⚠️  OpenFlights data files not found.');
        console.warn(`   Expected location: ${this.dataPath}`);
        console.warn('   Download from: https://openflights.org/data.html');
        console.warn('   Files needed: airports.dat, routes.dat');
        return false;
      }

      // Parse airports.dat
      const airportsData = readFileSync(airportsPath, 'utf-8');
      this.airports = airportsData
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const fields = line.split(',').map(f => f.replace(/"/g, '').trim());
          return {
            id: parseInt(fields[0]) || 0,
            name: fields[1] || '',
            city: fields[2] || '',
            country: fields[3] || '',
            iata: fields[4] || '',
            icao: fields[5] || '',
            latitude: parseFloat(fields[6]) || 0,
            longitude: parseFloat(fields[7]) || 0,
            altitude: parseFloat(fields[8]) || 0,
            timezone: fields[9] || ''
          };
        })
        .filter(airport => airport.iata && airport.iata !== '\\N' && airport.iata.length === 3);

      // Parse routes.dat
      const routesData = readFileSync(routesPath, 'utf-8');
      this.routes = routesData
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const fields = line.split(',').map(f => f.replace(/"/g, '').trim());
          return {
            airline: fields[0] || '',
            airlineId: parseInt(fields[1]) || 0,
            sourceAirport: fields[2] || '',
            sourceAirportId: parseInt(fields[3]) || 0,
            destinationAirport: fields[4] || '',
            destinationAirportId: parseInt(fields[5]) || 0,
            codeshare: fields[6] || '',
            stops: parseInt(fields[7]) || 0,
            equipment: fields[8] || ''
          };
        })
        .filter(route => 
          route.sourceAirport && 
          route.destinationAirport && 
          route.sourceAirport !== '\\N' && 
          route.destinationAirport !== '\\N' &&
          route.sourceAirport.length === 3 &&
          route.destinationAirport.length === 3
        );

      // Parse airlines.dat (optional)
      if (existsSync(airlinesPath)) {
        const airlinesData = readFileSync(airlinesPath, 'utf-8');
        this.airlines = airlinesData
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            const fields = line.split(',').map(f => f.replace(/"/g, '').trim());
            return {
              id: parseInt(fields[0]) || 0,
              name: fields[1] || '',
              alias: fields[2] || '',
              iata: fields[3] || '',
              icao: fields[4] || '',
              callsign: fields[5] || '',
              country: fields[6] || '',
              active: fields[7] || 'N'
            };
          })
          .filter(airline => 
            airline.iata && 
            airline.iata !== '\\N' && 
            airline.active === 'Y'
          );
      }

      this.loaded = true;
      console.log(`✅ Loaded ${this.airports.length} airports and ${this.routes.length} routes from OpenFlights.org`);
      return true;
    } catch (error) {
      console.warn('⚠️  Failed to load OpenFlights data:', error instanceof Error ? error.message : 'Unknown error');
      console.warn('   Falling back to synthetic data generation');
      return false;
    }
  }

  /**
   * Check if real data is available
   */
  isDataAvailable(): boolean {
    return this.loaded && this.airports.length > 0 && this.routes.length > 0;
  }

  /**
   * Get Copa Airlines routes (CM = Copa IATA code)
   */
  getCopaRoutes(): Route[] {
    return this.routes.filter(r => r.airline === 'CM');
  }

  /**
   * Get random Copa route
   */
  getRandomCopaRoute(): Route | null {
    const copaRoutes = this.getCopaRoutes();
    if (copaRoutes.length === 0) return null;
    return copaRoutes[Math.floor(Math.random() * copaRoutes.length)];
  }

  /**
   * Get all routes from a specific airport
   */
  getRoutesFromAirport(iata: string): Route[] {
    return this.routes.filter(r => r.sourceAirport === iata.toUpperCase());
  }

  /**
   * Get airport by IATA code
   */
  getAirportByIATA(iata: string): Airport | undefined {
    return this.airports.find(a => a.iata.toUpperCase() === iata.toUpperCase());
  }

  /**
   * Get airports by country
   */
  getAirportsByCountry(country: string): Airport[] {
    return this.airports.filter(a => 
      a.country.toLowerCase() === country.toLowerCase()
    );
  }

  /**
   * Calculate flight time based on distance (Haversine formula)
   */
  calculateFlightTime(sourceIATA: string, destIATA: string): number {
    const source = this.getAirportByIATA(sourceIATA);
    const dest = this.getAirportByIATA(destIATA);
    
    if (!source || !dest) {
      // Fallback: estimate based on typical speeds
      return 5.0; // Default 5 hours
    }

    // Haversine formula for great circle distance
    const R = 6371; // Earth radius in km
    const dLat = (dest.latitude - source.latitude) * Math.PI / 180;
    const dLon = (dest.longitude - source.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(source.latitude * Math.PI / 180) * 
      Math.cos(dest.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    // Average commercial aircraft speed: 800-900 km/h
    // Use 850 km/h as average
    const flightTime = distance / 850;
    
    // Add buffer for taxi, takeoff, landing (15% overhead)
    return flightTime * 1.15;
  }

  /**
   * Check if route is international (different countries)
   */
  isInternationalRoute(sourceIATA: string, destIATA: string): boolean {
    const source = this.getAirportByIATA(sourceIATA);
    const dest = this.getAirportByIATA(destIATA);
    return source && dest ? source.country !== dest.country : false;
  }

  /**
   * Get aircraft type from route equipment
   */
  getAircraftTypeFromRoute(route: Route): string {
    if (!route.equipment || route.equipment === '\\N') {
      return '737-800'; // Default
    }

    // Parse equipment string (e.g., "737 787" or "737")
    const equipment = route.equipment.toUpperCase();
    
    if (equipment.includes('737')) {
      return equipment.includes('MAX') ? '737-MAX' : '737-800';
    } else if (equipment.includes('787')) {
      return '787-9';
    } else if (equipment.includes('E190') || equipment.includes('E195')) {
      return 'E190';
    }
    
    return '737-800'; // Default fallback
  }

  /**
   * Get popular Copa routes (frequently used)
   */
  getPopularCopaRoutes(limit: number = 20): Route[] {
    const copaRoutes = this.getCopaRoutes();
    
    // Count route frequency
    const routeCounts = new Map<string, { route: Route; count: number }>();
    
    for (const route of copaRoutes) {
      const key = `${route.sourceAirport}-${route.destinationAirport}`;
      const existing = routeCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        routeCounts.set(key, { route, count: 1 });
      }
    }
    
    // Sort by frequency and return top routes
    return Array.from(routeCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(item => item.route);
  }

  /**
   * Get statistics about loaded data
   */
  getStatistics() {
    return {
      airports: this.airports.length,
      routes: this.routes.length,
      airlines: this.airlines.length,
      copaRoutes: this.getCopaRoutes().length,
      dataPath: this.dataPath,
      loaded: this.loaded
    };
  }
}

export const aviationDataService = new AviationDataService();

