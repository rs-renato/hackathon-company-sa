resource "aws_apigatewayv2_api" "hackathon-company-api" {
  name = "hackathon-company-api"
  protocol_type = "HTTP"
}

# AUTH
resource "aws_apigatewayv2_integration" "hackathon-company-api-integration-auth" {
  api_id           = aws_apigatewayv2_api.hackathon-company-api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.hackathon-company-lambda-authorizer.invoke_arn
  integration_method = "POST" 
  passthrough_behavior = "WHEN_NO_MATCH"
  depends_on = [ aws_lambda_function.hackathon-company-lambda-authorizer ]
}

resource "aws_apigatewayv2_route" "hackathon-company-api-route-token" {
  api_id = aws_apigatewayv2_api.hackathon-company-api.id
  route_key = "POST /auth"
  target = "integrations/${aws_apigatewayv2_integration.hackathon-company-api-integration-auth.id}"
}

# REGISTRO DE PONTO
resource "aws_apigatewayv2_integration" "hackathon-company-api-integration-register-clock" {
  api_id           = aws_apigatewayv2_api.hackathon-company-api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.hackathon-company-lambda-register-clock.arn
  integration_method = "POST" 
  passthrough_behavior = "WHEN_NO_MATCH"
  depends_on = [ aws_lambda_function.hackathon-company-lambda-register-clock]
}

resource "aws_apigatewayv2_route" "hackathon-company-api-route-register-clock" {
  api_id = aws_apigatewayv2_api.hackathon-company-api.id
  route_key = "POST /ponto/registrar"
  target = "integrations/${aws_apigatewayv2_integration.hackathon-company-api-integration-register-clock.id}"
  authorizer_id = aws_apigatewayv2_authorizer.hackathon-company-api-authorizer.id
  depends_on = [ aws_apigatewayv2_authorizer.hackathon-company-api-authorizer ]
  authorization_type = "JWT"
}

# CONSULTA DE PONTO
resource "aws_apigatewayv2_integration" "hackathon-company-api-integration-query-clock" {
  api_id           = aws_apigatewayv2_api.hackathon-company-api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.hackathon-company-lambda-query-clock.arn
  integration_method = "GET" 
  passthrough_behavior = "WHEN_NO_MATCH"
  depends_on = [ aws_lambda_function.hackathon-company-lambda-query-clock]
}

resource "aws_apigatewayv2_route" "hackathon-company-api-route-query-clock" {
  api_id = aws_apigatewayv2_api.hackathon-company-api.id
  route_key = "GET /ponto/consultar/{proxy+}"
  target = "integrations/${aws_apigatewayv2_integration.hackathon-company-api-integration-query-clock.id}"
  authorizer_id = aws_apigatewayv2_authorizer.hackathon-company-api-authorizer.id
  depends_on = [ aws_apigatewayv2_authorizer.hackathon-company-api-authorizer ]
  authorization_type = "JWT"
}

# SOLICITA DE PONTO
resource "aws_apigatewayv2_integration" "hackathon-company-api-integration-request-report" {
  api_id           = aws_apigatewayv2_api.hackathon-company-api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.hackathon-company-lambda-request-report.arn
  integration_method = "POST" 
  passthrough_behavior = "WHEN_NO_MATCH"
  depends_on = [ aws_lambda_function.hackathon-company-lambda-request-report]
}

resource "aws_apigatewayv2_route" "hackathon-company-api-route-request-report" {
  api_id = aws_apigatewayv2_api.hackathon-company-api.id
  route_key = "GET /ponto/relatorio/{proxy+}"
  target = "integrations/${aws_apigatewayv2_integration.hackathon-company-api-integration-request-report.id}"
  authorizer_id = aws_apigatewayv2_authorizer.hackathon-company-api-authorizer.id
  depends_on = [ aws_apigatewayv2_authorizer.hackathon-company-api-authorizer ]
  authorization_type = "JWT"
}

# AUTHORIZER
resource "aws_apigatewayv2_authorizer" "hackathon-company-api-authorizer" {
  api_id             = aws_apigatewayv2_api.hackathon-company-api.id
  authorizer_type    = "JWT"
  identity_sources    = ["$request.header.Authorization"]
  name                = "hackathon-company-authorizer"
  jwt_configuration {
    issuer = "https://${aws_cognito_user_pool.hackathon-company-user-pool.endpoint}"
    audience = [aws_cognito_user_pool_client.hackathon-company-client.id]
  }
}

resource "aws_apigatewayv2_stage" "hackathon-company-api-deployment" {
  api_id = aws_apigatewayv2_api.hackathon-company-api.id
  name = "$default"
  auto_deploy = true
}