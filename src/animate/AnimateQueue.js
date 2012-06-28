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
    this.loop = false;

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

            // If the animation is looped, we keep waiting...
            if( this.isLooped() )
                return;

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
    /*
     * Set the playback loop state
     */
    setLooped: function( isLooped ) {
        this.loop = isLoop;
    },
    /*
     * Returns the playback loop state
     *
     * @returns {Boolean|   true if playback will loop
     */
    isLooped: function() {
        return( this.loop );
    },
    /**
     * Called when the animation queue is complete
     */
    complete: function() {
        var isLoopedOnEntry = this.loop;

        // Not playing? We're done
        if( !this.isPlaying() )
            return;

        // If we're not looping, we call stop before the completion function
        if( !isLoopedOnEntry )
            this.stop();

        if( this.completeFn instanceof Function )
            this.completeFn();

        // If we were looping on entry and there's no change to the playback status, we restart the playback
        // This is so that the completion function can turn off the loop flag and not affect playback...
        if( isLoopedOnEntry && this.isPlaying() )
        {
            this._playIndex = 0;
            this._queue[ this._playIndex ].play();
        }
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
