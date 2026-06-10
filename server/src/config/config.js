const dotenv = require("dotenv");
dotenv.config();

if(!process.env.Db_password) {
    throw new error("Db_password is not defined in environment variables.");
}

if(!process.env.JWT_Secret) {
    throw new error("JWT_Secret is not defined in envrionment variables.");
}

if(!process.env.Google_CLIENT_ID){
    throw new error("Google_CLIENT_ID is not defined in environment variables.");
}

if(!process.env.Google_CLIENT_Secret){
    throw new error("Google_CLIENT_Secret is not defined in environment variables.");
}

if(!process.env.Google_REFRESH_Token){
    throw new error("Google_REFRESH_Token is not defined in environment varibales.");
}

if(!process.env.Google_USER){
    throw new error("Google_USER is not defined in environment variables.");
}

const config = {
    db: process.env.Db_password,
    jwt_secret: process.env.JWT_Secret,
    google_client_id: process.env.Google_CLIENT_ID,
    google_client_secret: process.env.Google_CLIENT_Secret,
    google_refresh_token: process.env.Google_REFRESH_Token,
    google_user: process.env.Google_USER
}

module.exports = config;