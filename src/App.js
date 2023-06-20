import './App.css';
import { useEffect, useState } from 'react';
import Map from 'Map';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const [title, setTitle] = useState("Don't be late")
  document.title = title;

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route index element={<Map />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

/* <section>
          <div className='loadingBar'></div> 
          <div className='coverLoad'></div>
        </section> */
        /* <Map /> */