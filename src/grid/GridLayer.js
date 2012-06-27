///////////////////////////////////////////////////////////////////////
//  GridLayer
///////////////////////////////////////////////////////////////////////
/**
 * GridLayer constructor
 * @constructor
 *
 * @param   {Object}    config
 *
 * @config  {String}    name
 * @config  {Boolean}   visible
 * @config  {Number}    alpha
 * @config  {Number}    depth
 */
Kinetic.GridLayer = function(config) {
    // Defaults
    this.name = undefined;
    this.visible = true;
    this.depth = 0;
    this.alpha = 1;

    // Set properties from config
    if(config != null ) {
        for(var key in config) {
            if( !config.hasOwnProperty(key) )
                continue;

            this[key] = config[key];
        }
    }

    // Set by the system...
    this.id = Kinetic.GlobalObject.idCounter++;
    this._parent = undefined;
};

/*
 *  Returns the grid bounds
 *  @returns {Kinetic.BoundsRect}
 */
Kinetic.GridLayer.prototype = {
    /*
     *  Draws the layer
     *
     *  @param  {CanvasContext}         drawCtx
     *  @param  {Kinetic.BoundsRect}    gridBounds
     *  @param  {Number}                spotWidth
     *  @param  {Number}                spotHeight
     */
    draw: function( drawCtx, gridBounds, spotWidth, spotHeight ) {
    },
    /*
     *  Sets the alpha
     *
     *  @param  {Number}         alpha
     */
    setAlpha: function( alpha ) {
        this.alpha = alpha;
    },
    /*
     *  Returns the alpha
     *
     *  @returns  {Number}
     */
    getAlpha: function() {
        return( this.alpha );
    },
    /*
     *  Sets the layer visibility
     *
     *  @param  {Boolean}         isVisible
     */
    setVisible: function( visible ) {
        this.visible = visible;
    },
    /*
     *  Returns true if it's visible. false otherwise.
     *
     *  @returns  {Boolean}
     */
    isVisible: function() {
        return( this.visible );
    },
    /*
     *  Sets the parent
     *  @param    {Kinetic.GridMap} parent
     */
    setParent: function( parent ) {
        if( parent === null )
            parent = undefined;

        this._parent = parent;
    },
    /*
     *  Returns the parent grid or undefined if it's not attached
     *  @returns    {Kinetic.GridMap}
     */
    getParent: function() {
        return( this._parent );
    },
    /*
     *  Returns the grid bounds overlap
     *  @returns    {Kinetic.BoundsRect}
     */
    getGridBounds: function() {
        return( new Kinetic.BoundsRect(0,0,0,0) );
    },
    /*
     *  Returns the grid bounds overlap
     *  @param      {Number}    spotWidth
     *  @param      {Number}    spotHeight
     *
     *  @returns    {Overlap}
     *
     *  @Overlap    {Number}    left
     *  @Overlap    {Number}    right
     *  @Overlap    {Number}    top
     *  @Overlap    {Number}    bottom
     */
    getOverlap: function(spotWidth, spotHeight) {
        return( {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        } );
    },

    /*
     *  Mark the layer for redraw
     */
    markForRedraw: function() {
        var parent = this.getParent();
        if( parent != null )
            parent.markForRedraw();
    }
};
