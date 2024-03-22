// configuracao de security group do loadbalancer
resource "aws_security_group" "hackathon-company-security-group" {
  name        = "hackathon-company-lb-security-group"
  description = "Allow API Gateway to connect to ECS"
  vpc_id      = aws_vpc.hackathon-company-vpc.id

  ingress {
    self = true
    from_port = 0
    to_port = 0
    protocol = -1
  }
  
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "TCP"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    description = "Allow all outbound traffic"
    from_port  = 0
    to_port    = 0
    protocol   = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}