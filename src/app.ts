

import express from 'express'
import dotenv from 'dotenv'

const app = express()
app.use(express.json())
dotenv.config()


app.listen(process.env.PORT,()=>{console.log(`App is running on PORT ${process.env.PORT}`)})

export {app}