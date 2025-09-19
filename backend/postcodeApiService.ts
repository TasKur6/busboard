import axios from 'axios';
import type { location } from './typeDefinitions';

export async function getLatLongGivenPostCode(postCode: string): Promise<location | null> {
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