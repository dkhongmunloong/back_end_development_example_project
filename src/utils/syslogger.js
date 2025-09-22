
// add on advanced feature system logging to log file
const winston = require('winston');
const { format } = winston;
const { combine, label, json } = format;

const myFormat = winston.format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

winston.loggers.add('user_controller', {
  format: combine(
    label({ label: 'user controller' }),
    winston.format.timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.File({ filename: "./logs/webservices.log" })
  ]
});

winston.loggers.add('category_controller', {
  format: combine(
    label({ label: 'category controller' }),
    winston.format.timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.File({ filename: "./logs/webservices.log" })
  ]
});

winston.loggers.add('product_controller', {
  format: combine(
    label({ label: 'product controller' }),
    winston.format.timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.File({ filename: "./logs/webservices.log" })
  ]
});

winston.loggers.add('main', {
  format: combine(
    label({ label: 'main modules and services' }),
    winston.format.timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.File({ filename: "./logs/webservices.log" })
  ]
});

console.log('logger has started');

module.exports = true;