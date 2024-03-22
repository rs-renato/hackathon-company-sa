# Lambda de Requisição de Relatório: lambda-request-report.js

Este lambda é responsável por receber a requisição de geração de relatório de ponto, para processamento assíncrono utilizando a fila SQS, utilizando o serviço Amazon SQS.

## Contrato
- **Entrada**: Espera uma requisição HTTP contendo a referência do relatório de ponto no formato `YYYY-MM`.
- **Saída de Sucesso**: Retorna um código de status 200 e o protocolo da mensagem SQS enviada para processamento.
- **Saída de Erro**: Em caso de erro de validação, retorna um código de status 400 e uma mensagem de erro no formato JSON.

## Funcionamento
1. Recebe a referência do relatório de ponto da requisição HTTP.
2. Valida a presença e o formato da referência.
3. Inicializa o cliente SQS para enviar uma mensagem contendo a referência para a fila SQS de solicitação de relatório.
4. Retorna o protocolo da mensagem SQS enviada para processamento.

## Integrações
- Este lambda integra-se com o serviço Amazon SQS para processamento assíncrono da requisição de geração de relatório de ponto.

## Exemplos

| **Requisição**                                                                                                          |**Resposta de Sucesso**| **Reposta Validações (400)**| 
|-------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|-----------------------------------------------------------|
| **Método:** POST<br>**URL:** /ponto/relatório/?referencia=2024-03<br>**Headers:**<br>Content-Type: application/json<br> | **Status:** 200 OK<br>**Headers:**<br>Content-Type: application/json<br><br>**Body:**<br>{<br>&nbsp;&nbsp;"protocolo": "ad5e2ecb-0057-4f19-bf1a-833fbf00f56a"<br>} | **Status:** 400 Bad Request<br>**Headers:**<br>Content-Type: application/json<br><br>**Body:**<br>{<br>&nbsp;&nbsp;"message": "Parâmetro referencia não encontrado ou inválido (YYYY-MM)"<br>} |

Este é um exemplo de como seria o README para a lambda de requisição de relatório de ponto, responsável por receber a requisição de geração de relatório para processamento assíncrono.