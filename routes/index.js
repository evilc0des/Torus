var express = require('express');
var router = express.Router();
var conf = require('../config');
var StreamDb = require('../model/stream');
var fs = require('fs');
var path = require("path");
var Transmission = require('transmission');
var transmission = new Transmission(conf.transmissionOpts);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Torus' });
});

router.get('/getTorrents', function(req, res, next) {
  	transmission.get(function(err, result) {
        if (err) {
            throw err;
        }
        if(result.torrents.length > 0){
        	/*console.log(result.torrents);
        	for(let torrent of result.torrents)
		    {
		    	console.log(torrent);			// Gets all details
        		console.log("Name = "+ torrent.name);
        		console.log("Download Rate = "+ torrent.rateDownload/1000);
        		console.log("Upload Rate = "+ torrent.rateUpload/1000);
        		console.log("Completed = "+ torrent.percentDone*100);
        		console.log("ETA = "+ torrent.eta/3600);
        		//console.log("Status = "+ getStatusType(torrent.status));
		    }*/
        	res.json({s: 'p', d:result});	
        }
    });
});

router.post('/addStream', function(req, res, next) {
	StreamDb.find({ 'torrentId': req.body.torrent.id, 'path': req.body.torrent.downloadDir + '/'+ req.body.filename }, function (err, docs) {
	  	if(err)
	  		throw err;
	  	if(docs.length != 0)
	  		res.json({s:'p', d: docs[0]._id});
	  	else
	  	{
	  		var streamDoc = new StreamDb();
	  		streamDoc.torrentId = req.body.torrent.id;
	  		streamDoc.path = req.body.torrent.downloadDir + '/' + req.body.filename;
	  		streamDoc.save(function(err, savedDoc){
	  			res.json({s:'p', d: savedDoc._id});
	  		});
	  	}
	});
});

router.post('/removeTorrent', function(req, res, next) {
	transmission.remove(req.body.torrent.id, true, function(err, result){
		if (err){
			console.log(err);
		} else {
			StreamDb.remove({torrentId: req.body.torrent.id}, function(err){
				if (err){
					console.log(err);
				} else {
					res.json({s:'p'});
				}
			});
		}
	});
});

router.get('/stream/:id', function(req, res, next) {
  	console.log(req.params.id);
  	StreamDb.findById(req.params.id, function (err, doc) {
	  	if(err)
	  	{
	  		console.log(err);
	  		throw err;
	  	}
	  	if(!doc)
	  	{
	  		console.log('nostream');
	  		res.json({s:'f', d:'nostream'});
	  	}
	  	else
	  	{
	  		console.log(doc);
	  		var file = path.resolve(doc.path);
	  		fs.stat(file, function(err, stats) {
		      if (err) {
		        if (err.code === 'ENOENT') {
		          // 404 Error if file not found
		          return res.sendStatus(404);
		        }
		      res.end(err);
		      }
		      var range = req.headers.range;
		      if (!range) {
		       // 416 Wrong range
		       return res.sendStatus(416);
		      }
		      var positions = range.replace(/bytes=/, "").split("-");
		      var start = parseInt(positions[0], 10);
		      var total = stats.size;
		      var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
		      var chunksize = (end - start) + 1;

		      res.writeHead(206, {
		        "Content-Range": "bytes " + start + "-" + end + "/" + total,
		        "Accept-Ranges": "bytes",
		        "Content-Length": chunksize,
		        "Content-Type": "video/mp4"
		      });

		      var stream = fs.createReadStream(file, { start: start, end: end })
		        .on("open", function() {
		          stream.pipe(res);
		        }).on("error", function(err) {
		          res.end(err);
		        });
		    });
	  		/*var movieStream = fs.createReadStream(doc.path);
			movieStream.on('open', function () {
			    /*res.writeHead(206, {
			        "Content-Range": "bytes " + start + "-" + end + "/" + total,
			            "Accept-Ranges": "bytes",
			            "Content-Length": chunksize,
			            "Content-Type": "video/mp4"
			    });
			    // This just pipes the read stream to the response object (which goes 
			    //to the client)
			    movieStream.pipe(res);
			});
			movieStream.on('error', function (err) {
			    console.log(err);
			    res.end(err);
			});*/
	  	}
	});
});

router.post('/addTorrent', function(req, res, next) {
  
	transmission.addUrl(req.body.url, {
    	"download-dir" : conf.storagePath
	}, function(err, result) {
	    if (err) {
	        return console.log(err);
	    }
	    var id = result.id;
	    console.log('Just added a new torrent.');
	    console.log('Torrent ID: ' + id);
	    //getTorrent(id);
	    res.json({s: 'p', d:id});	
	});
	    
});

module.exports = router;
