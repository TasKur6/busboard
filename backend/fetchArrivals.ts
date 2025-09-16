import axios from 'axios';
export type ArrivalInfo = {
    stationName: string;
    destinationName: string;
    timeToStationMinutes: string;
    towards: string;
}

type stopPoint = {
    naptanId: string;
    distance: number;
}

const api_key = "7b44c0bcdadc4eae9d72840651b5003f";

export async function getArrivalsGivenPostCode(postCode: string): Promise<ArrivalInfo[][] | null> {
    const latLong = await getLatLongGivenPostCode(postCode);
    if(latLong === null) return null;
    const stopPoints = await getStopPointsGivenLatLong(latLong);
    if(stopPoints === null) return null;
    stopPoints.sort((a, b) => a.distance - b.distance);
    const nearestTwoStops = stopPoints.slice(0,2);
    var arrivals: ArrivalInfo[][] = [];
    nearestTwoStops.forEach(async (item) => {
        var tempArrivals = await getArrivalsGivenStopPoint(item.naptanId);
        if(tempArrivals === null) return null;
        arrivals.push(tempArrivals);
    });
    return arrivals;
}

async function getArrivalsGivenStopPoint(stopPoint: string): Promise<ArrivalInfo[] | null> {
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

async function getStopPointsGivenLatLong(latLong: number[]): Promise<stopPoint[] | null> {
    try {
        const stopType = "NaptanPublicBusCoachTram";
        const latLongResponse = await axios.get(`https://api.tfl.gov.uk/StopPoint/?lat=${latLong[0]}&lon=${latLong[1]}&stopTypes=${stopType}&app_key=${api_key}`);
        console.log(latLongResponse.data)
        const {stopPoints} = latLongResponse.data;
        return stopPoints.map((item:any): stopPoint => {
            const {naptanId, distance} = item;
            return {naptanId, distance};
        });
    } catch(error) {
        console.log(error);
        return null;
    }
}

async function getLatLongGivenPostCode(postCode: string): Promise<number[] | null> {
    try {
        const postCodeResponse = await axios.get(`https://api.postcodes.io/postcodes/${postCode}`);
        console.log(postCodeResponse.data);
        console.log(postCodeResponse.data.result.latitude);
        console.log(postCodeResponse.data.result.longitude);
        var {latitude, longitude} = postCodeResponse.data.result;
        console.log(latitude);
        console.log(longitude);
        var latLong: number[] = [];
        latLong[0] = latitude;
        latLong[1] = longitude;
        console.log(latLong);
        return latLong;
    } catch(error) {
        console.log(error);
        return null;
    }
}