import type { StopArrivals } from './typeDefinitions';
import { getLatLongGivenPostCode } from './postcodeApiService';
import { getArrivalsGivenStopPoint, getStopPointsGivenLatLong} from './tflApiService';

export async function getArrivalsGivenPostCode(postCode: string): Promise<StopArrivals[] | string | null> {
    const latLong = await getLatLongGivenPostCode(postCode);
    if(latLong === null) return "Invalid Postcode";
    const stopPoints = await getStopPointsGivenLatLong(latLong);
    if(stopPoints === null) return "Bus Stops not found";

    stopPoints.sort((a, b) => a.distance - b.distance);

    const nearestTwoStops = stopPoints.slice(0,2);

    const arrivals: StopArrivals[] = (
        await Promise.all(
            nearestTwoStops.map(async (item) => {
            const tempArrivals = await getArrivalsGivenStopPoint(item.naptanId);
            if (tempArrivals === null) return null;
            return {stopName: item.commonName, arrivals: tempArrivals};
            })
        )
    ).filter((item): item is StopArrivals => item !== null);

    if (arrivals.length === 0) return "Invalid bus stops or no buses found for bus stops";
    return arrivals;
}



