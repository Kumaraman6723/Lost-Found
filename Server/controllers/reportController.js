const Report = require("../models/Report");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const createReport = async (req, res) => {
  const {
    reportType,
    location,
    itemName,
    category,
    date,
    description,
    images,
  } = req.body;

  try {
    const uploadedImages = await Promise.all(
      images.map((image) =>
        cloudinary.uploader.upload(image, { folder: "lost-found" })
      )
    );
    const imageUrls = uploadedImages.map((result) => result.secure_url);

    const user = await User.findOne({ email: req.headers.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newReport = new Report({
      reportType,
      location,
      itemName,
      category,
      date,
      description,
      images: imageUrls,
      user: user._id,
    });

    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(500).json({ message: "Error creating report" });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("user", "email");
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error });
  }
};

const getReportsByUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.headers.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reports = await Report.find({ user: user._id });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error });
  }
};

const editReport = async (req, res) => {
  const { id } = req.params;
  const { itemName, location, category, date, description, images } = req.body;

  try {
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const user = await User.findOne({ email: req.headers.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is an admin
    if (
      user.role === "admin" ||
      report.user.toString() === user._id.toString()
    ) {
      let imageUrls = report.images;

      if (images && images.length > 0) {
        const uploadedImages = await Promise.all(
          images.map((image) => {
            if (typeof image !== "string") {
              throw new Error("Invalid image format");
            }
            return cloudinary.uploader.upload(image, { folder: "lost-found" });
          })
        );

        imageUrls = uploadedImages.map((result) => result.secure_url);
      }

      report.itemName = itemName;
      report.location = location;
      report.category = category;
      report.date = date;
      report.description = description;
      report.images = imageUrls;

      const updatedReport = await report.save();
      res.status(200).json(updatedReport);
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error updating report" });
  }
};

const deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const deletedReport = await Report.findByIdAndDelete(reportId);

    if (!deletedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const claimReport = async (req, res) => {
  const { id } = req.params;
  const { email } = req.headers;

  try {
    const report = await Report.findById(id).populate("user");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.claimedBy) {
      return res.status(400).json({ message: "Item already claimed" });
    }

    const claimingUser = await User.findOne({ email });

    if (!claimingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (report.user.email === claimingUser.email) {
      return res.status(400).json({ message: "You can't claim your own item" });
    }

    report.claimedBy = claimingUser.email;
    report.read = false; // Ensure the notification is unread initially
    if (report.reportType === "found") {
      report.responseMessage =
        "You can claim your item from the security room.";
    }

    const updatedReport = await report.save();

    let mailOptions;
    if (report.reportType === "lost") {
      mailOptions = {
        from: process.env.MAIL_USER,
        to: report.user.email,
        subject: "Your Lost Item has been Claimed",
        text: `Hello ${report.user.firstName},\n\nYour lost item "${report.itemName}" has been claimed by ${claimingUser.firstName} ${claimingUser.lastName} (Email: ${claimingUser.email}).\n\nPlease contact the security office to retrieve your item.\n\nBest regards,\nYour Lost and Found Team`,
      };
    } else if (report.reportType === "found") {
      mailOptions = {
        from: process.env.MAIL_USER,
        to: claimingUser.email,
        subject: "Your Found Item has been Located",
        text: `Dear ${claimingUser.firstName},\n\nYour item "${report.itemName}" has been found by ${report.user.firstName} ${report.user.lastName} (Email: ${report.user.email}).\n\nPlease contact the security office to retrieve your item.\n\nBest regards,\nYour Lost and Found Team`,
      };
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(200).json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: "Error claiming report", error });
  }
};

const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`Marking notification as read for report id: ${id}`);
    const report = await Report.findById(id);

    if (!report) {
      console.error("Report not found");
      return res.status(404).json({ message: "Report not found" });
    }

    report.read = true;
    await report.save();

    console.log("Notification marked as read");
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error marking notification as read" });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportsByUser,
  editReport,
  deleteReport,
  claimReport,
  markNotificationAsRead,
};
