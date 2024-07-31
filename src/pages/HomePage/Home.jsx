import React from "react";
import NavBar from "./NavBar";
import Section1 from "./Section1";
import Section2 from "./Section2";
import Footer from "./Footer";
import NotificationsPage from "./NotificationsPage";
// Assuming you have a CSS file for global styles

export default function Home({ darkMode, toggleDarkMode }) {
  return (
    <div className={`home-container ${darkMode ? "dark" : ""}`}>
      <NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Section1 darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Section2 darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Footer darkMode={darkMode} />
    </div>
  );
}
