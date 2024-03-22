data "archive_file" "hackathon-company-lambda-authorizer-zip" {
  type        = "zip"
  source_file = "../serverless/lambda-authorizer.js"
  output_path = "../serverless/lambda-authorizer.zip"
}

resource "aws_lambda_function" "hackathon-company-lambda-authorizer" {
  function_name    = "hackathon-company-lambda-authorizer"
  filename         = "${path.module}/${data.archive_file.hackathon-company-lambda-authorizer-zip.output_path}"
  source_code_hash = filebase64sha256("${path.module}/${data.archive_file.hackathon-company-lambda-authorizer-zip.output_path}")
  handler          = "lambda-authorizer.handler"
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

data "archive_file" "hackathon-company-lambda-register-clock-zip" {
  type        = "zip"
  source_file = "../serverless/lambda-register-clock.js"
  output_path = "../serverless/lambda-register-clock.zip"
}

resource "aws_lambda_function" "hackathon-company-lambda-register-clock" {
  function_name    = "hackathon-company-lambda-register-clock"
  filename         = "${path.module}/${data.archive_file.hackathon-company-lambda-register-clock-zip.output_path}"
  source_code_hash = filebase64sha256("${path.module}/${data.archive_file.hackathon-company-lambda-register-clock-zip.output_path}")
  handler          = "lambda-register-clock.handler"
  role             = aws_iam_role.hackathon-company-lambda-iam-role.arn
  runtime          = "nodejs16.x"
  architectures    = [ "x86_64" ]
  layers           = [ aws_lambda_layer_version.hackathon-company-lambda-layers.arn ]
  depends_on = [ data.archive_file.hackathon-company-lambda-register-clock-zip, aws_docdb_cluster.hackathon-company-doc-cluster-clock, aws_cognito_user_pool.hackathon-company-user-pool]
  vpc_config {
    subnet_ids = [aws_subnet.hackathon-company-subnet-private1-us-east-1a.id, aws_subnet.hackathon-company-subnet-private2-us-east-1b.id]
    security_group_ids = [aws_security_group.hackathon-company-security-group.id]
  }  
  environment {
    variables = {
      CLIENT_ID = aws_cognito_user_pool_client.hackathon-company-client.id
      COLLECTION_NAME= "hackathon-registry-clock"
      DATABASE_NAME= "hackathon-company-sa"
      DOCUMENTDB_URL="mongodb://${aws_docdb_cluster.hackathon-company-doc-cluster-clock.master_username}:${aws_docdb_cluster.hackathon-company-doc-cluster-clock.master_password}@${aws_docdb_cluster.hackathon-company-doc-cluster-clock.endpoint}/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"
      POOL_ID =	aws_cognito_user_pool.hackathon-company-user-pool.id
    }
  }
}

data "archive_file" "hackathon-company-lambda-query-clock-zip" {
  type        = "zip"
  source_file = "../serverless/lambda-query-clock.js"
  output_path = "../serverless/lambda-query-clock.zip"
}

resource "aws_lambda_function" "hackathon-company-lambda-query-clock" {
  function_name    = "hackathon-company-lambda-query-clock"
  filename         = "${path.module}/${data.archive_file.hackathon-company-lambda-query-clock-zip.output_path}"
  source_code_hash = filebase64sha256("${path.module}/${data.archive_file.hackathon-company-lambda-query-clock-zip.output_path}")
  handler          = "lambda-query-clock.handler"
  role             = aws_iam_role.hackathon-company-lambda-iam-role.arn
  runtime          = "nodejs16.x"
  architectures    = [ "x86_64" ]
  layers           = [ aws_lambda_layer_version.hackathon-company-lambda-layers.arn ]
  depends_on = [ data.archive_file.hackathon-company-lambda-query-clock-zip, aws_docdb_cluster.hackathon-company-doc-cluster-clock]
  vpc_config {
    subnet_ids = [aws_subnet.hackathon-company-subnet-private1-us-east-1a.id, aws_subnet.hackathon-company-subnet-private2-us-east-1b.id]
    security_group_ids = [aws_security_group.hackathon-company-security-group.id]
  }  
  environment {
    variables = {
      COLLECTION_NAME= "hackathon-registry-clock"
      DATABASE_NAME= "hackathon-company-sa"
      DOCUMENTDB_URL="mongodb://${aws_docdb_cluster.hackathon-company-doc-cluster-clock.master_username}:${aws_docdb_cluster.hackathon-company-doc-cluster-clock.master_password}@${aws_docdb_cluster.hackathon-company-doc-cluster-clock.endpoint}/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"
    }
  }
}

data "archive_file" "hackathon-company-lambda-request-report-zip" {
  type        = "zip"
  source_file = "../serverless/lambda-request-report.js"
  output_path = "../serverless/lambda-request-report.zip"
}

resource "aws_lambda_function" "hackathon-company-lambda-request-report" {
  function_name    = "hackathon-company-lambda-request-report"
  filename         = "${path.module}/${data.archive_file.hackathon-company-lambda-request-report-zip.output_path}"
  source_code_hash = filebase64sha256("${path.module}/${data.archive_file.hackathon-company-lambda-request-report-zip.output_path}")
  handler          = "lambda-request-report.handler"
  role             = aws_iam_role.hackathon-company-lambda-iam-role.arn
  runtime          = "nodejs16.x"
  architectures    = [ "x86_64" ]
  layers           = [ aws_lambda_layer_version.hackathon-company-lambda-layers.arn ]
  depends_on = [ data.archive_file.hackathon-company-lambda-request-report-zip, aws_sqs_queue.hackathon-company-sqs-report-request]
  vpc_config {
    subnet_ids = [aws_subnet.hackathon-company-subnet-private1-us-east-1a.id, aws_subnet.hackathon-company-subnet-private2-us-east-1b.id]
    security_group_ids = [aws_security_group.hackathon-company-security-group.id]
  }  
  environment {
    variables = {
      SQS_HACKATHON_REPORT_REQUEST= aws_sqs_queue.hackathon-company-sqs-report-request.id
    }
  }
}

data "archive_file" "hackathon-company-lambda-export-report-zip" {
  type        = "zip"
  source_file = "../serverless/lambda-export-report.js"
  output_path = "../serverless/lambda-export-report.zip"
}

resource "aws_lambda_function" "hackathon-company-lambda-export-report" {
  function_name    = "hackathon-company-lambda-export-report"
  filename         = "${path.module}/${data.archive_file.hackathon-company-lambda-export-report-zip.output_path}"
  source_code_hash = filebase64sha256("${path.module}/${data.archive_file.hackathon-company-lambda-export-report-zip.output_path}")
  handler          = "lambda-export-report.handler"
  role             = aws_iam_role.hackathon-company-lambda-iam-role.arn
  runtime          = "nodejs16.x"
  architectures    = [ "x86_64" ]
  layers           = [ aws_lambda_layer_version.hackathon-company-lambda-layers.arn ]
  depends_on = [ data.archive_file.hackathon-company-lambda-export-report-zip, aws_sesv2_email_identity.hackathon-company-ses-sender-email-identity]
  vpc_config {
    subnet_ids = [aws_subnet.hackathon-company-subnet-private1-us-east-1a.id, aws_subnet.hackathon-company-subnet-private2-us-east-1b.id]
    security_group_ids = [aws_security_group.hackathon-company-security-group.id]
  }  
  environment {
    variables = {
      SES_SOURCE= aws_sesv2_email_identity.hackathon-company-ses-sender-email-identity.email_identity
      LAMBDA_QUERY_CLOCK=aws_lambda_function.hackathon-company-lambda-query-clock.function_name
    }
  }
}

resource "aws_lambda_event_source_mapping" "hackathon-company-lambda-export-report-event-source-mapping" {
  enabled = true
  event_source_arn = aws_sqs_queue.hackathon-company-sqs-report-request.arn
  function_name = aws_lambda_function.hackathon-company-lambda-export-report.function_name
}

resource "aws_lambda_layer_version" "hackathon-company-lambda-layers" {
  layer_name = "lambda-layers"
  compatible_runtimes = ["nodejs16.x"]
  compatible_architectures = [ "x86_64" ]
  source_code_hash   = filebase64sha256("../serverless/layers/lambda-layers.zip") 
  filename           = "../serverless/layers/lambda-layers.zip"
}