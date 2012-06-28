///////////////////////////////////////////////////////////////////////
//  General animation class
///////////////////////////////////////////////////////////////////////
/**
 * Animate constructor
 * @constructor
 * @param {Object} config
 *
 * @Config  {Object}    target          The instance to animate
 * @Config  {Object}    to              List of parameters and their final values
 * @Config  {Number}    duration        The animation length (secs)
 *
 * @Config  {Object}    [from]          List of parameters to start from. If not specified, it will use the object value
 * @Config  {Function}  [easing]        The easing function to use fn(t:Number, b:Number, c:Number)
 * @Config  {Boolean}   [loop]           True if the animation loops. False otherwise.
 * @Config  {Function}  [updateFn]      Update callback function
 * @Config  {Function}  [completeFn]    Completion callback function
 */
Kinetic.Animate = function(config) {
    this.target = config.target;
    this.endConfig = config.to;
    this.startConfig = config.from;
    this.duration = Math.max( 0, config.duration );
    this.loop = config.loop != null ? config.loop : false;
    this.easingFn = config.easing instanceof Function ? config.easing : Kinetic.Easing.linear;
    this.updateFn   = config.updateFn instanceof Function ? config.updateFn : undefined;
    this.completeFn = config.completeFn instanceof Function ? config.completeFn : undefined;

    this._tickRef = null;
    this._elapsedSecs = 0;
    this._startValues = undefined;

};
/*
 * Animate methods
 */
Kinetic.Animate.prototype = {

    /**
     * Start playback
     */
    play: function() {
        // Already playing? We're done...
        if( this.isPlaying() )
            return;

        // Apply the start animation configuration values
        this._applyConfig( this.target, this.startConfig );

        // Build up our own DB of starting values to use...
        this._startValues = this._buildStartValueDb( this.target, this.endConfig );

        // Start the ticking...
        this._elapsedSecs = 0;
        this._tickRef = Kinetic.GlobalObject.addTicked( this._tick, this, 0 );
    },
    /**
     * Stop playback
     */
    stop: function() {
        // Not playing? We're done
        if( !this.isPlaying() )
            return;

        this._tickRef.remove();
        this._tickRef = null;
        this._startValues = null;
    },
    /**
     * Returns the animation playback state
     *
     * @returns {Boolean}   Returns true if playing
     */
    isPlaying: function() {
        return( this._tickRef != null );
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
     * Animation update function
     *
     * @returns {Boolean}   Returns true if complete...
     */
    update: function( elapsedSecs ) {
        var t,
            key,
            valueStart;

        this._elapsedSecs += elapsedSecs;

        // Figure out where we are in the animation...
        t = Math..min( 1, this._elapsedSecs / this.duration );

        // Animate all the properties using the start values as the reference as it's filtered...
        for( key in this._startValues )
        {
            if( !this._startValues.hasOwnProperty(key) )
                continue;

            valueStart = this._startValues[key];
            this.target[key] = this.easingFn( t, valueStart, this.endConfig[key] - valueStart );
        }

        if( this.updateFn instanceof Function )
            this.updateFn( elapsedSecs );

        return( t >= 1 );
    },
    /**
     * Animation complete function
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
            this.stop();
            this.play();
        }
    },

    /**
     * Tick function
     */
    _tick: function( elapsedSecs ) {
        if( this.update( elapsedSecs ) )
            this.complete();
    },
    /**
     * Apply the starting configuration
     */
    _applyConfig: function( target, config ) {
        var key;

        if( config == null || target == null )
            return;

        for( key in config ) {
            if( !config.hasOwnProperty(key) )
                continue;
            if( target[key] != null )
                continue;

            target[key] = config[key];
        }
    },
    /**
     * Build the starting value DB
     *
     * @returns {Object}
     */
    _buildStartValueDb: function( target, config ) {
        var db = {},
            key;

        if( target != null && config != null ) {
            for( key in config )
            {
                if( !config.hasOwnProperty(key) )
                    continue;
                if( target[key] != null )
                    continue;

                db[key] = target[key];
            }
        }

        return( db );
    }
};
