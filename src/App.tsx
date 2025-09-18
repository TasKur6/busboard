import { useState } from "react";
import { getArrivalsGivenPostCode } from "../backend/fetchArrivals";
import type { StopArrivals } from "../backend/typeDefinitions";

function App() {
  const [arrivalsData, setArrivalsData] = useState<StopArrivals[] | string>();
  const [postcodeInput, setPostcodeInput] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPostcodeInput(event.target.value);
  };

  async function handleSubmit() {
    if(postcodeInput === "") {
      setArrivalsData("No postcode entered! Please enter a postcode first.");
      return;
    }
    const response = await getArrivalsGivenPostCode(postcodeInput);
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
        <h1 className="text-3xl font-bold text-center text-cyan-600 m-8"
        >BusBoard</h1>
        <div className="text-center border-black">
          <input
            className="p-2 m-12 text-center border-black"
            type="text"
            value={postcodeInput}
            placeholder="Type here..."
            onChange={handleChange}
          />
          <button className="underline text-white px-4 py-2 bg-cyan-600 rounded" onClick={handleSubmit}>Search</button>
        </div>
        <div className="m-12 text-center">
          {arrivalsData === undefined && (
            <p>Please enter a postcode and click Search.</p>
          ) }
          {typeof arrivalsData === 'string' && (
            <p className="text-red-500">{arrivalsData}</p>
          )}
          {Array.isArray(arrivalsData) && arrivalsData.length > 0 && arrivalsData.map((row, rowIndex) => (
              <div key={rowIndex} className="m-12 border-2 border-black rounded-xl"><p className="text-xl text-cyan-700">{row.stopName}</p>
                <ol className="list-decimal list-inside mx-auto text-left pl-4 w-fit">
                  {row.arrivals.length>0 && row.arrivals.map((item, colIndex) => (
                    <li key={colIndex}>{item.lineName} to {item.destinationName} via {item.towards}, {item.timeToStationMinutes}m </li>
                  ))}
                </ol>
              </div>
          ))}
        </div>
        </>
  )
}
export default App