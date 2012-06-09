///////////////////////////////////////////////////////////////////////
//  Stage
///////////////////////////////////////////////////////////////////////
/**
 * Stage constructor.  A stage is used to contain multiple layers and handle
 * animations
 * @constructor
 * @param {String|Node} cont Container id or DOM element
 * @param {int} width
 * @param {int} height
 */
Kinetic.Stage = function(cont, width, height) {
    this.className = 'Stage';
    this.container = typeof cont === 'string' ? document.getElementById(cont) : cont;
    this.content = document.createElement('div');

    this.width = width;
    this.height = height;

    this.viewPos = { x:0, y:0 };
    this.appliedViewPos = null;
    this.appliedViewScale = null;

    this._worldLimits = null;
    this._viewLimits = null;

    this.dblClickWindow = 400;
    this.clickStart = false;
    this.targetShape = undefined;
    this.targetFound = false;
    this.mouseoverShape = undefined;
    this.mouseoutShape = undefined;

    // desktop flags
    this.mousePos = undefined;
    this.mouseDown = false;
    this.mouseUp = false;

    // mobile flags
    this.touchPos = undefined;
    this.touchStart = false;
    this.touchEnd = false;

    // set stage id
    this.id = Kinetic.GlobalObject.idCounter++;

    // animation support
    this.isAnimating = false;
    this.redraw = false;
    this.onFrameFunc = undefined;

    this._buildDOM();
    this._listen();
    this._prepareDrag();

    // add stage to global object
    Kinetic.GlobalObject.stages.push(this);

    // call super constructor
    Kinetic.Container.apply(this, []);
};
/*
 * Stage methods
 */
Kinetic.Stage.prototype = {
    /**
     * destroys the stage
     *
     */
    destroy: function() {
        var goIndex = Kinetic.GlobalObject.stages.indexOf(this);
        if( goIndex >= 0 )
            Kinetic.GlobalObject.stages.splice( goIndex, 1 );
    },
    /**
     * sets onFrameFunc for animation
     * @param {function} func
     */
    onFrame: function(func) {
        this.onFrameFunc = func;
    },
    /**
     * start animation
     */
    start: function() {
        this.isAnimating = true;
        Kinetic.GlobalObject._handleAnimation();
    },
    /**
     * stop animation
     */
    stop: function() {
        this.isAnimating = false;
        Kinetic.GlobalObject._handleAnimation();
    },
    /**
     * mark for redraw
     */
    markForRedraw: function() {
        if( this.redraw === true )
            return;

        this.redraw = true;
        Kinetic.GlobalObject._handleAnimation();
    },
    /**
     * determines if the layer needs to be redrawn
     */
    needsRedraw: function() {
        return( this.redraw );
    },
    /**
     * draw children
     */
    draw: function() {
        this.redraw = false;
        this._drawChildren();
    },
    /**
     * set stage size
     * @param {int} width
     * @param {int} height
     */
    setSize: function(width, height) {
        // set stage dimensions
        this.width = width;
        this.height = height;
        this._recalcViewLimitsAndApply();

        this.content.style.width = width + 'px';
        this.content.style.height = height + 'px';

        // set buffer layer and backstage layer sizes
        this.bufferLayer.setSize( width, height );
        this.backstageLayer.setSize( width, height );

        var layers = this.children;
        for(var n = 0; n < layers.length; n++) {
            var layer = layers[n];
            layer.setSize( width, height );
        }

        this.markForRedraw();
    },
    /**
     * gets the layer size
     * @returns {Object} size
     *
     * @size {Number} x
     * @size {Number} y
     */
    getSize: function() {
        return( { x:this.width, y:this.height } );
    },
    /**
     * Sets the view limits by specifying the world bounds
     * @param {Kinetic.BoundsRect}   worldBounds    The world limits which is used to calculate the view limits
     **/
    setViewLimitsByWorldBounds: function(worldBounds) {
        if( !(worldBounds instanceof Kinetic.BoundsRect) )
        {
            this._worldLimits = null;
            this._viewLimits = null;
            return;
        }

        this._worldLimits = worldBounds;

        // Translate the limits from world space to view space and apply it
        this._recalcViewLimitsAndApply();
    },
    /**
     * set the view position
     * @param {int} x
     * @param {int} y
     */
    setTargetViewPos: function(x, y) {
        // Store the configured view position...
        this.viewPos = { x: x, y:y };

        var viewLimits = this._viewLimits;
        if( viewLimits !== null ) {
            x = Math.min( viewLimits.getRight(), Math.max(viewLimits.getLeft(), x) );
            y = Math.min( viewLimits.getBottom(), Math.max(viewLimits.getTop(), y) );
        }

        if( x === 0 && y === 0 ) {
            this.appliedViewPos = null;
            return;
        }

        this.appliedViewPos = { x: x, y: y };
    },
    /**
     * get the target view position
     */
    getTargetViewPos: function() {
        return this.viewPos;
    },
    /**
     * get the view position
     */
    getViewPos: function() {
        if( this.appliedViewPos !== null )
            return( this.appliedViewPos );

        return( this.viewPos );
    },
    /**
     * set stage scale.  If only one parameter is passed in, then
     * both scaleX and scaleY are set to the parameter
     * @param {int} scaleX
     * @param {int} scaleY
     */
    setScale: function(scaleX, scaleY) {
        if( scaleY === undefined )
            scaleY = scaleX;

        if( scaleX === 1 && scaleY === 1 )
            this.appliedViewScale = null;
        else
            this.appliedViewScale = { x:scaleX, y:scaleY };

        this._recalcViewLimitsAndApply();
    },
    /**
     * get scale
     */
    getScale: function() {
        if( this.appliedViewScale === null )
            return( {x:1, y:1} );

        return this.appliedViewScale;
    },
    /**
     * clear all layers
     */
    clear: function() {
        var layers = this.children;
        for(var n = 0; n < layers.length; n++) {
            layers[n].clear();
        }
    },
    /**
     * creates a composite data URL and passes it to a callback
     * @param {function} callback
     */
    toDataURL: function(callback) {
        var bufferLayer = this.bufferLayer;
        var bufferContext = bufferLayer.getContext();
        var layers = this.children;

        function addLayer(n) {
            var dataURL = layers[n].getCanvas().toDataURL();
            var imageObj = new Image();
            imageObj.onload = function() {
                bufferContext.drawImage(this, 0, 0);
                n++;
                if(n < layers.length) {
                    addLayer(n);
                }
                else {
                    callback(bufferLayer.getCanvas().toDataURL());
                }
            };
            imageObj.src = dataURL;
        }

        bufferLayer.clear();
        addLayer(0);
    },
    /**
     * remove layer from stage
     * @param {Kinetic.Layer} layer
     */
    remove: function(layer) {
        // remove layer canvas from dom
        this.content.removeChild(layer.canvas);

        this._remove(layer);
    },
    /**
     * bind event listener to stage (which is essentially
     * the container DOM)
     * @param {String} typesStr
     * @param {function} handler
     */
    on: function(typesStr, handler) {
        var types = typesStr.split(' ');
        for(var n = 0; n < types.length; n++) {
            var baseEvent = types[n];
            this.container.addEventListener(baseEvent, handler, false);
        }
    },
    /**
     * add layer to stage
     * @param {Kinetic.Layer} layer
     */
    add: function(layer) {
        if(layer.name) {
            this.childrenNames[layer.name] = layer;
        }
        layer.setSize( this.width, this.height );
        this._add(layer);

        // draw layer and append canvas to container
        this.content.appendChild(layer.canvas);
        layer.markForRedraw();
    },
    /**
     * get mouse position for desktop apps
     */
    getMousePosition: function() {
        return this.mousePos;
    },
    /**
     * get touch position for mobile apps
     */
    getTouchPosition: function() {
        return this.touchPos;
    },
    /**
     * get user position (mouse position or touch position)
     */
    getUserPosition: function() {
        return this.getTouchPosition() || this.getMousePosition();
    },
    /**
     * get container DOM element
     */
    getContainer: function() {
        return this.container;
    },
    /**
     * get stage
     */
    getStage: function() {
        return this;
    },
    /**
     * detect event
     * @param {Kinetic.Shape} shape
     */
    _detectEvent: function(shape, evt) {
        // Not listening? We're done...
        if( !shape.isListening )
            return false;
            
        var isDragging = Kinetic.GlobalObject.drag.moving;
        var backstageLayer = this.backstageLayer;
        var go = Kinetic.GlobalObject;
        var pos = this.getUserPosition();
        var el = shape.eventListeners;


        if(this.targetShape && shape.id === this.targetShape.id) {
            this.targetFound = true;
        }

        if(shape.visible && pos !== undefined && shape.isPointInShape(backstageLayer,pos)) {
            // handle onmousedown
            if(!isDragging && this.mouseDown) {
                this.mouseDown = false;
                this.clickStart = true;
                shape._handleEvents('onmousedown', evt);
                return true;
            }
            // handle onmouseup & onclick
            else if(this.mouseUp) {
                this.mouseUp = false;
                shape._handleEvents('onmouseup', evt);

                // detect if click or double click occurred
                if(this.clickStart) {
                    /*
                     * if dragging and dropping, don't fire click or dbl click
                     * event
                     */
                    if((!go.drag.moving) || !go.drag.node) {
                        shape._handleEvents('onclick', evt);

                        if(shape.inDoubleClickWindow) {
                            shape._handleEvents('ondblclick', evt);
                        }
                        shape.inDoubleClickWindow = true;
                        setTimeout(function() {
                            shape.inDoubleClickWindow = false;
                        }, this.dblClickWindow);
                    }
                }
                return true;
            }
            // handle touchstart
            else if(this.touchStart) {
                this.touchStart = false;
                this.clickStart = true;
                shape._handleEvents('touchstart', evt);
                return true;
            }
            // handle touchend
            else if(this.touchEnd) {
                this.touchEnd = false;
                shape._handleEvents('touchend', evt);

                // detect if click or double click occurred
                if(this.clickStart) {
                    /*
                     * if dragging and dropping, don't fire click or dbl click
                     * event
                     */
                    if((!go.drag.moving) || !go.drag.node) {
                        shape._handleEvents('onclick', evt);

                        if(shape.inDoubleClickWindow) {
                            shape._handleEvents('ondblclick', evt);
                        }
                        shape.inDoubleClickWindow = true;
                        setTimeout(function() {
                            shape.inDoubleClickWindow = false;
                        }, this.dblClickWindow);
                    }
                }
                return true;
            }
            /*
            * NOTE: these event handlers require target shape
            * handling
            */

            // handle onmouseover
            else if(!isDragging && this._isNewTarget(shape, evt)) {
                /*
                 * check to see if there are stored mouseout events first.
                 * if there are, run those before running the onmouseover
                 * events
                 */
                if(this.mouseoutShape) {
                    this.mouseoverShape = shape;
                    this.mouseoutShape._handleEvents('onmouseout', evt);
                    this.mouseoverShape = undefined;
                }

                shape._handleEvents('onmouseover', evt);
                this._setTarget(shape);
                return true;
            }

            // handle mousemove and touchmove
            else if(!isDragging) {
                shape._handleEvents('onmousemove', evt);
                shape._handleEvents('touchmove', evt);
                return true;
            }
        }
        // handle mouseout condition
        else if(!isDragging && this.targetShape && this.targetShape.id === shape.id) {
            this._setTarget(undefined);
            this.mouseoutShape = shape;
            //shape._handleEvents('onmouseout', evt);
            return true;
        }

        return false;
    },
    /**
     * set new target
     */
    _setTarget: function(shape) {
        this.targetShape = shape;
        this.targetFound = true;
    },
    /**
     * check if shape should be a new target
     */
    _isNewTarget: function(shape, evt) {
        if(!this.targetShape || (!this.targetFound && shape.id !== this.targetShape.id)) {
            /*
             * check if old target has an onmouseout event listener
             */
            if(this.targetShape) {
                var oldEl = this.targetShape.eventListeners;
                if(oldEl) {
                    this.mouseoutShape = this.targetShape;
                    //this.targetShape._handleEvents('onmouseout', evt);
                }
            }
            return true;
        }
        else {
            return false;
        }
    },
    /**
     * traverse container children
     * @param {Kinetic.Container} obj
     */
    _eventTraverseChildren: function(obj, evt) {
        var children = obj._getChildrenDrawList();
        // propapgate backwards through children
        for(var i = children.length - 1; i >= 0; i--) {
            var child = children[i];
            if(child.className === 'Shape') {
                if( this._detectEvent(child, evt) ) {
                    return true;
                }
            }
            else {
                if( this._eventTraverseChildren(child, evt) ) {
                    return true;
                }
            }
        }

        return false;
    },
    /**
     * handle incoming event
     * @param {Event} evt
     */
    _handleEvent: function(evt) {
        if(!evt) {
            evt = window.event;
        }

        this._setMousePosition(evt);
        this._setTouchPosition(evt);

        var backstageLayer = this.backstageLayer;
        backstageLayer.clear();

        /*
         * loop through layers.  If at any point an event
         * is triggered, n is set to -1 which will break out of the
         * three nested loops
         */
        this.targetFound = false;
        var shapeDetected = false;
        for(var n = this.children.length - 1; n >= 0; n--) {
            var layer = this.children[n];
            if(layer.visible && n >= 0 && layer.isListening) {
                if(this._eventTraverseChildren(layer, evt)) {
                    n = -1;
                    shapeDetected = true;
                }
            }
        }

        /*
         * if no shape was detected and a mouseout shape has been stored,
         * then run the onmouseout event handlers
         */
        if(!shapeDetected && this.mouseoutShape) {
            this.mouseoutShape._handleEvents('onmouseout', evt);
            this.mouseoutShape = undefined;
        }
    },
    /**
     * begin listening for events by adding event handlers
     * to the container
     */
    _listen: function() {
        var that = this;

        // desktop events
        this.container.addEventListener('mousedown', function(evt) {
            that.mouseDown = true;
            that._handleEvent(evt);
        }, false);

        this.container.addEventListener('mousemove', function(evt) {
            that.mouseUp = false;
            that.mouseDown = false;
            that._handleEvent(evt);
        }, false);

        this.container.addEventListener('mouseup', function(evt) {
            that.mouseUp = true;
            that.mouseDown = false;
            that._handleEvent(evt);

            that.clickStart = false;
        }, false);

        this.container.addEventListener('mouseover', function(evt) {
            that._handleEvent(evt);
        }, false);

        this.container.addEventListener('mouseout', function(evt) {
            that.mousePos = undefined;
        }, false);
        // mobile events
        this.container.addEventListener('touchstart', function(evt) {
            evt.preventDefault();
            that.touchStart = true;
            that._handleEvent(evt);
        }, false);

        this.container.addEventListener('touchmove', function(evt) {
            evt.preventDefault();
            that._handleEvent(evt);
        }, false);

        this.container.addEventListener('touchend', function(evt) {
            evt.preventDefault();
            that.touchEnd = true;
            that._handleEvent(evt);
        }, false);
    },
    /**
     * set mouse positon for desktop apps
     * @param {Event} evt
     */
    _setMousePosition: function(evt) {
        var mouseX = evt.clientX - this._getContainerPosition().left + window.pageXOffset;
        var mouseY = evt.clientY - this._getContainerPosition().top + window.pageYOffset;
        this.mousePos = {
            x: mouseX,
            y: mouseY
        };
    },
    /**
     * set touch position for mobile apps
     * @param {Event} evt
     */
    _setTouchPosition: function(evt) {
        if(evt.touches !== undefined && evt.touches.length === 1) {// Only deal with
            // one finger
            var touch = evt.touches[0];
            // Get the information for finger #1
            var touchX = touch.clientX - this._getContainerPosition().left + window.pageXOffset;
            var touchY = touch.clientY - this._getContainerPosition().top + window.pageYOffset;

            this.touchPos = {
                x: touchX,
                y: touchY
            };
        }
    },
    /**
     * get container position
     */
    _getContainerPosition: function() {
        var obj = this.container;
        var top = 0;
        var left = 0;
        while(obj && obj.tagName !== 'BODY') {
            top += obj.offsetTop - obj.scrollTop;
            left += obj.offsetLeft - obj.scrollLeft;
            obj = obj.offsetParent;
        }
        return {
            top: top,
            left: left
        };
    },
    /**
     * disable layer rendering
     * @param {Kinetic.Layer} layer
     */
    _stripLayer: function(layer) {
        layer.context.stroke = function() {
        };
        layer.context.fill = function() {
        };
        layer.context.fillRect = function(x, y, width, height) {
            layer.context.rect(x, y, width, height);
        };
        layer.context.strokeRect = function(x, y, width, height) {
            layer.context.rect(x, y, width, height);
        };
        layer.context.drawImage = function() {
        };
        layer.context.fillText = function() {
        };
        layer.context.strokeText = function() {
        };
    },
    /**
     * end drag and drop
     */
    _endDrag: function(evt) {
        var go = Kinetic.GlobalObject;
        if(go.drag.node) {
            if(go.drag.moving) {
                go.drag.moving = false;
                go.drag.node._handleEvents('ondragend', evt);
            }

            go.drag.node.onDragStop();
        }
        go.drag.node = undefined;
        go.drag.inputStartEvent = undefined;
        go.drag.userPosStart = undefined;
        go.drag.custom = undefined;
    },
    /**
     * prepare drag and drop
     */
    _prepareDrag: function() {
        var that = this;

        this.on('mousemove touchmove', function(evt) {
            var go = Kinetic.GlobalObject;
            var node = go.drag.node;
            if(node) {
                if(!go.drag.moving) {
                    go.drag.moving = true;

                    // execute drag start
                    go.drag.custom = {};
                    go.drag.node.onDragStart( go.drag.userPosStart, go.drag.custom );
                    go.drag.node._handleEvents('ondragstart', go.drag.inputStartEvent);
                }

                // execute drag move
                var pos = that.getUserPosition();
                node.onDragUpdate( pos, go.drag.custom );
                go.drag.node._handleEvents('ondragmove', evt);
            }
        }, false);

        this.on('mouseup touchend mouseout', function(evt) {
            that._endDrag(evt);
        });
    },
    /**
     * build dom
     */
    _buildDOM: function() {
        // content
        this.content.style.width = this.width + 'px';
        this.content.style.height = this.height + 'px';
        this.content.style.position = 'absolute';
        this.content.style.display = 'inline-block';
        this.content.className = 'kineticjs-content';
        this.container.appendChild(this.content);

        // default layers
        this.bufferLayer = new Kinetic.Layer();
        this.backstageLayer = new Kinetic.Layer();

        // set parents
        this.bufferLayer.parent = this;
        this.backstageLayer.parent = this;

        // customize back stage context
        this._stripLayer(this.backstageLayer);
        this.bufferLayer.getCanvas().style.display = 'none';
        this.backstageLayer.getCanvas().style.display = 'none';

        // add buffer layer
        this.bufferLayer.setSize( this.width, this.height );
        this.content.appendChild(this.bufferLayer.canvas);

        // add backstage layer
        this.backstageLayer.setSize( this.width, this.height );
        this.content.appendChild(this.backstageLayer.canvas);
    },
    /**
     Recalculate the view limits based on world limits and apply it
     **/
    _recalcViewLimitsAndApply: function()
    {
        var worldLimits = this._worldLimits,
            stageScale,
            left, top, right, bottom,
            viewPos;

        // No world limits to apply? We're done...
        if( worldLimits === null )
            return;

        // Transform the world limits to view limits
        stageScale = this.getScale();
        left = worldLimits.getLeft();
        top = worldLimits.getTop();
        right = (worldLimits.getRight() * stageScale.x) - this.width;
        bottom = (worldLimits.getBottom() * stageScale.y) - this.height;

        // The limits is smaller than the view space horizontally? The limits are kept in the center of the viewport...
        if( right < left )
        {
            left = Math.round( (right + left) * 0.5 );
            right = left;
        }
        if( bottom < top )
        {
            top = Math.round( (top + bottom) * 0.5 );
            bottom = top;
        }

        viewPos = this.viewPos;
        this._viewLimits = Kinetic.BoundsRect.fromBounds( left, top, right, bottom );

        // Force the view pos bounds limiting update...
        this.setTargetViewPos( viewPos.x, viewPos.y );
    }
};
// extend Container
Kinetic.GlobalObject.extend(Kinetic.Stage, Kinetic.Container);
