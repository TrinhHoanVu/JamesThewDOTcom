import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import $ from "jquery";
import 'datatables.net-dt/css/dataTables.dataTables.css';
import "datatables.net";
import "../../css/management/tip-magenement.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";

function useThrottledResizeObserver(callback, delay = 200) {
    const resizeObserverRef = useRef(null);
    const throttledCallbackRef = useRef(null);

    useEffect(() => {
        throttledCallbackRef.current = (entries) => {
            clearTimeout(resizeObserverRef.current);
            resizeObserverRef.current = setTimeout(() => {
                callback(entries);
            }, delay);
        };

        const observer = new ResizeObserver(throttledCallbackRef.current);
        const elementsToObserve = document.querySelectorAll('.contest-management-container'); // Adjust the selector

        elementsToObserve.forEach((element) => {
            observer.observe(element);
        });

        return () => {
            observer.disconnect();
            clearTimeout(resizeObserverRef.current);
        };
    }, [callback, delay]);

    return resizeObserverRef;
}

function TipManagement() {
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accountPostNameList, setAccountPostNameList] = useState({});

    useThrottledResizeObserver(() => {
        try {
            if (tips.length > 0) {
                setTimeout(() => {
                    $("#contestTable").DataTable();
                }, 500);
            }
        } catch (err) { console.log(err) }
    });

    useEffect(() => {
        try {
            fetchTips();
            fetchAccountPost()
        } catch (err) { console.log(err) }
    }, []);

    const fetchTips = async () => {
        try {
            const response = await axios.get("http://localhost:5231/api/Tips/getAll");
            let contestData = response.data.data.$values || [];

            const objectMap = {};

            contestData.forEach((contest) => {
                if (contest.account && contest.account.$ref) {
                    const accountId = contest.account.$ref;
                    if (!objectMap[accountId]) {
                        objectMap[accountId] = contest.account;
                    }
                    contest.account = objectMap[accountId];
                }
            });

            setTips(contestData);
            setLoading(false);
        } catch (err) {
            setError("Failed to load contests. Please try again.");
            setLoading(false);
        }
    };

    const fetchAccountPost = async () => {
        try {
            const response = await axios.get("http://localhost:5231/api/Tips/getAccountNamesFromTips")
            setAccountPostNameList(response.data)
        } catch (err) { console.log(err) }
    }

    const handleEdit = () => {

    }

    const handleDelete = () => {

    }

    const handleAddContest = () => {

    }

    return (
        <div className="contest-management-body">
            <h1 className="contest-management-title">Contest Management</h1>
            <div className="contest-management-container">
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="contest-management-error-message">{error}</p>
                ) : (
                    <table id="contestTable" className="display" style={{ backgroundColor: "transparent" }}>
                        <thead>
                            <tr>
                                <th style={{ width: "10%" }}>Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Account Post</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tips.map((tip) => (
                                <tr key={tip.idTip}>
                                    <td style={{ cursor: "pointer" }}>
                                        {tip.name}
                                    </td>
                                    <td className="price" style={{ textAlign: "right" }}>
                                        {tip.decription && tip.decription.length > 200 ?
                                            tip.decription.substring(0, 200) + "..." :
                                            tip.decription || "No description available"}
                                    </td>
                                    <td style={{ cursor: "pointer", textAlign: "right" }}>
                                        {tip.status ? "Public" : "Private"}
                                    </td>
                                    <td className={`status ${tip.status ? "active" : "inactive"}`} style={{ textAlign: "right" }}>
                                        {accountPostNameList[tip.idAccountPost] || tip.idAccountPost}
                                    </td>
                                    <td className="actions">
                                        <>
                                            <FaEdit
                                                className="contest-action-icon edit-icon"
                                                onClick={() => handleEdit()}
                                                title="Edit"
                                                style={{ cursor: "pointer" }}
                                            />
                                            <FaTrash
                                                className="contest-action-icon delete-icon"
                                                onClick={() => handleDelete()}
                                                title="Delete"
                                                style={{ cursor: "pointer", marginLeft: "20px" }}
                                            />
                                        </>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                )}
                <button className="compare-button" onClick={() => handleAddContest()}><FaPlus /> Add</button>

            </div>
        </div>
    );
}

export default TipManagement;
