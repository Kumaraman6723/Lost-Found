import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import MainLogo from "../../Images/ncu.png";
import MainLogoDark from "../../Images/ncuDark.png";
import "./Footer.css";

export default function Footer({ darkMode }) {
  return (
    <footer
      className={`py-8 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="footer-container">
          <div className="footer-item">
            <img
              src={darkMode ? MainLogoDark : MainLogo}
              alt="Logo"
              className="w-32 h-auto mb-6"
            />
            <p
              className={`text-lg flex items-center ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <FaMapMarkerAlt className="mr-2" /> Sector-23 A, Gurugram, Haryana
            </p>
          </div>

          <div className="footer-item">
            <h5
              className={`footer-title text-2xl ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Download & Projects
            </h5>
            <ul
              className={`footer-links text-lg ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <li>
                <a href="#" className="hover:text-gray-400">
                  Android App
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400">
                  iOS App
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400">
                  Desktop
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400">
                  Projects
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400">
                  My Tasks
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-item">
            <h5
              className={`footer-title text-2xl ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Help & Documentation
            </h5>
            <ul
              className={`footer-links text-lg ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <li>
                <a href="#" className="hover:text-gray-400">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400">
                  Reporting
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400">
                  Support Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400">
                  Privacy
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-item">
            <h5
              className={`footer-title text-2xl ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Follow Us
            </h5>
            <div className="footer-social flex space-x-4">
              <a
                href="#"
                className={`hover:text-gray-400 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="#"
                className={`hover:text-gray-400 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="#"
                className={`hover:text-gray-400 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>

        <hr
          className={`footer-divider ${
            darkMode ? "border-gray-600" : "border-gray-300"
          }`}
        />

        <div className="footer-bottom">
          <p
            className={`text-lg flex items-center ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            <FaEnvelope className="mr-2" /> For any queries:
            <a
              href="mailto:ncu@ncuindia.edu"
              className="hover:text-gray-300 hover:underline"
            >
              ncu@ncuindia.edu
            </a>
          </p>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            &copy; The NorthCap University {new Date().getFullYear()}. All
            Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
