const dotenv = require("dotenv");
dotenv.config();

if(!process.env.Db_password) {
    throw new Error("Db_password is not defined in environment variables.");
}

if(!process.env.JWT_Secret) {
    throw new Error("JWT_Secret is not defined in envrionment variables.");
}

if(!process.env.Google_CLIENT_ID){
    throw new Error("Google_CLIENT_ID is not defined in environment variables.");
}

if(!process.env.Google_CLIENT_Secret){
    throw new Error("Google_CLIENT_Secret is not defined in environment variables.");
}

if(!process.env.Google_REFRESH_Token){
    throw new Error("Google_REFRESH_Token is not defined in environment varibales.");
}

if(!process.env.Google_USER){
    throw new Error("Google_USER is not defined in environment variables.");
}

if(!process.env.Github_CLIENT_ID){
    throw new Error("Github_CLIENT_ID is not defined in environment variables.");
}

if(!process.env.Github_CLIENT_Secret){
    throw new Error("Github_CLIENT_Secret is not defined in environment variables.");
}

if(!process.env.Gnews_API_KEY){
    throw new Error("Gnews_API_KEY is not defined in environment variables.");
}

if(!process.env.DevPost_API_KEY){
    throw new Error("DevPost_API_KEY is not defined in environment variables.");
}

if(!process.env.Brabble_API_KEY){
    throw new Error("Brabble_API_KEY is not defined in environment variables.");
}

const config = {
    db: process.env.Db_password,
    jwt_secret: process.env.JWT_Secret,
    google_client_id: process.env.Google_CLIENT_ID,
    google_client_secret: process.env.Google_CLIENT_Secret,
    google_refresh_token: process.env.Google_REFRESH_Token,
    google_user: process.env.Google_USER,
    github_client_id: process.env.Github_CLIENT_ID,
    github_client_secret: process.env.Github_CLIENT_Secret,
    gnews_api_key: process.env.Gnews_API_KEY,
    devpost_api_key: process.env.DevPost_API_KEY,
    brabble_api_key: process.env.Brabble_API_KEY
};

module.exports = config;