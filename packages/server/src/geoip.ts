import geolite2 from "geolite2-redist";
import maxmind, { CityResponse, Reader } from "maxmind";

const lookupPromise = getLookup();

async function getLookup(): Promise<Reader<CityResponse> | { get: () => null }> {
    // Skip GeoIP initialization if explicitly disabled
    if (process.env.PL_DISABLE_GEOIP === "true") {
        console.log("GeoIP disabled by PL_DISABLE_GEOIP environment variable");
        return {
            get: () => null,
        };
    }
    
    try {
        // Set a timeout for downloading databases
        const downloadPromise = geolite2.downloadDbs();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("GeoIP database download timeout")), 5000)
        );
        
        await Promise.race([downloadPromise, timeoutPromise]);
        
        const lookup = await geolite2.open<Reader<CityResponse>>(
            geolite2.GeoIpDbName.City,
            (path) => maxmind.open<CityResponse>(path)
        );
        return lookup;
    } catch (error) {
        console.warn("GeoIP initialization failed (will continue without location tracking):", error.message || error);
        return {
            get: () => null,
        };
    }
}

export async function getLocation(ip: string) {
    const lookup = await lookupPromise;
    const city = lookup.get(ip);
    return city;
}
