module.exports = {
  server: {
    host: 'localhost',
    port: 4400,
    maxBytes: 104857600
  },
  JWTConfig: {
    secret: 'THEDARKKNIGHT'
  },
  database: {
    uri: 'mongodb://localhost:27017/kiddogardener'
  },
  s3config: {
    accessKey: '',
    secretKey: '',
    bucket: 'kiddogardener',
    region: 'ap-southeast-1'
  }
};
