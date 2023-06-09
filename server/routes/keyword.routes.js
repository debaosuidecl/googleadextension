const express = require("express");
const router = express.Router();
const Keyword = require("../models/Keyword.model")

router.get('/', async (req, res) => {
    try {
        const keyword = await Keyword.findOne();
        console.log(keyword, 8)
        res.json(keyword)
    } catch (error) {
        console.log(error)
        res.status(400).send({
            error: true
        })
    }
})

router.post("/schedule/:id", async (req, res) => {
    console.log(req.json, req.body, req.params)

    const { id, locations, keywords } = req.json;

    try {
        const keywordalreadyexists = await Keyword.findOne();

        if (!keywordalreadyexists) {

            const newkeyword = await new Keyword({
                keywordid: id,
                locations,
                keywords,
                scheduled: true
            }).save();

            res.json(newkeyword)
        } else {

            const updatekeyword = await Keyword.findOneAndUpdate({
                keyword: id
            }, {
                scheduled: true,
                keywords,
                keyword: id,
                locations,
            }, {
                new: true
            })


            res.json(updatekeyword);

        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: true,
        })

    }
})

router.post("/save-keyword/:id", async (req, res) => {
    console.log(req.json, req.body, req.params)


    res.json({
        message: "saved"
    })
})


module.exports = router