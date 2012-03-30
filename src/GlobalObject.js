///////////////////////////////////////////////////////////////////////
//  Global Object
///////////////////////////////////////////////////////////////////////
/**
 * Kinetic Namespace
 * @namespace
 */
var Kinetic = {};
/**
 * Kinetic Global Object
 * @property {Object} GlobalObjet
 */
Kinetic.GlobalObject = {
    stages: [],
    idCounter: 0,
    tempCanvas: null,
    frame: {
        time: 0,
        timeDiff: 0,
        lastTime: 0
    },
    drag: {
        moving: false,
        node: undefined,
        offset: {
            x: 0,
            y: 0
        }
    },
    extend: function(obj1, obj2) {
        for(var key in obj2.prototype) {
            if(obj2.prototype.hasOwnProperty(key) && obj1.prototype[key] === undefined) {
                obj1.prototype[key] = obj2.prototype[key];
            }
        }
    },
    _isaCanvasAnimating: function() {
        for(var n = 0; n < this.stages.length; n++) {
            var stage = this.stages[n];
            if(stage.isAnimating) {
                return true;
            }

            for(var i = 0; i < stage.children.length; i++) {
                var layer = stage.children[i];
                if(layer.transitions.length > 0) {
                    return true;
                }
            }
        }

        this.frame.lastTime = 0;
        return false;
    },
    _endTransition: function() {
        var config = this.config;
        for(var key in config) {
            if(config.hasOwnProperty(key)) {
                if(config[key].x !== undefined || config[key].y !== undefined) {
                    var propArray = ['x', 'y'];
                    for(var n = 0; n < propArray.length; n++) {
                        var prop = propArray[n];
                        if(config[key][prop] !== undefined) {
                            this.node[key][prop] = config[key][prop];
                        }
                    }
                }
                else {
                    this.node[key] = config[key];
                }
            }
        }
    },
    _transitionPow: function(transition, key, prop, powFunc) {
        var pow = powFunc(),
            start,
            change,
            b;

        var config = transition.config;
        if(prop !== undefined) {
            start = transition.starts[key][prop];
            change = config[key][prop] - start;
            b = change / (Math.pow(config.duration * 1000, pow));
            transition.node[key][prop] = b * Math.pow(transition.time, pow) + start;
        }
        else {
            start = transition.starts[key];
            change = config[key] - start;
            b = change / (Math.pow(config.duration * 1000, pow));
            transition.node[key] = b * Math.pow(transition.time, pow) + start;
        }
    },
    _chooseTransition: function(transition, key, prop) {
        var config = transition.config;
        switch(config.easing) {
            case 'ease-in':
                this._transitionPow(transition, key, prop, function() {
                    return 2.5;
                });
                break;
            case 'ease-out':
                this._transitionPow(transition, key, prop, function() {
                    return 0.4;
                });
                break;
            case 'ease-in-out':
                this._transitionPow(transition, key, prop, function() {
                    var change = -2.1;
                    var b = change / (config.duration * 1000);
                    return 2.5 + b * transition.time;
                });
                break;
            // linear is default
            default:
                this._transitionPow(transition, key, prop, function() {
                    return 1;
                });
                break;
        }
    },
    _runTransition: function(transition) {
        var config = transition.config;
        for(var key in config) {
            if( !config.hasOwnProperty(key) ) {
                continue;
            }

            if( key === 'duration' || key === 'easing' || key === 'callback') {
                continue;
            }

            if(config[key].x !== undefined || config[key].y !== undefined) {
                var propArray = ['x', 'y'];
                for(var n = 0; n < propArray.length; n++) {
                    var prop = propArray[n];
                    if(config[key][prop] !== undefined) {
                        this._chooseTransition(transition, key, prop);
                    }
                }
            }
            else {
                this._chooseTransition(transition, key);
            }
        }
    },
    _clearTransition: function(node) {
        var layer = node.getLayer();
        for(var n = 0; n < layer.transitions.length; n++) {
            if(layer.transitions[n].node.id === node.id) {
                layer.transitions.splice(n, 1);
            }
        }
    },
    _runFrames: function() {
        for(var n = 0; n < this.stages.length; n++) {
            var stage = this.stages[n];
            // run animation if available
            if(stage.isAnimating && stage.onFrameFunc !== undefined) {
                stage.onFrameFunc(this.frame);
            }

            // loop through layers
            var layers = stage.getChildren();
            for(var k = 0; k < layers.length; k++) {
                var layer = layers[k];
                var didTransition = false;
                // loop through transitions
                for(var i = 0; i < layer.transitions.length; i++) {
                    didTransition = true;
                    var transition = layer.transitions[i];
                    transition.time += this.frame.timeDiff;
                    if(transition.time >= transition.config.duration * 1000) {
                        this._endTransition.apply(transition);
                        this._clearTransition(transition.node);
                        if(transition.config.callback !== undefined) {
                            transition.config.callback();
                        }
                    }
                    else {
                        this._runTransition(transition);
                    }
                }

                if(didTransition) {
                    layer.draw();
                }
            }
        }
    },
    _updateFrameObject: function() {
        var date = new Date();
        var time = date.getTime();
        if(this.frame.lastTime === 0) {
            this.frame.lastTime = time;
        }
        else {
            this.frame.timeDiff = time - this.frame.lastTime;
            this.frame.lastTime = time;
            this.frame.time += this.frame.timeDiff;
        }
    },
    _animationLoop: function() {
        if(this._isaCanvasAnimating()) {
            this._updateFrameObject();
            this._runFrames();
            var that = this;
            requestAnimFrame(function() {
                that._animationLoop();
            });
        }
    },
    _handleAnimation: function() {
        var that = this;
        if(this._isaCanvasAnimating()) {
            that._animationLoop();
        }
    },
    getTempCanvasContext: function() {
        if( this.tempCanvas == null )
            this.tempCanvas = document.createElement('canvas');

        return( this.tempCanvas.getContext('2d') );
    }
};

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();
