# Lambda de Autenticação: lambda-authorizer.js

Este lambda é responsável pela autenticação de usuários no sistema utilizando o serviço AWS Cognito.

## Contrato
- **Entrada**: Espera um objeto JSON no corpo da requisição contendo os campos `username` e `password`.
- **Saída de Sucesso**: Retorna um código de status 200 e um objeto JSON contendo o token de autenticação (`token`).
- **Saída de Erro**: Em caso de erro, retorna um código de status 4xx ou 5xx e uma mensagem de erro no formato JSON.

## Funcionamento
1. Obtém os dados de usuário e senha do corpo da requisição.
2. Valida a presença dos parâmetros obrigatórios (usuário e senha).
3. Gera um hash secreto com base no `client_id` e `client_secret` fornecidos nas variáveis de ambiente.
4. Inicializa o serviço AWS Cognito.
5. Inicia a autenticação do usuário utilizando os parâmetros fornecidos.
6. Retorna o token de autenticação em caso de sucesso.

## Integrações
- Este lambda integra-se com o serviço AWS Cognito para autenticar os usuários.

## Variáveis de Ambiente
- `CLIENT_ID`: ID do cliente fornecido pelo AWS Cognito.
- `CLIENT_SECRET`: Segredo do cliente fornecido pelo AWS Cognito.
- `AWS_REGION`: Região da AWS onde está configurado o serviço Cognito.

## Exemplos

|**Requisição**|**Resposta de Sucesso**| **Reposta Validações (400)**| **Reposta Erros (500)**|
|----------------------------------------------------------|----------------------------------------------------------|-----------------------------------------------------------|-----------------------------------------------------------|
|**Método:** POST<br>**URL:** /auth<br>**Headers:**<br>Content-Type: application/json<br><br>**Body:**<br>{<br>&nbsp;&nbsp;"username": "example_user",<br>&nbsp;&nbsp;"password": "example_password"<br>} | **Status:** 200 OK<br>**Headers:**<br>Content-Type: application/json<br><br>**Body:**<br>{<br>&nbsp;&nbsp;"token": "eyJraWQiOiJ4eE..."<br>} | **Status:** 400 Bad Request<br>**Headers:**<br>Content-Type: application/json<br><br>**Body:**<br>{<br>&nbsp;&nbsp;"message": "Parâmetros de usuário e/ou senha não encontrados"<br>} | **Status:** 500 Internal Server Error<br>**Headers:**<br>Content-Type: application/json<br><br>**Body:**<br>{<br>&nbsp;&nbsp;"message": "Não foi possível autenticar o usuário"<br>}|
