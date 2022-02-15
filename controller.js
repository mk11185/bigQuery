const fs = require("fs")
const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
const LineByLineReader = require('line-by-line');
let cols = ['Region', 'Country', 'ItemType', 'SalesChannel', 'OrderPriority', 'OrderDate', 'OrderID', 'ShipDate', 'UnitsSold', 'UnitPrice', 'UnitCost', 'TotalRevenue', 'TotalCost', 'TotalProfit'];
let config = {
    dataset: "vriddhi_staging",
    table: "data_table"
}
module.exports = {
    listDataSet: async (req, res, next) => {
        let arr = [];
        const [datasets] = await bigquery.getDatasets();
        for (let dataset of datasets) {
            let obj = { dataset: dataset.id, tables: [] }
            let [tables] = await dataset.getTables();
            obj.tables = tables.map(e => e.id);
            arr.push(obj);
        }
        return res.send({ success: true, data: arr });
    },

    uploadDataSet: async (req, res, next) => {
        let { path } = req.file;
        let columns = [];
        let data = [];
        // console.log(lines)
        let lr = new LineByLineReader(path, {
            encoding: 'utf8',
            skipEmptyLines: true
        });

        lr.on('error', function (err) {
            // 'err' contains error object
            console.log("error\n\n", err, "\n\n");
        });

        lr.on('line', function (line) {
            // pause emitting of lines...
            lr.pause();
            let row = line.split(",");
            if (!columns.length) {
                columns = row.map(e => e.replace(" ", ""));
                lr.resume();
            } else {
                setTimeout(function () {
                    let obj = {};
                    for (let i = 0; i < columns.length; i++) {
                        obj[columns[i]] = row[i];
                    }
                    data.push(obj)
                    // ...and continue emitting lines.
                    lr.resume();
                }, 100);
            }
            // ...do your asynchronous line processing..
        });

        lr.on('end', async () => {
            // All lines are read, file is closed now.
            try {
                const options = {
                    schema: cols.map(e => { return { name: e.replace(" ", ""), type: 'STRING' } }),
                    location: 'south-asia2',
                };
                // Create a new table in the dataset
                const [table] = await bigquery
                    .dataset(config.dataset)
                    .createTable(config.table, options);
            } catch (error) {
                console.log("Table err", error);
            }
            console.log(data);
            await bigquery
                .dataset(config.dataset)
                .table(config.table)
                .insert(data);
            return res.send({ success: true, data })
        });

    },
    createTable: async (req, res, next) => {
        return res.send({ success: true, table })
        // [END bigquery_create_table]
    },
    loadLocalCsv: async (req, res, next) => {
        let filename = req.file.path
        try {
            const { datasetId, tableId } = req.body
            const [job] = await bigquery
                .dataset(datasetId)
                .table(tableId)
                .load(filename);
            return res.status(200).send({ success: true, message: `Job ${job.id} completed.` });
        }
        catch (error) {
            res.status(500).send({ status: false, error: error.message })
        }
    },
    uploadDataToBigquery: async (req, res) => {
        try {
            
            // let { table_name,
            //     changed_by,
            //     lead_activity_log_id,
            //     field_name,
            //     new_value,
            //     old_value,
            //     DOC,
            //     lead_id } = req.body
            let data = []
            data.push(req.body)
                await bigquery
                .dataset(config.dataset)
                .table(config.table)
                .insert(data);

            return res.status(200).send({success:true,data})
        }
        catch (error) {
            return res.status(500).send({ status: 500, error: error.message })
        }
    }
}