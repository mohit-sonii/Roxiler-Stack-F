
import express from 'express'
import dotenv from 'dotenv'
import userRoutes from "./routes/user.routes"

const app = express()
app.use(express.json())
dotenv.config()


app.use("/u",userRoutes)

app.listen(process.env.PORT,()=>{console.log(`App is running on PORT ${process.env.PORT}`)})

export {app}