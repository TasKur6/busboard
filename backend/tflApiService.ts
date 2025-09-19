import axios from 'axios';
import type { ArrivalInfo, location, StopPoint } from './typeDefinitions';

export async function getStopPointArrivals(stopPoint: string): Promise<ArrivalInfo[] | null> {
  try {
    const response = await axios.get<ArrivalInfo[]>(`https://api.tfl.gov.uk/StopPoint/${stopPoint}/Arrivals?app_key=${api_key}`);

    response.data.sort((a,b) => a.timeToStation - b.timeToStation);

    const firstFiveBuses = response.data.slice(0,5);

    return firstFiveBuses.map((item: ArrivalInfo): ArrivalInfo => (
        {
            stationName: item.stationName,
            lineName: item.lineName,
            destinationName: item.destinationName,
            timeToStation: Math.round(item.timeToStation/60),
            towards: item.towards
        }));
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getStopPointsFromLatLong(latLong: location, radius: number): Promise<StopPoint[] | null> {
    try {
        const stopType = "NaptanPublicBusCoachTram";
        const rad = Number.isNaN(radius) ? 200 : radius;
        const latLongResponse = await axios.get(`https://api.tfl.gov.uk/StopPoint/?lat=${latLong.latitude}&lon=${latLong.longitude}&stopTypes=${stopType}&radius=${rad}&app_key=${api_key}`);

        const {stopPoints} = latLongResponse.data;

        return stopPoints.map((item: any): StopPoint => (
            {
                naptanId: item.naptanId,
                commonName: item.commonName,
                distance: item.distance
            }));
    } catch(error) {
        console.log(error);
        return null;
    }
}