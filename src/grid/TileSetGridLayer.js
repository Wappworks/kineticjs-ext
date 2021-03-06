///////////////////////////////////////////////////////////////////////
//  TileSetGridLayer
///////////////////////////////////////////////////////////////////////
/**
 * TileSetGridLayer constructor
 * @constructor
 * @param {Object} config
 *
 * @config {Number}             x                   Starting grid x-position
 * @config {Number}             y                   Starting grid y-position
 * @config {Number}             width               Grid width
 * @config {Number}             height              Grid height
 * @config {Kinetic.TileSet}    tileSet             The tile set
 * @config {Number[]}           tiles               Array of tile IDs for each spot
 */
Kinetic.TileSetGridLayer = function( config ) {
    // Defaults
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.tileSet = new Kinetic.TileSet();
    this.tiles = null;

    // Initialize from the base class
    Kinetic.GridLayer.call(this, config);

    if( this.tiles == null )
        this.tiles = new Array( this.width * this.height );
};

Kinetic.TileSetGridLayer.prototype = {
    /*
     *  Draws the layer
     *
     *  @param  {CanvasContext}         drawCtx
     *  @param  {Kinetic.BoundsRect}    gridBounds
     *  @param  {Number}                spotWidth
     *  @param  {Number}                spotHeight
     */
    draw: function( drawCtx, gridBounds, spotWidth, spotHeight ) {
        var tiles,
            tileIndexStart, posXStart,
            posX, posY,
            rowCurr, colCurr, tileIndex, tileCurr;

        if( this.tileSet == null )
            return;

        tiles = this.tiles;
        tileIndexStart = this._tilePosToIndex( gridBounds.x, gridBounds.y );
        posXStart = gridBounds.x * spotWidth;
        for( rowCurr = 0, posY = gridBounds.y * spotHeight; rowCurr < gridBounds.height; rowCurr++, posY += spotHeight )
        {
            for( colCurr = 0, tileIndex = tileIndexStart, posX = posXStart; colCurr < gridBounds.width; colCurr++, tileIndex++, posX += spotWidth )
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
     *  Sets the tile at the specified tile position.
     *  @param    {Number}  tile
     *  @param    {Number}  x
     *  @param    {Number}  y
     */
    setTile: function( tile, x, y ) {
        var tileIndex = this._tilePosToIndex( x, y );
        if( tileIndex === undefined )
            return;

        this.tiles[ tileIndex] = tile;
    },
    /*
     *  Returns the tile at the specified tile position. May return null for unassigned tile locations...
     *  @param    {Number}  x
     *  @param    {Number}  y
     *
     *  @returns    {Number}
     */
    getTile: function( x, y ) {
        var tileIndex = this._tilePosToIndex( x, y );
        if( tileIndex === undefined )
            return( null );

        return( this.tiles[ tileIndex] );
    },
    /*
     *  Set the tile set
     *  @param    {Kinetic.TileSet} tileSet
     */
    setTileSet: function( tileSet ) {
        this.tileSet = tileSet;
    },
    /*
     *  Returns the grid bounds overlap
     *  @returns    {Kinetic.BoundsRect}
     */
    getGridBounds: function() {
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
    getOverlap: function(spotWidth, spotHeight) {
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
    _drawTile: function( drawCtx, tile, drawPosX, drawPosY, spotWidth, spotHeight ) {
        var width = tile.width,
            height = tile.height;

        drawPosX += Math.round( (spotWidth - width) * 0.5 );
        drawPosY += Math.round( (spotHeight - height) * 0.5 );
        drawCtx.drawImage( tile.image, tile.offsetX, tile.offsetY, width, height, drawPosX, drawPosY, width, height );
    },

    /*
     *  Get the tile index. Returns undefined if it's undefined...
     *  @param    {Number}  x
     *  @param    {Number}  y
     *
     *  @returns    {Number}
     */
    _tilePosToIndex: function( x, y ) {
        x -= this.x;
        y -= this.y;

        if( x < 0 || x >= this.width || y < 0 || y >= this.height )
            return undefined;

        return( x + (y * this.width) );
    }
};
// extend GridLayer
Kinetic.GlobalObject.extend(Kinetic.TileSetGridLayer, Kinetic.GridLayer);
