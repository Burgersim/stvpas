const { XMLParser } = require("fast-xml-parser");
const moment = require("moment");
const axios = require('axios');
const oauth = require('axios-oauth-client');
const parser = new XMLParser();
const clientId = process.env.VUE_APP_SPARKLE_TOKEN_CLIENTID;
const clientSecret = process.env.VUE_APP_SPARKLE_TOKEN_CLIENTSECRET;
const tokenUrl = 'https://auth.redbull.com/oauth2/auszmenrqNMwQtOJP416/v1/token';
const {CookieJar} = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support')
// eslint-disable-next-line no-unused-vars
//const _ = require('lodash')
//const convert = require('xml-js')


async function convertWonData(data){
    console.log("convertWon data function started")
    let resultArray = [];
    const dateMinus1D = moment.utc().subtract(1, 'day').toISOString();
    const dateMinus2D = moment.utc().subtract(2, 'day').toISOString();
    const dateMinus3D = moment.utc().subtract(3, 'day').toISOString();
    const date = moment.utc().toISOString()

    let jsonBody = parser.parse(data)
    //console.log("JsonBody: " + JSON.stringify(jsonBody, null, 4))
    //console.log(jsonBody.items.asset.length)
    //console.log("Element 0: " + JSON.stringify(jsonBody.items.asset[0], null, 4) + "=================================================================================\n\n")
    jsonBody.items.asset.forEach(element => {
            //console.log(new Date(element.metadata.startDate) + " < " + now)
        //console.log(element.metadata.startDate.substring(0, 10))
        //console.log("Asset Id: " + element.assetId, "| VIN: " + element.vin,  "| Start Date: " + element.metadata.startDate + " | Playable Start Date: " + element.metadata.playableStartDate + "\n")

            if (element.metadata.startDate.substring(0, 10) === dateMinus1D.substring(0, 10) ||
                element.metadata.startDate.substring(0, 10) === dateMinus2D.substring(0, 10) ||
                element.metadata.startDate.substring(0, 10) === dateMinus3D.substring(0, 10) ||
                element.metadata.startDate.substring(0, 10) === date.substring(0, 10) ) {
                    resultArray.push({
                        "assetId": element.assetId,
                        "title": "",
                        "type": "",
                        "label": "",
                        "vin": element.vin,
                        "dawn": element.metadata.startDate,
                        "sparkleDawn": "",
                        "dusk": element.metadata.endDate,
                        "sparkleDusk": "",
                        "sunrise": element.metadata.playableStartDate,
                        "sparkleSunrise": "",
                        "sunset": element.metadata.playableEndDate,
                        "sparkleSunset": "",
                        "discrepancy": []
                    })
                }
            //if(new Date(element.metadata.startDate) < now)
            //console.log("\n{\n" + "   " + element.assetId
            //    + "\n   " + element.vin
            //    + "\n   " + "Dawn: " + element.metadata.startDate
            //    + "\n   " + "Dusk: " + element.metadata.endDate
            //    + "\n   " + "Sunrise: " + element.metadata.playableStartDate
            //    + "\n   " + "Sunset: " + element.metadata.playableEndDate)
        }
    )

    //console.log("=====================JSON BODY============================")
    //console.log(JSON.stringify(jsonBody, null, 5));
    //console.log("=====================RESULT ARRAY============================")
    //console.log("Length: " + resultArray.length)
    //console.log(JSON.stringify(resultArray, null, 2))
    //console.log("Result Element 0" + JSON.stringify(resultArray[0], null, 2) + "=========================================\n\n")
    //let uniqueApiArray = [...new Set(resultArray)]
    let uniqueArray = [];
    resultArray.forEach((element) => {
        if (!uniqueArray.some(object => object.assetId === element.assetId)) {
            uniqueArray.push(element);
        } else
            console.log(" ===== found same ===== ")
    });
    console.log("\n\n ===== resultArray Length: " + resultArray.length)


    return uniqueArray;

}

/*
function capitalizeFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}
 */

async function wonApiCall(date){
    return new Promise(function (resolve, reject) {
        const jar = new CookieJar();
        jar
            .getSetCookieStrings('RB_BasicAuth=LWVJ1Zn63IC94yTfPN3vnQ==;', 'BIGipServerrb-p_won-wonrestapi_http_pool=!q0jOX5NlDknx92j9hllZ3r8Zs1McEJVon9q4drzHAah6XY8qOxqt4XdMMS8MDtAyh8LVwmKzZ869C/ih2SE1VJ77r2v9nF0DWZERZN6x2ZXnSg==')
        const dateFormatted = moment(date).format('YYYYMMDD')

        let headers = {
            'Accept': 'application/xml',
            'Accept-Charset': 'UTF-8',
            //'Cookie': 'RB_BasicAuth=LWVJ1Zn63IC94yTfPN3vnQ==; BIGipServerrb-p_won-wonrestapi_http_pool=!q0jOX5NlDknx92j9hllZ3r8Zs1McEJVon9q4drzHAah6XY8qOxqt4XdMMS8MDtAyh8LVwmKzZ869C/ih2SE1VJ77r2v9nF0DWZERZN6x2ZXnSg==',
        };

        const client = wrapper(axios.create({jar}))
        console.log("starting request for " + dateFormatted)
        return client.get(`https://won.redbullmediahouse.com/wonrestapi/platformcheck?searchParameters=eq(dateSelection,${dateFormatted})%3Beq(channelSelection,STVVISIBLE)`, {
            headers: headers,
            auth: {
                'user': process.env.VUE_APP_WON_USER,
                'pass': process.env.VUE_APP_WON_PASSWORD
            },
            withCredentials: true
        }).then(async res => {
            //console.log(await convertWonData(res.data))
            //let parsedArray = JSON.parse(convert.xml2json(res.data, {compact: true, spaces: 2}))
            //console.log("Won Response: " + JSON.stringify(parsedArray, null, 2))
            //console.log("WON yesterday answer: \n" + res.data)
            await convertWonData(res.data).then(res => {
                console.log("request " + dateFormatted + " done")
                resolve(res);
            })
        }).catch((err) => {
            if (err) {
                //console.error(err)
                reject(err)
            }
        })
    })
}

async function fetchWonData() {
    console.log("fetch Won Data function started")
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        const jar = new CookieJar();
        jar
            .getSetCookieStrings('RB_BasicAuth=LWVJ1Zn63IC94yTfPN3vnQ==;', 'BIGipServerrb-p_won-wonrestapi_http_pool=!q0jOX5NlDknx92j9hllZ3r8Zs1McEJVon9q4drzHAah6XY8qOxqt4XdMMS8MDtAyh8LVwmKzZ869C/ih2SE1VJ77r2v9nF0DWZERZN6x2ZXnSg==')
        //console.log(jar)
        // eslint-disable-next-line no-unused-vars
        //const client = wrapper(axios.create({jar}))
        // eslint-disable-next-line no-unused-vars
        //const now = new Date();
        const date = moment.utc().toISOString()
        //const dateFormatted = moment(date).format('YYYYMMDD')
        const dateMinus1D = moment.utc().subtract(1, 'day').toISOString();
        const dateMinus2D = moment.utc().subtract(2, 'day').toISOString();
        const dateMinus3D = moment.utc().subtract(3, 'day').toISOString()
        //const dateMinus1DFormatted = moment(dateMinus1D).format('YYYYMMDD')
        //let returnArray = [];
        //console.log(dateMinus1D)
        //console.log("Date 1 for Query: " + dateMinus1DFormatted)
        //console.log(date)
        //console.log("Date 2 for Query: " + dateFormatted)

        /*
        let headers = {
            'Accept': 'application/xml',
            'Accept-Charset': 'UTF-8',
            'Cookie': 'RB_BasicAuth=LWVJ1Zn63IC94yTfPN3vnQ==; BIGipServerrb-p_won-wonrestapi_http_pool=!q0jOX5NlDknx92j9hllZ3r8Zs1McEJVon9q4drzHAah6XY8qOxqt4XdMMS8MDtAyh8LVwmKzZ869C/ih2SE1VJ77r2v9nF0DWZERZN6x2ZXnSg==',
        };
         */

        // eslint-disable-next-line no-async-promise-executor
        //let yesterdayPromise = await wonApiCall(dateMinus1D)

        //let todayPromise = await wonApiCall(date)

        await Promise.all([
            await wonApiCall(date),
            await wonApiCall(dateMinus1D),
            await wonApiCall(dateMinus2D),
            await wonApiCall(dateMinus3D)
        ]).then((res) => {
            res.forEach((response, index) => {
                console.log("Response " + index + " (length: " + response.length + ")\n")
            })
            //console.log("Response 0 (length: " + res[0].length + "): \n")
            //console.log("Response 1 (length: " + res[1].length + "): \n")
            //console.log()
            console.log("Complete Response (length: " + [].concat.apply([], res).length + "): \n")
            resolve([].concat.apply([], res))
        }).catch(err => {if(err) reject(err)})




    })
}


async function fetchSparkleData(array) {
    console.log("fetchSparkleData")
    let erronousAssetIds = []
    //console.log(array.length)
    //let result = [];
    //console.log(token)
    console.log("Sparkle Data input Array length: " + array.length)
    let i = array.length
    console.log("ID at end of Array: " + array[array.length - 1].assetId)
    console.log("ID at start of Array: " + array[0].assetId)
    let token = await getSparkleToken()
    //console.log("Element 0: " + JSON.stringify(array[0], null, 2))
    //console.log("Element 38: " + JSON.stringify(array[38], null, 2))
    // eslint-disable-next-line no-unused-vars
    //console.log("i Before while: " + i)
        while (--i >= 0) {
            //console.log("i after while: " + i)
            //const index = array.indexOf(array[i]);
            //console.log("Asset Id of array[i] during Sparkle API call: " + array[i].assetId)
            //const index = array.indexOf(array[i]);
            //console.log("Index: " + index)
            //ask for Sparkle Data
            await axios.get('https://sparkle2-api.liiift.io/api/v1/stv/channels/stvcom/assets/' + array[i].assetId, {
                headers: {
                    'Authorization': `Bearer ${token.access_token}`,
                    'content-type': 'application/x-www-form-urlencoded'
                }
            }).then(async (res) => {
                console.log("requested " + array[i].assetId + " from Sparkle2")
                res.data.attributes = sanitizeSparkleData(res.data.attributes)
                //console.log("ResData: \n" + JSON.stringify(res.data, null, 4) + "\n")
                console.log("AssetId & Title: " + res.data.id + "| " + res.data.attributes.title_stv + " at Index " + i)
                array[i].sparkleDawn = res.data.attributes.currentdawn ? new Date(res.data.attributes.currentdawn).toISOString() : ""
                array[i].sparkleDusk = res.data.attributes.current_dusk ? new Date(res.data.attributes.current_dusk).toISOString() : ""
                array[i].sparkleSunrise = res.data.attributes.current_sunrise ? new Date(res.data.attributes.current_sunrise).toISOString() : ""
                array[i].sparkleSunset = res.data.attributes.current_sunset ? new Date(res.data.attributes.current_sunset).toISOString() : ""
                array[i].title = res.data.attributes.title_stv ? res.data.attributes.title_stv : ""
                array[i].backupTitle = res.data.attributes.online_title_stv ? res.data.online_title_stv : ""
                array[i].type =  res.data.attributes.type ? res.data.attributes.type : ""
                array[i].label = res.data.attributes.label ? res.data.attributes.label : ""
                if (array[i].sparkleDawn !== array[i].dawn)
                    array[i].discrepancy.push("dawn")
                if (array[i].sparkleDusk !== array[i].dusk)
                    array[i].discrepancy.push("dusk")
                if (array[i].sparkleSunrise !== array[i].sunrise)
                    array[i].discrepancy.push("sunrise")
                if (array[i].sparkleSunset !== array[i].sunset)
                    array[i].discrepancy.push("sunset")

                //console.log("Array at " + i + ": \n" + JSON.stringify(array[i], null, 2))

            }).catch((err) => {
                //console.error(err)
                //reject(err)
                if(array[i]){
                    erronousAssetIds.push(array[i].assetId + ": " + err.message)
                    //console.log("Error Status: " + err.response.status)
                    if(err.response.status === 404){
                        console.log("Removing " + array[i].assetId + " because of 404 - not found Sparkle Error. \n" )
                        array.splice(i, 1)
                    }
                }

                //console.log("Error Keys: " + Object.keys(err))
                //console.log("Full Error: " + JSON.stringify({ err }, null, 4))
                //console.log("Index: " + index)
            })
        }
        //console.log("'array[i]' 0 before sparkleData: " + JSON.stringify(array[0], null, 2))
        console.log("Errors: \n")
        erronousAssetIds.forEach(element => {
            console.log(element)
        })
        console.log("\n")
        console.log("resolved?")
        return array
    //write Sparkle Data to element -> note discrepancies
    //return result;
}

async function getSparkleToken() {
    const getAuthorizationToken = oauth.client(axios.create(), {
        url: tokenUrl,
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: '',
    });
    //console.log(token)
    return await getAuthorizationToken();
}

async function fetchData() {
    // eslint-disable-next-line no-async-promise-executor
    return await fetchWonData().then((async res => {
            //console.log("WonDataArray: " + res)
            return await fetchSparkleData(res).then((res) => {
                //console.log("Result of fetchWonData: " + res)
                return res
            })
        })).catch((err) => {if(err) Promise.reject(err)})
    /*
    await fetchWonData().then((async res => {
        console.log("Array after WONDATA Fetch: " + res)
        await fetchSparkleData(res).then((res) => {
            console.log(res)
        })
    }))
     */

}

function sanitizeSparkleData(item) {
    let sanitizedItem = {}
    item.forEach(entry => {
        sanitizedItem[entry.fieldKey] = entry.fieldValue
    })
    //console.log("Sanitized: " + JSON.stringify(sanitizedItem, null, 2))
    return sanitizedItem
}

//fetchData()

module.exports = {
    fetchData: fetchData
}

