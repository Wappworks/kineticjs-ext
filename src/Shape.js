///////////////////////////////////////////////////////////////////////
//  Shape
///////////////////////////////////////////////////////////////////////
/**
 * Shape constructor.  Shapes are used to objectify drawing bits of a KineticJS
 * application
 * @constructor
 * @augments Kinetic.Node
 * @param {Object} config
 */
Kinetic.Shape = function(config) {
    this.className = 'Shape';

    // defaults
    if(config.stroke !== undefined || config.strokeWidth !== undefined) {
        if(config.stroke === undefined) {
            config.stroke = "black";
        } else if(config.strokeWidth === undefined) {
            config.strokeWidth = 2;
        }
    }

    // required
    this.drawFunc = config.drawFunc;
    this._boundsUntransformed = null;

    // call super constructor
    Kinetic.Node.apply(this, [config]);
    Kinetic.NodeExtAnimate.apply(this);
};
/*
 * Shape methods
 */
Kinetic.Shape.prototype = {
    /**
     * isPointInShape
     */
    isPointInShape: function(backstageLayer,pos){
        var backstageLayerContext = backstageLayer.getContext();
        this._draw(backstageLayer, true);
        return backstageLayerContext.isPointInPath(pos.x,pos.y);
    },
    /**
     * invalidates the local bounds
     */
    invalidateBoundsLocal: function()
    {
        Kinetic.Node.prototype.invalidateBoundsLocal.apply( this );
        this._boundsUntransformed = null;
    },
    /**
     * get layer context where the shape is being drawn.  When
     * the shape is being rendered, .getContext() returns the context of the
     * user created layer that contains the shape.  When the event detection
     * engine is determining whether or not an event has occured on that shape,
     * .getContext() returns the context of the invisible backstage layer.
     */
    getContext: function() {
        return this.tempLayer.getContext();
    },
    /**
     * get shape temp layer canvas
     */
    getCanvas: function() {
        return this.tempLayer.getCanvas();
    },
    /**
     * helper method to fill and stroke a shape based on its
     * fill, stroke, and strokeWidth properties
     */
    fillStroke: function() {
        var context = this.getContext();

        if(this.fill !== undefined) {
            context.fillStyle = this.fill;
            context.fill();
        }
        if(this.stroke !== undefined) {
            context.lineWidth = this.strokeWidth === undefined ? 1 : this.strokeWidth;
            context.strokeStyle = this.stroke;
            context.stroke();
        }
    },
    /**
     * set fill which can be a color, gradient object,
     * or pattern object
     * @param {String|CanvasGradient|CanvasPattern} fill
     */
    setFill: function(fill) {
        this.fill = fill;
    },
    /**
     * get fill
     */
    getFill: function() {
        return this.fill;
    },
    /**
     * set stroke color
     * @param {String} stroke
     */
    setStroke: function(stroke) {
        this.stroke = stroke;
    },
    /**
     * get stroke color
     */
    getStroke: function() {
        return this.stroke;
    },
    /**
     * set stroke width
     * @param {Number} strokeWidth
     */
    setStrokeWidth: function(strokeWidth) {
        this.strokeWidth = strokeWidth;
    },
    /**
     * get stroke width
     */
    getStrokeWidth: function() {
        return this.strokeWidth;
    },
    /**
     * set composite mode
     * @param {String} compositeMode
     */
    setCompositeMode: function(compositeMode) {
        this.compositeMode = compositeMode;
    },
    /**
     * get composite mode
     */
    getCompositeMode: function() {
        return this.compositeMode;
    },
    /**
     * draw shape
     * @param {Kinetic.Layer} layer Layer that the shape will be drawn on
     * @param {Boolean} isForDetection  True if the draw is for point detection
     */
    _draw: function(layer, isForDetection) {
        if(this.visible) {
            var context = layer.getContext();
            context.save();

            this._applyTransform( context );

            if( this.compositeMode !== undefined ) {
                context.globalCompositeOperation = this.compositeMode;
            }

            context.globalAlpha = this.getAbsoluteAlpha();

            this.tempLayer = layer;
            this.drawFunc.call(this, isForDetection);

            context.restore();
        }
    },
    /**
     * return the untransformed node bounds
     * @returns {Kinetic.BoundsRect}
     */
    _getNodeBoundsUntransformed: function()
    {
        if( this._boundsUntransformed === null )
            this._boundsUntransformed = this._calcNodeBoundsLocalUntransformed();

        return( this._boundsUntransformed.clone() );
    },
    /**
     * calculates the untransformed local bounds for the node
     * @returns {Kinetic.BoundsRect}
     */
    _calcNodeBoundsLocalUntransformed: function()
    {
        return( new Kinetic.BoundsRect( 0, 0, 0, 0 ) );
    }
};

// extend Node
Kinetic.GlobalObject.extend(Kinetic.Shape, Kinetic.Node);
// extend NodeExtAnimate
Kinetic.GlobalObject.extend(Kinetic.Shape, Kinetic.NodeExtAnimate);
