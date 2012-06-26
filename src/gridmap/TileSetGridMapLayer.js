///////////////////////////////////////////////////////////////////////
//  GridMapLayer
///////////////////////////////////////////////////////////////////////
/**
 * GridMapLayer constructor
 * @constructor
 * @param {Object} config
 *
 * @config {Number}             x                   Starting grid x-position
 * @config {Number}             y                   Starting grid y-position
 * @config {Number}             width               Grid width
 * @config {Number}             height              Grid height
 * @config {Kinetic.TileSet}    tileSet             The tile set
 * @config {Number[]}           tiles               Array of tile IDs for each spot
 * @config {Function}           spotClass           The map spot container class. Must be Kinetic.TileMap.Spot or
 *                                                  a derivation of it.
 */
Kinetic.TileSetGridMapLayer = function( config ) {
    // Defaults
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.tileSet = new Kinetic.TileSet();
    this.tiles = null;

    // Initialize from the base class
    Kinetic.GridMapLayer.call(this, config);

    if( this.tiles == null )
        this.tiles = new Array( this.width * this.height );
};

/*
 *  Returns the grid bounds
 *  @returns {Kinetic.BoundsRect}
 */
Kinetic.TileSetGridMapLayer.prototype = {
    /*
     *  Draws the layer
     *
     *  @param  {CanvasContext}         drawCtx
     *  @param  {Kinetic.BoundsRect}    gridBounds
     *  @param  {Number}                spotWidth
     *  @param  {Number}                spotHeight
     */
    draw: function( drawCtx, gridBounds, spotWidth, spotHeight )
    {
        var tiles,
            tileIndexStart, posXStart,
            posX, posY,
            rowCurr, colCurr, tileIndex, tileCurr;

        if( this.tileSet == null )
            return;

        tiles = this.tiles;
        tileIndexStart = gridBounds.x + (gridBounds.y * this.width );
        posXStart = gridBounds.x * spotWidth;
        for( rowCurr = 0, posY = gridBounds.y * spotHeight; rowCurr < gridBounds.width; rowCurr++, posY += spotHeight )
        {
            for( colCurr = 0, tileIndex = tileIndexStart, posX = posXStart; colCurr < gridBounds.height; colCurr++, tileIndex++, posX += spotWidth )
            {
                tileCurr = this.tileSet.getTile( tiles[tileIndex] );
                if( tileCurr == null )
                    continue;

                this._drawTile( drawCtx, tileCurr, posX, posY, spotWidth, spotHeight );
            }

            tileIndexStart += this.width;
        }

    },
    /*
     *  Set the tile set
     *  @param    {Kinetic.TileSet} tileSet
     */
    setTileSet: function( tileSet )
    {
        var parent = this.getParent();
        this.tileSet = tileSet;

        if( parent != null )
            parent.invalidateBoundsLocal();
    },
    /*
     *  Returns the grid bounds overlap
     *  @returns    {Kinetic.BoundsRect}
     */
    getGridBounds: function()
    {
        return( new Kinetic.BoundsRect(this.x,this.y,this.width,this.height) );
    },
    /*
     *  Returns the grid bounds overlap
     *  @param      {Number}    spotWidth
     *  @param      {Number}    spotHeight
     *
     *  @returns    {Overlap}
     *
     *  @Overlap    {Number}    left
     *  @Overlap    {Number}    right
     *  @Overlap    {Number}    top
     *  @Overlap    {Number}    bottom
     */
    getOverlap: function(spotWidth, spotHeight)
    {
        var horzOverlap = 0,
            vertOverlap = 0,
            tileSizeMax;

        // Assumes that the tiles are drawn from the center out
        if( this.tileSet != null )
        {
            tileSizeMax = this.tileSet.getTileSizeMax();
            horzOverlap = Math.max(0, Math.ceil( (tileSizeMax.x - spotWidth) * 0.5 / spotWidth ) );
            vertOverlap = Math.max(0, Math.ceil( (tileSizeMax.y - spotHeight) * 0.5 / spotHeight ) );
        }

        return( {
            left: 0,
            right: horzOverlap,
            top: 0,
            bottom: vertOverlap
        } );
    },
    /*
     *  Draw a tile at the specified spot
     *  @param  {CanvasContext}         drawCtx
     *  @param  {Kinetic.TileInfo}      tile
     *  @param  {Number}                drawPosX
     *  @param  {Number}                drawPosY
     *  @param  {Number}                spotWidth
     *  @param  {Number}                spotHeight
     */
    _drawTile: function( drawCtx, tile, drawPosX, drawPosY, spotWidth, spotHeight )
    {
        var width = tile.width,
            height = tile.height;

        drawPosX += Math.round( (spotWidth - width) * 0.5 );
        drawPosY += Math.round( (spotHeight - height) * 0.5 );
        drawCtx.drawImage( tile.image, tile.offsetX, tile.offsetY, width, height, drawPosX, drawPosY, width, height );
    }
};
// extend GridMapLayer
Kinetic.GlobalObject.extend(Kinetic.TileSetGridMapLayer, Kinetic.GridMapLayer);
