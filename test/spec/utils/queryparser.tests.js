
var expect = require('chai').expect;
var sinon = require('sinon');

var parser = require('../../../lib/utils/queryparser').parser;


describe('QueryParser', function () {

	beforeEach(function () {

	});

	describe('Config', function () {	
	
		it('should do something', function () {

			var ast = parser.parse('uuid="asdf-asdf-asdf"  AND (b<=1 OR c IN(1, 13, 13) OR d="test" AND yz BETWEEN 1 AND 5) ');

			console.log('AST: ' + JSON.stringify(ast,null, 2));
			
		});	
	});
});

