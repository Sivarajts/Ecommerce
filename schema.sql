CREATE DATABASE IF NOT EXISTS ecommdb;

USE ecommdb;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description TEXT
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(100),
  mrp_price DECIMAL(10,2),
  discounted_price DECIMAL(10,2),
  description TEXT,
  image_url VARCHAR(255),
  quantity INT DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
