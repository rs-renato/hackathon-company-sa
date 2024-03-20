const crypto = require("crypto");
const AWS = require("aws-sdk");

exports.handler = async (event) => {
    try {
        // Obtenção do payload do corpo da solicitação
        const requestBody = JSON.parse(event.body);
        const { username, senha } = requestBody;

        // Obtenção de client_id e client_secret dos headers
        const client_id = process.env.CLIENT_ID
        const client_secret = process.env.CLIENT_SECRET

        // Validar entrada
        if (!username || !senha) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: "Requisição inválida! Revise os parâmetros informados." })
            };
        }

        // Gerar hash secreto
        const secretHash = crypto.createHmac('SHA256', client_secret)
                                 .update(username + client_id)
                                 .digest('base64');

        // Parâmetros para a solicitação de autenticação
        const params = {
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: client_id,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: senha,
                SECRET_HASH: secretHash
            }
        };

        // Inicializar o serviço Cognito
        const cognito = new AWS.CognitoIdentityServiceProvider({ region: process.env.AWS_REGION });

        // Iniciar autenticação
        const response = await cognito.initiateAuth(params).promise();

        // Retornar token de autenticação
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: response.AuthenticationResult.IdToken })
        };
        
    } catch (error) {
        console.error('Erro ao autenticar o usuário', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "Erro na autenticação do usuário" })
        };
    }
};
