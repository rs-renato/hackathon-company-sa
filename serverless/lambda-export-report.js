const { InvokeCommand, LambdaClient, LogType } = require("@aws-sdk/client-lambda");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const moment = require("moment-timezone");

exports.handler = async (event) => {

    try {

        let lambdaResponse;
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

        // Parsing a valid reference
        const [ano, mes] = referencia.split("-");
        const dataInicial = formatarData(`${ano}-${mes}-01T00:00:00`);
        const dataFinal = formatarData(moment(dataInicial).endOf('month'));
        
        event.queryStringParameters.dataInicial = dataInicial;
        event.queryStringParameters.dataFinal = dataFinal;

        console.log(`queryStringParameters: ${JSON.stringify(event?.queryStringParameters)}`);

        const lambdaClient = initLambdaClient({ region: process.env.AWS_REGION })

        const command = new InvokeCommand({
            FunctionName: "lambda-query-clock",
            Payload: JSON.stringify(event),
            LogType: LogType.Tail,
        });

        console.log('Invoking queryClock lambda')
        const { Payload } = await lambdaClient.send(command);
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

            let lambdaResp = {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    protocolo: emailResponse.MessageId,
                })
            }

            lambdaResponse = lambdaResp;
        }

        // Returning success response
        console.log(`Lambda Response: ${JSON.stringify(lambdaResponse)}`);
        return lambdaResponse

    } catch (error) {
        console.error('Erro ao gerar relatório de registros de ponto', error);
        // Returning error in export responseBody
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "Erro gerar relatório de registros de ponto." })
        };
    }
};

const formatarData = (data) =>{
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
        ToAddresses: [ toAddress ],
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