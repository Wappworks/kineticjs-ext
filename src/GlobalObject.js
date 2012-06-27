///////////////////////////////////////////////////////////////////////
//  Namespace
///////////////////////////////////////////////////////////////////////
/**
 * Kinetic Namespace
 * @namespace
 */
var Kinetic = {};

///////////////////////////////////////////////////////////////////////
//  Ticked Reference
///////////////////////////////////////////////////////////////////////
/**
 * Kinetic Ticked Instance Reference
 * @constructor
 *
 * @param   {Function}  tickFn  tickFn( elapsedSecs:Number ):void
 * @param   {Object}    context
 * @param   {Number}    priority
 */
Kinetic.TickedRef = function( tickFn, context, priority ) {
    this.tickFn = tickFn;
    this.context = context;
    this.priority = priority;
};

Kinetic.TickedRef.prototype = {
    tick: function( elapsedSecs )
    {
        this.tickFn.call( this.context, elapsedSecs );
    },
    remove: function()
    {
        Kinetic.GlobalObject.removeTickedRef( this );
    }
};

///////////////////////////////////////////////////////////////////////
//  Global Object
///////////////////////////////////////////////////////////////////////
/**
 * Kinetic Global Object
 * @property {Object} GlobalObject
 */
Kinetic.GlobalObject = {
    stages: [],
    idCounter: 0,
    tempCanvas: null,

    redrawNodes: [],
    tickedList: [],

    loopEnabled: false,
    loopActive: false,

    frameUpdateMs: 1000/ 60,
    lastUpdateTimeMs: 0,
    isCustomFrameUpdate: false,
    frame: {
        time: 0,
        timeDiff: 0,
        lastTime: 0
    },
    drag: {
        moving: false,
        inputStartEvent: undefined,
        userPosStart: undefined,
        node: undefined,
        custom: undefined
    },
    getTempCanvasContext: function() {
        if( this.tempCanvas == null )
            this.tempCanvas = document.createElement('canvas');

        return( this.tempCanvas.getContext('2d') );
    },
    extend: function(obj1, obj2) {
        for(var key in obj2.prototype) {
            if(obj2.prototype.hasOwnProperty(key) && obj1.prototype[key] === undefined) {
                obj1.prototype[key] = obj2.prototype[key];
            }
        }
    },
    setFrameRate: function( updateHz ) {
        this.frameUpdateMs = 1000 / updateHz;
    },
    setFrameUpdateMs: function( updateMs ) {
        this.frameUpdateMs = updateMs;
    },
    addTicked: function ( fn, context, priority ) {
        var tickedRef = this._tickedListAdd( fn, context, priority );
        this._loopUpdateStatus();
        return( tickedRef );
    },
    removeTicked: function ( fn, context, priority ) {
        if( this._tickedListRemove( fn, context, priority ) )
            this._loopUpdateStatus();
    },
    removeTickedRef: function( tickedRef ) {
        var tickedList = this.tickedList,
            index = tickedList.indexOf( tickedRef );

        if( index < 0 )
            return false;

        tickedList.splice( index, 1 );
        this._loopUpdateStatus();
        return true;
    },
    _tickedListUpdate: function( elapsedSecs ) {
        var tickedListCurr = this.tickedList.slice(),
            listLength = tickedListCurr.length,
            index;

        for( index = 0; index < listLength; index++ )
            tickedListCurr[ index ].tick( elapsedSecs );
    },
    _tickedListAdd: function( fn, context, priority ) {
        var tickedRef =  new Kinetic.TickedRef( fn, context, priority ),
            tickedList = this.tickedList,
            listLength = tickedList.length,
            indexLow = 0,
            indexHigh = listLength,
            indexInsert,
            compareResult;

        if( listLength <= 0 ) {
            tickedList.push( tickedRef );
            return( tickedRef );
        }

        do {
            indexInsert = Math.floor( (indexLow + indexHigh) * 0.5 );
            compareResult = priority - tickedList[indexInsert].priority;

            // Equivalent? Then, we can insert it...
            if( compareResult === 0 )
                break;

            // The layer is to be inserted in the earlier half of the list...
            if( compareResult < 0 )
            {
                // END CONDITION: The current index is the low index. In this case, we're saying that
                // we want to insert BEFORE the lowest index...
                if( indexInsert === indexLow )
                {
                    break;
                }

                indexHigh = indexInsert;
                continue;
            }

            // If we get here, the layer is to be inserted in the latter half of the list...
            indexInsert++;

            // END CONDITION: The current index is the highest index: In this case, we're saying that
            // we want to insert AFTER the highest index...
            if( indexInsert === indexHigh )
            {
                break;
            }

            indexLow = indexInsert;
        }
        while( 1 );

        // We've found our insertion point when we get here...
        if( indexInsert <= 0 ) {
            tickedList.unshift( tickedRef );
        } else if( indexInsert >= listLength ) {
            tickedList.push( tickedRef );
        } else {
            tickedList.splice( indexInsert, 0, tickedRef );
        }

        return( tickedRef );
    },
    _tickedListRemove: function( fn, context, priority ) {
        // If we don't keep the ticked reference, we have to remove it the hard way...
        var tickedList = this.tickedList,
            index, listLength, tickedRefCurr;

        for( index = 0, listLength = tickedList.length; index < listLength; index++ )
        {
            tickedRefCurr = tickedList[ index ];
            if( tickedRefCurr.tickFn === fn && tickedRefCurr.context === context && tickedRefCurr.priority === priority )
            {
                tickedList.splice( index, 1 );
                return true;
            }
        }

        return false;
    },
    _redrawListAdd: function( node )
    {
        if( node.className === "Stage" ) {
            // Stages go to the front of the queue
            this.redrawNodes.unshift( node );
        } else {
            // Everything else is queued at the back...
            this.redrawNodes.push( node );
        }

        this._loopUpdateStatus();
    },
    _redrawUpdate: function()
    {
        var redrawNodes = this.redrawNodes,
            listLength = redrawNodes.length,
            index, redrawNodeCurr;

        if( listLength <= 0 )
            return;

        // Prepare the redraw nodes list for the next update...
        this.redrawNodes = [];

        // Update the nodes marked for redraw
        for( index = 0; index < listLength; index++ )
        {
            redrawNodeCurr = redrawNodes[ index ];
            if( redrawNodeCurr.needsRedraw() )
                redrawNodeCurr.draw();
        }
    },

    _runFrames: function() {
        this._tickedListUpdate( this.frame.timeDiff / 1000 );
        this._redrawUpdate();
    },
    _updateFrameObject: function( time ) {
        if(this.frame.lastTime === 0) {
            this.frame.lastTime = time;
        }
        else {
            this.frame.timeDiff = time - this.frame.lastTime;
            this.frame.lastTime = time;
            this.frame.time += this.frame.timeDiff;
        }
    },
    _loopUpdate: function() {
        if( !this.loopEnabled )
            return;

        var currTimeMs = (new Date()).getTime();
        if( this.lastUpdateTimeMs <= 0 )
        {
            // First update? The time is the expected elapsed time...
            this.lastUpdateTimeMs = currTimeMs - this.frameUpdateMs;
        }

        // For browser based updated? We may need to throttle back the update...
        if( !this.isCustomFrameUpdate ) {
            // Not enough elapsed time? Wait longer...
            if( currTimeMs - this.lastUpdateTimeMs < this.frameUpdateMs ) {
                this._scheduleLoop();
                return;
            }
        }

        this._updateFrameObject( currTimeMs );
        this.loopActive = true;
        this._runFrames();
        this.loopActive = false;

        if( this._loopShouldLoop() )
            this.loopEnabled = true;

        this._scheduleLoop( this.loopEnabled );
    },
    _loopUpdateStatus: function() {
        // Don't change the update loop status is we're in the loop. The loop will take care of itself
        if( this.loopActive )
            return;

        // Determine if we need to enable the loop
        var shouldLoop = this._loopShouldLoop();
        if( shouldLoop === this.loopEnabled )
            return;

        this.loopEnabled = shouldLoop;
        this._scheduleLoop( shouldLoop );
    },
    _loopShouldLoop: function()
    {
        return( this.tickedList.length > 0 || this.redrawNodes.length > 0 );
    },
    _scheduleLoop: function( doLoop )
    {
        if( !doLoop ) {
            this.lastUpdateTimeMs = 0;
            return;
        }

        var that = this;
        requestAnimFrame(function() {
            that._loopUpdate();
        });
    }
};

window.requestAnimFrame = (function() {
    if( window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame )
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;

    // If we get here, we're returning our own callback
    Kinetic.GlobalObject.isCustomFrameUpdate = true;
    return function(callback) {
        window.setTimeout(callback, Kinetic.GlobalObject.frameUpdateMs);
    };
})();
