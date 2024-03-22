const { InvokeCommand, LambdaClient, LogType } = require("@aws-sdk/client-lambda");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const moment = require("moment-timezone");

exports.handler = async (event, context) => {

    for (const message of event.Records) {
        await processSQSMessage(message);
    }

    console.log(`Processing messages done`);
};

const processSQSMessage = async (message) => {

    try {

        const body = JSON.stringify(message.body);
        console.log(`Processed message body ${body}`);

        const referencia = /"referencia"\s*:\s*"([^"]+)"/.exec(message.body)[1];
        const authorization = /"(?:Authorization|authorization)"\s*:\s*"([^"]+)"/i.exec(message.body)[1];
        
        // Parsing a valid reference
        const [ano, mes] = referencia.split("-");
        const dataInicial = formatarData(`${ano}-${mes}-01T00:00:00`);
        const dataFinal = formatarData(moment(dataInicial).endOf('month'));


        const event = {
            headers:{
                Authorization: authorization,
            },
            queryStringParameters:{
                dataInicial: dataInicial,
                dataFinal: dataFinal
            }
        }

        const lambdaClient = initLambdaClient({ region: process.env.AWS_REGION })

        const command = new InvokeCommand({
            FunctionName: "lambda-query-clock",
            Payload: JSON.stringify(event),
            LogType: LogType.Tail,
        });

        console.log('Invoking queryClock lambda')
        const { Payload } = await lambdaClient.send(command);
        console.log(`queryClock Payload: ${Payload}`)

        const queryClockReponse = JSON.parse(Buffer.from(Payload).toString());
        console.log(`queryClock Response: ${JSON.stringify(queryClockReponse)}`)

        // send report only if could query data
        if (queryClockReponse?.statusCode === 200) {

            // Send email to user            
            let response = JSON.parse(queryClockReponse.body.replace(/\\/g, ''));
            let sendCommand = createSendEmailCommand(response.email, process.env.SES_SOURCE, "Relatório de Espelho de Ponto", generateEmailBody(response))
            console.log(`Initializing ses client`)
            let sesClient = initSesClient({ region: process.env.AWS_REGION })
            console.log(`sendCommand: ${JSON.stringify(sendCommand)}`)
            let emailResponse = await sesClient.send(sendCommand);

            console.log(`SES Response: ${JSON.stringify(emailResponse)}`);
        }
        console.log('Finalizado com sucesso');
        await Promise.resolve(1); //Placeholder for actual async work
    } catch (error) {
        console.error('Erro ao gerar relatório de registros de ponto', error);
        throw error;
    }
}

const formatarData = (data) => {
    return moment(data).format("YYYY-MM-DDTHH:mm:ss");
}

const initLambdaClient = (params) => {
    return new LambdaClient(params);
}

const initSesClient = (params) => {
    return new SESClient(params);
}

const generateEmailBody = (response) => {
    let emailBody = `Olá ${response.username}, conforme solicitado, abaixo está o relatório de espelho de ponto:\n\n`;

    emailBody += `-----------------------------------------------------------------------------\n`
    emailBody += `Período:\t${response.periodo.dataInicial} a ${response.periodo.dataFinal}\n`;
    emailBody += `Total de horas trabalhadas no período:\t${response.periodo.totalHorasTrabalhadas}\n`;
    emailBody += `-----------------------------------------------------------------------------\n\n`;

    response.registros.forEach((registro) => {
        const dataRegistro = Object.keys(registro)[0];
        const horasTrabalhadas = response.periodo.totalHorasTrabalhadas;

        emailBody += `Data:\t${dataRegistro}\tHoras Trabalhadas:\t${registro[dataRegistro].horasTrabalhadas}\n`;
        emailBody += `-----------------------------------------------------------------------------\n`;

        let ocorrencias = '';
        registro[dataRegistro].ocorrencias.forEach((ocorrencia, index) => {
            const tipoOcorrencia = ocorrencia.ocorrencia === 'entrada' ? 'Entrada:\t\t' : 'Saída:\t\t\t';
            const numeroOcorrencia = index + 1;
            ocorrencias += `#${numeroOcorrencia}\t${tipoOcorrencia}${ocorrencia.timestamp}\n`;
        });

        emailBody += `${ocorrencias}`;
        emailBody += `-----------------------------------------------------------------------------\n\n`;
    });


    emailBody += `Atenciosamente,\nHackathon Company SA`;

    console.log(`emailBody:\n${emailBody}`);
    return emailBody;
};

const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
    return new SendEmailCommand({
        Destination: {
            ToAddresses: [toAddress],
        },
        Message: {
            Body: {
                Text: {
                    Charset: "UTF-8",
                    Data: body,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: fromAddress,
    });
};

