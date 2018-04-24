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
  PLANS_RECEIVED_BY: "G",
  TAKE_OFF_MADE: "H",
  TAKE_OFF_MADE_BY: "I",
  QUOTE_MADE: "J",
  QUOTE_MADE_BY: "K",
  QUOTE_CHECKED: "L",
  QUOTE_CHECKED_BY: "M",
  QUOTE_SENT: "N",
  QUOTE_SENT_BY: "O",
  OK: "P",
  REVISE: "Q",
  DENIED: "R",
  DEADLINE: "S",
  PURCHASE_MADE: "T",
  MATERIALS_ORDERED: "U",
  NOTES: "V"
};

const reverseFields = {
  A: "COMPANY",
  B: "CONTACT_NAME",
  C: "JOB_NAME",
  D: "PHONE",
  E: "EMAIL",
  F: "PLANS_RECEIVED",
  G: "PLANS_RECEIVED_BY",
  H: "TAKE_OFF_MADE",
  I: "TAKE_OFF_MADE_BY",
  J: "QUOTE_MADE",
  K: "QUOTE_MADE_BY",
  L: "QUOTE_CHECKED",
  M: "QUOTE_CHECKED_BY",
  N: "QUOTE_SENT",
  O: "QUOTE_SENT_BY",
  P: "OK",
  Q: "REVISE",
  R: "DENIED",
  S: "DEADLINE",
  T: "PURCHASE_MADE",
  U: "MATERIALS_ORDERED",
  V: "NOTES"
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
  Q: 16,
  R: 17,
  S: 18,
  T: 19,
  U: 20,
  V: 21
};

const numberFields = {
  0: "COMPANY",
  1: "CONTACT_NAME",
  2: "JOB_NAME",
  3: "PHONE",
  4: "EMAIL",
  5: "PLANS_RECEIVED",
  6: "PLANS_RECEIVED_BY",
  7: "TAKE_OFF_MADE",
  8: "TAKE_OFF_MADE_BY",
  9: "QUOTE_MADE",
  10: "QUOTE_MADE_BY",
  11: "QUOTE_CHECKED",
  12: "QUOTE_CHECKED_BY",
  13: "QUOTE_SENT",
  14: "QUOTE_SENT_BY",
  15: "OK",
  16: "REVISE",
  17: "DENIED",
  18: "DEADLINE",
  19: "PURCHASE_MADE",
  20: "MATERIALS_ORDERED",
  21: "NOTES"
};

const sortOptions = [
  "ALL",
  "TAKEOFF_INCOMPLETE",
  "INCOMPLETE_BY_RECEIVED",
  "ALL_BY_RECEIVED",
  "CUSTOMER"
];

// MAIN LOOP

const start = async auth => {

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/", "index.html"));
  });

  app.post("/DB", (req, res) => {});

  app.listen(PORT, () => {
    console.log("Now listening on port", PORT);
    searchByFields(auth)(["COMPANY", "NOTES"], ["ALL_BY_RECEIVED"]);
  });
};


// SEARCH FUNCTION

const searchByFields = auth => (fieldArray = [], sortOption = []) => {
  // Initialize search variables
  const sheets = google.sheets({ version: "v4", auth });

  const searchLetters = Object.keys(fields)
    .map(field => (fieldArray.includes(field) ? fields[field] : null))
    .filter(value => value != null)
    .sort();

  const searchFields = Object.keys(reverseFields)
    .map(
      field => (searchLetters.includes(field) ? reverseFields[field] : null)
    )
    .filter(value => value != null);

  const rowNumbers = searchLetters.map(letter => letterNumbers[letter]);

  const range =
    sortOption[0] === "INCOMPLETE"
      ? "A5:V"
      : fieldArray.length === 0
        ? "A5:V"
        : `${searchLetters[0]}5:${searchLetters[searchLetters.length - 1]}`;
  
  // SORT FUNCTIONS

  let sortFunction;

  const allSort = results => {
    return results;
  };

  const uncompletedSortByName = name => results => {
    return results.filter(item => {
      return !item.hasOwnProperty(name);
    });
  };

  const sortByDateByField = name => results => {
    return results
      .filter(item => {
        return (item.hasOwnProperty(name) &&
               !isNaN(Date.parse(item[name])));
      })
      .sort((a,b) => {
        return Date.parse(a[name]) - Date.parse(b[name]);
    });
  };

  const convertResultsToObjs = sortfn => (err, response) => {
    if (err) return console.log("The API returned an error: " + err);
    const { data } = response;
    const rows = data.values;
    if (rows.length) {
      let foundRows = rows.reduce((result, row) => {
        if (row[0] || row[1]) {
          //Ignore results without a 'Company' or 'Contact' entry
          result.push(row);
        }
        return result;
      }, []);

      let objectifiedRows = foundRows.map(row => {
        let newRow = row
          .map((item, i) => {
            let objFromItem = {};
            objFromItem[numberFields[i]] = item;
            return objFromItem;
          })
          .filter(obj => {
            return (
              Object.values(obj)[0] !== undefined &&
              Object.values(obj)[0].length !== 0
            );
          })
          .reduce((result, item) => {
            let key = Object.keys(item)[0];
            result[key] = Object.values(item)[0];
            return result;
          }, {});
        return newRow;
      });
      
      console.log(sortfn(objectifiedRows));
      return sortfn(objectifiedRows);
    } else {
      console.log("No data found.");
    }
  };

  let optionKey = sortOption[0];

  switch (optionKey) {
    case "ALL":
      sortFunction = allSort;
      break;
    case "TAKEOFF_INCOMPLETE":
      sortFunction = uncompletedSortByName("TAKE_OFF_MADE");
      break;
    case "ALL_BY_RECEIVED":
      sortFunction = sortByDateByField("PLANS_RECEIVED");
      break;
    case "CUSTOMER":
      sortFunction = sortByCustomerName(sortOption[1]);
      break;
    case "INCOMPLETE_BY_RECEIVED":
      break;
  }

  //Perform the search
  sheets.spreadsheets.values.get(
    {
      spreadsheetId: process.env.SHEETID,
      range: range
    },
    convertResultsToObjs(sortFunction)
  );
};
