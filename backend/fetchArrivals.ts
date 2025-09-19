import type { StopArrivals } from './typeDefinitions';
import { getLatLongGivenPostCode } from './postcodeApiService';
import { getStopPointArrivals, getStopPointsFromLatLong} from './tflApiService';

export async function getPostCodeArrivals(postCode: string): Promise<StopArrivals[]> {
    const latLong = await getLatLongGivenPostCode(postCode);
    if(latLong === null) throw new Error("Invalid Postcode");
    const stopPoints = await getStopPointsFromLatLong(latLong);
    if(stopPoints === null) throw new Error("Bus Stops not found");

    stopPoints.sort((a, b) => a.distance - b.distance);

    const nearestTwoStops = stopPoints.slice(0,2);

    const arrivals: StopArrivals[] = (
        await Promise.all(
            nearestTwoStops.map(async (item) => {
            const tempArrivals = await getStopPointArrivals(item.naptanId);
            if (tempArrivals === null) return null;
            return {stopName: item.commonName, arrivals: tempArrivals};
            })
        )
    ).filter((item): item is StopArrivals => item !== null);

    if (arrivals.length === 0) throw new Error("Invalid bus stops or no buses found for bus stops");
    return arrivals;
}



