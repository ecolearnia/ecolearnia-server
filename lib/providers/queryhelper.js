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

var queryparser = require('lodash');

var queryparser = require('../utils/queryparser').parser;

// Declaration of namespace for internal module use
var internals = {};

/**
 * @class QueryHelper
 *
 * @module provider
 *
 * @classdesc
 *  Helper class that includes method to parse simplified SQL language into
 *  AST.
 *
 * @param {Array<string>} searchableFields - Fields that can be search on
 * @param {Array<string>} requiredFields - Fields that must be search on 
 */
internals.QueryHelper = function(searchableFields, requiredFields)
{
	this.searchableFields_ = searchableFields;
	this.requiredFields_ = requiredFields;
}


/**
 * Parses a simplified WHERE clause string into AST.
 * for the grammar, see the /artifacts/queryparser.jison
 */
internals.QueryHelper.prototype.parse = function(clause)
{
    var ast = queryparser.parse(clause);
    this.flatternTermsAndFactors_(ast);

    return ast;
}


/**
 * Current queryparser.jison generates a binary tree for 
 * multiple consutive ORs and AND's.
 * This methods falttens the deep binary three to one level with multiple
 * children
 *  
 */
internals.QueryHelper.prototype.flatternTermsAndFactors_ = function(node)
{
	var newCriteria = {};
	this.flatternTermsAndFactorsRecursive_(null, node, 0);

    return node;
};

internals.QueryHelper.prototype.flatternTermsAndFactorsRecursive_ = function(parent, node, idxInParent)
{
	if (node.args && node.args.length && node.args.length > 0)
	{
    	var idx = 0
    	do
    	{
    		var increment = this.flatternTermsAndFactorsRecursive_(node, node.args[idx], idx);
    		idx = idx + increment;
    	} while(idx < node.args.length)
    }

	if (parent && node.op && parent.op && node.op === parent.op 
		&& idxInParent === 0 // Only first child get to be merged with the parent. Remember, we are dealing with binary tree
		)
	{
		parent.args.splice.apply(parent.args, [0, 1].concat(node.args));
		return 2; // two were inserted
	}
	return 1; // none were inserted
};



/**
 * Check if the properties searched for are all in the searchableFields_
 * And includes the requiredFields_ in the top
 */
internals.QueryHelper.prototype.isCriteriaLegal = function(ast)
{
	// The searchableFields_ were not set, so any field is allowed
	if (!this.searchableFields_ || this.searchableFields_.length == 0)
	{
		return true;
	}
	return this.isCriteriaLegalRecursive_(ast);
};


internals.QueryHelper.prototype.isCriteriaLegalRecursive_ = function(node)
{
	var isLegal = true;
	if (node.var && this.searchableFields_.indexOf(node.var) == -1)
	{
		var test = node.var in this.searchableFields_;
		isLegal = false;
	}
	if (node.args && node.args.length && node.args.length > 0)
	{
    	for(i=0; i < node.args.length; i++)
    	{
    		isLegal = this.isCriteriaLegalRecursive_(node.args[i]);
    		if (!isLegal) {
    			break;
    		}
    	}
    }
    return isLegal;

};

module.exports.QueryHelper = internals.QueryHelper;