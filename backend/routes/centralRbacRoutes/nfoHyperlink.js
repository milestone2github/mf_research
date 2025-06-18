const express = require("express");
const { getNfoHyperlinks, updateNfoHyperlinks } = require("../../controllers/centralRbacControllers/nfoHyperlink");
const nfoHyperlinkRouter = express.Router();

// nfoHyperlink Routes

nfoHyperlinkRouter.get('/', getNfoHyperlinks);
nfoHyperlinkRouter.patch('/', updateNfoHyperlinks);


module.exports = nfoHyperlinkRouter;