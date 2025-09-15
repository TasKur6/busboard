import axios from 'axios';
export type ArrivalInfo = {
    stationName: string;
    destinationName: string;
    timeToStationMinutes: string;
    towards: string;
}

export async function getArrivals(stopPoint: string): Promise<ArrivalInfo[] | null> {
  try {
    const response = await axios.get(`https://api.tfl.gov.uk/StopPoint/${stopPoint}/Arrivals?app_key=${api_key}`);
    response.data.sort((a: { timeToStation: number; }, b: { timeToStation: number; }) => a.timeToStation - b.timeToStation);
    const firstFiveRows = response.data.slice(0,5);
    return firstFiveRows.map((item: any): ArrivalInfo => {
        var {stationName, destinationName, timeToStation, towards} = item;
        var timeToStationMinutes = `${Math.floor(timeToStation/60)}m ${timeToStation%60}s`;
        return {stationName, destinationName, timeToStationMinutes, towards};
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}