const {fetchAirtableData} = require("./getRecordsFromAirtable");
const {fetchData} = require("./getRecordsFromWonAndSparkle");
// eslint-disable-next-line no-unused-vars
const {createAirtableRecords} = require("./createRecordsInAirtable");


async function pasSync() {
    console.log("starting PasSync function")
    let startTime = Date.now();
    //let elapsed = ''
    let airtableArray;
    let apiArray;

    /*
    // eslint-disable-next-line no-async-promise-executor
    let getArrays = new Promise(async function (resolve, reject) {
        await fetchAirtableData()
            .then((res) => {
                //airtableArray = res;
                console.log("Airtable Array: " + res)
                return res
            })
            .then(async (res) => {
                let airtableArray = res;
                await fetchData()
                    .then(res => {
                    //apiArray = res;
                        res.forEach(function (item, index) {
                            console.log("Data Array on index " + index + ": \n" + JSON.stringify(item, null, 2))
                        })
                    resolve({apiArray: res, airtableArray: airtableArray})
                })
            }).catch((err) =>{if(err) reject(err)})
    })
     */

    // eslint-disable-next-line no-async-promise-executor
    /*
    return new Promise(async function (resolve, reject) {
        await fetchAirtableData()
            .then((res) => {
                //airtableArray = res;
                //console.log("\n\n ===== Airtable Array: " + res)
                return res
            })
            .then(async (res) => {
                let airtableArray = res;
                await fetchData()
                    .then(res => {
                        //apiArray = res;
                        resolve({apiArray: res, airtableArray: airtableArray})
                    })
            }).catch((err) =>{if(err) reject(err)})
    })
    */
        return Promise.all([
            fetchAirtableData(),
            fetchData()
        ]).then(async (res) => {
        airtableArray = res[0]
        apiArray = res[1]
            //console.log(JSON.stringify(apiArray, null, 3))
        //console.log("API Array Length before split: " + apiArray.length)

        for (let i = 0; i < airtableArray.length; i++) {
            for (let j = 0; j < apiArray.length; j++) {
                if (airtableArray[i].toLowerCase() === (apiArray[j].vin.toLowerCase())) {
                    //console.warn("Found Record")
                    apiArray.splice(j, 1)
                }

            }
        }

        //console.log("API Array Length after split: " + apiArray.length)


        //Airtable records are created in chunks of 10 max records at once
        let i, j, temporary, chunk = 10;
        for (i = 0, j = apiArray.length; i < j; i += chunk) {
            temporary = apiArray.slice(i, i + chunk);
            await createAirtableRecords(temporary)
            console.log("chunk done")
        }

        let endTime = Date.now();
        let elapsed = '';
        if (apiArray.length > 0) {
            console.log("Time " + (endTime - startTime) + "ms")
            elapsed = "Time " + (endTime - startTime) + "ms";
        }
        if (apiArray.length === 0) {
            console.log("No new Assets published")
            elapsed = "No new Assets published";
        }

        return elapsed;

    })


}

module.exports = {
    pasSync
}