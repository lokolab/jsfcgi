/**
 * Wrapper for applications in Node.js via "mod_fcgid".
 *
 * Copyright Krystian Pietruszka <kpietru@lokolab.net>
 * License MIT
 */

var fs = require('fs');
var fastcgi = require('node-fastcgi');

function NjsFcgi(fastcgi) {
    this.fastcgi = fastcgi;
};

NjsFcgi.prototype.callback = null;
NjsFcgi.prototype.server = null;
NjsFcgi.prototype.fastcgi = null;

NjsFcgi.prototype.createServer = function(callback) {
    this.callback = callback;
    return this.server;
};

NjsFcgi.prototype.listen = function() {
    return this.server;
};

NjsFcgi.prototype.runnnnnnnnnnnnnnnnnn = function(encoding) {
    var encoding = encoding || 'utf8';
    var self = this;
    this.server = this.fastcgi.createServer(function(request, response) {
        fs.readFile(request.cgiParams['SCRIPT_FILENAME'], encoding, function(error, data) {
            if (error) throw error;
            var njsfcgi = self;
            if (data.match(/^#!.+/))          var data = '//' + data;
            
            // Overwrite global __filename
            __filename = request.cgiParams['SCRIPT_FILENAME'];

            // Overwrite global __dirname
            var dirname = request.cgiParams['SCRIPT_FILENAME'].split('/');
            dirname.pop();
            __dirname = dirname.join('/');
            
            eval(data);
            if (!njsfcgi)                     throw 'Variable njsfcgi undefined.';
            if (typeof(njsfcgi) !== 'object') throw 'Variable njsfcgi must be an object.';
            njsfcgi.callback(request, response);
        });
    }).listen();
};

// front controller as module
NjsFcgi.prototype.run = function(encoding) {
    var self = this;
    this.server = this.fastcgi.createServer(function(request, response) {
            require(request.cgiParams['SCRIPT_FILENAME'])(self)
            self.callback(request, response);
    }).listen();
};


module.exports = new NjsFcgi(fastcgi);


/*
var fs = require('fs');
var fastcgi = require('node-fastcgi');

module.exports = {

    wraper: {

        run: function() {
            server = module.exports.server();
            server.listen_for_wrapper();
        }

    },

    server: function(application) {

        this.adapter = fastcgi;
        this.application = application;
        return {
        createServer: function(responder, authorizer, filter, config) {
            return this.adapter.function(responder, authorizer, filter, config);
        }

        listen: function() {
            //return this.application;
            return this.adapter.listen();
        }

        listen_for_wrapper: function() {
            return this.createServer(this._process).listen();
        }

        _process: function(request, response) {
            var encoding = 'utf8';
            fs.readFile(request.cgiParams['SCRIPT_FILENAME'], encoding, function(error, data) {
                if (error) throw error;
                var njsfcgi = self;
                if (data.match(/^#!.+/))          var data = '//' + data;
                //if (data.substring(0, 2) === '!#' var data = '//' + data;
                eval(data);
                if (!njsfcgi)                     throw 'Variable "njsfcgi" undefined.';
                if (typeof(njsfcgi) !== 'object') throw 'Variable "njsfcgi" must be an object.';
                njsfcgi.callback(request, response);
            });
        }}
    }

};
*/













