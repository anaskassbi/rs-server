const Pv = require("../models/pv");
require('../server.js'); 
var mongoose = require('mongoose');

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

exports.findPv = async (req, resp) => {
    try {
        var file={};
        console.log(req.params._id)
        console.log(req.params._doc)
        const pv = await Pv.findById(req.params._id);
        var docs = pv.rapport.concat(pv.annexe)
        docs.forEach((doc)=>{
            if(doc._id==req.params._doc){
                file=doc;
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