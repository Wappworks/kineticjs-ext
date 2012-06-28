///////////////////////////////////////////////////////////////////////
//  Animation queue class
///////////////////////////////////////////////////////////////////////
/**
 * Animation queue constructor
 * @constructor
 *
 * @param   {Object}    [config]
 *
 * @config  {Function}  complete    Completion callback function
 */
Kinetic.AnimateQueue = function( config ) {
    if( config == null )
        config = {};

    this.completeFn = config.complete != null ? config.complete : undefined;

    this._queue = [];
    this._playIndex = -1;
};
/*
 * Animation queue methods
 */
Kinetic.AnimateQueue.prototype = {
    /**
     * Add a regular animation to the queue
     * @param   {Object}    config      The animation config
     */
    addAnimation: function( config ) {
        var animInst = new Kinetic.Animate( config );
        this._installAnimCompleteCb( animInst );
        this._queue.push( animInst );
    },
    /**
     * Add a shape animation to the queue
     * @param   {Object}    config      The shape animation config
     */
    addShapeAnimation: function( config ) {
        var animInst = new Kinetic.AnimateShape( config );
        this._installAnimCompleteCb( animInst );
        this._queue.push( animInst );
    },
    /**
     * Installs an animation completion callback into the animation instance
     * @param   {Kinetic.Animate|Kinetic.AnimateShape}    anim
     */
    _installAnimCompleteCb: function( anim ) {
        var queue = this;

        Kinetic.GlobalObject.functionWrap( anim, "complete", function( prevFn ){
            prevFn.call( this );

            queue._onAnimComplete();
        });
    },
    /*
     * Start playback...
     */
    play: function() {
        // Already playing? We're done...
        if( this.isPlaying() )
            return;

        // Nothing in the queue? Playback is complete...
        if( this._queue.length == 0 )
            this.complete();

        // If we get here, play the first animation in the queue...
        this._playIndex = 0;
        this._queue[ this._playIndex ].play();
    },
    /*
     * Stop playback...
     */
    stop: function() {
        // Not playing? We're done...
        if( !this.isPlaying() )
            return;

        // Stop the playing animation...
        this._queue[ this._playIndex ].stop();
        this._playIndex = -1;
    },
    /*
     * Returns the playback state
     *
     * @returns {Boolean|   true if playing back...
     */
    isPlaying: function() {
        return( this._playIndex >= 0 );
    },
    /**
     * Called when the animation queue is complete
     */
    complete: function() {
        // Not playing? We're done
        if( !this.isPlaying() )
            return;

        if( this.completeFn instanceof Function )
            this.completeFn();

        this.stop();
    },
    /*
     *  Callback when an animation completes
     */
    _onAnimComplete: function()
    {
        // No animation playing? We're done...
        if( !this.isPlaying() )
            return;

        // Completion of the queue?
        if( this._playIndex >= (this._queue.length - 1) ) {
            this.complete();
            return;
        }

        // If we get here, play the next animation....
        this._playIndex++;
        this._queue[ this._playIndex ].play();
    }
};
