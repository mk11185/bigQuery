const controller = require('./controller')
const express = require('express');
const router = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

router.post('/',controller.listDataSet)
router.post('/uploadCsv',upload.single('myfile'),controller.uploadDataSet)
router.post('/uploadLocalFile',upload.single('myfile'),controller.loadLocalCsv)

module.exports = router