/* globals console, DataAccess, document */
(function() {
	var dataStoreName = 'appaweek-contact-mgr',
		da = DataAccess.getInstance();

	da.setDataSource(dataStoreName, '/data/contact_import.json');
	da.addButtons('.menu-items');
	da.whenDataLoads(function(data) {
		var c = document.querySelector('contact-list');

		//console.log(c, data);
		if (c) c.contacts = data;
	});
	da.whenDataUnloads(function() {
		var c = document.querySelector('contact-list');
		console.log('unloading');
		if (c) c.contacts = [];
	});

	/*window.addEventListener('contact-item-attached', function(ele) {
		console.log('bang');
		var record;

		if (ele.contactId) {
			console.log('going!');
			record = da.getRecordAtId('contactId', ele.contactId);
			ele.contact = record;
		}
	});*/
})();

