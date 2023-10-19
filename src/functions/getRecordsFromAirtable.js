//import moment from "moment";



//const dateMinus3D = new Date(moment.utc().subtract(8, 'day').toISOString());

function fetchAirtableData() {
    console.log("fetching Airtable data")
    return new Promise(function(resolve, reject){

    const Airtable = require('airtable');
    const base = new Airtable({apiKey:process.env.VUE_APP_ASSETS_AIR_APIKEY}).base(process.env.VUE_APP_ASSETS_AIR_BASEID);
    let recordArray = [];

    base('Assets').select({
        view: "DMCR PAS",
        filterByFormula: `IF(DATETIME_DIFF(NOW(), CREATED_TIME(), 'days') < 2, "1", "")`
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function(record) {
            recordArray.push(record.get('VIN (IMPO):').toLowerCase());
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();

    }, function done(err) {
        if (err) { console.error(err);reject(err); }
        //console.log("Record Array: " + recordArray)
        resolve(recordArray);
    });
    });
}

module.exports = {
    fetchAirtableData: fetchAirtableData
}