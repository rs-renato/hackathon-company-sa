const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const moment = require("moment-timezone");

exports.handler = async (event) => {

    const referencia = event?.queryStringParameters?.referencia;

    // Validating input
    if (!moment(referencia, "YYYY-MM", true).isValid()) {
        // Returning validation error
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "Parâmetro referencia não encontrado ou inválido (YYYY-MM)" })
        };
    }

    console.log(`Initializing sqs client`)
    const sqsClient = initSqsClient({ region: process.env.AWS_REGION })

    const params = {
        MessageBody: JSON.stringify({
          event:{
            headers: event.headers
          },
          queryStringParameters: event.queryStringParameters
        }),
        QueueUrl: process.env.SQS_HACKATHON_REPORT_REQUEST
    };

    console.log(`sending message to SQS: ${JSON.stringify(params)}`)
    let data = await sqsClient.send(new SendMessageCommand(params))
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            protocolo: data.MessageId,
        })
    }
}

const initSqsClient = (params) => {
    return new SQSClient(params);
}