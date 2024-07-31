import React from "react";
import "./Section1.css";

// Import images
import laptopImage from "../../Images/laptop.webp";
import notebookGif from "../../Images/notebook.gif";
import audiblesGif from "../../Images/audibles.gif";
import bottleGif from "../../Images/bottle.gif";
import tiffinGif from "../../Images/tiffin.gif";

import cardGif from "../../Images/card.gif";
import walletGif from "../../Images/wallet.gif";
import bagGif from "../../Images/bag.gif";

const Section1 = ({ darkMode }) => {
  return (
    <section className={`section-container ${darkMode ? "dark" : "light"}`}>
      <div className="container">
        <div className="item item1">
          <img src={laptopImage} alt="Laptop" className="laptop" />
        </div>
        <div className="item item2">
          <img
            src={notebookGif}
            alt="Notebook"
            className="notebook gif-image"
          />
        </div>
        <div className="item item3">
          <img
            src={audiblesGif}
            alt="Audibles"
            className="audibles gif-image"
          />
        </div>
        <div className="item item4">
          <img src={bottleGif} alt="Bottle" className="bottle gif-image" />
        </div>
        <div className="container1">
          <h1 className="lost">LOST AND FOUND</h1>
        </div>
        <div className="item item5">
          <img src={tiffinGif} alt="Tiffin" className="tiffin gif-image" />
        </div>
        <div className="item item7">
          <img src={cardGif} alt="Cards" className="cards gif-image" />
        </div>
        <div className="item item8">
          <img src={walletGif} alt="Wallet" className="wallet gif-image" />
        </div>
        <div className="item item9">
          <img src={bagGif} alt="Bag" className="bag gif-image" />
        </div>
      </div>
    </section>
  );
};

export default Section1;
