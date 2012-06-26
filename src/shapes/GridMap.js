///////////////////////////////////////////////////////////////////////
//  GridMap
///////////////////////////////////////////////////////////////////////
/**
 * GridContainer constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 *
 * @config {Number}             spotWidth           Grid spot width
 * @config {Number}             spotHeight          Grid spot height
 * @config {Number}             x                   Draw x-position
 * @config {Number}             y                   Draw y-position
 */
Kinetic.GridMap = function( config ) {
    // defaults
    this.spotWidth = 0;
    this.spotHeight = 0;
    this.x = 0;
    this.y = 0;

    config.drawFunc = this._customDraw;

    // call super constructor
    Kinetic.Shape.call(this, config);

    // Local members
    this._layers = [];
    this._layerMap = {};
    this._gridBounds = new Kinetic.BoundsRect( 0, 0, 0, 0);
    this._bounds = new Kinetic.BoundsRect( 0, 0, this.gridColumns * this.spotWidth, this.gridRows * this.spotHeight );
    this._overlap = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };
};

Kinetic.GridMap.prototype = {
    /*
     *  Adds a layer into the grid map
     *  @param {Kinetic.GridMapLayer}    layer
     */
    add: function( layer ) {
        var layerParent = layer.getParent();
        if( layerParent !== undefined )
            layerParent.remove( layer );

        this._insertIntoList( layer );
        layer.setParent( this );
        this.invalidateBoundsLocal();
    },
    /*
     *  Remove a layer from the grid map
     *  @param {Kinetic.GridMapLayer}    layer
     */
    remove: function( layer ) {
        var layers = this._layers,
            layerIndex = layers.indexOf( layer );

        if( layerIndex >= 0 )
        {
            layers.splice( layerIndex, 1 );
            layer.setParent( undefined );

            delete this._layerMap[ layer.id ];
            if( layer.name != null && this._layerMap[ layer.name ] === layer )
                delete this._layerMap[ layer.name ];

            this.invalidateBoundsLocal();
        }
    },
    /*
     *  Returns the specified layer. null otherwise
     *  @param  {String|Number}        id
     *
     *  @returns {Kinetic.GridMapLayer}
     */
    getLayer: function( id ) {
        if( this._layerMap.hasOwnProperty(id) )
            return( this._layerMap[id] );

        return( null );
    },
    /*
     *  Converts a local position to grid position
     *  @param {Number}    posX
     *  @param {Number}    posY
     *
     *  @returns {TilePos} gridPos
     *
     *  @TilePos {Number} x
     *  @TilePos {Number} y
     */
    localPosToGridPos: function( posX, posY ) {
        var gridPos =
        {
            x: Math.floor( posX / this.spotWidth ),
            y: Math.floor( posY / this.spotHeight )
        };

        return( gridPos );
    },
    /**
     * invalidates the local bounds
     */
    invalidateBoundsLocal: function()
    {
        Kinetic.Shape.prototype.invalidateBoundsLocal.apply( this );
        this._gridBounds = null;
        this._bounds = null;
        this._overlap = null;
    },
    /*
     *  Returns the grid bounds
     *  @returns {Kinetic.BoundsRect}
     */
    getGridBounds: function() {
        if( this._gridBounds === null )
        {
            var layers = this._layers,
                layersNum = layers.length,
                index,
                overlap;

            if( layersNum === 0 )
            {
                this._gridBounds = new Kinetic.BoundsRect( 0, 0, 0, 0);
            }
            else
            {
                this._gridBounds = layers[0].getGridBounds();
                for( index = 1; index < layersNum; index++ )
                    this._gridBounds.encloseRect( layers[index].getGridBounds() );

                // Take into account the overlap...
                overlap = this.getOverlap();
                this._gridBounds.x -= overlap.left;
                this._gridBounds.y -= overlap.top;
                this._gridBounds.width += overlap.left + overlap.right;
                this._gridBounds.height += overlap.top + overlap.bottom;
            }
        }

        return( this._gridBounds.clone() );
    },
    /*
     *  Returns the grid bounds overlap
     *  @returns    {Overlap}
     *
     *  @Overlap    {Number}    left
     *  @Overlap    {Number}    right
     *  @Overlap    {Number}    top
     *  @Overlap    {Number}    bottom
     */
    getOverlap: function()
    {
        if( this._overlap == null )
        {
            var layers = this._layers,
                layersNum = layers.length,
                index, layerOverlap;

            this._overlap = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            };

            for( index = 0; index < layersNum; index++ )
            {
                layerOverlap = layers[ index ].getOverlap( this.spotWidth, this.spotHeight );
                this._overlap.left = Math.max( this._overlap.left, layerOverlap.left );
                this._overlap.right = Math.max( this._overlap.right, layerOverlap.right );
                this._overlap.top = Math.max( this._overlap.top, layerOverlap.top );
                this._overlap.bottom = Math.max( this._overlap.bottom, layerOverlap.bottom );
            }
        }

        return( this._overlap );
    },
    /**
     * Add the layer to the layer list
     */
    _insertIntoList: function( layer ) {
        var layers = this._layers,
            layersNum =  layers.length,
            indexLow = 0,
            indexHigh = layersNum,
            indexInsert,
            compareResult;

        this._layerMap[ layer.id ] = layer;
        if( layer.name != null )
            this._layerMap[ layer.name ] = layer;

        if( layersNum <= 0 )
        {
            layers.push( layer );
            return;
        }

        do
        {
            indexInsert = Math.floor( (indexLow + indexHigh) * 0.5 );
            compareResult = layer.depth - layers[indexInsert].depth;

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
        if( indexInsert <= 0 )
        {
            layers.unshift( layer );
            return;
        }

        if( indexInsert >= layersNum )
        {
            layers.push( layer );
            return;
        }

        layers.splice( indexInsert, 0, layer );
    },

    /*
    *  Custom draw
    *  @param {Boolean}    isForDetection
    */
    _customDraw: function( isForDetection ) {
        var layers = this._layers,
            layersNum = layers.length,
            canvas, drawCtx,
            mapBounds,
            transform,
            spotWidth, spotHeight,
            viewportBounds,
            viewportLocalTopLeft,
            viewportLocalBottomRight,
            overlap,
            spotStartX, spotStartY,
            spotStopX, spotStopY,
            drawGridBounds,
            layerIndex, layerCurr, layerGridBounds;

        drawCtx = this.getContext();

        if( isForDetection )
        {
            mapBounds = this._bounds;
            drawCtx.beginPath();
            drawCtx.rect( mapBounds.x, mapBounds.y, mapBounds.width, mapBounds.height );
            drawCtx.closePath();
            return;
        }

        // No layers to draw? We're done...
        if( layersNum === 0 )
            return;

        // Get the canvas extents in local space...
        canvas = this.getContext();
        transform = this.getTransformView();
        transform.invert();
        viewportBounds = new Kinetic.BoundsRect( 0, 0, canvas.width, canvas.height );
        viewportBounds.transform( transform );
        viewportLocalTopLeft = { x: viewportBounds.x, y: viewportBounds.y };
        viewportLocalBottomRight  = { x: viewportBounds.getRight(), y: viewportBounds.getBottom() };

        spotWidth = this.spotWidth;
        spotHeight = this.spotHeight;

        // Convert the canvas draw extents into grid coordinates
        overlap = this.getOverlap();
        spotStartX = Math.floor(viewportLocalTopLeft.x /  spotWidth) - overlap.left;
        spotStartY = Math.floor(viewportLocalTopLeft.y /  spotHeight) - overlap.top;
        spotStopX = Math.floor(viewportLocalBottomRight.x /  spotWidth) + overlap.right;
        spotStopY = Math.floor(viewportLocalBottomRight.y /  spotHeight) + overlap.bottom;
        drawGridBounds = Kinetic.BoundsRect.fromBounds(spotStartX, spotStartY, spotStopX, spotStopY);

        if( !this.getGridBounds().overlaps( drawGridBounds ) )
            return;

        for( layerIndex = 0; layerIndex < layersNum; layerIndex++ )
        {
            layerCurr = layers[layerIndex];
            if( !layerCurr.isVisible() )
                continue;

            layerGridBounds = drawGridBounds.getOverlapRect( layerCurr.getGridBounds() );
            if( layerGridBounds !== null )
                layerCurr.draw( drawCtx, layerGridBounds, this.spotWidth, this.spotHeight );
        }
    },

    /**
     * calculates the untransformed local bounds for the node
     * @returns {Kinetic.BoundsRect}
     */
    _calcNodeBoundsLocalUntransformed: function() {
        if( this._bounds == null )
        {
            var gridBounds = this.getGridBounds();
            this._bounds = new Kinetic.BoundsRect( gridBounds.x * this.spotWidth, gridBounds.y * this.spotHeight, gridBounds.width * this.spotWidth, gridBounds.height * this.spotHeight );
        }

        return( this.bounds );
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.GridMap, Kinetic.Shape);
