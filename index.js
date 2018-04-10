import express from "express";
const dotenv = require("dotenv").config();
import path from "path";

const PORT = process.env.PORT;
const app = express();

const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const OAuth2Client = google.auth.OAuth2;
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const TOKEN_PATH = "credentials.json";

app.use(express.static(path.join(__dirname, "client/build")));

// Load client secrets from a local file.
fs.readFile("client_secret.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), start);
  // I think I can put the main function in the callback here
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new OAuth2Client(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

const fields = {
  COMPANY: "A",
  CONTACT_NAME: "B",
  JOB_NAME: "C",
  PHONE: "D",
  EMAIL: "E",
  PLANS_RECEIVED: "F",
  TAKE_OFF_MADE: "G",
  QUOTE_MADE: "H",
  QUOTE_CHECKED: "I",
  QUOTE_SENT: "J",
  OK: "K",
  REVISE: "L",
  DENIED: "M",
  DEADLINE: "N",
  PURCHASE_MADE: "O",
  MATERIALS_ORDERED: "P",
  NOTES: "Q"
};

const reverseFields = {
  A: "COMPANY",
  B: "CONTACT_NAME",
  C: "JOB_NAME",
  D: "PHONE",
  E: "EMAIL",
  F: "PLANS_RECEIVED",
  G: "TAKE_OFF_MADE",
  H: "QUOTE_MADE",
  I: "QUOTE_CHECKED",
  J: "QUOTE_SENT",
  K: "OK",
  L: "REVISE",
  M: "DENIED",
  N: "DEADLINE",
  O: "PURCHASE_MADE",
  P: "MATERIALS_ORDERED",
  Q: "NOTES"
};

const letterNumbers = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 10,
  L: 11,
  M: 12,
  N: 13,
  O: 14,
  P: 15,
  Q: 16
};

const start = auth => {
  const sheets = google.sheets({ version: "v4", auth });

  const searchByFields = fieldArray => {
    let searchLetters = Object.keys(fields)
      .map(field => (fieldArray.includes(field) ? fields[field] : null))
      .filter(value => value != null)
      .sort();

    let searchFields = Object.keys(reverseFields)
      .map(
        field => (searchLetters.includes(field) ? reverseFields[field] : null)
      )
      .filter(value => value != null);

    let rowNumbers = searchLetters.map(letter => letterNumbers[letter]);

    const range = `${searchLetters[0]}5:${
      searchLetters[searchLetters.length - 1]
    }`;

    sheets.spreadsheets.values.get(
      {
        spreadsheetId: process.env.SHEETID,
        range: range
      },
      (err, { data }) => {
        if (err) return console.log("The API returned an error: " + err);
        const rows = data.values;
        if (rows.length) {
          console.log(searchFields);
          // Print columns A and E, which correspond to indices 0 and 4.
          rows.map(row => {
            if (row[0]) {
              let string = "";
              rowNumbers.forEach(
                number => (row[number] ? (string += `${row[number]}  `) : null)
              );
              console.log(string);
            }
          });
        } else {
          console.log("No data found.");
        }
      }
    );
  };

  searchByFields(["COMPANY", "EMAIL", "NOTES"]);

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/", "index.html"));
  });

  app.post("/DB", (req, res) => {});

  app.listen(PORT);
  console.log("Now listening on port", PORT);
};
