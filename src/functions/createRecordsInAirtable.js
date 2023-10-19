const Airtable = require('airtable');
// eslint-disable-next-line no-unused-vars
const base = new Airtable({apiKey: process.env.VUE_APP_ASSETS_AIR_APIKEY}).base(process.env.VUE_APP_ASSETS_AIR_BASEID);

function createAirtableRecords(recordArray) {
    console.log("creating records in airtable")
    // eslint-disable-next-line no-unused-vars
    return new Promise(function(resolve, reject) {
        let formattedArray = []
        for (let entry of recordArray) {
            //console.log("Entry: " + JSON.stringify(entry, null, 2))
            let fields = {
                fields: {
                    //"Name (Type | Title) (IMPO):": ,
                    "VIN (IMPO):": entry.vin ? entry.vin : " -- no VIN -- ",
                    "Video-ID (IMPO):": entry.assetId ? entry.assetId : " -- no Asset ID -- ",
                    //"Dawn (IMPO):": entry.dawn,
                    //"Sunrise (IMPO)": entry.sunrise,
                    //"Sunset (IMPO):": entry.sunset,
                    //"Dusk (IMPO):": entry.dusk,
                    "WON Sparkle discrepancy": entry.discrepancy ? entry.discrepancy.toString() : " -- no discrepancies between WON and Sparkle Dates -- "
                }
            }
            let name1 = entry.type ? entry.type : " -- no Type -- ";
            let name2 = entry.label ? (" | " + entry.label) : (" | -- no Label -- ");
            let name3 = entry.title ? entry.title : (entry.backupTitle ? entry.backupTitle : " -- no Title -- ");
            if(entry.label.toLowerCase() === entry.title.toLowerCase())
                name2 = ""

            fields.fields["Name (Type | Label | Title) (IMPO):"] = name1 + name2 + " | " + name3
            fields.fields["Dawn (IMPO):"] = entry.dawn ? entry.dawn : null;
            fields.fields["Sunrise (IMPO)"] = entry.sunrise ? entry.sunrise : null;
            fields.fields["Sunset (IMPO):"] = entry.sunset ? entry.sunset : null;
            fields.fields["Dusk (IMPO):"] = entry.dusk ? entry.dusk : null;
            fields.fields["Dawn (Sparkle) (IMPO)"] = entry.sparkleDawn ? entry.sparkleDawn : null;
            fields.fields["Sunrise (Sparkle) (IMPO)"] = entry.sparkleSunrise ? entry.sparkleSunrise : null;
            fields.fields["Sunset (Sparkle) (IMPO)"] = entry.sparkleSunset ? entry.sparkleSunset : null;
            fields.fields["Dusk (Sparkle) (IMPO)"] = entry.sparkleDusk ? entry.sparkleDusk : null;
            //console.log("Pushed Field Entries: " + JSON.stringify(fields, null, 2))

            formattedArray.push(fields)
        }
        //console.log(formattedArray)

        /*
        for (let i = 0; i < formattedArray.length; i++)
            console.log(formattedArray[i])
         */


        base('Assets').create(formattedArray, function(err, records) {
            if (err) {
                console.error(err);
                reject(err);
            }
            records.forEach(function (record) {
                console.log(record.getId());
            });
                resolve("success")
        });

    });
}

module.exports = {
    createAirtableRecords: createAirtableRecords
}