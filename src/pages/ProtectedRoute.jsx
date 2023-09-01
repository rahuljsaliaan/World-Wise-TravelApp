import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/FakeAuthContext";
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <Navigate to="/" />;

  // alternate solution
  // const navigate = useNavigate();
  // useEffect(
  //   function () {
  //     if (!isAuthenticated) navigate("/");
  //   },
  //   [isAuthenticated, navigate]
  // );
  // return isAuthenticated ? children : null
}

export default ProtectedRoute;
