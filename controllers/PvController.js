const Pv = require("../models/pv");
require('../server.js');
var mongoose = require('mongoose');
const firebase = require('../helpers/firebase')

exports.findAll = async (req, resp) => {
    try {
        const pv = await Pv.find({ laboratory_id: mongoose.Types.ObjectId(req.params._id) });
        resp.status(200).send(pv);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
}


exports.createPv = async (req, resp) => {
    var files = req.files;
    var keys = Object.keys(files);

    var rapports = new Array();
    var annexes = new Array();

    keys.forEach((key) => {
        var file = files[key];
        if (file.mimetype == "application/pdf") {
            rapports.push(file);
        } else if (file.mimetype == "application/vnd.ms-excel" || file.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            annexes.push(file)
        }
    })

    /*
    const blob = firebase.bucket.file(rapports[0]);
    const blobWriter = blob.createWriteStream({
        metadata: {
            contentType: rapports[0].mimetype
        }
    });

    blobWriter.on('error', (err) => {
        console.log(err)
    })

    blobWriter.on('finish', () => {
        //res.status(200).send("File uploaded.")
        console.log("file uploaded ============>")
    })

    blobWriter.end(rapports[0].buffer)
*/


    try {

        var obj = {
            date: req.body.date,
            rapport: rapports,
            annexe: annexes,
            laboratory_id: req.body.laboratory_id
        }
        const response = await Pv.create(obj);
        resp.status(200).send(response);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }

}

exports.removeElement = async (req, resp) => {
    const { type, racine, element } = req.body;
    console.log("removeElement " + racine + "   " + element);
    var resultPvDelete;
    try {
        if (type == "rapport") {
            resultPvDelete = await Pv.updateOne({ _id: racine }, { $pull: { "rapport": { _id: element } } })
        } else {
            resultPvDelete = await Pv.updateOne({ _id: racine }, { $pull: { "annexe": { _id: element } } })
        }
        resp.status(200).send(resultPvDelete);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
}

exports.findPvById = async (req, resp) => {
    try {
        const draggedElement = await Pv.findOne({ _id: req.params._id })
        resp.status(200).send(draggedElement);

    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
}


exports.dragDropElement = async (req, resp) => {
    const { type, racineSrc, elementSrc, racineDest } = req.body;
    try {
        const draggedElement = await Pv.findOne({ _id: racineSrc })

        if (type == "annexe") {
            files = draggedElement.annexe;

        } else {
            files = draggedElement.rapport;

        }

        var file;
        files.forEach((e) => {
            if (e._id == elementSrc)
                file = e;
        })

        var resultPull;
        var resultPush;
        if (type == "annexe") {
            resultPull = await Pv.updateOne({ _id: racineSrc }, { $pull: { "annexe": { _id: elementSrc } } })
            resultPush = await Pv.updateOne({ _id: racineDest }, { $push: { "annexe": file } })
        } else {
            resultPull = await Pv.updateOne({ _id: racineSrc }, { $pull: { "rapport": { _id: elementSrc } } })
            resultPush = await Pv.updateOne({ _id: racineDest }, { $push: { "rapport": file } })
        }
        resp.status(200).send({ resultPull, resultPush });

    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
}

exports.findPv = async (req, resp) => {
    try {
        var file = {};
        console.log(req.params._id)
        console.log(req.params._doc)
        const pv = await Pv.findById(req.params._id);
        var docs = pv.rapport.concat(pv.annexe)
        docs.forEach((doc) => {
            if (doc._id == req.params._doc) {
                file = doc;
            }
        })
        console.log(file)
        resp.status(200).send(file);
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