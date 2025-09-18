import axios from 'axios';
import type { ArrivalInfo, location, StopPoint } from './typeDefinitions';

export async function getArrivalsGivenPostCode(postCode: string): Promise<ArrivalInfo[][] | string | null> {
    const latLong = await getLatLongGivenPostCode(postCode);
    if(latLong === null) return "Invalid Postcode";
    const stopPoints = await getStopPointsGivenLatLong(latLong);
    if(stopPoints === null) return "Bus Stops not found";

    stopPoints.sort((a, b) => a.distance - b.distance);

    const nearestTwoStops = stopPoints.slice(0,2);

    const arrivalsPotential = await Promise.all(
        nearestTwoStops.map(async (item) => {
        const tempArrivals = await getArrivalsGivenStopPoint(item.naptanId);
        return tempArrivals ?? [];
        })
    );

    const arrivals: ArrivalInfo[][] = [];
    for(const point of arrivalsPotential) {
        if (point.length === 0) {
            continue;
        }
        arrivals.push(point);
    }
    if (arrivals.length === 0) return "Invalid bus stops or no buses found for bus stops";
    return arrivals;
}

async function getArrivalsGivenStopPoint(stopPoint: string): Promise<ArrivalInfo[] | null> {
  try {
    const response = await axios.get(`https://api.tfl.gov.uk/StopPoint/${stopPoint}/Arrivals?app_key=${api_key}`);

    response.data.sort((a: { timeToStation: number; }, b: { timeToStation: number; }) => a.timeToStation - b.timeToStation);

    const firstFiveBuses = response.data.slice(0,5);

    return firstFiveBuses.map((item: any): ArrivalInfo => (
        {
            stationName: item.stationName,
            lineName: item.lineName,
            destinationName: item.destinationName,
            timeToStationMinutes: Math.round(item.timeToStation/60),
            towards: item.towards
        }));
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getStopPointsGivenLatLong(latLong: location): Promise<StopPoint[] | null> {
    try {
        const stopType = "NaptanPublicBusCoachTram";
        const latLongResponse = await axios.get(`https://api.tfl.gov.uk/StopPoint/?lat=${latLong.latitude}&lon=${latLong.longitude}&stopTypes=${stopType}&app_key=${api_key}`);

        const {stopPoints} = latLongResponse.data;

        return stopPoints.map((item: any): StopPoint => (
            {
                naptanId: item.naptanId,
                distance: item.distance
            }));
    } catch(error) {
        console.log(error);
        return null;
    }
}

async function getLatLongGivenPostCode(postCode: string): Promise<location | null> {
    try {
        const postCodeResponse = await axios.get(`https://api.postcodes.io/postcodes/${postCode}`);

        const latLong: location = (
            {
                latitude: postCodeResponse.data.result.latitude,
                longitude: postCodeResponse.data.result.longitude
            });
        return latLong;
    } catch(error) {
        console.log(error);
        return null;
    }
}