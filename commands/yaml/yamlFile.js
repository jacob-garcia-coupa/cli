'use strict';

const YAML  = require('json2yaml')
const debug = require('debug')('yaml file creator')
const _     = require('lodash');
const Q     = require('q');

function Yamlfile(){
  this.model = _.clone(modelTemplate);
}
const modelTemplate = {
  version: '1.0',
  steps : {}
}
const buildStep = {
  type: "build",
  "fail-fast": false,
  dockerfile: "Dockerfile",
  "image-name": "owner/imageName",
  tag : "latest"
}

Yamlfile.prototype.create = function(type , callback){

   return this.done(callback);
}

Yamlfile.prototype.reset = function(){
  this.model = _.clone(modelTemplate);
}
Yamlfile.prototype.addComment = function(){
  throw new Error('not implemented');
}
Yamlfile.prototype.addStack = function(stack, callback){

   var error = new Error();
   var resolve = callback.bind(null);
   var reject  = callback.bind(error);


    debug(`adding stack ${stack.name}`);
    debug(`addStack ->arguments : ${JSON.stringify(arguments)}`);
    var self = this;
    var promise = stack.steps.reduce((sofar ,step)=>{
      debug(`running reduce on step ${JSON.stringify(step)}`);

      return Q.when(sofar , ()=>{

        debug(`before addign step ${step.name}`)
        var defer  = Q.defer();
        self.addStep(step.name , step, (err, data)=>{
         if (err){
           error.err = err;
           return defer.reject(err);
         }

        return defer.resolve();
      })
      return defer.promise;
    });
  }, Q.resolve());

    debug('after reduce');
    promise.then(()=>{
      debug('add stackeresolved');
      debug(`add->stack->model : ${JSON.stringify(this.model)}`);
      callback();
    }, reject);

    return;
 }
Yamlfile.prototype.addStep = function(name, data, callback){
    debug(`adding step ${name} , ${data}`);

    var step = {}

    if ( data.type === "build"){
      let step  = _.clone(buildStep);
       data = _.merge(data , step)
    }

  _.unset(data, 'name');

  step [name]  = data;
  debug(`added step ${name} , ${JSON.stringify(data)}`);
  this.model.steps[name] = data;
  debug(`model : ${JSON.stringify(this.model)}`);
  callback(null, data);
}

Yamlfile.prototype.done = function(callback){

  let yamlText = YAML.stringify(this.model);
  debug(`yaml is : ${yamlText}`);
  callback(null, yamlText);

}

Yamlfile.prototype.save = function(dir, callback){

  debug(`dir name :${dir}`);
  debug(`callback : ${callback}`);
  debug(`argument : ${JSON.stringify(arguments)}`);
  debug(`save->model : ${JSON.stringify(this.model)}`);

  if (!dir)
    dir = "";

  _.defaults(dir, ".");

  var path = require('path');
  var fs   = require('fs');
  var yaml = path.resolve(dir, './codefresh.yml');
  debug(`saving file ${yaml}`);
  let yamlText = YAML.stringify(this.model);

  fs.writeFile(yaml, yamlText, callback);

}


module.exports = Yamlfile;
