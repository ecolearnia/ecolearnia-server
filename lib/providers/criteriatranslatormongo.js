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
 *  This file includes definition of HapiResource.
 *
 * @author Young Suk Ahn Park
 * @date 6/10/15
 */

// Declaration of namespace for internal module use
var internals = {};

internals.MONGO_OP = {
	'=' : '$eq',
	'>' : '$gt',
	'>=': '$gte',
	'<' : '$lt',
	'<=' : '$lte',
	'in' : '$in',
	'nin' : '$nin',

	'or' : '$or',
	'and' : '$and',
}

/**
 * @class CriteriaTranslatorMongo
 * @static
 */
internals.CriteriaTranslatorMongo = {
}


/**
 * Translates a criteria into Mongo JSON critiera
 */
internals.CriteriaTranslatorMongo.translate = function(criteria)
{
    var mongoCriteria = internals.CriteriaTranslatorMongo.translatelRecursive_(criteria);

    return mongoCriteria;
}

internals.CriteriaTranslatorMongo.translatelRecursive_ = function(node)
{
	var mongoCriteria = {};
	if (node.op && (node.op == 'or' || node.op == 'and')) {
		var children = [];
		mongoCriteria[ internals.MONGO_OP[node.op] ] = children;
		if (node.args && node.args.length && node.args.length > 0)
		{
	    	for(i=0; i < node.args.length; i++)
	    	{
	    		var child = this.translatelRecursive_(node.args[i]);
	    		children.push(child);
	    	}
	    }
	}
	else if (node.op) {
		
		var predicateObj = {};
		predicateObj[ internals.MONGO_OP[node.op] ] = node.val;

		mongoCriteria[node.var] = predicateObj
	}
	else if (node.between) {
		
		var predicateObj = {};
		predicateObj[ internals.MONGO_OP['>='] ] = node.between.from;
		predicateObj[ internals.MONGO_OP['<='] ] = node.between.to;

		mongoCriteria[node.var] = predicateObj
	}

    return mongoCriteria;
};



module.exports.CriteriaTranslatorMongo = internals.CriteriaTranslatorMongo;