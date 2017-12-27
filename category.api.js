const express = require('express'),
    httpStatus = require('http-status-codes');

const router = express.Router();

const category = require('../models/category');

router.get("/", (req, res) => {
    category.find({}).then((docs) => {
        return res.status(httpStatus.OK).send(docs);
    }).catch((err) => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err);
    });
}).get("/:id", function (req, res) {
    var id = req.params.id;
    category.findById(id, function (err, data) {
        if (err)
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.stack);
        else
            res.status(httpStatus.OK).send(data);
    });
}).post("/", function (req, res) {
    var body = req.body;
    var obj = new category(body);
    obj.save(function (err, data) {
        if (err)
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.stack);
        else
            res.status(httpStatus.CREATED).send();
    });
})
    .put("/:id", function (req, res) {
        var id = req.params.id;
        var body = req.body;
        category.findByIdAndUpdate(id, {
            name: body.name, description: body
                .description
        }, function (err, data) {
            if (err)
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.stack);
            else
                res.status(httpStatus.OK).send();
        });
    })
    .delete("/:id", function (req, res) {
        var id = req.params.id;
        category.findByIdAndRemove(id, function (err, data) {
            if (err)
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.stack);
            else
                res.status(httpStatus.OK).send();
        });
    });

module.exports = router;