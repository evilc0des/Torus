"use strict";

function Config()
{
    this.port = '3000';
    this.dbUrl = 'mongodb://dksaha:21ststreet@ds129374.mlab.com:29374/torus';
    this.transmissionOpts = {
	    port : 9091,
	    host : '127.0.0.1'
	}
	this.storagePath = '/media/rapt0r/Movies/testTor'
}

module.exports = new Config();