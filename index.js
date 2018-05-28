import express from "express";
const dotenv = require("dotenv").config();
import path from "path";
import bodyParser from "body-parser";
const compression = require("compression");
const { Readable } = require("stream");
import fileUpload from "express-fileupload";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(compression());
app.use(
  fileUpload({
    safeFileNames: true,
    preserveExtension: 4,
    abortOnLimit: true
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("client/build/"));

const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const OAuth2Client = google.auth.OAuth2;
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
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
  NOTES: "V",
  id: "W",
  QUOTE_NUMBER: "X",
  Plans_Uploaded: "Y"
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
  V: "NOTES",
  W: "id",
  X: "QUOTE_NUMBER",
  Y: "Plans_Uploaded"
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
  V: 21,
  W: 22,
  X: 23,
  Y: 24
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
  21: "NOTES",
  22: "id",
  23: "QUOTE_NUMBER",
  24: "Plans_Uploaded"
};

const sortOptions = [
  "ALL",
  "TAKEOFF_INCOMPLETE",
  "QUOTE_INCOMPLETE",
  "ALL_BY_RECEIVED",
  "CUSTOMER",
  "COMPANY",
  "QUOTE_UNCHECKED",
  "QUOTE_UNSENT",
  "QUOTE_NUMBER"
];

// e.g. "CUSTOMER", "John Landry"

// MAIN LOOP

const start = async auth => {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/", "index.html"));
  });

  app.post("/api/DB", (req, res) => {
    const { fields, sortOption } = req.body;
    /*
      Example:
      body: JSON.stringify({
        fields: ["COMPANY", "NOTES"],
        sortOption: ["TAKEOFF_INCOMPLETE"] 
      })
    */
    searchByFields(auth)(fields, sortOption)(req, res);
  });

  app.post("/api/newPlan", (req, res) => {
    addNewPlan(auth)(req, res);
  });

  app.post("/api/takeoffComplete", (req, res) => {
    markItemComplete(auth)("takeoff")(req, res);
  });

  app.post("/api/quoteComplete", (req, res) => {
    markItemComplete(auth)("quote")(req, res);
  });

  app.post("/api/uploadPlan", (req, res) => {
    uploadFile("plans")(req, res);
  });

  app.post("/api/getPlan/:fileName", (req, res) => {
    downloadFile("plans")(req, res);
  });

  app.listen(PORT, () => {
    console.log("Now listening on port", PORT);
  });
};

// SEARCH FUNCTION

const searchByFields = auth => (fieldArray = [], sortOption = []) => (
  req,
  res
) => {
  // Initialize search variables
  const sheets = google.sheets({ version: "v4", auth });

  const searchLetters = Object.keys(fields)
    .map(field => (fieldArray.includes(field) ? fields[field] : null))
    .filter(value => value != null)
    .sort();

  const searchFields = Object.keys(reverseFields)
    .map(field => (searchLetters.includes(field) ? reverseFields[field] : null))
    .filter(value => value != null);

  const rowNumbers = searchLetters.map(letter => letterNumbers[letter]);

  const range =
    fieldArray.length === 0
      ? "A5:Y"
      : `${searchLetters[0]}5:${searchLetters[searchLetters.length - 1]}`;

  // SORT FUNCTIONS

  let sortFunction;

  const allSort = results => {
    return results;
  };

  const uncompletedSortByName = name => results => {
    return sortByDateByField("PLANS_RECEIVED", true)(
      results.filter(item => {
        return !item.hasOwnProperty(name);
      })
    );
  };

  const sortByDateByField = (name, includeNoDate = false) => results => {
    let secondCondition = true;
    return results
      .filter(item => {
        if (!includeNoDate) {
          secondCondition = !isNaN(Date.parse(item[name]));
        }
        return item.hasOwnProperty(name) && secondCondition;
      })
      .sort((a, b) => {
        return Date.parse(a[name]) - Date.parse(b[name]);
      });
  };

  const filterByFieldName = field => name => results => {
    return results.filter(item => {
      return (
        item.hasOwnProperty(field) && new RegExp(name, "i").test(item[field])
      );
    });
  };

  const convertResultsToObjs = sortfn => (error, response) => {
    if (error) return res.json({ err: `The API returned an error ${error}` });
    const { data } = response;
    const rows = data.values;

    //let dataStream = new Readable();
    //dataStream._read = () => {};

    if (rows.length) {
      let objectifiedRows = rows
        .reduce((result, row) => {
          if (row[0] || row[1]) {
            //Ignore results without a 'Company' or 'Contact' entry
            result.push(row);
          }
          return result;
        }, [])
        .map(row => {
          return row
            .map((item, i) => {
              let objFromItem = {};
              // adds all fields to an object
              objFromItem[numberFields[i]] = item;
              return objFromItem;
            })
            .filter(obj => {
              // removes empty fields
              return (
                Object.values(obj)[0] !== undefined &&
                Object.values(obj)[0].length !== 0
              );
            })
            .reduce((result, item) => {
              // populates the object with relevant details
              let key = Object.keys(item)[0];
              result[key] = Object.values(item)[0];
              return result;
            }, {});
        });

      //sortfn(objectifiedRows).forEach(row => dataStream.push(JSON.stringify(row)));
      //dataStream.push(JSON.stringify(sortfn(objectifiedRows)));
      //dataStream.push(null);
      //dataStream.pipe(res);
      res.json(sortfn(objectifiedRows));
    } else {
      res.json({ err: "No Data Found!" });
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
    case "QUOTE_INCOMPLETE":
      sortFunction = uncompletedSortByName("QUOTE_MADE");
      break;
    case "ALL_BY_RECEIVED":
      sortFunction = sortByDateByField("PLANS_RECEIVED");
      break;
    case "CUSTOMER":
      sortFunction = filterByFieldName("CONTACT_NAME")(sortOption[1]);
      break;
    case "COMPANY":
      sortFunction = filterByFieldName("COMPANY")(sortOption[1]);
      break;
    case "JOB":
      sortFunction = filterByFieldName("JOB_NAME")(sortOption[1]);
      break;
    case "QUOTE_UNCHECKED":
      sortFunction = uncompletedSortByName("QUOTE_CHECKED");
      break;
    case "QUOTE_UNSENT":
      sortFunction = uncompletedSortByName("QUOTE_SENT");
      break;
    case "QUOTE_NUMBER":
      sortFunction = filterByFieldName("QUOTE_NUMBER")(sortOption[1]);
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

const addNewPlan = auth => (req, res) => {
  const sheets = google.sheets({ version: "v4", auth });
  const date = new Date();
  const dateString =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
  let appendedArray = [
    req.body.COMPANY,
    req.body.CONTACT,
    req.body.JOB,
    req.body.PHONE,
    req.body.EMAIL,
    dateString,
    req.body.ENTERED_BY
  ];

  let appendedRange = "A:G";

  if (req.body.NOTES && !req.body.Plans_Uploaded) {
    appendedRange = "A:V";
    appendedArray = appendedArray
      .concat(Array(14).fill(null))
      .concat(req.body.NOTES);
  } else if (req.body.NOTES && req.body.Plans_Uploaded) {
    appendedRange = "A:Y";
    appendedArray = appendedArray
      .concat(Array(14).fill(null))
      .concat(req.body.NOTES)
      .concat([null, null])
      .concat(req.body.Plans_Uploaded);
  } else if (!req.body.NOTES && req.body.Plans_Uploaded) {
    appendedRange = "A:Y";
    appendedArray = appendedArray
      .concat(Array(17).fill(null))
      .concat(req.body.Plans_Uploaded);
  }

  const request = {
    spreadsheetId: process.env.SHEETID,
    range: appendedRange,
    insertDataOption: "INSERT_ROWS",
    responseDateTimeRenderOption: "FORMATTED_STRING",
    responseValueRenderOption: "FORMATTED_VALUE",
    valueInputOption: "USER_ENTERED",
    auth: auth,
    resource: {
      values: [appendedArray]
    }
  };

  sheets.spreadsheets.values.append(request, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ err: err });
    }
    return res.json({ message: "data appended successfully" });
  });
};

const markItemComplete = auth => (conditional = "takeoff") => (req, res) => {
  let { id, name, number } = req.body;
  id = parseInt(id);
  const sheets = google.sheets({ version: "v4", auth });
  const date = new Date();
  const dateString =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();

  let range =
    conditional === "takeoff"
      ? `H${id + 4}:I${id + 4}`
      : conditional === "quote"
        ? `J${id + 4}:K${id + 4}`
        : "";

  let appendedArray = [dateString, name];

  if (conditional === "quote" && number) {
    range = `J${id + 4}:X${id + 4}`;
    appendedArray = appendedArray.concat(Array(12).fill(null)).concat(number);
  }

  const request = {
    spreadsheetId: process.env.SHEETID,
    range: range,
    responseDateTimeRenderOption: "FORMATTED_STRING",
    responseValueRenderOption: "FORMATTED_VALUE",
    valueInputOption: "USER_ENTERED",
    auth: auth,
    resource: {
      values: [appendedArray],
      range: range
    }
  };

  sheets.spreadsheets.values.update(request, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ err: err });
    }
    return res.json({ message: "Updated successfully" });
  });
};

const downloadFile = (option = "plans") => (req, res) => {
  const title = req.params.fileName;
  const file = path.resolve(`./${option}/${title}`);
    res.download(file, err => {
      if (err) {
        console.log("Error downloading plan", err);
        res.status(500).send("File not found!");
      }
    });
};

const uploadFile = (option = "plans") => (req, res) => {
  let { title } = req.body;
  const { file } = req.files;
  let periodI = file.name.lastIndexOf(".");
  title += file.name.substring(periodI);

  file
      .mv(path.resolve(`./${option}/${title}`))
      .then(() => {
        console.log("File uploaded!");
        res.send({ title: title });
      })
      .catch(err => {
        console.log("Error uploading file", err);
        res.status(500).send({ err: err });
      });
};
