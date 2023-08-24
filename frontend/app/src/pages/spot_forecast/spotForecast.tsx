import './style/spotForecast.css'
import SpotHeader from './spotHeader'
import ForecastDays from './forecastDays'
import DayForecast from './dayForecast'
import GeneralNavbar from './generalNavbar'
import TideForecast from './tideForecast'
import TideChart from './tideChart'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SpotForecast() {
    
    // Obtain spot specified in URL.
    const queryParameters = new URLSearchParams(window.location.search)
    const spot = queryParameters.get("spot")
    const navigate = useNavigate()
    !spot ? navigate('/forecast?spot=salt_creek') : null

    // Declare state variables. 
    const [waveData, setWaveData] = useState(null)
    const [windData, setWindData] = useState(null)
    const [ratingData, setRatingData] = useState(null)
    const [tideData, setTideData] = useState(null)
    const [currTide, setCurrTide] = useState(null)
    const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to trigger component remount
    const [minTimestamp, setMinTimestamp] = useState(0)
    const [maxTimestamp, setMaxTimestamp] = useState(0)
    const [maxHeight, setMaxHeight] = useState(0)
    const [currDay, setCurrday] = useState(0)

    // Fetch wave data from API.
    useEffect(() => {
        fetch(`https://goldfish-app-qsewy.ondigitalocean.app/wave?spot=${spot}`)
          .then(response => response.json())
          .then(data => {
            setWaveData(data);
            // Find the maximum height and update maxHeight state.
            let maxFoundHeight = 0;
            for (const dataPoint of data) {
                const currentHeight = dataPoint.surf.rawSurf.rawMax;
                if (currentHeight > maxFoundHeight) {
                    maxFoundHeight = currentHeight;
                }
            }
            setMaxHeight(maxFoundHeight)
          })
          .catch(error => console.log(error))
      }, [spot]);
      
    // Fetch rating data from API. 
    useEffect(() => {
        fetch(`https://goldfish-app-qsewy.ondigitalocean.app/rating?spot=${spot}`)
          .then(response => response.json())
          .then(data => {
            setRatingData(data);
          })
          .catch(error => console.log(error))
      }, [spot]);

    // Fetch tide data from API.
    useEffect(() => {
        fetch(`https://goldfish-app-qsewy.ondigitalocean.app/tide?spot=${spot}`)
          .then(response => response.json())
          .then(data => {
            setTideData(data)
          })
          .catch(error => console.log(error))
    }, [spot])

    // Fetch wind data from API.
    useEffect(() => {
        fetch(`https://goldfish-app-qsewy.ondigitalocean.app/wind?spot=${spot}`)
          .then(response => response.json())
          .then(data => {
            setWindData(data)
          })
          .catch(error => console.log(error))
    }, [spot])



    function changeCurrDay(minTimestamp, maxTimestamp, month, day) {
        setMinTimestamp(minTimestamp)
        setMaxTimestamp(maxTimestamp)
        setCurrday(`${month} ${day.toString()}`)
    }

    function changeSpot(path){
        if (spot == path) {
            return;
        }
        else {
        setRefreshKey(refreshKey + 1); // Increment the refresh key
        setWaveData(null)
        setTideData(null)
        navigate(`/forecast?spot=${path}`)
        }
    }
   
    function handleTide(t) {
        setCurrTide(t)
    }

    return (
        <div className="spot--forecast">
            <GeneralNavbar changeSpot={changeSpot} currSpot={spot}/>
            <div className="content">
                <SpotHeader spot={spot} />
                <div className='hero'>
                    <ForecastDays waveData={waveData} ratingData={ratingData} changeCurrDay={changeCurrDay}/>
                </div>
                <div className='hero'>
                    <DayForecast spot={spot} data={waveData} ratingData={ratingData} minTimestamp={minTimestamp} maxTimestamp={maxTimestamp} maxHeight={maxHeight} currDay={currDay}/>
                </div>
                <div className='hero'>
                    <TideForecast spot={spot} handleTide={handleTide} minTimestamp={minTimestamp} maxTimestamp={maxTimestamp} data={tideData} />
                </div>
            </div>
        </div>
    )
}