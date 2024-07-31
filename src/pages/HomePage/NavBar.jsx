import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, setUser } from "../../redux/userSlice";
import mainLogo from "../../Images/ncu.png"; // light mode logo
import darkLogo from "../../Images/ncuDark.png"; // dark mode logo
import { FaSun, FaMoon, FaBell } from "react-icons/fa";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./Section2.css";

export default function NavBar({ darkMode, toggleDarkMode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState("user");

  const getUserInitials = (user) => {
    if (user && user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return "";
  };

  const handleLogout = () => {
    dispatch(setUser(null));
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    toast.success("Logged out successfully", {
      autoClose: 2000,
      onClose: () => navigate("/"),
    });
  };

  const handleLoginSuccess = async (response) => {
    try {
      const { credential } = response;
      const res = await axios.post("http://localhost:8000/api/auth/login", {
        token: credential,
        role, // Send the selected role to the backend
      });
      dispatch(setUser(res.data.user));
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("isLoggedIn", true);
      toast.success("Logged in successfully", {
        autoClose: 1000,
        onClose: () => navigate("/home"),
      });
    } catch (error) {
      console.error("Error during login", error);
      toast.error("Login failed", {
        autoClose: 2000,
      });
    }
  };

  const handleLoginFailure = (error) => {
    console.error("Google login failed", error);
    toast.error("Login failed", {
      autoClose: 2000,
    });
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      dispatch(setUser(savedUser));
    }
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get(
            "http://localhost:8000/api/reports/user",
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
                email: user.email,
              },
            }
          );
          const unreadNotifications = response.data.filter(
            (notification) => notification.claimedBy && !notification.read
          );
          setNotifications(response.data);
          setUnreadCount(unreadNotifications.length);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };
      fetchNotifications();
    }
  }, [user]);

  const handleBellClick = () => {
    navigate("/notifications");
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <GoogleOAuthProvider clientId="860312032073-8mfimrab6r5t9e09hj8ibl0n498tmf9g.apps.googleusercontent.com">
        <nav
          className={`py-2 px-4 shadow ${
            darkMode
              ? "bg-gray-800 text-white border-b border-gray-700"
              : "bg-white text-black border-b border-gray-300"
          }`}
        >
          <div className="container mx-auto navbar-container">
            <NavLink to="/" className="navbar-logo">
              <img
                src={darkMode ? darkLogo : mainLogo}
                alt="logo"
                className="w-24 h-auto"
              />
            </NavLink>

            <div className="navbar-links">
              <NavLink
                to="/"
                className={`${darkMode ? "text-white" : "text-black"}`}
              >
                HOME
              </NavLink>
              <NavLink
                to="/LostItems"
                className={`${darkMode ? "text-white" : "text-black"}`}
              >
                LOST ITEMS
              </NavLink>
              <NavLink
                to="/FoundItems"
                className={`${darkMode ? "text-white" : "text-black"}`}
              >
                FOUND ITEMS
              </NavLink>
              <NavLink
                to="/Report"
                className={`${darkMode ? "text-white" : "text-black"}`}
              >
                REPORT
              </NavLink>
            </div>

            <div className="navbar-icons">
              <div className="relative">
                <FaBell
                  className={`text-2xl ${
                    darkMode ? "text-white" : "text-black"
                  } cursor-pointer`}
                  onClick={handleBellClick}
                />
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {unreadCount}
                  </div>
                )}
              </div>
              <button
                onClick={toggleDarkMode}
                className={`text-2xl focus:outline-none ml-4 ${
                  darkMode ? "text-white" : "text-black"
                }`}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
              {user ? (
                <div className="relative">
                  <div
                    className="flex items-center space-x-2 cursor-pointer ml-4"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="user-initials">{getUserInitials(user)}</div>
                    <span
                      className={`text-lg ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    >
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  {dropdownOpen && (
                    <div
                      className={`absolute right-0 mt-2 py-2 w-48 rounded-lg shadow-xl ${
                        darkMode ? "bg-gray-700 text-white" : "bg-white text-black"
                      }`}
                    >
                      <NavLink
                        to="/EditProfile"
                        className={`block px-4 py-2 ${
                          darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                        }`}
                      >
                        Edit Profile
                      </NavLink>
                      <NavLink
                        to="/MyListings"
                        className={`block px-4 py-2 ${
                          darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                        }`}
                      >
                        My Reports
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-2 ${
                          darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                        }`}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`p-2 border ${
                      darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginFailure}
                  />
                </div>
              )}
            </div>
          </div>
        </nav>
      </GoogleOAuthProvider>
    </>
  );
}

