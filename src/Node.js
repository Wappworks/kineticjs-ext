///////////////////////////////////////////////////////////////////////
//  Node
///////////////////////////////////////////////////////////////////////
/**
 * Node constructor.&nbsp; Nodes are entities that can move around
 * and have events bound to them.  They are the building blocks of a KineticJS
 * application
 * @constructor
 * @param {Object} config
 */
Kinetic.Node = function(config) {
    this.visible = true;
    this.isListening = true;
    this.name = undefined;
    this.alpha = 1;
    this.x = 0;
    this.y = 0;
    this.scale = {
        x: 1,
        y: 1
    };
    this.rotation = 0;
    this.centerOffset = {
        x: 0,
        y: 0
    };
    this.eventListeners = {};
    this.dragConstraint = 'none';
    this.dragBounds = {};
    this._draggable = false;
    this._boundsNoTranslation = null;

    // set properties from config
    if(config) {
        for(var key in config) {
            if( !config.hasOwnProperty(key) )
                continue;
            // handle special keys
            switch (key) {
                case 'draggable':
                    this.draggable(config[key]);
                    break;
                case 'listen':
                    this.listen(config[key]);
                    break;
                case 'rotationDeg':
                    this.rotation = config[key] * Math.PI / 180;
                    break;
                default:
                    this[key] = config[key];
                    break;
            }
        }
    }

    // overrides
    if(this.centerOffset.x === undefined) {
        this.centerOffset.x = 0;
    }
    if(this.centerOffset.y === undefined) {
        this.centerOffset.y = 0;
    }
};
/*
 * Node methods
 */
Kinetic.Node.prototype = {
    /**
     * bind events to the node.  KineticJS supports mouseover, mousemove,
     * mouseout, mousedown, mouseup, click, dblclick, touchstart, touchmove,
     * touchend, dbltap, dragstart, dragmove, and dragend.  Pass in a string
     * of event types delimmited by a space to bind multiple events at once
     * such as 'mousedown mouseup mousemove'. include a namespace to bind an
     * event by name such as 'click.foobar'.
     * @param {String} typesStr
     * @param {function} handler
     */
    on: function(typesStr, handler) {
        var types = typesStr.split(' ');
        /*
         * loop through types and attach event listeners to
         * each one.  eg. 'click mouseover.namespace mouseout'
         * will create three event bindings
         */
        for(var n = 0; n < types.length; n++) {
            var type = types[n];
            var event = (type.indexOf('touch') === -1) ? 'on' + type : type;
            var parts = event.split('.');
            var baseEvent = parts[0];
            var name = parts.length > 1 ? parts[1] : '';

            if(!this.eventListeners[baseEvent]) {
                this.eventListeners[baseEvent] = [];
            }

            this.eventListeners[baseEvent].push({
                name: name,
                handler: handler
            });
        }
    },
    /**
     * remove event bindings from the node.  Pass in a string of
     * event types delimmited by a space to remove multiple event
     * bindings at once such as 'mousedown mouseup mousemove'.
     * include a namespace to remove an event binding by name
     * such as 'click.foobar'.
     * @param {String} typesStr
     * @param {function} [handler]
     */
    off: function(typesStr, handler) {
        var types = typesStr.split(' ');

        for(var n = 0; n < types.length; n++) {
            var type = types[n];
            var event = (type.indexOf('touch') === -1) ? 'on' + type : type;
            var parts = event.split('.');
            var baseEvent = parts[0];
            var i;
            var name = undefined;

            if( handler === undefined ) {
                // Remove all belonging to the event name...
                if(this.eventListeners[baseEvent] && parts.length > 1) {
                    name = parts[1];

                    for(i = 0; i < this.eventListeners[baseEvent].length; i++) {
                        if(this.eventListeners[baseEvent][i].name === name) {
                            this.eventListeners[baseEvent].splice(i, 1);
                            if(this.eventListeners[baseEvent].length === 0) {
                                this.eventListeners[baseEvent] = undefined;
                            }
                            break;
                        }
                    }
                } else {
                    this.eventListeners[baseEvent] = undefined;
                }
            } else {
                // Remove the specific handler...
                if(this.eventListeners[baseEvent] && parts.length > 1) {
                    name = parts[1];
                }

                for(i = 0; i < this.eventListeners[baseEvent].length; i++) {

                    if( this.eventListeners[baseEvent][i].handler === handler ) {
                        if( name !== undefined && this.eventListeners[baseEvent][i].name !== name ) {
                            continue;
                        }

                        this.eventListeners[baseEvent].splice(i, 1);
                        break;
                    }
                }
            }
        }
    },
    /**
     * show node
     */
    show: function() {
        this.visible = true;
    },
    /**
     * hide node
     */
    hide: function() {
        this.visible = false;
    },
    /**
     * Determines if it's visible
     */
    isVisible: function() {
        return( this.visible );
    },
    /**
     * get zIndex
     */
    getZIndex: function() {
        return this.index;
    },
    /**
     * set node scale.  If only one parameter is passed in,
     * then both scaleX and scaleY are set with that parameter
     * @param {Number} scaleX
     * @param {Number} scaleY
     */
    setScale: function(scaleX, scaleY) {
        if(scaleY) {
            this.scale.x = scaleX;
            this.scale.y = scaleY;
        } else {
            this.scale.x = scaleX;
            this.scale.y = scaleX;
        }
        this._boundsNoTranslation = null;
    },
    /**
     * get scale
     */
    getScale: function() {
        return this.scale;
    },
    /**
     * set node position
     * @param {Number} x
     * @param {Number} y
     */
    setPosition: function(x, y) {
        this.x = x;
        this.y = y;
    },
    /**
     * get node position relative to container
     */
    getPosition: function() {
        return {
            x: this.x,
            y: this.y
        };
    },
    /**
     * get absolute position relative to stage
     */
    getAbsolutePosition: function() {
        var x = this.x;
        var y = this.y;
        var parent = this.getParent();
        while(parent.className !== 'Stage') {
            x += parent.x;
            y += parent.y;
            parent = parent.parent;
        }
        return {
            x: x,
            y: y
        };
    },
    /**
     * move node by an amount
     * @param {Number} x
     * @param {Number} y
     */
    move: function(x, y) {
        this.x += x;
        this.y += y;
    },
    /**
     * set node rotation in radians
     * @param {Number} theta
     */
    setRotation: function(theta) {
        this.rotation = theta;
        this._boundsNoTranslation = null;
    },
    /**
     * set node rotation in degrees
     * @param {Number} deg
     */
    setRotationDeg: function(deg) {
        this.rotation = (deg * Math.PI / 180);
        this._boundsNoTranslation = null;
    },
    /**
     * get rotation in radians
     */
    getRotation: function() {
        return this.rotation;
    },
    /**
     * get rotation in degrees
     */
    getRotationDeg: function() {
        return this.rotation * 180 / Math.PI;
    },
    /**
     * rotate node by an amount in radians
     * @param {Number} theta
     */
    rotate: function(theta) {
        this.rotation += theta;
        this._boundsNoTranslation = null;
    },
    /**
     * rotate node by an amount in degrees
     * @param {Number} deg
     */
    rotateDeg: function(deg) {
        this.rotation += (deg * Math.PI / 180);
        this._boundsNoTranslation = null;
    },
    /**
     * get the transform from local to view
     * @returns {Kinetic.Transform}
     */
    getTransformView: function()
    {
        var transform = new Kinetic.Transform();
        this._applyTransform( transform );

        return( transform );
    },
    /**
     * get the local transform
     * @returns {Kinetic.Transform}
     */
    getTransformLocal: function()
    {
        var transform = new Kinetic.Transform();

        // Transformations are applied right to left (i.e. last transform is applied first)...
        if (this.x !== 0 || this.y !== 0) {
            transform.translate(this.x, this.y);
        }
        if (this.scale.x !== 1 || this.scale.y !== 1) {
            transform.scale(this.scale.x, this.scale.y);
        }
        if (this.rotation !== 0) {
            transform.rotate(this.rotation);
        }
        if (this.centerOffset.x !== 0 || this.centerOffset.y !== 0) {
            transform.translate(-1 * this.centerOffset.x, -1 * this.centerOffset.y);
        }

        return( transform );
    },
    /**
     * get the local bounds
     * @returns {Kinetic.BoundsRect}
     */
    getBoundsLocal: function()
    {
        if( this._boundsNoTranslation === null ) {
            var prevX = this.x;
            var prevY = this.y;
            this.x = 0;
            this.y = 0;
            var transform = this.getTransformLocal();
            this.x = prevX;
            this.y = prevY;

            // Optimization - the local bounds includes all aspects of the transformation except for the translation
            // under the assumption that translating will be the most common operation...
            this._boundsNoTranslation = this._getNodeBoundsUntransformed().transform( transform );
        }

        var bounds = this._boundsNoTranslation.clone();
        bounds.x += this.x;
        bounds.y += this.y;
        return( bounds );
    },
    /**
     * invalidates the local bounds
     */
    invalidateBoundsLocal: function()
    {
        this._boundsNoTranslation = null;
    },
    /**
     * listen or don't listen to events
     * @param {Boolean} isListening
     */
    listen: function(isListening) {
        this.isListening = isListening;
    },
    /**
     * move node to top
     */
    moveToTop: function() {
        var index = this.index;

        // Already at the top? We're done...
        if( index >= (this.parent.children.length-1) )
            return;

        this.parent.children.splice(index, 1);
        this.parent.children.push(this);
        this.parent._setChildrenIndices();
    },
    /**
     * move node up
     */
    moveUp: function() {
        var index = this.index;
        if( index < (this.parent.children.length - 1) ) {
            this.parent.children.splice(index, 1);
            this.parent.children.splice(index + 1, 0, this);
            this.parent._setChildrenIndices();
        }
    },
    /**
     * move node down
     */
    moveDown: function() {
        var index = this.index;
        if(index > 0) {
            this.parent.children.splice(index, 1);
            this.parent.children.splice(index - 1, 0, this);
            this.parent._setChildrenIndices();
        }
    },
    /**
     * move node to bottom
     */
    moveToBottom: function() {
        var index = this.index;

        // Already at the bottom? We're done...
        if( index <= 0 )
            return;

        this.parent.children.splice(index, 1);
        this.parent.children.unshift(this);
        this.parent._setChildrenIndices();
    },
    /**
     * set zIndex
     * @param {int} zIndex
     */
    setZIndex: function(zIndex) {
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.splice(zIndex, 0, this);
        this.parent._setChildrenIndices();
    },
    /**
     * set alpha.  Alpha values range from 0 to 1.
     * A node with an alpha of 0 is fully transparent, and a node
     * with an alpha of 1 is fully opaque
     * @param {Object} alpha
     */
    setAlpha: function(alpha) {
        this.alpha = alpha;
    },
    /**
     * get alpha.  Alpha values range from 0 to 1.
     * A node with an alpha of 0 is fully transparent, and a node
     * with an alpha of 1 is fully opaque
     */
    getAlpha: function() {
        return this.alpha;
    },
    /**
     * get absolute alpha
     */
    getAbsoluteAlpha: function() {
        var absAlpha = 1;
        var node = this;
        // traverse upwards
        while(node.className !== 'Stage') {
            absAlpha *= node.alpha;
            node = node.parent;
        }
        return absAlpha;
    },
    /**
     * enable or disable drag and drop
     * @param {Boolean} isDraggable
     */
    draggable: function(isDraggable) {
        if(this.draggable !== isDraggable) {
            if(isDraggable) {
                this._initDrag();
            }
            else {
                this._dragCleanup();
            }
            this._draggable = isDraggable;
        }
    },
    /**
     * determine if node is currently in drag and drop mode
     */
    isDragging: function() {
        var go = Kinetic.GlobalObject;
        return go.drag.node !== undefined && go.drag.node.id === this.id && go.drag.moving;
    },
    /**
     * move node to another container
     * @param {Kinetic.Container} newContainer
     */
    moveTo: function(newContainer) {
        var parent = this.parent;
        // remove from parent's children
        parent.children.splice(this.index, 1);
        parent._setChildrenIndices();

        // add to new parent
        newContainer.children.push(this);
        this.index = newContainer.children.length - 1;
        this.parent = newContainer;
        newContainer._setChildrenIndices();

        // update children hashes
        if(this.name) {
            parent.childrenNames[this.name] = undefined;
            newContainer.childrenNames[this.name] = this;
        }
    },
    /**
     * get parent container
     */
    getParent: function() {
        return this.parent;
    },
    /**
     * get layer associated to node
     */
    getLayer: function() {
        if(this.className === 'Layer') {
            return this;
        }

        var parent = this.getParent();
        if( parent != null ) {
            return parent.getLayer();
        }

        return undefined;
    },
    /**
     * get stage associated to node
     */
    getStage: function() {
        if(this.className === 'Stage') {
            return this;
        }
        
        var parent = this.getParent();
        if( parent == null )
            return null;

        return parent.getStage();
    },
    /**
     * get name
     */
    getName: function() {
        return this.name;
    },
    /**
     * set center offset
     * @param {Number} x
     * @param {Number} y
     */
    setCenterOffset: function(x, y) {
        this.centerOffset.x = x;
        this.centerOffset.y = y;
        this._boundsNoTranslation = null;
    },
    /**
     * set center offset by alignment
     * @param {String}  hAlign      Horiontal alignment to use for the center offset calculation (left,right,center).
     *                              Use null to ignore.
     * @param {String}  vAlign      Vertical alignment to use for the center offset calculation (top, bottom, middle).
     *                              Use null to ignore.
     */
    setCenterOffsetByAlign: function(hAlign, vAlign) {
        var localBounds = this._getNodeBoundsUntransformed();

        switch( hAlign )
        {
            case "left":
                this.centerOffset.x = localBounds.x;
                break;

            case "right":
                this.centerOffset.x = localBounds.getRight();
                break;

            case "center":
                this.centerOffset.x = localBounds.x + (localBounds.width * 0.5);
                break;

            default:
                break;
        }

        switch( vAlign )
        {
            case "top":
                this.centerOffset.y = localBounds.y;
                break;

            case "bottom":
                this.centerOffset.y = localBounds.getBottom();
                break;

            case "middle":
                this.centerOffset.y = localBounds.y + (localBounds.height * 0.5);
                break;

            default:
                break;
        }

        this._boundsNoTranslation = null;
    },
    /**
     * get center offset
     */
    getCenterOffset: function() {
        return this.centerOffset;
    },
    /**
     * mark for redraw
     */
    markForRedraw: function() {
        var layer = this.getLayer();
        if( layer != null )
            layer.markForRedraw();
    },
    /**
     * set drag constraint
     * @param {String} constraint
     */
    setDragConstraint: function(constraint) {
        this.dragConstraint = constraint;
    },
    /**
     * get drag constraint
     */
    getDragConstraint: function() {
        return this.dragConstraint;
    },
    /**
     * set drag bounds
     * @param {Object} bounds
     * @config {Number} [left] left bounds position
     * @config {Number} [top] top bounds position
     * @config {Number} [right] right bounds position
     * @config {Number} [bottom] bottom bounds position
     */
    setDragBounds: function(bounds) {
        this.dragBounds = bounds;
    },
    /**
     * get drag bounds
     */
    getDragBounds: function() {
        return this.dragBounds;
    },
    /**
     * called when dragging starts
     * @param {Object} dragPos
     * @param {Object} customObj
     *
     * @dragPos {Number} x
     * @dragPos {Number} y
     */
    onDragStart: function( dragPos, customObj ) {
        customObj.offset = { x:dragPos.x - this.x, y:dragPos.y - this.y };
    },
    /**
     * called when there is a drag update
     * @param {Object} dragPos
     * @param {Object} customObj
     *
     * @dragPos {Number} x
     * @dragPos {Number} y
     */
    onDragUpdate: function( dragPos, customObj ) {
        var ds = this.dragConstraint;
        var db = this.dragBounds;
        if(ds === 'none' || ds === 'horizontal') {
            var newX = dragPos.x - customObj.offset.x;
            if((db.left === undefined || db.left < newX) && (db.right === undefined || db.right > newX)) {
                this.x = newX;
            }
        }
        if(ds === 'none' || ds === 'vertical') {
            var newY = dragPos.y - customObj.offset.y;
            if((db.top === undefined || db.top < newY) && (db.bottom === undefined || db.bottom > newY)) {
                this.y = newY;
            }
        }
        this.markForRedraw();
    },
    /**
     * called when the dragging stops
     */
    onDragStop: function() {
    },
    /**
     * initialize drag and drop
     */
    _initDrag: function() {
        var go = Kinetic.GlobalObject;
        var that = this;
        this.on('mousedown.initdrag touchstart.initdrag', function(evt) {
            var stage = that.getStage();
            var pos = stage.getUserPosition();

            if(pos) {
                go.drag.node = that;
                go.drag.inputStartEvent = evt;
                go.drag.userPosStart = pos;
            }
        });
    },
    /**
     * remove drag and drop event listener
     */
    _dragCleanup: function() {
        this.off('mousedown.initdrag');
        this.off('touchstart.initdrag');
    },
    /**
     * handle node events
     * @param {String} eventType
     * @param {Event} evt
     */
    _handleEvents: function(eventType, evt) {
        var stage = this.getStage();
        this._handleEvent(this, stage.mouseoverShape, stage.mouseoutShape, eventType, evt);
    },
    /**
     * handle node event
     */
    _handleEvent: function(node, mouseoverNode, mouseoutNode, eventType, evt) {
        var el = node.eventListeners;
        var okayToRun = true;

        /*
         * determine if event handler should be skipped by comparing
         * parent nodes
         */
        if(eventType === 'onmouseover' && mouseoutNode && mouseoutNode.id === node.id) {
            okayToRun = false;
        }
        else if(eventType === 'onmouseout' && mouseoverNode && mouseoverNode.id === node.id) {
            okayToRun = false;
        }

        if(el[eventType] && okayToRun) {
            var events = el[eventType];
            for(var i = 0; i < events.length; i++) {
                events[i].handler.apply(node, [evt]);
            }
        }

        var mouseoverParent = mouseoverNode ? mouseoverNode.parent : undefined;
        var mouseoutParent = mouseoutNode ? mouseoutNode.parent : undefined;

        // simulate event bubbling
        if(!evt.cancelBubble && node.parent.className !== 'Stage') {
            this._handleEvent(node.parent, mouseoverParent, mouseoutParent, eventType, evt);
        }
    },
    /**
     * return the untransformed node bounds
     * @returns {Kinetic.BoundsRect}
     */
    _getNodeBoundsUntransformed: function()
    {
        return( new Kinetic.BoundsRect( 0, 0, 0, 0 ) );
    },
    /**
     * Calculate the transform
     * @param {CanvasContext|Kinetic.Transform} transform
     */
    _applyTransform: function( transform ) {
        var family = [];
        var stage = null;
        family.unshift(this);
        var parent = this.parent;
        while (parent !== null) {
            if( parent.className !== "Stage" ) {
                family.unshift(parent);
                parent = parent.parent;
            } else {
                // When we reach the stage, we stop...
                stage = parent;
                break;
            }
        }

        if(stage) {
            var stageViewPos = stage.appliedViewPos;
            if( stageViewPos !== null ) {
                transform.translate( -stageViewPos.x, -stageViewPos.y );
            }

            var stageScale = stage.appliedViewScale;
            if( stageScale !== null ) {
                transform.scale(stageScale.x, stageScale.y);
            }
        }

        // apply children transforms
        for (var n = 0; n < family.length; n++) {
            var obj = family[n];

            // Transformations are applied right to left (i.e. last transform is applied first)...
            if (obj.x !== 0 || obj.y !== 0) {
                transform.translate(obj.x, obj.y);
            }
            if (obj.scale.x !== 1 || obj.scale.y !== 1) {
                transform.scale(obj.scale.x, obj.scale.y);
            }
            if (obj.rotation !== 0) {
                transform.rotate(obj.rotation);
            }
            if (obj.centerOffset.x !== 0 || obj.centerOffset.y !== 0) {
                transform.translate(-obj.centerOffset.x, -obj.centerOffset.y);
            }
        }

        return( transform );
    }
};
