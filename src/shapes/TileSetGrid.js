///////////////////////////////////////////////////////////////////////
//  Tile set grid
///////////////////////////////////////////////////////////////////////
/**
 * Tilemap constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 *
 * @config {Number}             gridColumns         Number of grid columns
 * @config {Number}             gridRows            Number of grid rows
 * @config {Kinetic.TileSet}    tileSet             The tile set
 * @config {Number[]}           tiles               Array of tile IDs for each spot
 */
Kinetic.TileSetGrid = function( config ) {
    // defaults
    this.gridColumns = 0;
    this.gridRows = 0;
    this.tileSet = undefined;
    this.tiles = undefined;

    // call super constructor
    Kinetic.Grid.call(this, config);

    // Create the tile set layer...
    this._tileSetLayer = new Kinetic.TileSetGridLayer({
        width: this.gridColumns,
        height: this.gridRows,
        tileSet: this.tileSet,
        tiles: this.tiles
    });
    this.add( this._tileSetLayer );

    // Clear the unnecessary fields...
    delete this.gridColumns;
    delete this.gridRows;
    delete this.tileSet;
    delete this.tiles;
};

Kinetic.TileSetGrid.prototype = {
    /*
     *  Returns the tile assigned to a grid coordinate
     *  @param {Number}    gridX
     *  @param {Number}    gridY
     *
     *  @returns {Numbers}
     */
    getTileByGridPos: function( gridX, gridY ) {
        return( this._tileSetLayer.getTile( gridX, gridY ) );
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.TileSetGrid, Kinetic.Grid);