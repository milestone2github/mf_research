const mongoose = require("mongoose")

const connectiontomongo = async()=>{
  try {
    const connect = await mongoose.connect("mongodb+srv://MacApp:NSyBdyxvQma9q7eS@milestone.wftaulr.mongodb.net/mfresearchusers")
    if(connect){
        console.log("Successfully connected to database mfresearchusers ");
    }
    else{
        throw new Error("Error occured while connecting to database")
    }
  } catch (error) {
        console.log("Error occured while connecting to database : ", error);
  }
}

module.exports = connectiontomongo