import { useState } from "react";
import { getPostCodeArrivals } from "../backend/fetchArrivals";
import type { StopArrivals } from "../backend/typeDefinitions";

function App() {
  const [arrivalsData, setArrivalsData] = useState<StopArrivals[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [postcodeInput, setPostcodeInput] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPostcodeInput(event.target.value);
  };

  async function handleSubmit() {
    try {
      if(postcodeInput === "") {
        setErrorMessage("No postcode entered! Please enter a postcode first.");
        setArrivalsData([]);
        return;
      }
      const response = await getPostCodeArrivals(postcodeInput);
      console.log(response);
      if(response === null) {
        setErrorMessage("Arrivals not found");
        setArrivalsData([]);
      }
      else {
        setArrivalsData(response);
        setErrorMessage("");
      }
    } catch(error) {
      const errMsg = (error instanceof Error) ? error.message : String(error);
      setErrorMessage(errMsg);
      setArrivalsData([]);
    }
  }

  const errorPresent = errorMessage !== "";
  const arrivalsPresent = arrivalsData.length > 0;

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
          {!errorPresent && !arrivalsPresent && (
            <p>Please enter a postcode and click Search.</p>
          ) }
          {errorPresent ? (
            <p className="text-red-500">{errorMessage}</p>
          ) :
          arrivalsPresent && arrivalsData.map((row, rowIndex) => (
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