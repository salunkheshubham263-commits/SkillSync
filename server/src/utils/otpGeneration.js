const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const getOtpHtml = (otp) => {
    return `<!doctype html>
    <html lang="en">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 50px auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                color: #333;
            }
            .otp {
                font-size: 24px;
                font-weight: bold;
                color: #007BFF;
                text-align: center;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                color: #777;
                font-size: 12px;
            }
    </style>
    </head>
    <body>
        <div class="container">
            <h2 class="header">Your OTP Code</h2>
            <h2 class="otp">${otp}</h2>
            <p> use this OTP code to verify your email address.</p>
           <p class="footer">This OTP is valid for 10 minutes. Please do not share it with anyone. 
           And if you didn't request this, please ignore this email.</p>
        </div>
    </body>
    </html>`
}

module.exports = {generateOtp, getOtpHtml};