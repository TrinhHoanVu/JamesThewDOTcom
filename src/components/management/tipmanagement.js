import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import $ from "jquery";
import 'datatables.net-dt/css/dataTables.dataTables.css';
import "datatables.net";
import "../../css/management/tip-magenement.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import TipEditForm from "./tip-edit";
import AddTip from "../tips/add-tip";
import Swal from 'sweetalert2';
import { FaCheck } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";

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
    const [editTable, setEditTable] = useState(false);
    const [idTip, setIdTip] = useState(0);
    const [addTipTable, setAddTipTable] = useState(false);
    const [checkedState, setCheckedState] = useState();
    const [selectedTip, setSelectedTip] = useState([]);


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
            if (tips.length > 0) {
                setTimeout(() => {
                    $("#contestTable").DataTable({
                        destroy: true,
                        pageLength: 5,
                        lengthMenu: [5, 10],
                    });
                }, 500);
            }
            setCheckedState(new Array(tips.length).fill(false));
        } catch (err) {
            console.log(err);
        }
    }, [tips]);

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
            console.log(tips)
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

    const handleEdit = (idTip) => {
        setEditTable(true)
        setIdTip(idTip)
    }

    const handleDelete = (idTip, name) => {
        try {
            Swal.fire({
                title: `Delete ${name}?`,
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await axios.delete(`http://localhost:5231/api/Tips/delete/${idTip}`);
                        localStorage.setItem("managementTab", "tip");
                        Swal.fire('Deleted!', 'The contest has been deleted.', 'success').then(() => {
                            window.location.reload();
                        });
                    } catch (err) {
                        Swal.fire('Error!', 'Failed to delete the contest. Please try again.', 'error');
                    }
                }
            });
        } catch (err) {
            console.log(err)
        }
    }

    const handleAddTip = () => {
        try {
            setAddTipTable(true)
        } catch (err) { console.log(err) }
    }

    const reloadTips = async () => {
        try {
            await fetchTips();
        } catch (er) { console.log(er) }
    };

    const selectTips = (index) => {
        try {
            setCheckedState((prevState) => {
                const updatedState = [...prevState];
                updatedState[index] = !prevState[index];
                return updatedState;
            });

            setSelectedTip((prevSelectedTips) => {
                let updatedTips;


                const isTipSelected = prevSelectedTips.some(tip => tip.name === tips[index].name);

                if (isTipSelected) {
                    updatedTips = prevSelectedTips.filter(tip => tip.name !== tips[index].name);
                } else {
                    updatedTips = [...prevSelectedTips, tips[index]];
                    if (updatedTips.length > 3) updatedTips = updatedTips.slice(1);
                }

                if (updatedTips.length === 0) {
                    setAddTipTable(false);
                }

                return updatedTips;
            });
        } catch (err) {
            console.log(err);
        }
    };

    const handleApprove = async () => {
        try {
            const tipsToApprove = selectedTip.filter(tip => !tip.isApproved);

            if (tipsToApprove.length === 0) {
                Swal.fire('No action needed', 'All selected tips are already approved.', 'info');
                return;
            }

            const approveRequests = tipsToApprove.map(tip =>
                axios.put(`http://localhost:5231/api/Tips/approve/${tip.idTip}`)
            );

            await Promise.all(approveRequests);

            Swal.fire('Success', 'Selected tips have been approved.', 'success');
            reloadTips();
        } catch (err) {
            console.log(err);
            Swal.fire('Error', 'Failed to approve tips. Please try again.', 'error');
        }
    };

    const handleClear = () => {
        setSelectedTip([])
        setCheckedState(new Array(tips.length).fill(false));
    }

    return (
        <div className="contest-management-body">
            <h1 className="contest-management-title">Tip Management</h1>
            <div className="contest-management-container">
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="contest-management-error-message">{error}</p>
                ) : (
                    <table id="contestTable" className="display" style={{ backgroundColor: "transparent" }}>
                        <thead>
                            <tr>
                                <th></th>
                                <th style={{ width: "10%" }}>Name</th>
                                <th>Description</th>
                                <th>Approved</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tips.map((tip, index) => (
                                <tr key={index}>
                                    <td style={{ textAlign: "center" }} onClick={() => selectTips(index)}>
                                        {checkedState[index] ? <FaCheck /> : <div></div>}
                                    </td>
                                    <td style={{ cursor: "pointer" }}>
                                        {tip.name}
                                    </td>
                                    <td className="price" style={{ textAlign: "left" }}>
                                        {tip.decription && tip.decription.length > 250 ?
                                            tip.decription.substring(0, 250) + "..." :
                                            tip.decription || "No description available"}
                                    </td>
                                    <td>
                                        {tip.isApproved ? "Approved" : "Not Approved"}
                                    </td>
                                    <td style={{ cursor: "pointer", textAlign: "right" }}>
                                        {tip.isPublic ? "Public" : "Private"}
                                    </td>
                                    <td className="actions">
                                        <>
                                            <FaEdit
                                                className="contest-action-icon edit-icon"
                                                onClick={() => handleEdit(tip.idTip)}
                                                title="Edit"
                                                style={{ cursor: "pointer" }}
                                            />
                                            <FaTrash
                                                className="contest-action-icon delete-icon"
                                                onClick={() => handleDelete(tip.idTip, tip.name)}
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

                <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                    <button className="compare-button" onClick={() => handleAddTip()}><FaPlus /> Add</button>
                    <button className="compare-button" onClick={() => handleApprove()}><FaCheck /> Approve</button>
                    <button className="compare-button" onClick={() => handleClear()}><FaTimes /> Clear</button>
                </div>

                {editTable && (
                    <div className="edit-modal-overlay">
                        <div className="edit-modal">
                            <TipEditForm idTip={idTip} onClose={() => setEditTable(false)} reloadTips={reloadTips} />
                            <button className="close-modal-button" onClick={() => setEditTable(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
                {addTipTable && (
                    <div className="edit-modal-overlay">
                        <div className="edit-modal">
                            <AddTip onClose={() => setAddTipTable(false)} reloadTips={reloadTips} IsApproved={true} />
                            <button className="close-modal-button" onClick={() => setAddTipTable(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TipManagement;
