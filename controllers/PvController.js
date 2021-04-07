const Pv = require("../models/pv");
const fs = require('fs');
const Grid = require("gridfs-stream");
require('../server.js'); // which executes 'mongoose.connect()'
const path = require('path')
var mongoose = require('mongoose');

exports.findAll = async (req, resp) => {
    try {
        const pv = await Pv.find({laboratory_id: mongoose.Types.ObjectId(req.params._id)});
        resp.status(200).send(pv);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
}


exports.createPv = async (req, resp) => {
  

    //preparing the files
    var rapport;
    var annexe;
    if (req.files.file1.mimetype == "application/pdf") {
        rapport = req.files.file1
    } else if (req.files.file1.mimetype == "application/vnd.ms-excel" || req.files.file1.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        annexe = req.files.file1
    }

    if (req.files.file2.mimetype == "application/pdf") {
        rapport = req.files.file2
    } else if (req.files.file2.mimetype == "application/vnd.ms-excel" || req.files.file2.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        annexe = req.files.file2
    }


    //upload in the server
    let rapportUrl = rapport.name;
    let rapportPath = __dirname + "/../pvs/" + rapportUrl;
    rapport.mv(rapportPath, function (err) {
        if (err) {
            console.log(err);
        }
    });

    let annexeUrl = annexe.name;
    let annexePath = __dirname + "/../pvs/" + annexeUrl;
    annexe.mv(annexePath, function (err) {
        if (err) {
            console.log(err);
        }
    });

    //upload in the database
    fs.readFile(path.join(__dirname + '/../pvs/' + rapport.name), 'utf8', async function (err, rapportData) {
        fs.readFile(path.join(__dirname + '/../pvs/' + annexe.name), 'utf8', async function (err, annexeData) {
            try {
                
                var obj = {
                    date: req.body.date,
                    rapport: {
                        data: rapportData,
                        contentType: 'application/pdf',
                        nom: rapport.name
                    },
                    annexe: {
                        data: annexeData,
                        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        nom: annexe.name
    
                    },
                    laboratory_id: req.body.laboratory_id
                }
                const response = await Pv.create(obj);
                resp.status(200).send(response);
            } catch (error) {
                console.log(error);
                resp.status(500).send(error);
            }
            
        });
    });






    /**
    var url = path.join(__dirname + '/../pvs/' + rapport.name)
    Grid.mongo = mongoose.mongo;
    var gfs = Grid(mongoose.connection.db);
    var writeStream = gfs.createWriteStream({
        filename: rapport.name
    })

    fs.createReadStream(url).pipe(writeStream);
    writeStream.on('close', function (file) {
        console.log("=======>done")
    })
    */
}

exports.findPv = async (req, resp) => {
    try {
        const pv = await Pv.findById(req.params._id);
        resp.status(200).send(pv);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
};


exports.deletePv = async (req, resp) => {
    try {
        const resultPvDelete = await Pv.deleteOne({ _id: req.params._id });
        resp.status(200).send(resultPvDelete);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
}