const express = require('express');
const { Pool, Client } = require('pg')
const connectionString = 'postgresql://vriddhi:wu19013fbcihbch1@35.207.200.26:5432/vriddhi'
let oldDate;
const CronJob = require('cron').CronJob;
const job = new CronJob('0 */10 * * * *', function() {
	oldDate = new Date();
	console.log('Every Tenth Minute:', oldDate);
});
job.start();
// Create an Express object and routes (in order)
const app = express();

const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
app.get('/', (req, res)=>{
  try{
    let arr = [];
        const [datasets] = await bigquery.getDatasets();
        for(let dataset of datasets){
            let obj = {dataset:dataset.id, tables:[]}
            let [tables] = await dataset.getTables();
            obj.tables = tables.map(e=> e.id);
            arr.push(obj);
        }
        return res.send({ success: true, data:arr });
  }catch(err){
        return res.send({ success: true, err:err });
  }
})
app.get('/users', (req, res)=>{
  const pool = new Pool({
      connectionString,
  })
  pool.query('SELECT NOW()', (err, data) => {
      res.status(200).json({rows:data.rows, newDate:new Date(), oldDate});
      pool.end()
  })
});

// Set our GCF handler to our Express app.
exports.helloWorld = app;
