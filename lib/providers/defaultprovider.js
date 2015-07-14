/*
 * This file is part of the EcoLearnia platform.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * EcoLearnia v0.0.1
 *
 * @fileoverview
 *  This file includes definition of MongoPersistenceProvider.
 *
 * @author Young Suk Ahn Park
 * @date 2/28/15
 */

var lodash = require('lodash');
var uuid = require('node-uuid');

var Exception = require('ecofyjs-exception');
var logger = require('ecofyjs-logger-facade');
var promiseutils = require('../utils/promiseutils');
var DbUtils = require('../utils/dbutils').DbUtils;

var QueryHelper = require('../utils/queryhelper').QueryHelper;

var CriteriaTranslatorMongo = require('./criteriatranslatormongo').CriteriaTranslatorMongo;


// Declaration of namespace for internal module use
var internals = {};

internals.DEFAULT_QUERY_LIMIT = 20;

/**
 * @class MongoPersistenceProvider
 * @todo - Change to MongoPersistenceProvider
 *
 * @module utils
 *
 * @classdesc
 *  Mongo-based resource provider.
 *  A resource provider's responsibility is the CRUD operations to the 
 *  persistent store.
 *
 * @todo - implement PATCH
 *
 * Limitation, the primaryKey property must reside in the rool level
 * @param {!string} modelName - The name of the model  
 * @param {!Schema} schema - The Mongoose schema
 * @param {string} config - Configuration 
 */
internals.MongoPersistenceProvider = function(modelName, schema, config)
{
	this.logger_ = logger.Logger.getLogger('MongoPersistenceProvider:' + modelName);

	this.modelName = modelName;
	this.Model_ = DbUtils.getModel(modelName, schema);

	if (config) {
		this.primaryKey_ = config.primaryKey || '_id'; // eg. uuid
		this.autoSetPkIfEmpty_ = config.autoSetPkIfEmpty || true;
	}

	this.logger_.info({
		primaryKey: this.primaryKey_, autoSetPkIfEmpty: this.autoSetPkIfEmpty_
	}, 'configured');
};

/**
 * Add resource to the persistent store
 *
 * @param {object} resource  - The resource to add
 * @param {object=} options  - Option
 *
 * @returns {Promise}
 *		{Promise.resolve(Resource)}
 *		{Promise.reject(Exception)}
 */
internals.MongoPersistenceProvider.prototype.add = function(resource, options)
{
	// Assign a uuid if absent
	if (this.autoSetPkIfEmpty_ && !resource[this.primaryKey_]) {
		resource[this.primaryKey_] = uuid.v4();
	}
	var swLog = new logger.StopwatchLog(this.logger_, 'add');
	var logMeta = {PK: resource[this.primaryKey_]};
	swLog.start(logMeta);

	var promise = promiseutils.createPromise(function(resolve, reject) {

		var resourceModel = new this.Model_(resource);

		resourceModel.save(function(error){
			swLog.stop({_id: resourceModel._id});
		    if(error) {
		    	var exception = Exception.wrapError(error);
		    	logger.Logger.logError(this.logger_, exception, 'Error when saving to Mongo', logMeta);
		        reject(exception);
		    } else {
		        resolve(resourceModel);
		    }
		});
	}.bind(this));

	return promise; 
};

/**
 * Find a single resource
 *
 * @param {Object} criteria - The  criteria
 * @param {Object=} options  - Optional parameters
 *
 * @returns {Promise}
 */
internals.MongoPersistenceProvider.prototype.find = function(criteria, options)
{
	var swLog = new logger.StopwatchLog(this.logger_, 'find');
	swLog.start({criteria: criteria, options: options}, undefined, 'info');

	var mongoCriteria = CriteriaTranslatorMongo.translate(criteria);

	var promise = promiseutils.createPromise(function(resolve, reject) {
		this.Model_.findOne(mongoCriteria, function(error, result) {
			swLog.stop();
			this.logger_.debug({result: result});
			
			if(error) {
				var exception = Exception.wrapError(error);
		        reject(exception);
		    } else {
		        resolve(result);
		    }
		}.bind(this));
	}.bind(this));

	return promise; 
};

/**
 * Find a single resource by primary key
 *
 * @param {string|number} pk  - Primary key
 * @param {Object=} options  - Optional parameters
 * @returns {Promise}
 */
internals.MongoPersistenceProvider.prototype.findByPK = function(pk, options)
{
	/*var criteria = {};
	criteria[this.primaryKey_] = pk;
	*/
	var criteria = QueryHelper.createComparisonOp('=', this.primaryKey_, pk);

	return this.find(criteria, options);
};

/**
 * @param {Object<String, Object>} criteria -  A map of criteria
 *        Uses Mongoose's dot notation for the property path
 * @param {Object=} options
 *		options.sort, 
 *		options.offset, 
 *		options.limit
 *
 * @returns {Promise}
 */
internals.MongoPersistenceProvider.prototype.query = function(criteria, options)
{
	var swLog = new logger.StopwatchLog(this.logger_, 'query');
	swLog.start({criteria: criteria, options: options}, undefined, 'info');

	var mongoCriteria = CriteriaTranslatorMongo.translate(criteria);

	options = options || {};
	var offset = options.offset || 0;
	var limit  = options.limit || internals.DEFAULT_QUERY_LIMIT;

	// @todo - pagination
	var promise = promiseutils.createPromise(function(resolve, reject) {
		this.Model_.find(mongoCriteria)
    		.skip(offset)
			.limit(limit)
    		.exec(function(error, result) {

    			swLog.stop();
				this.logger_.debug({result: result});

	    		if(error) {
	    			var exception = Exception.wrapError(error);
	    			logger.Logger.logError(this.logger_, exception, 'Error querying Mongo', criteria);
			        reject(exception);
			    } else {
			        resolve(result);
			    }
			}.bind(this));

	}.bind(this));

	return promise; 
};


/**
 * Counts the hits that matches the criteria
 *
 * @param {Object} criteria -  A object that represents Ecofy Criteria
 *
 * @returns {Promise}
 */
internals.MongoPersistenceProvider.prototype.count = function(criteria)
{
	var swLog = new logger.StopwatchLog(this.logger_, 'query');
	swLog.start({criteria: criteria}, undefined, 'info');

	var mongoCriteria = CriteriaTranslatorMongo.translate(criteria);

	// @todo - pagination
	var promise = promiseutils.createPromise(function(resolve, reject) {
		this.Model_.count(mongoCriteria)
    		.exec(function(error, result) {

    			swLog.stop();
				this.logger_.debug({result: result});

	    		if(error) {
	    			var exception = Exception.wrapError(error);
	    			logger.Logger.logError(this.logger_, exception, 'Error querying Mongo', criteria);
			        reject(exception);
			    } else {
			        resolve(result);
			    }
			}.bind(this));

	}.bind(this));

	return promise; 
};


/**
 * Update a resource
 *
 * @param {Object<String, Object>} criteria -  A map of criteria
 *        Uses Mongoose's dot notation for the property path
 * @param resource
 * @param {Object=} options  - Optional parameters
 * @returns {Promise}
 */
internals.MongoPersistenceProvider.prototype.update = function(criteria, resource, options)
{
	var swLog = new logger.StopwatchLog(this.logger_, 'update');
	swLog.start({criteria: criteria, options: options});

	var mongoCriteria = CriteriaTranslatorMongo.translate(criteria);

	var promise = promiseutils.createPromise(function(resolve, reject) {

		// http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
		this.Model_.findOneAndUpdate(mongoCriteria, resource, {upsert: false}, function(error, doc) {
			swLog.stop();
			this.logger_.debug({result: doc});

		    if (error) {
		    	var exception = Exception.wrapError(error);
	    		logger.Logger.logError(this.logger_, exception, 'Error updating Mongo', criteria);
		    	reject(exception);
		    } else {
		    	resolve(doc);
		    }
		}.bind(this));
	}.bind(this));

	return promise; 
}

/**
 * Saves the mongoose model.
 * Useful when mongoose model is available
 *
 * @param {Model} resourceModel
 * @param options
 * @returns {Promise}
 */
internals.MongoPersistenceProvider.prototype.updateModel = function(resourceModel, options)
{
	var promise = promiseutils.createPromise(function(resolve, reject) {

		resourceModel.save(function(error) {
		    if(error) {
		    	var exception = Exception.wrapError(error);
	    		logger.Logger.logError(this.logger_, exception, 'Error saving Mongo');
		        reject(exception);
		    } else {
		        resolve(resourceModel);
		    }
		});
	}.bind(this));

	return promise; 
}

/**
 * Delete a resource
 *
 * @param criteria
 * @param {Object=} options  - Optional parameters
 * @returns {Promise}
 */
internals.MongoPersistenceProvider.prototype.remove = function(criteria, options)
{
	var swLog = new logger.StopwatchLog(this.logger_, 'remove');
	swLog.start({criteria: criteria, options: options}, undefined, 'info');

	var mongoCriteria = CriteriaTranslatorMongo.translate(criteria);

	var promise = promiseutils.createPromise(function(resolve, reject) {
		this.Model_.remove(mongoCriteria, function(error, result) {
			this.logger_.debug({result: result});
			if(error) {
				var exception = Exception.wrapError(error);
	    		logger.Logger.logError(this.logger_, exception, 'Error removing from Mongo', criteria);
		        reject(exception);
		    } else {
		        resolve(result);
		    }
		}.bind(this));
	}.bind(this));

	return promise; 
}


/**
 * removeByPK
 * 
 * Removes a resource by PrimaryKey
 */
internals.MongoPersistenceProvider.prototype.removeByPK = function(pk, options)
{
	var criteria = QueryHelper.createComparisonOp('=', this.primaryKey_, pk);

	return this.remove(criteria);
}


/**
 * Factory method to create a provider instance
 *
 * @param {string} modelName  - THe name of the model
 * @param {string | mongoose.Schema} schema  - Either the mongoose schema 
 *				object or the name of it. If name is provided, the schema
 *				is loaded requiring it from ../models/ path.
 * @param {Object} config}  - the config
 */
internals.createProvider = function(modelName, schema, config)
{
	var schemaObj = null;
	if (lodash.isObject(schema)) {
		schemaObj = schema;
	} else if (lodash.isString(schema)){
		schemaObj = require('../models/' + schema).getSchema();
	}

	return new internals.MongoPersistenceProvider(modelName, schemaObj, config);
}

module.exports.createProvider = internals.createProvider;