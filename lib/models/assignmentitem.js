/*****************************************************************************
 * 
 * model/asignmentItem.js
 * 
 * The AssignmentItem schema.
 */

var lodash = require('lodash');
var mongoose = require('mongoose');

var contentitem = require('./contentitem');

var Schema = mongoose.Schema;


var internals = {}

// Singleton object of the ContentItem schema
internals.asignmentItemSchema = null;

internals.getSchemaDefObject = function()
{
    return lodash.extend( 
            {
                course: { type: Schema.Types.ObjectId, ref: 'Course' },
                courseUuid: { type: String, index: true }
            }, 
            contentitem.getSchemaDefObject()
        );
}

internals.getSchema = function()
{
    if (!internals.asignmentItemSchema)
    {
        internals.asignmentItemSchema = new Schema( internals.getSchemaDefObject() );
    }
    return internals.asignmentItemSchema;
}


module.exports.getSchemaDefObject = internals.getSchemaDefObject;
module.exports.getSchema = internals.getSchema;