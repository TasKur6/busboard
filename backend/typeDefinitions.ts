export type ArrivalInfo = {
    stationName: string;
    lineName: string;
    destinationName: string;
    timeToStation: number;
    towards: string;
}

export type StopPoint = {
    naptanId: string;
    commonName: string;
    distance: number;
}

export type location = {
    latitude: number;
    longitude: number;
}

export type StopArrivals = {
  stopName: string;
  arrivals: ArrivalInfo[];
}