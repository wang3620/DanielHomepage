# How to Run This Program

1. `npm install`
2. start your redis and mariadb
3. run sql statement to initialize database. See files in `./sql_statements`
4. `npm run build` or `npm run build-local`
5. `npm start` or `npm run start-local`
6. go to `https://localhost:8080` to view your page


# Misc

### About database

please create database with name and user according to the following configs. Currently these configs are hardcoded:

```javascript
const pool = mariadb.createPool({
host: 'localhost',
user: 'daniel',
password: '7777',
database: 'danielHomepage',
connectionLimit: 100
});
```

### About officialdaniel.com ssl Certificates

The ssl certificate is bought on [ssls](https://www.ssls.com/)

Please refer to [Daniel's OneDrive](https://onedrive.live.com/?id=3418FCE41D5324F5%214827&cid=3418FCE41D5324F5). Email chenguang89.wang@outlook.com for details.

### About frontend.js

Currently it's always trying to connect `wss://officialdaniel.com:1337`

### About dotenv-webpack

During build or build-local process, it passes .env or .env.local files' en vars into react files.