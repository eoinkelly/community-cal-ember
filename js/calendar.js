// If the goal of this app is to be included in other pages I would consider
// using a name that is less likely to be in use e.g. BLUGCalendarApp.

// create ember-app instance
var App = Ember.Application.create({
    rootElement: '.community-calendar'
});

// As much as possibly you want to avoid polluting the global namespace so I
// would rename this to `App._events`

// list of events
var _events = []

// I suggest moving this function and its invocation into a separate file as it
// has a separate purpose.
function handlebars_extend() {
    // handlebar helpers
    var helpers = [{
        name: 'date',
        date: function(unix) {
            var date;
            date = new Date(unix * 1000);
            return date.toDateString();
        }
    }, {
        name: 'day',
        day: function(unix) {
            var date;
            date = new Date(unix * 1000);
            return date.getDate();
        },
    }, {
        name: 'month',
        month: function(unix) {
            var date;
            date = new Date(unix * 1000);
            return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()];
        },
    }, {
        name: 'year',
        year: function(unix) {
            var date;
            date = new Date(unix * 1000);
            return date.getFullYear();
        },
    }, {
        name: 'time',
        time: function(unix) {
            var date;
            date = new Date(unix * 1000);
            return date.getTime();
        }
    }, {
        name: 'log',
        log: function(x) {
            console.log(x);
        }
    }];


    for (var i = 0; i < helpers.length; i++) {
        var helper = helpers[i];
        Ember.Handlebars.helper(helper.name, helper[helper.name]);
    }

    // used handlebars as it works differently
    Handlebars.registerHelper('link', function(id) {
        id = Handlebars.Utils.escapeExpression(id);
        template = '#/communitycal/'; // unused variable

        // I think it would be clearer to include the ending tag rather than
        // relying on SafeString to fix it. It also gives the reader of the
        // code less to think about and removes the need for the comment line

        // don't need the ending tag (safe escape)
        var result = '<a href="#/communitycal/' + id + '">';

        return new Handlebars.SafeString(result);
    });

}
handlebars_extend();

App.IndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('dashboard');
    }
});

App.Router.map(function() {
    this.route('dashboard');
});


App.DashboardRoute = Ember.Route.extend({
    events: {
        selectTab: function(name) {
            this.controllerFor('dashboard').set('activeTab', name);
            this.render(name, {
                into: 'dashboard',
                outlet: 'tab'
            });
        }
    },

    setupController: function(controller) {
        controller.set('activeTab', 'list');
    },

    renderTemplate: function() {
        this.render();
        this.render('list', {
            outlet: 'tab',
            into: 'dashboard'
        });
    }
});

// I think the calendar widget is probably best expressed as an Ember Component
// (http://emberjs.com/guides/components/).
//
// * A component is a controller+view is generally easier to work with because
//   of that (the separation between ember controller and ember view is not clear
//   at first).
// * Components are much closer to what other frameworks call "views" e.g. a
//   component has similar responsibilities to a Backbone View object.
//
// * The component should be completely responsible the piece of DOM you give
//   it to manage (in this case the calendar widget). I suggest removing the
//   `renderTemplate` stuff from the Route and let component manage it. I think
//   this will simplify the implementation a lot as the component template can
//   include markup for all 3 tabs and it can show/hide them using standard
//   jQuery techniques.
App.DashboardView = Ember.View.extend({
    activeTab: Ember.computed.alias('controller.activeTab'),

    activeTabDidChange: (function() {
        if (this.state == 'inDOM') this.setActiveTab();
    }).observes('activeTab'),

    didInsertElement: function() {
        this.setActiveTab();
    },

    setActiveTab: function() {
        $('.active').removeClass('active');
        var activeTab = this.get('activeTab');
        this.$("a[data-tab='%@']".fmt(activeTab)).parent().addClass('active');
    }

});

var steam = Steam.create(App);

// App.steam.get('techgrind.events/order-by-date', function(data) { // using alternate version code block from steam.js
steam.get('techgrind.events/order-by-date', function(data) {
    // I suggest making this a property of the component not a global (see my comments on components above)
    App.obj = Ember.Object.create({
        "events": data['event-list']
    });
    // All this should be in the component template (see my comments on components above)
    var templates = [{
        name: 'list',
        list: '\
	      <div class="tab-pane">\
	        <ul class="event-list">\
	          {{#with App.obj}}\
	          {{#each event in events}}\
	          <li class="cc-event">\
	            <a href="">\
	              <div class="cc-event-date">\
	                <div class="cc-event-day">{{day event.date}}</div>\
	                <div class="cc-event-month">{{month event.date}}</div>\
	                <div class="cc-event-year">{{year event.date}}</div>\
	                <div class="cc-event-time">{{time event.date}}</div>\
	              </div>\
	              <div class="cc-event-title">{{event.title}}</div>\
	              <div class="cc-event-location">{{event.address}}</div>\
	            </a>\
	          </li>\
	          {{/each}}\
	          {{/with}}\
	        </ul>\
	      </div>'
    }, {
        name: 'cal',
        cal: ' <div class="tab-pane">calendar</div>'
    }, {
        name: 'add',
        add: '<div class="tab-pane">add events</div>'
    }, {
        name: 'dashboard',
        dashboard: '{{outlet tab}}\
    <ul class="tabrow">\
      <li><a href="#" data-tab="list" {{action selectTab "list"}}>list</a></li>\
      <li><a href="#" data-tab="cal" {{action selectTab "cal"}}>cal</a></li>\
      <li><a href="#" data-tab="add" {{action selectTab "add"}}>add</a></li>\
    </ul>'
    }];
    // This will make ember sad. It can be elimated by using a component for the calendar widget. (see comments above)
    for (var i = 0; i < templates.length; i++) {
        $('.community-calendar').append('<script type="text/x-handlebars" data-template-name="' + templates[i].name + '">' + templates[i][templates[i].name] + "</script>");
    };
});
