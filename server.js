const express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  port = process.env.PORT || 5000,
  fs = require('fs'),
  xml2js = require('xml2js'),
  csvToJson = require('convert-csv-to-json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function nameToUpperCase(value){
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function retrieveRecords() {
  let result = {
    compinedRecords : [],
    errors: []
  };

  return new Promise(function(resolve, reject) {

    // Firstly retrieve and parse the xml file to json
    const parser = new xml2js.Parser({
      explicitArray : false,
      tagNameProcessors: [nameToUpperCase],
      attrNameProcessors: [nameToUpperCase]
    });
  
    let xmlRecord = [];
    let processedRecords = [];

    return fs.readFile(__dirname + '/data/records.xml', function(err, data) {
      if (err) {
        result.errors.push('ERROR RETRIEVING XML FILE');
        resolve(processedRecords);
        return;
      }

      return parser.parseString(data, function (err, res) {
        if (err) {
          res.errors.push('ERROR RETRIEVING XML FILE');
          resolve(processedRecords);
          return;
        }
  
        if (res && res.Records && res.Records.Record) {
          xmlRecord = res.Records.Record;
        }
  
        processedRecords = xmlRecord.filter(record => {
          if (record['$'] && record['$'].Reference) {
            record.Reference = record['$'].Reference; 
            delete record['$'];
          } else {
            record.Reference = '';
          }
          return record;
        });

        resolve(processedRecords);
      });
    });
  
  }).then(function(res) {

    // Secondly retrieve and parse the csv file to json
    let jsonRecords = [];

    try {
      jsonRecords = csvToJson.fieldDelimiter(',').getJsonFromCsv("./data/records.csv");
      result.compinedRecords = [...res, ...jsonRecords] ;
    }
    catch(err) {
      result.errors.push('ERROR RETRIEVING XML FILE');
      result.compinedRecords = res ;
    }

    //Return the combined array of both the xml and csv file
    return result;
  });
}

app.get('/api/report', (req, res) => {

  // Retrieve all records from both the xml and csv file and then validate
  retrieveRecords().then(function(result) {
    const failedRecords = result.compinedRecords.filter(record => {

      // Validate the end balance of each record
      let total = +record.StartBalance + +record.Mutation;
      total = Math.round(total * 100) / 100

      // Validate the reference number of each record
      let hasDuplicate = false;
      let count = 0;
      result.compinedRecords.map(dupRecord => {
        if (+record.Reference === +dupRecord.Reference) {
          count++;
        }
        return hasDuplicate = count > 1;
      });

      return (+record.EndBalance !== +total) || hasDuplicate;
    });

    // Respond the the failed records and any errors to the client side application
    res.send({ 
      report: failedRecords,
      error: result.errors[0]
     });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));