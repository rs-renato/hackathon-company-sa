resource "aws_sqs_queue" "hackathon-company-sqs-report-request" {
    name = "hackathon-company-sqs-report-request"
    visibility_timeout_seconds = 3
    delay_seconds = 3
}