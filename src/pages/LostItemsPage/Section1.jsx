import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { deleteReport, updateReport } from "../../redux/reportSlice";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Lost({ darkMode }) {
  const [search, setSearch] = useState("");
  const [selectCategory, setSelectCategory] = useState("All");
  const [lostItems, setLostItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editData, setEditData] = useState({});
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchLostItems() {
      try {
        const response = await axios.get("http://localhost:8000/api/reports");
        const lostItems = response.data.filter(
          (item) => item.reportType === "lost"
        );
        setLostItems(lostItems);
        setFilteredItems(lostItems);
      } catch (error) {
        console.error("Error fetching lost items:", error);
      }
    }
    fetchLostItems();
  }, [user]);


  useEffect(() => {
    const searchTerm = search.toLowerCase();
    let filtered = lostItems.filter((item) =>
      item.itemName.toLowerCase().includes(searchTerm)
    );

    switch (selectCategory) {
      case "latest":
        filtered = filtered.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        break;
      case "oldest":
        filtered = filtered.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        break;
      case "claimed":
        filtered = filtered.filter(item => item.claimedBy);
        break;
      case "unclaimed":
        filtered = filtered.filter(item => !item.claimedBy);
        break;
      default:
        break;
    }

    setFilteredItems(filtered);
  }, [search, lostItems, selectCategory]);


  const handleDelete = async (id) => {
    if (!id) {
      console.error("Invalid ID provided for deletion:", id);
      return;
    }
    try {
      await axios.delete(`http://localhost:8000/api/reports/${id}`, {
        headers: { Email: user.email },
      });
      dispatch(deleteReport(id));
      // Assuming `setLostItems` and `setFilteredItems` update the local state
      setLostItems((prevItems) => prevItems.filter((item) => item._id !== id));
      setFilteredItems((prevItems) => prevItems.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };
  
  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentItem(item);
    setEditData({
      itemName: item.itemName,
      location: item.location,
      category: item.category,
      date: item.date,
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
        reader.readAsDataURL(file); // Ensure this reads the file as a base64 string
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
        user: currentItem.user, // Ensure the user object is retained
      };

      const response = await axios.put(
        `http://localhost:8000/api/reports/${currentItem._id}`,
        updatedData,
        {
          headers: {
            Email: user.email,
          },
        }
      );

      dispatch(updateReport(response.data));
      setIsEditing(false);
      setCurrentItem(null);
      setLostItems((prevItems) =>
        prevItems.map((item) =>
          item._id === response.data._id
            ? { ...response.data, user: item.user }
            : item
        )
      );
      setFilteredItems((prevItems) =>
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

  const handleClaim = async (item) => {
    if (user) {
      if (item.user.email === user.email) {
        toast.error("You can't claim your own item");
        return;
      }
      try {
        console.log(`Claiming item with id: ${item._id}`);
        const response = await axios.post(
          `http://localhost:8000/api/reports/${item._id}/claim`,
          {},
          {
            headers: { Email: user.email },
          }
        );
        console.log("Claim response:", response.data);
        setLostItems(
          lostItems.map((i) => (i._id === item._id ? response.data : i))
        );
        setFilteredItems(
          filteredItems.map((i) => (i._id === item._id ? response.data : i))
        );
        toast.success("Item claimed successfully!");
      } catch (error) {
        console.error("Error claiming item:", error);
        toast.error("Error claiming item.");
      }
    } else {
      console.error("User is not logged in.");
      toast.error("You need to be logged in to claim an item.");
    }
  };

  return (
    <div
      className={`flex flex-col items-center py-10 px-4 w-full ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Lost Inventory</h1>
        <h6 className="text-lg text-gray-600">List of items that are lost</h6>
        <form onSubmit={(e) => e.preventDefault()} className="mt-4">
          <div className="flex items-center justify-center space-x-2">
            <input
              type="text"
              placeholder="Search Item"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search"
              className={`p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 w-80 ${
                darkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            />
            <button
              type="submit"
              className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
            >
              <FaSearch />
            </button>
          </div>
        </form>
      </div>
      <div className="flex space-x-4 mb-8">
        {[
          { name: "Specs", imgSrc: "./src/Assets/image 20.png" },
          { name: "Key", imgSrc: "./src/Assets/image 21.png" },
          { name: "Bag", imgSrc: "./src/Assets/image 29.png" },
          { name: "Mobile", imgSrc: "./src/Assets/image 31.png" },
          { name: "Purse", imgSrc: "./src/Assets/image 37.png" },
        ].map((category, index) => (
          <button key={index} className="flex flex-col items-center">
            <img
              src={category.imgSrc}
              alt={category.name}
              className="w-16 h-16 mb-2"
            />
            <h1 className="text-lg">{category.name}</h1>
          </button>
        ))}
      </div>
      <div className="w-full flex justify-center mb-8">
        <form onSubmit={(e) => e.preventDefault()}>
          <select
            className={`p-2 rounded-md ${
              darkMode
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-black"
            }`}
            id="sortId"
            value={selectCategory}
            onChange={(e) => setSelectCategory(e.target.value)}
          >
            <option value="All">ALL</option>
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="claimed">Claimed</option>
            <option value="unclaimed">Unclaimed</option>
          </select>
        </form>
      </div>
<div className="w-full flex flex-wrap justify-center space-y-6 px-4">
  {filteredItems.length > 0 ? (
    filteredItems.map((item) => (
      <div
        key={item._id}
        className={`flex items-start p-4 rounded-lg shadow-lg w-full max-w-4xl ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex-none w-40 h-40 mr-8">
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt="Lost item"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-lg">
              No Image
            </div>
          )}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-2xl font-semibold">{item.itemName}</h3>
            {item.claimedBy ? (
              <span className="text-sm text-green-500">
                Claimed by: {item.claimedBy}
              </span>
            ) : (
              user && (
                <button
                  className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  onClick={() => handleClaim(item)}
                >
                  Claim
                </button>
              )
            )}
          </div>
        
          <p className="text-gray-500">
            <span className="font-semibold">Location:</span> {item.location}
          </p>
          <p className="text-gray-500">
            <span className="font-semibold">Date:</span> {new Intl.DateTimeFormat('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(item.date))}
          </p>
          <p className="text-gray-500">
            <span className="font-semibold">Description:</span> {item.description}
          </p>
          <p className="text-gray-500">
            <span className="font-semibold">Category:</span> {item.category}
          </p>
          <div className="flex justify-end mt-4 space-x-2">
            {(user && (user.role === "admin" || item.user.email === user.email)) && (
              <>
                <button
                  className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
                <button
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    ))
  ) : (
    <p className="text-xl text-gray-500">No items found.</p>
  )}
</div>


      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`p-6 rounded-lg shadow-lg w-full max-w-lg ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-2xl font-semibold mb-4">Edit Item</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  name="itemName"
                  value={editData.itemName}
                  onChange={handleEditChange}
                  className={`p-2 rounded-md w-full ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={editData.location}
                  onChange={handleEditChange}
                  className={`p-2 rounded-md w-full ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>
              <div className="mb-4">
  <label className="block text-sm font-medium mb-1">Date</label>
  <input
    type="date"
    name="date"
    value={new Date(editData.date).toISOString().split('T')[0]}
    onChange={handleEditChange}
    className={`p-2 rounded-md w-full ${
      darkMode
        ? "bg-gray-700 border-gray-600 text-white"
        : "bg-white border-gray-300 text-black"
    }`}
  />
</div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  className={`p-2 rounded-md w-full ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
                  className={`p-2 rounded-md w-full ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`p-2 rounded-md w-full ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
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
