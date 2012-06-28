///////////////////////////////////////////////////////////////////////
//  Shape animation class
///////////////////////////////////////////////////////////////////////
/**
 * Shape Animator constructor
 * @constructor
 * @augments Kinetic.Animate
 * @param {Object} config
 */
Kinetic.AnimateShape = function(config) {
    Kinetic.Animate.apply( this, arguments );
};
/*
 * Animate methods
 */
Kinetic.AnimateShape.prototype = {

    /**
     * Animation update function
     *
     * @returns {Boolean}   Returns true if complete...
     */
    update: function( elapsedSecs ) {
        var result = Kinetic.Animate.prototype.update.call( this, elapsedSecs),
            target;

        // Get the shapes to mark themselves for redraw...
        if( this.target.markForRedraw instanceof Function )
            this.target.markForRedraw();

        return( result );
    }
};

// extend Kinetic.Animate
Kinetic.GlobalObject.extend(Kinetic.AnimateShape, Kinetic.Animate);
