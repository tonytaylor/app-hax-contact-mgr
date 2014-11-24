/* globals console, $, amplify, localStorage */

var DataAccess = (function() {
	var D = function() {
			return this.datasource, this.requestresource;
		},
		instance;

	D.prototype = {
		prepareResource: function(name, url) {
			if (!url) {
				throw new Error('please provide a url for data requests.');
			}

			this.requestresource = 'request-' + name;

			amplify.request.define(this.requestresource, 'ajax', {
				url: url, dataType: 'json', type: 'GET'
			});
		},

		setDataSource: function(name, url) {
			if (!name) throw new Error('please set a data source name.');

			this.prepareResource(name, url);

			this.datasource = name;
		},

		getRecordAtId: function(fieldname, value) {
			if (!value) {
				console.log('no value provided');
				return;
			}
			var ds = this.getDataSource(),
				retval = ds.filter(function(e) {
					return e[fieldname] === value;	
				});
			
			return (retval.length > 0) ? retval[0] : undefined;
		},

		getDataSource: function() {
			//console.log('!!', this, this.datasource);
			if (!this.datasource) {
				var msg = [
					'please call setDataSource before using this method.'
				].join('');

				throw new Error(msg);
			}

			return amplify.store(this.datasource);
		},

		addSeedButton: function(selector) {
			var text = 'seed client data',
				markup = [
					'<li><a id="seed" href="#" class="button">',
					text, '</a></li>'
				].join(''),
				seedbutton;

			$(selector).append(markup);
			seedbutton = $(selector + ' #seed');
			$(seedbutton).click(this.seedData());
		},

		addFlushButton: function(selector) {
			var text = 'flush client data',
				markup = [
					'<li><a id="flush" href="#" class="button alert">',
					text,
					'</a></li>'
				].join(''),
				killbutton;

			$(selector).append(markup);
			killbutton = $(selector + ' #flush');

			$(killbutton).click(this.flushData());
		},
		addButtons: function(selector) {
			if (!selector) throw new Error('a css selector is required!');

			this.addSeedButton(selector);
			this.addFlushButton(selector);
		},

		seedData: function() {
			var me = this;

			return function(e) {
				e.preventDefault();

				if (!amplify.store(me.datasource)) {
					console.log('creating client-side data store. . .');
					me.loadData();
				} else {
					console.log('reloading client-side data store. . .');
					me.reloadData();
					//me.resetData();
				}
			};
		},

		flushData: function() {
			var me = this;

			return function(e) {
				e.preventDefault();
				
				var key = '__amplify__' + me.datasource;

				if (localStorage[key]) {
					console.log('flushing data @: %s', key);
					localStorage.removeItem(key);
					amplify.publish('unloaded');
				} else {
					console.log('no entry found @: %s', key);
				}
			};
		},
		loadData: function() {
			var me = this;

			amplify.request(this.requestresource, function(data) {
				amplify.store(me.datasource, data);
				amplify.publish('loaded', data);
			});
		},
		updateData: function(data) {
			var src = amplify.store(this.datasource),
				index;

			src.forEach(function(ele, idx) {
				if (ele.contactId === data.contactId) index = idx;
			});

			src[index] = data;
			amplify.store(this.datasource, src);
			amplify.publish('dataupdated', src);
			return data;
		},
		saveData: function(data) {
			amplify.store(this.datasource, data);
			amplify.publish('updated', data);
		},
		reloadData: function() {
			amplify.publish('loaded', amplify.store(this.datasource));
		},
		resetData: function() {
			amplify.store(this.datasource, null);
			this.loadData();
		},

		whenDataLoads: function(cb) {
			amplify.subscribe('loaded', cb);
		},

		whenDataUpdates: function(cb) {
			amplify.subscribe('updated', cb);
		},

		whenDataUnloads: function(cb) {
			amplify.subscribe('unloaded', cb);
		}
	};

	function init() { return new D(); }

	return {
		getInstance: function() {
			if (!instance) instance = init();

			return instance;
		}
	};
})();

DataAccess;
