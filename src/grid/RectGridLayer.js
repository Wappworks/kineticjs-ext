///////////////////////////////////////////////////////////////////////
//  RectGridLayer
///////////////////////////////////////////////////////////////////////
/**
 * RectGridLayer constructor
 * @constructor
 * @param {Object} config
 *
 * @config {Number}             x                   Starting grid x-position
 * @config {Number}             y                   Starting grid y-position
 * @config {Number}             width               Grid width
 * @config {Number}             height              Grid height
 * @config {String}             fill                The fill style
 * @config {String}             stroke              The stroke style
 * @config {Number}             strokeWidth         The stroke width
 * @config {Number}             tiles               The grid fill status (0 - unfilled, anything else - filled)
 */
Kinetic.RectGridLayer = function( config ) {
    var index, length;

    // Defaults
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.fill = undefined;
    this.stroke = undefined;
    this.strokeWidth = undefined;

    // Initialize from the base class
    Kinetic.GridLayer.call(this, config);

    if( this.tiles == null ) {
        this.tiles = new Array( this.width * this.height );
        for( index = 0, length = this.tiles.length; index < length; index++ )
            this.tiles[ index ] = 0;
    }
};

Kinetic.RectGridLayer.prototype = {
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
            rowCurr, colCurr, tileIndex;

        // If both the stroke and fill are undefined, there's nothign to draw...
        if( this.stroke == null && this.fill == null )
            return;

        tiles = this.tiles;
        tileIndexStart = this._tilePosToIndex( gridBounds.x, gridBounds.y );
        posXStart = gridBounds.x * spotWidth;

        drawCtx.beginPath();
        for( rowCurr = 0, posY = gridBounds.y * spotHeight; rowCurr < gridBounds.height; rowCurr++, posY += spotHeight )
        {
            for( colCurr = 0, tileIndex = tileIndexStart, posX = posXStart; colCurr < gridBounds.width; colCurr++, tileIndex++, posX += spotWidth )
            {
                if( tiles[ tileIndex ] === 0 )
                    continue;

                drawCtx.rect( posX, posY, spotWidth, spotHeight );
            }

            tileIndexStart += this.width;
        }
        drawCtx.closePath();

        // Do the actual filling and line drawing...
        if(this.fill != null) {
            drawCtx.fillStyle = this.fill;
            drawCtx.fill();
        }
        if(this.stroke != null) {
            drawCtx.lineWidth = this.strokeWidth == null ? 1 : this.strokeWidth;
            drawCtx.strokeStyle = this.stroke;
            drawCtx.stroke();
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
     *  Returns the grid bounds overlap
     *  @returns    {Kinetic.BoundsRect}
     */
    getGridBounds: function() {
        return( new Kinetic.BoundsRect(this.x,this.y,this.width,this.height) );
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
Kinetic.GlobalObject.extend(Kinetic.RectGridLayer, Kinetic.GridLayer);
