import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing in .env");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName: uri.split("/").pop() });
  console.log("MongoDB connected");
}
