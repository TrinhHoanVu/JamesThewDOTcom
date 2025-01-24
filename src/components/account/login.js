import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../../css/account/login.css";
import { DataContext } from "../../context/DatabaseContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { tokenInfor, setTokenInfor } = useContext(DataContext)
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    
    await axios.post("http://localhost:5231/api/Account/login", { email, password })
      .then(res => {
        if (res.status === 200) {
          console.log("res: ", res);

          localStorage.setItem("inforToken", JSON.stringify(res.data));
          let tokenDecode = jwtDecode(res.data.token);
          console.log("tokenDecode: ", tokenDecode);
          setTokenInfor(tokenDecode)
          const allowedRoles = ["SUPERADMIN", "ADMIN"];

          if (allowedRoles.includes(tokenDecode.role)) {
            navigate("/management", { state: { isProfile: true, isContest: false, isRecipe: false, isTip: false } });
          } else {
            navigate("/")
          }

        }
      })
      .catch(err => {
        const errMes = err.response?.data?.message
        console.log(errMes)
        setErrorMessage(errMes)
      })
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="title">🍳 Cooking Login</h1>
        <p className="subtitle">Welcome to JamesThew's Kitchen!</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {errorMessage && <p className="message">{errorMessage}</p>}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <div className="extra-options">
          <p onClick={() => navigate("/forgot-password")}>
            Forgot your password?
          </p>
          <p onClick={() => navigate("/sign-up")}>
            Don't have an account?
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
