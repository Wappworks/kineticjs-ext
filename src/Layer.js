///////////////////////////////////////////////////////////////////////
//  Layer
///////////////////////////////////////////////////////////////////////
/**
 * Layer constructor.  Layers are tied to their own canvas element and are used
 * to contain groups or shapes
 * @constructor
 * @augments Kinetic.Container
 * @augments Kinetic.Node
 * @param {Object} config
 */
Kinetic.Layer = function(config) {
    this.className = 'Layer';
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.style.position = 'absolute';
    this.transitions = [];
    this.transitionIdCounter = 0;
    this.redraw = false;

    // call super constructors
    Kinetic.Container.apply(this, []);
    Kinetic.Node.apply(this, [config]);
};
/*
 * Layer methods
 */
Kinetic.Layer.prototype = {
    /**
     * public draw children
     */
    draw: function() {
        this._draw();
    },
    /**
     * clear layer
     */
    clear: function() {
        var context = this.getContext();
        var canvas = this.getCanvas();
        context.clearRect(0, 0, canvas.width, canvas.height);
    },
    /**
     * set the layer size
     * @param {Number} width
     * @param {Number} height
     */
    setSize: function( width, height ) {
        var canvas = this.getCanvas();
        canvas.width = width;
        canvas.height = height;
        this.invalidateBoundsLocal();
    },
    /**
     * get layer canvas
     */
    getCanvas: function() {
        return this.canvas;
    },
    /**
     * get layer context
     */
    getContext: function() {
        return this.context;
    },
    /**
     * add node to layer
     * @param {Kinetic.Node} child
     */
    add: function(child) {
        this._add(child);
        this.invalidateBoundsLocal();
    },
    /**
     * remove a child from the layer
     * @param {Kinetic.Node} child
     */
    remove: function(child) {
        this._remove(child);
        this.invalidateBoundsLocal();
    },
    /**
     * mark for redraw
     */
    markForRedraw: function() {
        if( this.redraw === true )
            return;

        this.redraw = true;
        Kinetic.GlobalObject._handleAnimation();
    },
    /**
     * determines if the layer needs to be redrawn
     */
    needsRedraw: function() {
        return( this.redraw );
    },
    /**
     * private draw children
     */
    _draw: function() {
        this.redraw = false;
        this.clear();
        if(this.visible) {
            this._drawChildren();
        }
    },
    /**
     * return the untransformed node bounds
     * @returns {Kinetic.BoundsRect}
     */
    _getNodeBoundsUntransformed: function()
    {
        // The bounds for this node is the canvas bounds...
        var canvas = this.getCanvas();
        return( Kinetic.BoundsRect(0, 0, canvas.width, canvas.height) );
    }
};
// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Layer, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Layer, Kinetic.Node);
