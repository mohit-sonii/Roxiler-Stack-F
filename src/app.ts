
import express from 'express'
import dotenv from 'dotenv'
import userRoutes from "./routes/user.routes"
import ownerRoutes from "./routes/owner.routes"
import adminRoutes from "./routes/admin.routes"
import cookieParser from 'cookie-parser'

const app = express()
app.use(express.json())
app.use(cookieParser())
dotenv.config()



app.use("/u",userRoutes)
app.use("/o",ownerRoutes)
app.use("/a",adminRoutes)

app.listen(process.env.PORT,()=>{console.log(`App is running on PORT ${process.env.PORT}`)})

export {app}