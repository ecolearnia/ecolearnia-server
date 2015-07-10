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
 * @date 3/04/15
 */

// Declaration of namespace for internal module use
var internals = {};

/**
 * @class RequestAdapter
 *
 * @module provider
 *
 * @classdesc
 *  Object of this class includes Given an object which contains request information: params and query, 
 *
 * @param {string} name - the log name
 * @param {number} level - the level to which
 */
internals.QueryBuilder = function()
{

}


/**
 * Parses a string into AST of query
 */
internals.QueryBuilder.prototype.parse = function(clause)
{
    var criteria = defaultCriteria || {};
    

    return criteria;
}