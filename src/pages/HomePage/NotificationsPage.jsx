import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { selectUser } from "../../redux/userSlice";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NotificationsPage = ({ darkMode }) => {
  const user = useSelector(selectUser);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/reports", {
          headers: {
            Authorization: `Bearer ${user.token}`,
            email: user.email,
          },
        });

        let userNotifications;
        if (user.role === "admin") {
          userNotifications = response.data.filter(
            (notification) => notification.claimedBy
          );
        } else {
          userNotifications = response.data.filter(
            (report) =>
              (report.reportType === "lost" &&
                report.user.email === user.email &&
                report.claimedBy) ||
              (report.reportType === "found" && report.claimedBy === user.email)
          );
        }

        setNotifications(userNotifications);

        // Mark notifications as read
        for (const notification of userNotifications) {
          if (!notification.read) {
            await axios.put(
              `http://localhost:8000/api/reports/notification/${notification._id}/read`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                  email: user.email,
                },
              }
            );
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <div
      className={`flex flex-col min-h-screen ${
        darkMode ? "dark bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <NavBar darkMode={darkMode} />
      <div className="container mx-auto py-4">
        <h2 className="text-2xl font-semibold mb-4"></h2>
        <ToastContainer />

        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-card ${
                  darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
                } shadow-md rounded-lg p-4`}
              >
                <div className="flex items-start">
                  <img
                    src={notification.images[0]}
                    alt="Report"
                    className="w-20 h-20 object-cover rounded-md mr-4"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-2">
                      Item Name: {notification.itemName}
                    </h3>
                    <p className="mb-2">
                      Description: {notification.description}
                    </p>
                    {notification.reportType === "lost" ? (
                      <p>
                        Your lost item has been claimed by:{" "}
                        {notification.claimedBy}
                      </p>
                    ) : (
                      <div>
                        <p>You have claimed this found item.</p>
                        {notification.claimedByDetails && (
                          <div className="mt-2">
                            <h4 className="font-semibold">Claimed By:</h4>
                            <p>Name: {notification.claimedByDetails.name}</p>
                            <p>
                              Contact: {notification.claimedByDetails.contact}
                            </p>
                          </div>
                        )}
                        {notification.responseMessage && (
                          <div
                            className={`mt-2 p-4 ${
                              darkMode
                                ? "bg-green-900 border-green-700 text-green-300"
                                : "bg-green-100 border-green-500 text-green-600"
                            } border rounded-lg`}
                          >
                            <h4 className="font-semibold">Response Message</h4>
                            <p>{notification.responseMessage}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>No notifications</div>
        )}
      </div>
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default NotificationsPage;
