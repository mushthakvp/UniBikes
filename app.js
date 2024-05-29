const express = require("express");
const app = express();
const connectDB = require("./connection/mongoConnection");
const cors = require("cors");
const morgan = require("morgan");
const colors = require("colors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
dotenv.config({ path: "/.env" });
app.use(bodyParser.json({ limit: "1000mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "1000mb", extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
connectDB();
app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ extended: true, limit: "1000mb" }));
const mongoose = require("mongoose");

const hostName = process.env.HOST_NAME || "localhost";
const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server running at ${hostName}:${port}/`.yellow);
});

app.post("/register", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const user = await login.findOne({ mobileNumber: mobileNumber });
    await login.create({ mobileNumber: mobileNumber });
    if (user) {
      if (user.isRegistered) {
        return res.status(200).json({
          message: "User already registered",
          isRegistered: true,
          mobileNumber,
          id: user._id,
        });
      } else {
        return res.status(200).json({
          message: "User not registered",
          isRegistered: false,
          mobileNumber,
          id: user._id,
        });
      }
    } else {
      return res.status(200).json({
        message: "User not registered",
        isRegistered: false,
        mobileNumber,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/create-profile", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    console.log(req.body);
    const user = await login.findOne({ mobileNumber: mobileNumber });
    if (!user) {
      return res.status(200).json({ message: "User not registered" });
    }
    user.profilePicture = req.body.profilePicture;
    user.fullName = req.body.fullName;
    user.hostelName = req.body.hostelName;
    user.gender = req.body.gender;
    user.departMent = req.body.departMent;
    user.isRegistered = true;
    user.collegeId = req.body.collegeId;
    await user.save();
    return res
      .status(200)
      .json({ message: "Profile created successfully", id: user._id });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/create-ride", async (req, res) => {
  try {
    const rideModel = new ride({ ...req.body });
    await rideModel.save();
    return res.status(200).json({ message: "Ride created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/get-rides", async (req, res) => {
  try {
    const { startPoint, endPoint } = req.body;
    if (startPoint || endPoint) {
      const rides = await ride
        .find({
          startPoint: startPoint,
          endPoint: endPoint,
        })
        .populate("userId")
        .populate("showIntrests");
      return res.status(200).json({ rides });
    } else {
      const rides = await ride.find().populate("userId");
      console.log(rides);
      return res.status(200).json({ rides });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/get-user", async (req, res) => {
  try {
    const { id } = req.body;
    const user = await login.findOne({ _id: id });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/get-my-rides", async (req, res) => {
  try {
    const { id } = req.body;
    const rides = await ride
      .find({ userId: id })
      .populate("userId")
      .populate("showIntrests");
    res.status(200).json({ rides });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/show-intrest", async (req, res) => {
  try {
    const { id, rideId } = req.body;
    const rideData = await ride.findOne({ _id: rideId });
    rideData.showIntrests.push(id);
    await rideData.save();
    res.status(200).json({ message: "Intrest shown successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

const loginModel = new mongoose.Schema({
  mobileNumber: {
    type: Number,
    default: null,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  fullName: {
    type: String,
    default: null,
  },
  gender: {
    type: String,
    default: null,
  },
  hostelName: {
    type: String,
    default: null,
  },
  departMent: {
    type: String,
    default: null,
  },
  isRegistered: {
    type: Boolean,
    default: false,
  },
  collegeId: {
    type: String,
    default: "NIT Warangal",
  },
});

const login = mongoose.model("login", loginModel);

const rideModel = new mongoose.Schema({
  startPoint: {
    type: String,
    default: null,
  },
  endPoint: {
    type: String,
    default: null,
  },
  startTime: {
    type: String,
    default: null,
  },
  genderPreference: {
    type: String,
    default: null,
  },
  vehicleType: {
    type: String,
    default: null,
  },
  phoneNumber: {
    type: Number,
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "login",
  },
  showIntrests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "login",
    },
  ],
});

const ride = mongoose.model("ride", rideModel);
