const express = require("express");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const FormData = require("form-data");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: "uploads/" });
app.use(express.json());

// Route to post on Facebook, Instagram, and WhatsApp
app.post("/post", upload.array("files"), async (req, res) => {
  const message = req.body.message; // Correctly extracting 'message'
  const files = req.files; // Renamed to 'files' for clarity

  //console.log("Message Received:", message);
  //console.log("Files Received:", files);

  if (!message || files.length === 0) {
    return res.status(400).send("Message and at least one image are required.");
  }

  try {
    const uploadedImageIds = [];

    // Upload images to Facebook
    for (let file of files) {
      const formData = new FormData();
      console.log("Files Received:",file);
      formData.append("access_token", process.env.FACEBOOK_ACCESS_TOKEN);
      formData.append("source", fs.createReadStream(file.path));

      const uploadResponse = await axios.post(
        `https://graph.facebook.com/v12.0/me/photos`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      uploadedImageIds.push(uploadResponse.data.id);
console.log("uploadedImageIds"+uploadedImageIds);
      // Remove the file from the server after uploading
      fs.unlinkSync(file.path);
    }

    // Create a post with the uploaded images
    const postParams = {
      access_token: process.env.FACEBOOK_ACCESS_TOKEN,
      message: message,
      attached_media: uploadedImageIds.map((id) => ({ media_fbid: id })),
    };

    // Post on Facebook
    await postOnFacebook(postParams);

    // Post on Instagram
    await postOnInstagram(message, files);

    // Post on WhatsApp
    await postOnWhatsApp(message, files);

    res.status(200).send("Post successful on all platforms.");
  } catch (error) {
    console.error('Complete error object:', error);
    console.error('Error message:', error.message);
    console.error('Error posting:', error.message);
  if (error.response) {
    console.error('Error response data:', error.response.data);
    res.status(500).send(error.response.data);
  } else {
    res.status(500).send('Error posting');
  }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

async function postOnFacebook(postParams) {
  const url = `https://graph.facebook.com/v12.0/me/feed`;

  const response = await axios.post(url, null, { params: postParams });
  return response.data;
}

async function postOnInstagram(message, files) {
  // Implementation for Instagram post goes here
}

async function postOnWhatsApp(message, files) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require("twilio")(accountSid, authToken);

  const messageData = await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: "whatsapp:your_recipient_number",
    body: `${message}\n${files.map((file) => file.path).join("\n")}`,
  });

  return messageData;
}
