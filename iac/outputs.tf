output "random_password_hackathon-company-random-passoword_result" {
  value = random_password.hackathon-company-random-passoword.result
  sensitive = true
}

output "hackathon-company-api-url" {
  value = aws_apigatewayv2_stage.hackathon-company-api-deployment.invoke_url
}