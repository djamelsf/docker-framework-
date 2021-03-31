const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
//const url = 'mongodb://mongodb:rootroot@192.168.56.103:27017';
const url = 'mongodb://root:example@172.18.0.2:27017';

// Database Name
const dbName = 'cfpindex';

// Create a new MongoClient
const client = new MongoClient(url, {useUnifiedTopology: true});

const findDocuments = function (db, col, callback) {
    // Get the documents collection
    const collection = db.collection(col);
    // Find some documents
    collection.find({}).toArray(function (err, docs) {
        assert.equal(err, null);
        callback(docs);
    });
}

// Use connect method to connect to the Server
client.connect(function (err) {
    assert.equal(err, null);
    console.log("Connected correctly to server");
    const db = client.db(dbName);
    findDocuments(db, 'pop', function (data) {
        console.log("Found the following records");
        console.log('data', data);
        client.close();
    });
});
