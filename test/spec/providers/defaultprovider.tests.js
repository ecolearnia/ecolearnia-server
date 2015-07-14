
var expect = require('chai').expect;
var sinon = require('sinon');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var config = require('ecofyjs-config');
var DbUtils = require('../../../lib/utils/dbutils').DbUtils;


// Library under test
var provider = require('../../../lib/providers/defaultprovider');

config.load('./config/test.conf.json');

describe('DefaultProvider', function () {

	before(function(){
		DbUtils.connect('mongodb://localhost/test_ecolearnia');
	});

	var testProvider;

	var testSchema = new Schema({
        uuid: { type: String, required: true, unique: true },
        group: { type: Number },
        data: { type: String }
	});

	var testResources = [
			{
				group: 1,
				data: 'test-data1'
			},
			{
				group: 1,
				data: 'test-data2'
			},
			{
				group: 2,
				data: 'test-data3'
			}
		];

	beforeEach(function () {
		testProvider = provider.createProvider(
			'TestFunctional',
			testSchema,
			{ primaryKey: 'uuid'} );
	});

	describe('Initialize', function () {	
	
		it('should initialize', function () {
			expect(testProvider.modelName,'modelName' ).to.equal('TestFunctional');
			expect(testProvider.primaryKey_).to.equal('uuid');
			expect(testProvider.Model_).to.not.null;
		});	
	});

	describe('Create resource', function () {	
	
		it('should add', function (done) {

			var resource = {
				group: 1,
				data: 'Test-data'
			}

			testProvider.add(resource)
			.then( function(model) {
				var result = model.toJSON();
				result.uuid;
				// remove system properties
				delete result['__v'];
				delete result['_id'];

				expect(result.uuid, 'uuid property not generated').to.not.null;
				expect(result).to.deep.equal(resource);

				delete_(testProvider, result.uuid);
				done();
			})
			.catch( function(error) {
				done(error);
			});
		});	
	});

	var createdUuids = [];

	beforeEach(function (done) {
		// Create three for reading 
		testProvider.add(testResources[0])
		.then( function(model1) {
			createdUuids.push(model1.uuid);

			testProvider.add(testResources[1])
			.then( function(model2) {
				createdUuids.push(model2.uuid);

				testProvider.add(testResources[2])
				.then( function(model3) {
					createdUuids.push(model3.uuid);

					done();
				})

			})

		})
		.catch( function(error) {
			done(error);
		});
	});

	afterEach(function (done) {
		deleteAllAndDone(testProvider, done);
	});

	describe('Read resource', function () {

		it('should find', function (done) {
			var criteria = {
				op: '=',
				var: 'data',
				val: testResources[1].data
			};

			testProvider.find(criteria)
			.then( function(model) {
				expect(model, 'Model is null').to.not.null;
				expect(model.data, 'Data does not match').to.equal(testResources[1].data);
				done();
			})
			.catch( function(error) {
				done(error);
			});
		});

		it('should findByPK', function (done) {
			testProvider.findByPK(createdUuids[0])
			.then( function(model) {
				expect(model.data).to.equal(testResources[0].data);
				done();
			})
			.catch( function(error) {
				done(error);
			});
		});

		it('should query', function (done) {

			var criteria = {
				op: '=',
				var: 'group',
				val: 1
			};

			testProvider.query(criteria)
			.then( function(collection) {
				expect(collection.length, 'Retrieve').to.equal(2);
				done();
			})
			.catch( function(error) {
				done(error);
			});
		});

		it('should count', function (done) {

			var criteria = {
				op: '=',
				var: 'group',
				val: 1
			};

			testProvider.count(criteria)
			.then( function(result) {
				expect(result, 'Count').to.equal(2);
				done();
			})
			.catch( function(error) {
				done(error);
			});
		});
	});

	describe('Update resource', function () {
		var resources = [
			{
				group: 2,
				data: 'test-data1'
			}
		];

		beforeEach(function (done) {
			delete_(testProvider, {})
			.then( function(model) {
				
				// Create two for reading 
				//delete resources[0].uuid;
				testProvider.add(resources[0])
				.then( function(model1) {
					model = model1;
					done();
				})
				.catch( function(error) {
					done(error);
				});
			})
			.catch( function(error) {
				console.log('** ERROR on delete! **' +  JSON.stringify(error));
				done(error);
			});
		});

		afterEach(function (done) {
			deleteAllAndDone(testProvider, done);
		});
	
		it('should update', function (done) {

			var criteria = {
				op: '=',
				var: 'group',
				val: 2
			};

			var updateTo = {
				group: 3,
				data: 'test-data1-new'
			}

			testProvider.update(criteria, updateTo)
			.then( function(model2) {
				testProvider.findByPK(resources[0].uuid)
				.then( function(model2b) {
					expect(model2b.data).to.equal(updateTo.data);
					done();
				})
				.catch( function(error) {
					done(error);
				});
			})
			.catch( function(error) {
				done(error);
			});
		});

		it('should updateModel', function (done) {

			testProvider.findByPK(resources[0].uuid)
			.then( function(modelFound) {

				modelFound.group = 3;
				modelFound.data = 'test-data1-new2';

				testProvider.updateModel(modelFound)
				.then( function(model3) {
					testProvider.findByPK(resources[0].uuid)
					.then( function(model3b) {
						expect(model3b.data).to.equal('test-data1-new2');
						done();
					})
					.catch( function(error) {
						done(error);
					});
				})
				.catch( function(error) {
					done(error);
				});
			})
			.catch( function(error) {
				done(error);
			});
		});	
	});

	describe('Delete resource', function () {	
	
		it('should remove', function (done) {

			var criteria = {
				op: '=',
				var: 'data',
				val: testResources[0].data
			};

			testProvider.remove(criteria)
			.then( function(removeResult) {

				testProvider.find(criteria)
				.then( function(resourceFound) {
					expect(resourceFound, 'Resource was not deleted').to.null;
					done();
				})
				.catch( function(error) {
					done(error);
				});
			})
			.catch( function(error) {
				done(error);
			});
		});

		it('should removeByPK', function (done) {

			testProvider.removeByPK(testResources[0].uuid)
			.then( function(removeResult) {

				testProvider.findByPK(testResources[0].uuid)
				.then( function(resourceFound) {
					expect(resourceFound, 'Resource was not deleted').to.null;
					done();
				})
				.catch( function(error) {
					done(error);
				});
			})
			.catch( function(error) {
				done(error);
			});
		});	
	});

	function deleteAllAndDone(provider, done)
	{
		delete_(provider, {})
			.then( function(model) {
				done();
			})
			.catch( function(error) {
				console.log('** ERROR on deleteAllAndDone! **' +  JSON.stringify(error));
				done(error);
			});
	}


	function delete_(provider, criteria)
	{
		if (typeof criteria == 'string')
		{
			criteria = {
				uuid: criteria
			}
		}
		return provider.remove(criteria);
	}
});

