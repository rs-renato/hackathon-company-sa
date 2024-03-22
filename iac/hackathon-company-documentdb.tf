resource "aws_docdb_cluster" "hackathon-company-doc-cluster-clock" {
  cluster_identifier = "hackathon-company-doc-cluster-clock"
  engine = "docdb"
  storage_type = "standard"
  master_username      = "hackathon_company"
  master_password      = random_password.hackathon-company-random-passoword.result
  skip_final_snapshot = true
  vpc_security_group_ids = [aws_security_group.hackathon-company-security-group.id]
  db_subnet_group_name = aws_db_subnet_group.hackathon-company-db-subnet-group.name
  storage_encrypted = false
  db_cluster_parameter_group_name = aws_docdb_cluster_parameter_group.hackathon-company-doc-cluster-parameters.name
}

resource "aws_db_subnet_group" "hackathon-company-db-subnet-group" {
  name       = "hackathon-company-db-subnet-group"
  subnet_ids = [
    aws_subnet.hackathon-company-subnet-private1-us-east-1a.id,
    aws_subnet.hackathon-company-subnet-private2-us-east-1b.id,
    aws_subnet.hackathon-company-subnet-public1-us-east-1a.id,
    aws_subnet.hackathon-company-subnet-public2-us-east-1b.id
  ]
  tags = {
    Name = "database subnet group"
  }
}

resource "random_password" "hackathon-company-random-passoword" {
  length           = 16
  special          = false
}

resource "aws_docdb_cluster_instance" "hackathon-company-doc-cluster-instance" {
  cluster_identifier = aws_docdb_cluster.hackathon-company-doc-cluster-clock.cluster_identifier
  instance_class = "db.t3.medium"
}

resource "aws_docdb_cluster_parameter_group" "hackathon-company-doc-cluster-parameters" {
  family = "docdb5.0"
  name = "hackathon-company-doc-cluster-parameters"
  
  parameter {
    name = "tls"
    value = "disabled"
  }
}