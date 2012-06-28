///////////////////////////////////////////////////////////////////////
//  Easing
///////////////////////////////////////////////////////////////////////
/**
 * Easing library
 *
 * Expected parameters:
 * t: current time (normalized), b: start value, c: value change
 */
(function(){

    var HALF_PI = Math.PI / 2;

    Kinetic.Easing = {
        linear: function (t, b, c) {
            return (c*t) + b;
        },

        quadIn: function (t, b, c) {
            return (c*t*t) + b;
        },
        quadOut: function (t, b, c) {
            return (c*t*(t-2)) + b;
        },
        quadInOut: function (t, b, c) {
            t /= 0.5;

            if( t <= 1 )
                return( Kinetic.Easing.quadIn(t, b, c) );

            return Kinetic.Easing.quadOut( t - 1, b, c );
        },

        sineIn: function (t, b, c) {
            return -c * Math.cos(t * HALF_PI) + c + b;
        },
        sineOut: function (t, b, c) {
            return c * Math.sin(t * HALF_PI) + b;
        },
        sineInOut: function (t, b, c) {
            return -c/2 * (Math.cos(t * Math.PI) - 1) + b;
        }
    }
})();
