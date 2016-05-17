// my-module.js
'use strict';
console.log('login');
var debug   = require('debug')('login->index');
var Login   = require('../login/connector');
var assert  = require('assert');


exports.command = 'builds [account] <repo>'

exports.describe = 'build in codefresh '

exports.builder = function (yargs) {
    return yargs.option('url', {
      alias: 'url',
      default: 'https://g.codefresh.io'
    }).option('account', {
      alias: 'a'
    }).option('repo', {
      alias: 'p'
    })
  }


exports.handler = function (argv) {
  console.log('running');
  debug(`${argv.url}`);
  debug(`${JSON.stringify(argv)}`);
  debug(`${argv.account}`);
  debug(`${argv.repo}`);

  let repo = argv.repo.split('/');
  var info = {};
  info.url = argv.url;
  info.account = argv.account;
  info.repoOwner = repo[0];
  info.repoName = repo[1];


  //https://g.codefresh.io/api/builds/?limit=10&page=1&type=webhook

  var login = new Login(argv.user, argv.password, argv.url, argv.token);
  var builds  = require('./command')(info);

  login.connect().then(builds.bind(login.token), (err)=>{
    debug('error:' + err);
    process.exit(err);
  });
  }
  // do something with argv.
