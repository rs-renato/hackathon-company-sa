const { MongoClient } = require('mongodb');
const { decomposeUnverifiedJwt } = require("aws-jwt-verify/jwt");
const moment = require("moment-timezone");
const timezone = 'America/Sao_Paulo'

const documentURL = process.env.DOCUMENTDB_URL
const databaseName = process.env.DATABASE_NAME
const collectionName = process.env.COLLECTION_NAME
let client;

exports.handler = async (event) => {

    try {

        // Extraction paylod from token
        const { payload } = decomposeUnverifiedJwt(event.headers.Authorization || event.headers.authorization)
        console.log(`Payload: ${JSON.stringify(payload)}`);
        console.log(`headers: ${JSON.stringify(event?.headers)}`);

        // Obtaining user data from token payload
        const matricula = payload['custom:matricula'];
        const username = payload['cognito:username'];

        // Connecting to DocumentDB        
        const database = await initMongoClient(documentURL, databaseName)

        console.log(`Querying current day clock records for employee ${username}`)
        const result = await database.collection(collectionName)
            .find({
                matricula: matricula,
                timestamp: { $regex: `^${moment().tz(timezone).format('YYYY-MM-DD')}` },
            })
            .sort({ timestamp: "desc" })
            .limit(1)
            .toArray();

        console.log(`DocumentDB Response: ${JSON.stringify(result)}`);

        const previousClock = result[0];
        console.log(`previousClock: ${JSON.stringify(previousClock)}`)

        // If there are already records for the current day, toggle occurrence between 'entrada' and 'saida'
        let ocorrencia = await previousClock?.ocorrencia === 'entrada' ? 'saida' : 'entrada';

        let clock = {
            username: username,
            matricula: matricula,
            ocorrencia: ocorrencia,
            timestamp: moment().tz(timezone).format('YYYY-MM-DDTHH:mm:ss')
        }

        console.log(`Saving clock record in DocumentDB: ${JSON.stringify(clock)}`)
        await database.collection(collectionName).insertOne(clock);

        // Returning success response
        let lambdaResponse = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clock)
        };

        console.log(`Lambda Response: ${JSON.stringify(lambdaResponse)}`);
        return lambdaResponse;

    } catch (error) {
        console.error('Error registering clock', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "Erro ao registrar o ponto." })
        };
    } finally {
        console.log(`Closing connection`)
        client?.close()
    }
};

async function initMongoClient(documentURL, databaseName) {
    // Connecting to DocumentDB        
    const mongo = new MongoClient(documentURL);
    console.log(`Conectando ao banco de dados`);
    client = await mongo.connect(documentURL);
    return client.db(databaseName);
}