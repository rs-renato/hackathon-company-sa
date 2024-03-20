const { MongoClient } = require('mongodb');
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const moment = require("moment-timezone");
const timezone = 'America/Sao_Paulo'

const client_id = process.env.CLIENT_ID
const pool_id = process.env.POOL_ID
const documentURL = process.env.DOCUMENTDB_URL
const databaseName= process.env.DATABASE_NAME
const collectionName =  process.env.COLLECTION_NAME

exports.handler = async (event) => {

    let client
    try {

        let payload;

         // Creating Cognito JWT verifier
        const verifier = CognitoJwtVerifier.create({
            userPoolId: pool_id,
            tokenUse: "id",
            clientId: client_id,
        });

        // Verifying and getting Cognito JWT token information
        try {
            payload = await verifier.verify(event.headers.Authorization);    
            console.log(`Valid Token! Payload: ${JSON.stringify(payload)}`)
        } catch (error) {
            console.error(`Error validating token: ${error}`)
            return {
                statusCode: 403,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Invalid Token!'
                })
            };
        }
        
        // Obtaining employee ID from token payload
        const employeeId = payload['custom:matricula'];
        const username = payload['custom:username'];
        
        // Connecting to DocumentDB        
        const mongo = new MongoClient(documentURL);
        console.log(`Connecting to database`)
        client = await mongo.connect(documentURL);
        const database = await client.db(databaseName);
        
        console.log(`Querying current day clock records for this employee`)
        const result = await database.collection(collectionName)
            .find({
                employeeId: employeeId,
                timestamp: { $regex: `^${moment(new Date().getTime()).tz(timezone).format('YYYY-MM-DDTHH:mm')}` },
            })
            .sort({ timestamp: "desc" })
            .limit(1)
            .toArray();;

        const previousClock = result[0];
        console.log(`previousClock: ${JSON.stringify(previousClock)}`)

        // If there are already records for the current day, toggle occurrence between 'entry' and 'exit'
        let occurrence = await previousClock?.occurrence === 'entry' ? 'exit' : 'entry';
       
        let clock = {
            username: username,
            employeeId: employeeId,
            occurrence: occurrence,
            timestamp: moment(new Date().getTime()).tz(timezone).format('YYYY-MM-DDTHH:mm:ss')
        }

        console.log(`Saving clock record in DocumentDB`)
        await database.collection(collectionName).insertOne(clock);

        // Returning success response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clock)
        };

    } catch (error) {
        console.error('Error registering clock', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "Error registering clock." })
        };
    }finally{
        console.log(`Closing connection`)
        client?.close()
    }
};
