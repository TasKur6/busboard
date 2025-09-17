import { useState } from "react";
import { getArrivalsGivenPostCode, type ArrivalInfo } from "../backend/fetchArrivals";

function App() {
  const [arrivalsData, setArrivalsData] = useState<ArrivalInfo[][] | string>();
  const [text, setText] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  async function handleSubmit() {
    const response = await getArrivalsGivenPostCode(text);
    console.log(response);
    if(response === null) {
      setArrivalsData("Arrivals not found");
    }
    else {
      setArrivalsData(response);
    }
  }

  return (
        <>
        <h1 className="text-3xl font-bold underline text-center text-cyan-600 m-4"
        >BusBoard</h1>
        <input
          className="m-12"
          type="text"
          value={text}
          placeholder="Type here..."
          onChange={handleChange}
        />
        <button className="underline text-cyan-600" onClick={handleSubmit}>Submit</button>
        <div className="m-12">
          {arrivalsData === undefined && (
            <p>Please enter a postcode and click Submit.</p>
          ) }
          {typeof arrivalsData === 'string' && (
            <p className="text-red-500">{arrivalsData}</p>
          )}
          {Array.isArray(arrivalsData) && arrivalsData.length > 0 && arrivalsData.map((row, rowIndex) => (
              <div key={rowIndex}>Bus Stop {rowIndex+1}
                <ul>
                  {row.length>0 && row.map((item, colIndex) => (
                    <li key={colIndex}>Stop: {item.stationName},    Route: {item.towards},     Destination: {item.destinationName},     Time Until Arrival: {item.timeToStationMinutes} </li>
                  ))}
                </ul>
              </div>
          ))}
        </div>
        </>
  )
}
export default App