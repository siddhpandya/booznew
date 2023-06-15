import UserModel from "../models/User.js";
import bcrypt from "bcrypt"; // to encrypt password
import jwt from "jsonwebtoken"; // JSON web token
import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import transporter from "../config/emailConfig.js";
import bikeModel from "../models/bike.js";
import adminsList from "../models/adminList.js";
import ridecost from "../models/bikecost.js";
import discountPrize from "../models/discount.js";
import bikecountModel from "../models/bikecount.js";
import paymentModel from "../models/payments.js";

// logic
let tempOTP;
class UserController {
  // For registration
  static userRegistration = async (req, res) => {
    //object created
    const { name, email, password, password_confirmation } = req.body;

    const user = await UserModel.findOne({ email: email });
    //if user already exist
    if (user) {
      res.send({ status: "failed", message: "Email already exists" });
    } else {
      if (name && email && password && password_confirmation) {
        //checking password confirmation
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            // encrypt password
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashPassword,
            });
            await doc.save();
            const saved_user = await UserModel.findOne({ email: email });
            // Generate JWT Token
            const token = jwt.sign(
              { userID: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            // response for success
            res.status(201).send({
              status: "success",
              message: "Registration Success",
              token: token,
            });
          } catch (error) {
            //if any unexpected error occur
            console.log(error);
            res.send({ status: "failed", message: "Unable to Register" });
          }
        } else {
          res.send({
            status: "failed",
            message: "Password and Confirm Password doesn't match",
          });
        }
      }
      //if any fields are missing
      else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    }
  };

  //login verification
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await UserModel.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            // Generate JWT Token
            const token = jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.send({
              status: "success",
              message: "Login Success",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: "Email or Password is not Valid",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "You are not a Registered User",
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields are Required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to Login" });
    }
  };

  // for future development change password
  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          message: "New Password and Confirm New Password doesn't match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await UserModel.findByIdAndUpdate(req.user._id, {
          $set: { password: newHashPassword },
        });
        res.send({
          status: "success",
          message: "Password changed succesfully",
        });
      }
    } else {
      res.send({ status: "failed", message: "All Fields are Required" });
    }
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  // sending resetn email
  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userID: user._id }, secret, {
          expiresIn: "15m",
        });
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
        console.log(link);
        // // Send Email
        // let info = await transporter.sendMail({
        //   from: process.env.EMAIL_FROM,
        //   to: user.email,
        //   subject: "GeekShop - Password Reset Link",
        //   html: `<a href=${link}>Click Here</a> to Reset Your Password`
        // })
        res.send({
          status: "success",
          message: "Password Reset Email Sent... Please Check Your Email",
        });
      } else {
        res.send({ status: "failed", message: "Email doesn't exists" });
      }
    } else {
      res.send({ status: "failed", message: "Email Field is Required" });
    }
  };

  // reset password
  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await UserModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      jwt.verify(token, new_secret);
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          res.send({
            status: "failed",
            message: "New Password and Confirm New Password doesn't match",
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          await UserModel.findByIdAndUpdate(user._id, {
            $set: { password: newHashPassword },
          });
          res.send({
            status: "success",
            message: "Password Reset Successfully",
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields are Required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Invalid Token" });
    }
  };

  static generateOTP() {
    const digits = "0123456789";
    let OTP = "";

    for (let i = 0; i < 5; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }

    return OTP;
  }

  static othauth = (req, res) => {
    const { userEmail } = req.body;
    console.log(userEmail);
    tempOTP = this.generateOTP();
    let config = {
      service: "gmail",
      auth: {
        user: "node0773@gmail.com",
        pass: "pnzwvdyriuxtauqg",
      },
    };

    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Mailgen",
        link: "https://mailgen.js/",
      },
    });

    let response = {
      body: {
        name: "OTP",
        intro: "OTP",
        table: {
          data: [
            {
              item: "OTP",
              description: "OTP verification",
              OTP_number: tempOTP,
            },
          ],
        },
        outro: "Looking forward to do more business",
      },
    };

    let mail = MailGenerator.generate(response);

    let message = {
      from: "node0773@gmail.com",
      to: userEmail,
      subject: "OTP Verification",
      html: mail,
    };

    transporter
      .sendMail(message)
      .then(() => {
        return res.send({
          status: "success",
          message: "Email Sent... Please Check Your Email",
        });
      })
      .catch((error) => {
        return res.status(500).json({ error });
      });

    // res.status(201).json("getBill Successfully...!");
  };
  static verifyOTP = (req, res) => {
    const { enteredOTP } = req.body;
    console.log(enteredOTP);
    if (tempOTP === enteredOTP) {
      res.send({ status: "success", message: "Successfully Registered" });
    } else {
      res.send({ status: "failed", message: "Registration Failed" });
    }
  };
  static getCurrentTime() {
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    const seconds = currentTime.getSeconds().toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}:${seconds}`;
    return timeString;
  }

  static addUserBike = async (req, res) => {
    try {
      const {
        name,
        email,
        bikeId,
        userId,
        numberOfBike,
        start_time,
        user_email,
      } = req.body;
      const loctemp = await adminsList.findOne({ email: email });
      console.log(loctemp);
      const time = new Date();
      const date = time.toISOString().split("T")[0];
      // const start_time = String(this.getCurrentTime());
      console.log(start_time);

      const userBike = new bikeModel({
        name: name,
        email: email,
        bikeId: bikeId,
        numberOfBike: numberOfBike,
        start_time: start_time,
        date: date,
        userId: userId,
        end_time: "",
        cost: 0,
        location: loctemp.location,
        user_email: user_email,
      });
      // Insert the user bike object into the "bike" collection
      const result = bikeModel.collection.insertOne(userBike);
      // console.log("User bike added successfully:", result.insertedId);

      return res.send({
        status: "Success",
        message: "bike data inserted",
        date: date,
        time: start_time,
      });
    } catch (error) {
      console.error("Error adding user bike:", error);
      throw error;
    }
  };

  static adminLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await adminsList.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            // Generate JWT Token
            const token = jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.send({
              status: "success",
              message: "Login Success",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: "Email or Password is not Valid",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "You are not a Registered User",
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields are Required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to Login" });
    }
  };

  static adminRegistration = async (req, res) => {
    //object created
    const { name, email, password, password_confirmation, location } = req.body;

    const user = await adminsList.findOne({ email: email });
    //if user already exist
    if (user) {
      res.send({ status: "failed", message: "Email already exists" });
    } else {
      if (name && email && password && password_confirmation) {
        //checking password confirmation
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            // encrypt password
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = new adminsList({
              name: name,
              email: email,
              password: hashPassword,
              location: location,
            });
            await doc.save();
            const saved_user = await adminsList.findOne({ email: email });
            // Generate JWT Token
            const token = jwt.sign(
              { userID: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            // response for success
            res.status(201).send({
              status: "success",
              message: "Registration Success",
              token: token,
            });
          } catch (error) {
            //if any unexpected error occur
            console.log(error);
            res.send({ status: "failed", message: "Unable to Register" });
          }
        } else {
          res.send({
            status: "failed",
            message: "Password and Confirm Password doesn't match",
          });
        }
      }
      //if any fields are missing
      else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    }
  };

  static bikecosting = async (req, res) => {
    try {
      const { location, rate, minutes } = req.body;
      if (location && rate && minutes) {
        const loc = await ridecost.findOne({ location: location });
        // console.log(loc);
        if (loc != null) {
          // console.log("in");
          var myquery = { location: location };
          var newvalues = { $set: { rate: rate, minutes: minutes } };
          ridecost.collection.updateOne(myquery, newvalues);
          return res.send({
            status: "updated",
            message: "updated successfully",
          });
        } else {
          const newloc = new ridecost({
            location: location,
            rate: rate,
            minutes: minutes,
          });
          ridecost.collection.insertOne(newloc);
          return res.send({
            status: "inserted",
            message: "inserted successfully",
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields are Required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to identify" });
    }
  };
  static discountprizes = async (req, res) => {
    try {
      const { location, reason, prize } = req.body;
      if (location && reason && prize) {
        const loc = await discountPrize.findOne({ location: location });
        // console.log(loc);
        if (loc != null) {
          // console.log("in");
          var myquery = { location: location };
          var newvalues = { $set: { reason: reason, prize: prize } };
          discountPrize.collection.updateOne(myquery, newvalues);
          return res.send({
            status: "updated",
            message: "updated successfully",
          });
        } else {
          const newloc = new discountPrize({
            location: location,
            reason: reason,
            prize: prize,
          });
          discountPrize.collection.insertOne(newloc);
          return res.send({
            status: "inserted",
            message: "inserted successfully",
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields are Required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to identify" });
    }
  };
  static convertStringToTime(stringTime) {
    const [hours, minutes] = stringTime.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }
  static calculateTimeInterval(startTime, endTime) {
    // Calculate the time difference in milliseconds
    const timeDiff = endTime - startTime;

    // Convert milliseconds to minutes
    const intervalMinutes = Math.floor(timeDiff / (1000 * 60));

    return intervalMinutes;
  }
  static convertStringToTime(stringTime) {
    const [hours, minutes] = stringTime.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  static rideoverpayment = async (req, res) => {
    try {
      const { email, user_email, name, numberOfBike, bikeId, reason } =
        req.body;
      // console.log(email, name, numberOfBike, bikeId, location, reason);
      if (email && name && numberOfBike && bikeId && user_email) {
        // const loctemp = await bikeModel.findOne({ email: email });
        const bike_details = await bikeModel.findOne({
          bikeId: bikeId,
          user_email: user_email,
          email: email,
        });
        const location = bike_details.location;
        // console.log(loctemp);
        const actual_prize = await ridecost.findOne({
          location: location,
        });
        // console.log(actual_prize);

        // console.log(bike_details);
        // console.log("correct2");
        const end_time = bike_details.end_time;
        // console.log(bike_details);
        const discount_check = await discountPrize.findOne({
          location: location,
          reason: reason,
        });
        let cost = 0;
        console.log(
          this.convertStringToTime(bike_details.start_time),
          this.convertStringToTime(end_time)
        );
        let total_time = this.calculateTimeInterval(
          this.convertStringToTime(bike_details.start_time),
          this.convertStringToTime(end_time)
        );
        // console.log(total_time / actual_prize.minutes);
        let total_ride = Math.floor(total_time / actual_prize.minutes);
        // console.log(total_ride);
        if (total_time - total_ride * actual_prize.minutes > 2) {
          total_ride += 1;
        }
        if (discount_check.reason == null) {
          cost = total_ride * actual_prize.rate;
          // console.log(total_ride, actual_prize.rate);
        } else {
          cost = total_ride * actual_prize.rate - discount_check.prize;
          // console.log(total_ride, actual_prize.cost);
        }
        // console.log(total_time);
        // console.log(total_ride);
        // console.log(cost);
        // console.log(cost);
        const update = { $inc: { count: 1 } };
        if (bikeId != null) {
          // console.log("in");
          var myquery = { bikeId: bikeId };
          var newvalues = {
            $set: { end_time: end_time, cost: cost },
          };
          bikeModel.collection.updateOne(myquery, newvalues);
          const bikecount = await bikecountModel.findOne({ bikeId: bikeId });
          if (bikecount != null) {
            bikecountModel.collection.updateOne(myquery, update);
          } else {
            const newloc = new bikecountModel({
              bikeId: bikeId,
              count: 1,
            });
            bikecountModel.collection.insertOne(newloc);
          }
          return res.send({
            status: "updated",
            message: "updated successfully",
            cost: cost,
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields are Required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to identify" });
    }
  };
  static rideover = async (req, res) => {
    try {
      const { email, name, user_email, bikeId, end_time } = req.body;
      // console.log(email, name, numberOfBike, bikeId, location, reason);
      if (email && name && bikeId && user_email) {
        const loctemp = await adminsList.findOne({ email: email });

        // const actual_prize = await ridecost.findOne({
        //   location: loctemp.location,
        // });
        // // console.log("correct1");
        // const bike_details = await bikeModel.findOne({
        //   bikeId: bikeId,
        //   email: email,
        //   user_email: user_email,
        // });
        if (bikeId != null) {
          var myquery = {
            bikeId: bikeId,
            email: email,
            user_email: user_email,
          };
          var newvalues = {
            $set: { end_time: end_time },
          };
          bikeModel.collection.updateOne(myquery, newvalues);
          const bikecount = await bikecountModel.findOne({ bikeId: bikeId });
          if (bikecount != null) {
            bikecountModel.collection.updateOne(myquery, update);
          } else {
            const newloc = new bikecountModel({
              bikeId: bikeId,
              count: 1,
            });
            bikecountModel.collection.insertOne(newloc);
          }
          return res.send({
            status: "updated",
            message: "updated successfully",
            end_time: end_time,
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields are Required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to identify" });
    }
  };

  static getJSONValuesByDate = async (req, res) => {
    const { startDate, endDate, location } = req.body;
    try {
      const query = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
      const results = await bikeModel.collection.find(query).toArray();
      return res.send({
        status: "Send",
        results: results,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  static paymentmethod = async (req, res) => {
    try {
      const { email, name, bikeId, method, user_email } = req.body;
      // console.log(email, name, numberOfBike, bikeId, location, reason);
      const loc = await adminsList.findOne({
        email: email,
      });
      console.log(loc);
      if (email && name && method && bikeId && user_email) {
        const newloc = new paymentModel({
          email: email,
          name: name,
          bikeId: bikeId,
          location: loc.location,
          method: method,
          user_email: user_email,
        });

        paymentModel.collection.insertOne(newloc);
        return res.send({
          status: "success",
          message: method,
        });
      } else {
        res.send({ status: "failed", message: "All Fields are Required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to identify" });
    }
  };
}

export default UserController;
