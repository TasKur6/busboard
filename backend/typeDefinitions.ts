export type ArrivalInfo = {
    stationName: string;
    lineName: string;
    destinationName: string;
    timeToStationMinutes: number;
    towards: string;
}

export type StopPoint = {
    naptanId: string;
    distance: number;
}

export type location = {
    latitude: number;
    longitude: number;
}