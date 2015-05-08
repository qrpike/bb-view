

/*

	Basic view with some additional functionality:

 */


var _ = require('underscore');
var Backbone = require('backbone');


var ItemView = Backbone.View.extend({
	renderOnChange: true,
	initialize: function( params ){
		_.extend( this, params );
		// Compile the template to a function
		this.template = this.template || function(){ return false };
		// Call init on sub views
		this.init.apply(this, arguments);
		// Extend this views:
		_.extend(this.events, ItemView.prototype.events);
		// If this view has a model, listen for changes
		if(this.model && this.renderOnChange === true){
			this.listenTo( this.model, 'change', this.render.bind(this) );
			this.listenTo( this.model, 'error', this.onError.bind(this) );
		}
		// Bind functions
		_.bindAll(this,'onRender', 'render');
	},
	
	// Placeholder in case you want to override what data goes to the template.
	_getData: function(){
		return this.model || this;	
	},

	render: function(){
		this.$el.html( this.template( this._getData() ) );
		this.onRender();
		return this;
	},

	// Over ride in child views:
	init: function(){ },
	onRender: function(){ },
	unRender: function(){
		this.$el.html('');
	},
	onError: function( e, req ){
		this.eventEmitter.trigger('apiError', e, req);
	}

});


var ListView = Backbone.View.extend({
	template: '',
	itemView: null,
	listSelector: '',
	initialize: function( params ){
		_.extend( this, params );
		// Compile the template to a function
		// this.template = _.template( this.template || '' );
		// Call init on sub views
		this.init.apply(this, arguments);
		// Extend this views:
		_.extend(this.events, ListView.prototype.events);
		// If this view has a model, listen for changes
		if(this.collection){
			// this.listenTo( this.collection, 'change', this.render );
			this.listenTo( this.collection, 'add', this.render );
			this.listenTo( this.collection, 'remove', this.render );
		}
		// Bind functions
		_.bindAll(this, 'onRender', 'render');
		// if(this.collection)
		// 	this.collection.fetch();
	},
	
	renderItems: function(){
		_.each(this.collection.models, this.renderItem.bind(this));
	},

	render: function(){
		if(this.listSelector){
			this.$el.html( this.template( this.collection ) );
		}else{
			this.$el.html('');
		}
		if(this.collection.models.length == 0 && this.emptyView){
			this.displayEmptyView();
		}else{
			this.renderItems();
		}
		this.onRender();
		return this;
	},

	renderItem: function( item ){
		var self = this;
		var view = new this.itemView({
			model: item,
			listView: self
		});
		if(this.listSelector){
			this.$el.find( this.listSelector ).append( view.render().el );
		}else{
			this.$el.append( view.render().el );
		}
		view.delegateEvents();
		this.onRenderItem( item, view );
		return this;
	},

	displayEmptyView: function(){
		var view = new this.emptyView({ collection: this.collection, view: this });
		if(this.listSelector){
			this.$el.find( this.listSelector ).append( view.render().el );
		}else{
			this.$el.html( view.render().el );
		}
		return this;
	},

	// Over ride in child views:
	init: function(){ },
	onRenderItem: function(){ },
	onRender: function(){ }

});

module.exports = {
	Item: ItemView,
	List: ListView
};


