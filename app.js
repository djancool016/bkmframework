const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()
const PORT = process.env.PORT || 6100
const {router, errRoute} = require('./routes')

const {db, truncateAll} = require('./database').init()
const {migrating, seeding, resetTables} = require('./config')
const {migration} = require('./migrations')
const {seedTables} = require('./seeders')

db.connect()
    .then(async db => {
        if(resetTables) await truncateAll(db)
        if(migrating) await migration(db)
        if(seeding) await seedTables(db)
    })
    .catch(error => console.error(error))

app.use(cookieParser())
app.use(bodyParser.json())
app.use('/api', router)
app.use(errRoute)
app.listen(PORT, () => console.log(`This server is running on port : http://localhost:${PORT}`))