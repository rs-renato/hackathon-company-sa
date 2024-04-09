# configuracao de vpc
resource "aws_vpc" "hackathon-company-vpc" {
  cidr_block = "10.0.0.0/16"
}

# configuracao de subnet publica east-1a
resource "aws_subnet" "hackathon-company-subnet-public1-us-east-1a" {
  vpc_id            = aws_vpc.hackathon-company-vpc.id
  cidr_block        = "10.0.0.0/20"
  availability_zone = "us-east-1a"

  tags = {
    "Name" = "hackathon-company-subnet-public1 | us-east-1a"
  }
}

# configuracao de subnet privada east-1a
resource "aws_subnet" "hackathon-company-subnet-private1-us-east-1a" {
  vpc_id            = aws_vpc.hackathon-company-vpc.id
  cidr_block        = "10.0.128.0/20"
  availability_zone = "us-east-1a"

  tags = {
    "Name" = "hackathon-company-subnet-private1 | us-east-1a"
  }
}

# configuracao de subnet publica east-1b
resource "aws_subnet" "hackathon-company-subnet-public2-us-east-1b" {
  vpc_id            = aws_vpc.hackathon-company-vpc.id
  cidr_block        = "10.0.16.0/20"
  availability_zone = "us-east-1b"

  tags = {
    "Name" = "hackathon-company-subnet-public2 | us-east-1b"
  }
}

# configuracao de subnet privada east-1b
resource "aws_subnet" "hackathon-company-subnet-private2-us-east-1b" {
  vpc_id            = aws_vpc.hackathon-company-vpc.id
  cidr_block        = "10.0.144.0/20"
  availability_zone = "us-east-1b"

  tags = {
    "Name" = "hackathon-company-subnet-private2 | us-east-1b"
  }
}

# configuracao de route table publica
resource "aws_route_table" "hackathon-company-rtb-public" {
  vpc_id = aws_vpc.hackathon-company-vpc.id
  tags = {
    "Name" = "hackathon-company-rtb-public"
  }
}

# configuracao de route table privada
resource "aws_route_table" "hackathon-company-rtb-private" {
  vpc_id = aws_vpc.hackathon-company-vpc.id
  tags = {
    "Name" = "hackathon-company-rtb-private"
  }
}

# configuracao de associations route table 
resource "aws_route_table_association" "hackathon-company-subnet-public1-us-east-1a_subnet" {
  subnet_id      = aws_subnet.hackathon-company-subnet-public1-us-east-1a.id
  route_table_id = aws_route_table.hackathon-company-rtb-public.id
}

resource "aws_route_table_association" "hackathon-company-subnet-private1-us-east-1a_subnet" {
  subnet_id      = aws_subnet.hackathon-company-subnet-private1-us-east-1a.id
  route_table_id = aws_route_table.hackathon-company-rtb-private.id
}

resource "aws_route_table_association" "hackathon-company-subnet-public2-us-east-1b_subnet" {
  subnet_id      = aws_subnet.hackathon-company-subnet-public2-us-east-1b.id
  route_table_id = aws_route_table.hackathon-company-rtb-public.id
}

resource "aws_route_table_association" "hackathon-company-subnet-private2-us-east-1b_subnet" {
  subnet_id      = aws_subnet.hackathon-company-subnet-private2-us-east-1b.id
  route_table_id = aws_route_table.hackathon-company-rtb-private.id
}

# configuracqo de nat vpc
resource "aws_eip" "nat" {
  domain = "vpc"
}

# configuracao de gatway
resource "aws_internet_gateway" "hackathon-company-igw" {
  vpc_id = aws_vpc.hackathon-company-vpc.id

  tags = {
    "Name" = "hackathon-company-igw"
  }
}

# configuracao de nat gatway
resource "aws_nat_gateway" "hackathon-company-nat-public1-us-east-1a" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.hackathon-company-subnet-public1-us-east-1a.id
  depends_on = [ aws_internet_gateway.hackathon-company-igw ]
}

# configuracao de route para gateway publico
resource "aws_route" "hackathon-company-public-igw" {
  route_table_id         = aws_route_table.hackathon-company-rtb-public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.hackathon-company-igw.id
}

# configuracao de route para gateway privado
resource "aws_route" "hackathon-company-private-ngw" {
  route_table_id         = aws_route_table.hackathon-company-rtb-private.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.hackathon-company-nat-public1-us-east-1a.id
}