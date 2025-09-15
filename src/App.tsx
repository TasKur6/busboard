import { useState } from "react";
import { getArrivals, type ArrivalInfo } from "../backend/fetchArrivals";
function App() {
  const [arrivalsData, setArrivalsData] = useState<ArrivalInfo[]>();
  const [text, setText] = useState("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };
  async function handleSubmit() {
    const response = await getArrivals(text);
    console.log(response);
    if(response === null) {
      setArrivalsData([]);
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
          <ul>
            {arrivalsData && arrivalsData!.map((item, index) => (
              <li key={index}>Route: {item.towards},     Destination: {item.destinationName},     Time Until Arrival: {item.timeToStationMinutes} </li>
            ))}
          </ul>
        </div>
        </>
  )
}
export default App