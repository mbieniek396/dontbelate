import 'Map.css'
import { useEffect } from 'react';
import { GoogleMap, useLoadScript, DirectionsRenderer } from '@react-google-maps/api';
import googleKey from 'googleKey';
import { useState } from 'react';
import rt2 from 'test2Route'; 
import rt from 'testRoute';
import bs from 'busStops'; 
import React from 'react';
import busIcon from './bus.png';

function Map() {

    //// Google key load map, center and response
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: googleKey
    });

    function latLon(la, lo){
        return {lat: la, lng: lo}
    }

    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    const [center, setCenter] = useState(latLon(51.6,17.1));
    const [response, setResponse] = useState(null);
    const [route, setRoute] = useState(null);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [hour, setHour] = useState("00");
    const [minute, setMinute] = useState("00");
    const [busStops, setBusStops] = useState(null);
    const [stopNames, setStopNames] = useState(null);
    const [results, setResults] = useState([]);

    const [sdisplay, setSDispaly] = useState(false);
    const [edisplay, setEDispaly] = useState(false);

    const [rdisplay, setRDisplay] = useState(true);

    function makeStopNames(stops){
        let result = []
        for (let stp of stops){
            if (!result.includes(stp.name)){
                result.push(stp.name)
            }
        }
        console.log(result);
        return result
    }

    useEffect(() => {
        fetch('https://maciekdt.loca.lt/nav/busstopes')
            .then(res => res.json())
            .then(data => {
                setBusStops(data);
                console.log(busStops);
                setStopNames(makeStopNames(data));
            })
            .catch(e => {
                console.log(e);
                setBusStops(bs);
                setStopNames(makeStopNames(bs));
            })
    }, []);

    const findRoutes = (s, e, h, m, c) => {
        if (c <= 0){
            return;
        }
        /// Wyb
        results.push(rt2);
        results.push(rt);
        forceUpdate();
        /// End Wyb
        fetch(`https://maciekdt.loca.lt/nav/connection/${s}/${e}/${h}:${m}:00`)
        .then(res => res.json())
        .then(res => {
            results.push(res);
            forceUpdate()
            m++;
            if (m > 59){
                m = 0
                h++;
            }
            m = m<10 ? `0${m}` : String(m);
            h = h<10 ? `0${h}` : String(h);
            findRoutes(s, e, h, m, c-1)
        })
        .catch(e => console.log(e));
    };



    const search = () => {
        if (start !== "" && end !== "" && hour !== "" && minute !== ""){
            if(stopNames.includes(start) && stopNames.includes(end)){
                let sStop = busStops.filter(el => el.name === start)[0];
                let eStop = busStops.filter(el => el.name === end)[0];
                while(results.length > 0) {
                    results.pop();
                }
                findRoutes(sStop.id, eStop.id, hour, minute, 5);
            }
        }
    };

    const selectRoute = (rut) => {
        setRoute(rut); 
        setCenter(latLon(rut[0].startBustStop.lat, rut[0].startBustStop.lon));
        setRDisplay(true);
    }



    if (!isLoaded){
        return <p>Loading</p>
    } 
    if (route){
        let rLast = route.length-1;

        let waypoints = [];
        for (let i=1; i<rLast; i++){
            waypoints.push({location: {lat: route[i].startBustStop.lat, lng: route[i].startBustStop.lon}})
        }
        
        

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: { lat: route[0].startBustStop.lat, lng: route[0].startBustStop.lon },
                destination: { lat: route[rLast].endBustStop.lat, lng: route[rLast].endBustStop.lon},
                waypoints: waypoints,
                travelMode: 'DRIVING',
            },
            (result, status) => {
            if (status === 'OK') {
                setResponse(result);
            }
            }
        );
    }

    const mapOptions = {
        disableDefaultUI: true, // Turn off all default UI controls
    };

    function getTimeLeft(t1, t2){
        let dep = new Date(Date.parse(`2017-05-02T${t1}`))
        let tt = new Date(Date.parse(`2017-05-02T${t2}`))
        let mils = dep-tt
        return mils / 60000;
    }

    function setStartAuto(val){
        setStart(val);
        setSDispaly(false);
    }

    function setEndAuto(val){
        setEnd(val);
        setEDispaly(false);
    }

    return (
        <div className='map'>
            <aside>
                {rdisplay && 
                <section className='rdisplay'>
                    <article className='xLine'><div onClick={() => setRDisplay(false)} className='x'>X</div></article>
                    <article></article>
                </section>}
                <section className='inputs'>
                    <h1>Don't be late</h1>
                    <article className='wrapInputs'>
                        <label htmlFor="startStop">Przystanek początkowy</label>
                        <section className='startACSection'>
                        <input className='startStop' autocomplete="off" onClick={() => setSDispaly(!sdisplay)} 
                        id="startStop" value={start} onChange={e => setStart(e.target.value)}></input>
                        <div className='autoCompleteStart'>
                            {busStops && sdisplay && stopNames.filter((name) => name.toLowerCase().indexOf(start.toLowerCase()) > -1).map((name) => (
                                <div onClick={() => setStartAuto(name)} className='startACel' key={stopNames.indexOf(name)}>
                                    <p>{name}</p>
                                </div>
                            ))}
                        </div>
                        </section>


                        <label htmlFor="endStop">Przystanek końcowy</label>
                        <section className='startACSection'>
                        <input className='startStop' autocomplete="off" onClick={() => setEDispaly(!edisplay)} 
                        id="endStop" value={end} onChange={e => setEnd(e.target.value)}></input>
                        <div className='autoCompleteStart'>
                        {busStops && edisplay && stopNames.filter((name) => name.toLowerCase().indexOf(end.toLowerCase()) > -1).map((name) => (
                                <div onClick={() => setEndAuto(name)} className='startACel' key={stopNames.indexOf(name)}>
                                    <p>{name}</p>
                                </div>
                            ))}
                        </div>
                        </section>
                        
                        <article className='timeWrapper'>
                        <label htmlFor="time">Czas odjazdu</label>
                        <article className='timeBox'>
                            <input className='hour' id="hour" type='number' min='0' max='23' value={hour} onInput={e => {
                                if (e.target.value >= 0 && e.target.value < 24){
                                    let val = Number(e.target.value);
                                    val = String(val < 10 ? "0"+val : val);
                                    setHour(val)
                                }
                                }}></input>
                            <span>:</span>
                            <input className='minute' id="minute" type='number' min='0' max='59' value={minute} onInput={e => {
                                if (e.target.value >= 0 && e.target.value < 60){
                                    let val = Number(e.target.value);
                                    val = String(val < 10 ? "0"+val : val);
                                    setMinute(val)
                                }
                                }}></input>
                        </article>
                        </article>

                        <button className='search-btn' onClick={search}>Szukaj</button>

                    </article>
                </section>
                <section className='stops'>
                    {results.map((resu) => (
                        <div className='result' onClick={() => selectRoute(resu)}key={results.indexOf(resu)}>
                            <h1>{getTimeLeft(resu[0].connection.departureTime, `${hour}:${minute}:00`)}<span className='min'>min</span></h1>
                            <section className='line'>
                                <h2>{resu[0].line.name}</h2>
                                <img className='bus' src={busIcon}/>
                            </section>
                            <section className='fromTo'>
                                <p className="times">{resu[0].connection.departureTime.slice(0,5)}</p>
                                <p>-</p>
                                <p className="times">{resu[resu.length-1].connection.departureTime.slice(0,5)}</p>
                            </section>
                        </div>
                    ))}
                </section>
            </aside>
            <GoogleMap zoom={15} center={center} options={mapOptions} mapContainerClassName="map-container">
                {response && 
                    <DirectionsRenderer 
                        directions={response}
                        options={{preserveViewport:true}} 
                    />
                }
            </GoogleMap>
        </div>
    );
}

export default Map