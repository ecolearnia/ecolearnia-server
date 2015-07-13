
var expect = require('chai').expect;
var sinon = require('sinon');

var parser = require('../../../lib/utils/queryparser').parser;
var QueryHelper = require('../../../lib/utils/queryhelper').QueryHelper;

var CriteriaTranslatorMongo = require('../../../lib/providers/criteriatranslatormongo').CriteriaTranslatorMongo;

describe('QueryParser', function () {

	beforeEach(function () {

	});

	describe('parsing', function () {	
	
		it('should parse', function () {

			var queryHelper = new QueryHelper();
			//var ast = queryHelper.parse('c=3 AND (d=4 AND f="a" AND g=4 OR j=6)');
			var ast = parser.parse('c=3 OR (d=4 OR f="a" OR g=4 OR h=5 AND (i=0 OR j IN (9,10) OR k BETWEEN 10 AND 20) )');
			//console.log('AST1: ' + JSON.stringify(ast, null, 2));

			//var ast2 = queryHelper.parse('uuid=3 AND d=4 AND (f="a" OR g=4)');
			var ast2 = queryHelper.parse('c=3 OR (d=4 OR f="a" OR g=4 OR h=5 AND (i=0 OR j IN (9,10) OR k BETWEEN 10 AND 20) )');
			//console.log('AST2: ' + JSON.stringify(ast2, null, 2));
			
		});
	});

	describe('check legal', function () {	
		it('should evaluate to legal', function () {

			var searchableFields = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'i.z']
			var queryHelper = new QueryHelper(searchableFields);
			
			var ast = queryHelper.parse('a=3 OR (b=4 OR c="a" OR d=4 OR e=5 AND (f=0 OR g IN (9,10) OR i.z BETWEEN 10 AND 20) )');
			//console.log('AST: ' + JSON.stringify(ast, null, 2));
			expect(queryHelper.isCriteriaLegal(ast), 'Is Legal').to.be.true;
		});	

		it('should evaluate to not legal', function () {
			var searchableFields = ['b', 'c', 'd', 'e', 'f', 'g']
			var queryHelper = new QueryHelper(searchableFields);

			ast = queryHelper.parse('a=3 OR (b=4 OR c="a" OR d=4 )');
			//console.log('AST: ' + JSON.stringify(ast, null, 2));

			expect(queryHelper.isCriteriaLegal(ast), 'Is NOT Legal').to.be.false;
		});	

		it('should evaluate to not legal', function () {
			var searchableFields = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
			var queryHelper = new QueryHelper(searchableFields);

			ast = queryHelper.parse('a=3 OR (b=4 OR c="a" OR d=4 OR e=5 AND (f=0 OR g IN (9,10) OR h BETWEEN 10 AND 20) )');
			//console.log('AST: ' + JSON.stringify(ast, null, 2));

			expect(queryHelper.isCriteriaLegal(ast), 'Is NOT Legal').to.be.false;
		});	
	});


	describe('CriteriaTranslatorMongo', function () {

		it('should generate mongo criteria', function () {
			var queryHelper = new QueryHelper();

			ast = queryHelper.parse('a=3 OR (b=4 OR c="a" OR d=4 OR e=5 AND (f=0 OR g IN (9,10) OR h BETWEEN 10 AND 20) )');

			var mongoCriteria = CriteriaTranslatorMongo.translate(ast)

			//console.log('AST: ' + JSON.stringify(ast, null, 2));

			//console.log('Mongo criteria: ' + JSON.stringify(mongoCriteria, null, 2));
			//expect(mongoCriteria, 'Equal').to.be.false;
		});	
	});

});

