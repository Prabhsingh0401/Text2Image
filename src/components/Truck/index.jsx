import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import './index.scss';
import { useUser } from '@clerk/clerk-react';
import Dashboard from '../../assets/Dashboard icon.png';
import { FaArrowsAltV, FaLocationArrow } from 'react-icons/fa';

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

export default function TruckDashboard() {
    const { user } = useUser();
    const [location, setLocation] = useState('');
    const [destination, setDestination] = useState('');
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [isLocationSelecting, setIsLocationSelecting] = useState(false);
    const [isDestinationSelecting, setIsDestinationSelecting] = useState(false);
    const [isLiveLocationUsed, setIsLiveLocationUsed] = useState(false);

    const locationInputRef = useRef(null);
    const destinationInputRef = useRef(null);

    const handleRouteOptimization = () => {
        const start = encodeURIComponent(location);
        const end = encodeURIComponent(destination);
        const url = `https://www.google.com/maps/dir/?api=1&origin=${start}&destination=${end}`;
        window.open(url, '_blank');
    };

    const getLiveLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const liveLocation = `${latitude},${longitude}`;
                    setLocation(liveLocation);
                    setIsLiveLocationUsed(true);
                    setLocationSuggestions([]);
                },
                (error) => {
                    console.error('Error getting live location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    const handleLocationSelection = (suggestion) => {
        setLocation(suggestion.display_name);
        setLocationSuggestions([]);
        setIsLocationSelecting(false);
    };

    const handleDestinationSelection = (suggestion) => {
        setDestination(suggestion.display_name);
        setDestinationSuggestions([]);
        setIsDestinationSelecting(false);
    };

    const swapLocations = () => {
        const temp = location;
        setLocation(destination);
        setDestination(temp);
    };

    const fetchLocationSuggestions = async (input) => {
        if (input.length < 2) {
            setLocationSuggestions([]);
            return;
        }

        try {
            const response = await axios.get(`https://api.locationiq.com/v1/autocomplete.php?key=YOUR_API_KEY&q=${input}`);
            setLocationSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
        }
    };

    const fetchDestinationSuggestions = async (input) => {
        if (input.length < 2) {
            setDestinationSuggestions([]);
            return;
        }

        try {
            const response = await axios.get(`https://api.locationiq.com/v1/autocomplete.php?key=YOUR_API_KEY&q=${input}`);
            setDestinationSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching destination suggestions:', error);
        }
    };

    const debouncedFetchLocationSuggestions = debounce(fetchLocationSuggestions, 300);
    const debouncedFetchDestinationSuggestions = debounce(fetchDestinationSuggestions, 300);

    useEffect(() => {
        if (location) {
            debouncedFetchLocationSuggestions(location);
        } else {
            setLocationSuggestions([]);
        }
    }, [location]);

    useEffect(() => {
        if (destination) {
            debouncedFetchDestinationSuggestions(destination);
        } else {
            setDestinationSuggestions([]);
        }
    }, [destination]);

    return (
        <div className="truck-index-page">
            <h1>Greetings, {user ? user.firstName : "Guest"}</h1>
            <h2 className="h2">Dashboard <img src={Dashboard} alt="Dashboard icon" /></h2>
            <p className="main-heading1">
                Designed for optimal route planning, it offers real-time updates ensuring that drivers receive the most efficient and accurate navigation, minimizing delays and fuel consumption.
                <br></br><br></br>
                Whether navigating through congested areas or remote highways, it provides a seamless solution for truck drivers to find the quickest and most reliable route to their destination.
            </p>
            <div className="form-container">
                <form>
                    <label>Current Location:</label>
                    <div className="input-wrapper">
                        <input
                            ref={locationInputRef}
                            type="text"
                            value={location}
                            onChange={(e) => {
                                setLocation(e.target.value);
                                setIsLocationSelecting(false);
                                setIsLiveLocationUsed(false); // Reset live location usage
                            }}
                            placeholder="Enter current location"
                            className="autocomplete-input"
                            onBlur={() => {
                                if (!isLocationSelecting) setLocationSuggestions([]);
                            }}
                            onFocus={() => setIsLocationSelecting(true)}
                        />
                        <FaLocationArrow
                            className="live-location-icon"
                            onClick={getLiveLocation}
                        />
                        {locationSuggestions.length > 0 && !isLocationSelecting && !isLiveLocationUsed && (
                            <ul
                                className="autocomplete-suggestions location-suggestions"
                                style={{ top: `${locationInputRef.current.offsetHeight}px` }}
                                onMouseDown={() => setIsLocationSelecting(true)}
                            >
                                {locationSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onMouseDown={() => handleLocationSelection(suggestion)}
                                    >
                                        {suggestion.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <FaArrowsAltV
                        className="swap-locations-icon"
                        onClick={swapLocations}
                    />

                    <label>Destination Location:</label>
                    <div className="input-wrapper">
                        <input
                            ref={destinationInputRef}
                            type="text"
                            value={destination}
                            onChange={(e) => {
                                setDestination(e.target.value);
                                setIsDestinationSelecting(false);
                                setIsLiveLocationUsed(false); // Reset live location usage
                            }}
                            placeholder="Enter destination"
                            className="autocomplete-input"
                            onBlur={() => {
                                if (!isDestinationSelecting) setDestinationSuggestions([]);
                            }}
                            onFocus={() => setIsDestinationSelecting(true)}
                        />
                        {destinationSuggestions.length > 0 && !isDestinationSelecting && !isLiveLocationUsed && (
                            <ul
                                className="autocomplete-suggestions destination-suggestions"
                                style={{ top: `${destinationInputRef.current.offsetHeight}px` }}
                                onMouseDown={() => setIsDestinationSelecting(true)}
                            >
                                {destinationSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onMouseDown={() => handleDestinationSelection(suggestion)}
                                    >
                                        {suggestion.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button type="button" onClick={handleRouteOptimization}>Get Optimized Route</button>
                </form>
            </div>
        </div>
    );
}
