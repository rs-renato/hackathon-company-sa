# configuracao de role IAM para o lambda
resource "aws_iam_role" "hackathon-company-lambda-iam-role" {
  name = "hackathon-company-lambda-iam-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# configuracao de policy IAM para o lambda
resource "aws_iam_policy" "hackathon-company-lambda-iam-policy" {
  name        = "hackathon-company-lambda-iam-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = ["arn:aws:logs:*:*:*"]
      },
      {
        Effect = "Allow",
        "Action": [
            "apigateway:InvokeApi",
            "apigateway:InvokeResource",
            "apigateway:InvokeMethod"
        ],
        Resource = ["*"]
      },
      {
        Effect = "Allow",
        "Action": [
            "cognito-idp:AdminInitiateAuth",
            "cognito-idp:AdminRespondToAuthChallenge",
            "cognito-idp:AdminUserGlobalSignOut",
            "cognito-idp:AdminCreateUser",
            "cognito-idp:AdminDeleteUser",
            "cognito-idp:AdminSetUserPassword"
        ],
        Resource = ["*"]
      },
      {
        Effect = "Allow",
        "Action": [
            "ec2:CreateNetworkInterface",
            "ec2:DescribeNetworkInterfaces",
            "ec2:DescribeSubnets",
            "ec2:DeleteNetworkInterface",
            "ec2:AssignPrivateIpAddresses",
            "ec2:UnassignPrivateIpAddresses"
        ],
        Resource = ["*"]
      },
      {
        "Effect": "Allow",
        "Action": [
            "sqs:*"
        ],
        "Resource": "*"
        },
      {
        Effect = "Allow",
        "Action": [
            "lambda:InvokeFunction"
        ],
        Resource = ["*"]
      },
      {
        Effect = "Allow",
        "Action": [
            "ses:*"
        ],
        Resource = ["*"]
      }
    ]
  })
}

resource "aws_lambda_permission" "hackathon-company-lambda-authorizer-permission" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.hackathon-company-lambda-authorizer.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_lambda_permission" "hackathon-company-lambda-register-clock-permission" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.hackathon-company-lambda-register-clock.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_lambda_permission" "hackathon-company-lambda-query-clock-permission" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.hackathon-company-lambda-query-clock.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_lambda_permission" "hackathon-company-lambda-request-report-permission" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.hackathon-company-lambda-request-report.function_name
  principal     = "apigateway.amazonaws.com"
}


resource "aws_iam_role_policy_attachment" "hackathon-company-lambda-iam-policy-attachment" {
  policy_arn = aws_iam_policy.hackathon-company-lambda-iam-policy.arn
  role = aws_iam_role.hackathon-company-lambda-iam-role.name
}