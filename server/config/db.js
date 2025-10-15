import mongoose from "mongoose"; 

export async function connectDB(params) {
    mongoose.connection.on('connected',()=>{
        console.log("DB Connected")
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/Cisco`)
}
