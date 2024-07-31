import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { deleteReport, updateReport } from "../../redux/reportSlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css";

export default function Section1({ darkMode }) {
  const user = useSelector(selectUser);
  const [listings, setListings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      console.error("User not authenticated");
      toast.error("User not authenticated");
      return;
    }

    async function fetchListings() {
      try {
        console.log("Fetching listings for user:", user._id);
        const response = await axios.get(
          `http://localhost:8000/api/reports/user`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              email: user.email,
            },
          }
        );
        console.log("Listings fetched successfully:", response.data);
        setListings(response.data);
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast.error("An error occurred while fetching your listings.");
      }
    }

    fetchListings();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      console.log("Deleting listing with id:", id);
      await axios.delete(`http://localhost:8000/api/reports/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          email: user.email,
        },
      });
      setListings(listings.filter((listing) => listing._id !== id));
      dispatch(deleteReport(id));
      toast.success("Listing deleted successfully.");
      console.log("Listing deleted successfully.");
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("An error occurred while deleting the listing.");
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentItem(item);
    const formattedDate = new Date(item.date).toISOString().split("T")[0];
    setEditData({
      itemName: item.itemName,
      location: item.location,
      category: item.category,
      date: formattedDate,
      description: item.description,
      images: [],
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const readerPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readerPromises)
      .then((images) => {
        setEditData((prevData) => ({
          ...prevData,
          images,
        }));
      })
      .catch((error) => {
        console.error("Error reading images:", error);
      });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...editData,
        user: currentItem.user,
      };

      const response = await axios.put(
        `http://localhost:8000/api/reports/${currentItem._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            Email: user.email,
          },
        }
      );

      // Ensure response.data contains _id
      if (response.data && response.data._id) {
        dispatch(updateReport(response.data));
      } else {
        console.error("Response data is missing _id:", response.data);
      }

      setIsEditing(false);
      setCurrentItem(null);
      setListings((prevItems) =>
        prevItems.map((item) =>
          item._id === response.data._id
            ? { ...response.data, user: item.user }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentItem(null);
    setEditData({});
  };

  return (
    <div
      className={`flex flex-col items-center py-10 px-4 w-full ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <ToastContainer />
      <h1 className="text-4xl font-bold mb-8">My Listings</h1>
      <div className="w-full flex flex-wrap justify-center space-y-6 px-4">
        {listings.length > 0 ? (
          listings.map((listing) => (
            <div
              key={listing._id}
              className={`flex items-start p-4 rounded-lg shadow-lg w-full max-w-4xl ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
            >
              <div className="flex-none w-40 h-40 mr-8">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.itemName}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <img
                    src="/mnt/data/image.png"
                    alt="No image available"
                    className="w-full h-full object-cover rounded-md"
                  />
                )}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <h1 className="text-2xl font-bold mb-2">
                    {listing.itemName}
                  </h1>
                  {listing.claimedBy && (
                    <span className="text-sm text-green-500">
                      Claimed by: {listing.claimedBy}
                    </span>
                  )}
                </div>
                <p className="mb-4">{listing.description}</p>
                <div className="text-sm mb-4">
                  <p>
                    <strong>Category:</strong> {listing.category}
                  </p>
                  <p>
                    <strong>Location:</strong> {listing.location}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(listing.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                  {!listing.claimedBy && (
                    <>
                      <button
                        className={`px-4 py-2 rounded-md flex items-center ${
                          darkMode
                            ? "bg-indigo-600 hover:bg-indigo-700"
                            : "bg-indigo-500 hover:bg-indigo-600"
                        } text-white`}
                        onClick={() => handleEdit(listing)}
                      >
                        <FaEdit className="mr-2" /> Edit
                      </button>
                      <button
                        className={`px-4 py-2 rounded-md flex items-center ${
                          darkMode
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-red-500 hover:bg-red-600"
                        } text-white`}
                        onClick={() => handleDelete(listing._id)}
                      >
                        <FaTrash className="mr-2" /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No listings found.</p>
        )}
      </div>
      {isEditing && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 ${
            darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
        >
          <div
            className={`p-8 rounded-lg shadow-lg w-full max-w-4xl ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <h2 className="text-2xl font-bold mb-4">Edit Listing</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="itemName"
                  className="block text-sm font-semibold"
                >
                  Item Name
                </label>
                <input
                  type="text"
                  id="itemName"
                  name="itemName"
                  value={editData.itemName}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600 focus:border-indigo-500"
                      : "border-gray-300 focus:border-blue-300"
                  } focus:outline-none focus:ring`}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="location"
                  className="block text-sm font-semibold"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={editData.location}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600 focus:border-indigo-500"
                      : "border-gray-300 focus:border-blue-300"
                  } focus:outline-none focus:ring`}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600 focus:border-indigo-500"
                      : "border-gray-300 focus:border-blue-300"
                  } focus:outline-none focus:ring`}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-semibold">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={editData.date}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600 focus:border-indigo-500"
                      : "border-gray-300 focus:border-blue-300"
                  } focus:outline-none focus:ring`}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600 focus:border-indigo-500"
                      : "border-gray-300 focus:border-blue-300"
                  } focus:outline-none focus:ring`}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="images" className="block text-sm font-semibold">
                  Images
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600 focus:border-indigo-500"
                      : "border-gray-300 focus:border-blue-300"
                  } focus:outline-none focus:ring`}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md ${
                    darkMode
                      ? "bg-gray-500 hover:bg-gray-600"
                      : "bg-gray-300 hover:bg-gray-400"
                  } text-white`}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md ${
                    darkMode
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-blue-300 hover:bg-blue-400"
                  } text-white`}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
