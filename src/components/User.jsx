import { useEffect } from "react";
import { useAuth } from "../contexts/FakeAuthContext";
import styles from "./User.module.css";
import { useNavigate } from "react-router-dom";

function User() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleClick() {
    logout();
  }

  useEffect(
    function () {
      if (!isAuthenticated) navigate("/");
    },
    [isAuthenticated, navigate]
  );

  return (
    <div className={styles.user}>
      <img src={user?.avatar} alt={user?.name} />
      <span>Welcome, {user?.name}</span>
      <button onClick={handleClick}>Logout</button>
    </div>
  );
}

export default User;
