const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  desc:{
    type:String,
    required:true
  },
  categories:[{
    id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    name:{
        type:String,
        required:true
    }
  }]
});
