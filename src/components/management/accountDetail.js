import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../../context/DatabaseContext";
import { Country, State, City } from 'country-state-city';
import "../../css/management/account-profile.css"

function AccountDetail() {
    const { tokenInfor, setTokenInfor } = useContext(DataContext);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const isUser = tokenInfor?.role;
    const email = tokenInfor?.email;
    const [loggedUser, setLoggedUser] = useState([]);

    const [countries, setCountries] = useState(Country.getAllCountries());
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);

    const [initialLoadState, setInitialLoadState] = useState(true);
    const [initialLoadCity, setInitialLoadCity] = useState(true);

    const [showSelectBoxes, setShowSelectBoxes] = useState(false);

    useEffect(() => {
        fetchAccountData();
    }, [])

    const fetchAccountData = async () => {
        try {
            const respone = await axios.get(`http://localhost:5231/api/Account/${tokenInfor.email}`);
            setLoggedUser(respone.data);
            setName(respone.data.name);
            setAddress(respone.data.address);
            setPhoneNumber(respone.data.phoneNumber);
        } catch (err) {
            console.log(err)
        }
    }

    const handleCountryChange = (country) => {
        if (!country) return;

        setSelectedCountry(country);

        const statesOfCountry = State.getStatesOfCountry(country.isoCode);
        setStates(statesOfCountry);

        setSelectedState(null);
        setCities([]);

        if (statesOfCountry.length > 0) {
            const firstState = statesOfCountry[0];
            setSelectedState(firstState);


            const citiesOfState = City.getCitiesOfState(country.isoCode, firstState.isoCode);
            setCities(citiesOfState);

            if (citiesOfState.length > 0) {
                setInitialLoadCity(false);
                setSelectedCity(citiesOfState[0])
            }
        }

        setInitialLoadState(false);
    };

    const handleStateChange = (state) => {
        if (!state) return;

        setSelectedState(state);

        const citiesOfState = City.getCitiesOfState(selectedCountry.isoCode, state.isoCode);
        setCities(citiesOfState);

        if (citiesOfState.length > 0) {
            setInitialLoadCity(false);
            setSelectedCity(citiesOfState[0])
        } else {
            setInitialLoadCity(true);
        }
    };

    const handleChangeAddress = () => {
        setShowSelectBoxes(true)
    }

    const handleUpdateAddress = () => {
        setShowSelectBoxes(false)

        if (selectedCity == null) {
            return
        }

        if (selectedCity == null) {
            setAddress(selectedCity.name + ", " + selectedState.name)
        } else {
            setAddress(selectedCity.name + ", " + selectedState.name + ", " + selectedCity.name)
        }
        setShowSelectBoxes(false)
    }

    async function handleUpdateProfile(e) {
        e.preventDefault();

        try {
            await axios.put("http://localhost:5231/api/Account/updateProfile", { email, name, address, phoneNumber })
                .then(res => {
                    if (res.status === 200) {
                        alert("Profile updated successfully!");
                    }
                })
                .catch(err => console.log(err))
        } catch (err) {
            console.log(err)
        }
    }
    return (
        <div className="profile-container">
            <div className="profile-box">
                <h1 className="title">Account Profile</h1>
                <p className="subtitle">Manage your account information</p>
                <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            readOnly
                            value={tokenInfor.email}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={phoneNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                if (value.length <= 10) {
                                    setPhoneNumber(value);
                                }
                            }}
                            placeholder="Enter your phone number"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={address}
                            placeholder="Enter your address"
                            onClick={handleChangeAddress}
                            onChange={(e) => { }}
                        />

                        {showSelectBoxes && (<div className="container">
                            <div className="row custom-row">
                                <select
                                    className="form-select"
                                    onChange={(e) =>
                                        handleCountryChange(
                                            countries.find((c) => c.isoCode === e.target.value)
                                        )
                                    }>
                                    <option value="">Select Country</option>
                                    {countries.map((country) => (
                                        <option key={country.isoCode} value={country.isoCode}>
                                            {country.name}
                                        </option>

                                    ))}

                                </select>
                                <select
                                    disabled={!selectedCountry}
                                    className="form-select"
                                    onChange={(e) =>
                                        handleStateChange(
                                            states.find((s) => s.isoCode === e.target.value)
                                        )
                                    }>
                                    {initialLoadState && <option value="">Select State</option>}
                                    {states.map((state) => (
                                        <option key={state.isoCode} value={state.isoCode}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    disabled={!selectedState || !selectedCountry}
                                    className="form-select"
                                    value={selectedCity?.name || ""}
                                    onChange={(e) => {
                                        const city = cities.find((c) => c.name === e.target.value);
                                        setSelectedCity(city);
                                    }}>

                                    {initialLoadCity && <option value="">Select City</option>}

                                    {cities.map((city) => (
                                        <option key={city.name} value={city.name}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={handleUpdateAddress}
                                    className="updateAddress">
                                    Update Address
                                </button>
                            </div>
                        </div>)}
                    </div>
                    {isUser === 'USER' && (<div className="form-group">
                        <label htmlFor="expiredDay">Expired Day</label>
                        <input
                            type="text"
                            readOnly
                            id="expiredDay"
                            name="expiredDay"
                            value={tokenInfor?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/expired"]}
                        />
                    </div>)}
                    <button type="submit" className="profile-button">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AccountDetail