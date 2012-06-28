///////////////////////////////////////////////////////////////////////
//  Node animation extension
///////////////////////////////////////////////////////////////////////
/**
 * Node animation implementation
 */
Kinetic.NodeExtAnimate = function() {
    this._animQueue = undefined;
};

Kinetic.NodeExtAnimate.prototype = {
    /*
     *  Adds a shape animation to the node
     *
     *  @param  {Object}    config      Shape animation configuration. Refer to Kinetic.ShapeAnimate for its fields.
     *
     *  @return {Kinetic.Node}          This instance
     */
    animate: function( config ) {
        if( this._animQueue == null ) {
            this._animQueue = new Kinetic.AnimateQueue({
                complete: this._getQueueCompleteCb()
            });
        }

        this._animQueue.addShapeAnimation( config );
        this._animQueue.play();

        return( this );
    },
    /*
     *  Clears all the animations
     */
    clearAnimations: function()
    {
        if( this._animQueue == null )
            return;

        this._animQueue.stop();
        this._animQueue = undefined;
    },
    /*
     *  Returns the animation state
     *
     *  @return {Boolean}          true if animating...
     */
    isAnimating: function() {
        return( this._animQueue != null );
    },
    /*
     *  Returns the completion callback
     *
     *  @returns    {Function}  The callback function;
     */
    _getQueueCompleteCb: function()
    {
        var that = this;
        return( function() {
           // Discard the animation queue on completion..
            that._animQueue = undefined;
        });
    }
};
