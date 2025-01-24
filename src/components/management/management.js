import React, { useState, useEffect } from "react";
import "../../css/management/management.css";
import { useNavigate } from "react-router-dom";
import AccountDetail from "./accountDetail";
import ContestManagement from "./contestmanagement";
import TipManagement from "./tipmanagement";
import RecipeManagement from "./recipemanagement";


const Management = (isProfile, isContest, isRecipe, isTip) => {
  const [contestStatus, setContestStatus] = useState(isContest);
  const [tipStatus, setTipStatus] = useState(isTip);
  const [recipeStatus, setRecipeStatus] = useState(isRecipe);
  const [profileStatus, setProfileStatus] = useState(isProfile);

  const navigate = useNavigate();

  useEffect(() => {
    handleChangeProfile();
  }, []);

  const handleChangeContest = () => {
    setContestStatus(true);
    setRecipeStatus(false);
    setTipStatus(false)
    setProfileStatus(false)
  }

  const handleChangeRecipe = () => {
    setContestStatus(false);
    setRecipeStatus(true);
    setTipStatus(false)
    setProfileStatus(false)
  }

  const handleChangeTip = () => {
    setContestStatus(false);
    setRecipeStatus(false);
    setTipStatus(true)
    setProfileStatus(false)
  }

  const handleChangeProfile = () => {
    setContestStatus(false);
    setRecipeStatus(false);
    setTipStatus(false)
    setProfileStatus(true)
  }

  const logOut = () => {
    localStorage.removeItem("inforToken");
    navigate("/login")
  }
  return (
    <div className="manage-panel">
      <div className="management-slide">
        <div className="management-title">MANAGEMENT</div>
        <div className="management-slide-option">
          <div className="management-item" onClick={handleChangeProfile}>Profile</div>
          <div className="management-item" onClick={handleChangeContest}>Contest</div>
          <div className="management-item" onClick={handleChangeRecipe}>Recipe</div>
          <div className="management-item" onClick={handleChangeTip}>Tip</div>
          <div className="management-item" onClick={logOut}>Log out</div>
        </div>
      </div>
      <div className="management-function">
        {profileStatus && (<div><AccountDetail /></div>)}
        {contestStatus && (<div><ContestManagement /></div>)}
        {recipeStatus && (<div><RecipeManagement /></div>)}
        {tipStatus && (<div><TipManagement /></div>)}
      </div>
    </div>
  );
};

export default Management;
