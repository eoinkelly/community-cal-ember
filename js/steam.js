// Please don't do this.
//
// You are modifying how XHR works for everything on the page that uses
// jQuery (not just this app) - this will have serious negative inpact on the
// user experience (JS is single threaded, XHR requests like this will make the
// page unresponsive to the user).
//
$.ajaxSetup({
	async:false,
});


// This is functional but there is some unnecessary indirection going on.
//
// In Ember the idiomatic way to create new "factory objects" (i.e. classes in
// other languages) is to use extend(). You can also use create() to create an
// object directly. There is very little value in wrapping those mechanisms in
// a traditional JS constructor function as this code is doing.
function Steam(App) {
	App.Steam = Ember.Object.extend({
		get: function(req, callback) {
			var request = Ember.$.getJSON('http://dev-back1.techgrind.asia/scripts/rest.pike?request='+req);
			request.then(callback)
		}
	});
}

Steam.create=function(App){
	var s = new Steam(App);  // Unused variable assignment
	return App.Steam.create();
}

// An alternative version
// **********************

// Inspecting the other code I notice that there is only a single instance of
// the objects created by the `App.Steam` factory in use. This means we can
// create that singleton here and save it as a property of `App` e.g.
// `App.steam`.
//
// You can pass customisation to Ember.Object.create() directly without using
// extend() if you don't need to make multiple instances of the object.
//
// I am using a lowercase 'steam' to indicate that this is an instance not a constructor
//
// App.steam = Ember.Object.create({
//   get: function(req, callback) {
//     Ember.$.getJSON('http://dev-back1.techgrind.asia/scripts/rest.pike?request='+req).then(callback);
//   }
// });
