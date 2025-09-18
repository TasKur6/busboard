import axios from 'axios';

export type ArrivalInfo = {
    stationName: string;
    lineName: string;
    destinationName: string;
    timeToStationMinutes: string;
    towards: string;
}

type stopPoint = {
    naptanId: string;
    distance: number;
}

export async function getArrivalsGivenPostCode(postCode: string): Promise<ArrivalInfo[][] | string | null> {
    const latLong = await getLatLongGivenPostCode(postCode);
    if(latLong === null) return "Invalid Postcode";
    const stopPoints = await getStopPointsGivenLatLong(latLong);
    if(stopPoints === null) return "Bus Stops not found";

    //Sort bus stops by nearest to farthest
    stopPoints.sort((a, b) => a.distance - b.distance);

    //Get the two nearest bus stops
    const nearestTwoStops = stopPoints.slice(0,2);

    //Get bus arrival information for each of the bus stops
    const arrivalsPotential = await Promise.all(
        nearestTwoStops.map(async (item) => {
        const tempArrivals = await getArrivalsGivenStopPoint(item.naptanId);
        return tempArrivals ?? []; // return empty array if null
        })
    );

    //Checking for empty arrays in case of null return from API call
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

    //Sort bus arrivals by earliest to latest
    response.data.sort((a: { timeToStation: number; }, b: { timeToStation: number; }) => a.timeToStation - b.timeToStation);

    //Get the first five buses at given stop
    const firstFiveRows = response.data.slice(0,5);

    //Return as ArrivalInfo type
    return firstFiveRows.map((item: any): ArrivalInfo => {
        const {stationName, lineName, destinationName, timeToStation, towards} = item;

        //timeToStation gives a value whose unit is seconds, so convert this to a readable string of the form 'Xm Ys'
        const timeToStationMinutes = `${Math.floor(timeToStation/60)}m ${timeToStation%60}s`;
        return {stationName, lineName, destinationName, timeToStationMinutes, towards};
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

        //Get stopPoints list from total JSON data
        const {stopPoints} = latLongResponse.data;

        //Return as stopPoint type
        return stopPoints.map((item: any): stopPoint => {
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

        //Get latitude and longitude from total JSON data
        const {latitude, longitude} = postCodeResponse.data.result;

        //Return as a number array
        const latLong: number[] = [];
        latLong[0] = latitude;
        latLong[1] = longitude;
        console.log(latLong);
        return latLong;
    } catch(error) {
        console.log(error);
        return null;
    }
}