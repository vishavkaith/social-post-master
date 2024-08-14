//const express =require("express");
const axios= require("axios");
//const path= require("path");



const express = require('express');
//const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const bodyParser= require("body-parser");
require('dotenv').config();

const app= express();
const port = 3000;
app.use(cors());

app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });


app.use(express.static(path.join(__dirname, 'public')));

// Route to handle OAuth 2.0 callback

app.get('/auth/callback',async(req,res)=>{
      // Handle OAuth callback and get access tokens

});

// Route to post on Facebook, Instagram, and WhatsApp

app.post('/post',async(req,res)=>{

    const {message,imageUrl}= req.bodyParse();
    try{
            // Post on Facebook
            await postOnFacebook(message,imageUrl);
           // Post on Instagram
            await postOnInstagram(message,imageUrl);

           // Post on watsapp
            await postOnWatsApp(message,imageUrl);

            res.status(200).send("Post Successfull on all platform");
    }
    catch(error){
        console.error('Error posting:', error);

        res.status(500).send("Error Posting on platform");

    }
    finally {
        if (imagePath) {
            fs.unlinkSync(imagePath); // Delete the uploaded file
        }
    }
});
app.listen(port,()=>{

    console.log(`Server running at http://localhost:${port}`);

});

async function postOnFacebook(message,imageUrl){

    const url = `https://graph.facebook.com/v12.0/me/feed`;
    const params = {
      access_token: process.env.FACEBOOK_ACCESS_TOKEN,
      message: message,
      link: imageUrl,
    };
  
    const response = await axios.post(url, null, { params });
    return response.data;
  

}
async function postOnInstagram(message,imageUrl){
    const url = `https://graph.facebook.com/v12.0/me/feed`;
    const params = {
      access_token: process.env.FACEBOOK_ACCESS_TOKEN,
      message: message,
      link: imageUrl,
    };
  
    const response = await axios.post(url, null, { params });
    return response.data;
  
}
async function postOnWatsApp(message,imageUrl){
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    const messageData = await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: 'whatsapp:your_recipient_number',
        body: `${message}\n${imageUrl}`,
    });

return messageData;
}