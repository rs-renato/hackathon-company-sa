data "archive_file" "hackathon-company-lambda-authorizer-zip" {
  type        = "zip"
  source_file = "../serverless/lambda-authorizer.js"
  output_path = "../serverless/lambda-authorizer.zip"
}

# configuracao de funcao lambda
resource "aws_lambda_function" "hackathon-company-lambda-authorizer" {
  function_name    = "hackathon-company-lambda-authorizer"
  filename         = "${path.module}/${data.archive_file.hackathon-company-lambda-authorizer-zip.output_path}"
  source_code_hash = filebase64sha256("${path.module}/${data.archive_file.hackathon-company-lambda-authorizer-zip.output_path}")
  handler          = "hackathon-company-lambda-authorizer.handler"
  role             = aws_iam_role.hackathon-company-lambda-iam-role.arn
  runtime          = "nodejs16.x"
  architectures    = [ "x86_64" ]
  layers           = [ aws_lambda_layer_version.hackathon-company-lambda-layers.arn ]
  depends_on = [ data.archive_file.hackathon-company-lambda-authorizer-zip]
    
  environment {
    variables = {
      CLIENT_ID = aws_cognito_user_pool_client.hackathon-company-client.id
      CLIENT_SECRET = aws_cognito_user_pool_client.hackathon-company-client.client_secret
    }
  }
}

resource "aws_lambda_layer_version" "hackathon-company-lambda-layers" {
  layer_name = "lambda-layers"
  compatible_runtimes = ["nodejs16.x"]
  compatible_architectures = [ "x86_64" ]
  source_code_hash   = filebase64sha256("../serverless/layers/lambda-layers.zip") 
  filename           = "lambda-layers.zip"
}