///////////////////////////////////////////////////////////////////////
//  Tile set
///////////////////////////////////////////////////////////////////////
/**
 * Tileset constructor
 *
 * NOTE: The tileset configuration information is compatible with Tiled tileset definition
 * @constructor
 * @param {Object|Object[]}  [config]       Tile configuration(S). See addSpriteSheet() and addTileAtlas() for the
 *                                          configuration definition
 */
Kinetic.TileSet = function( config ) {
    this.images = new Array();
    this.tiles = new Object();
    this.tileWidthMax = 0;
    this.tileHeightMax = 0;

    if( config !== undefined )
    {
        if( config instanceof Array ) {
            this.addTileConfigs( config );
        } else if( this.isTileSheetConfig(config) ) {
            this.addTileSheet( config );
        } else {
            this.addTileAtlas( config );
        }
    }
};

Kinetic.TileSet.prototype = {

    /*
     * Adds multiple tile configurations to the tile set
     * @param {Object[]} config         See addTileSheet() and addTileAtlas() for the configuration definition
     */
    addTileConfigs: function( config ) {
        var spriteSheetsNum = config.length,
            index,
            configCurr;

        for( index = 0; index < spriteSheetsNum; index++ ) {
            configCurr = config[ index ];

            if( this.isTileSheetConfig(configCurr) )
                this.addTileSheet( configCurr );
            else
                this.addTileAtlas( configCurr );
        }
    },

    /*
     * Adds a tile sheet to the tile set
     * @param {Config} config
     *
     * @Config {Number}         firstgid            Tile ID start
     * @Config {String|Image}   image               Image or image URL to use
     * @Config {Number}         imagewidth          Image width
     * @Config {Number}         imageheight         Image height
     * @Config {Number}         tilewidth           Tile width
     * @Config {Number}         tileheight          Tile height
     * @Config {Number}         [tilesnum]          Number of tiles in the spritesheet
     * @Config {Object}         [properties]        Tile sheet properties
     * @Config {Object}         [tileproperties]    Tile properties map with the key being each tile's index
     *
     * @tileproperties {String} name                Tile name. Use this to specify a custom name that can be used
     *                                              for retrieval
     */
    addTileSheet: function( config )
    {
        var imageRes,
            tilesPerRow, tilesPerCol,
            tilesNum,
            mapPropsCustomTile,
            propsCustomSheet,
            tileIdCurr,
            propsCustomTile,
            indexX, indexY, tileIndex,
            texCurrX, texCurrY;

        // Add the texture to the list (if applicable)...
        if( config.image instanceof Image ) {
            imageRes = config.image;
        } else {
            imageRes = new Image();
            imageRes.src = config.image;
        }

        this.images.push( imageRes );
        this.tileWidthMax = Math.max( this.tileWidthMax, config.tilewidth );
        this.tileHeightMax = Math.max( this.tileHeightMax, config.tileheight );

        // TODO: Add support for margin and spacing information
        tilesPerRow = Math.floor( config.imagewidth / config.tilewidth );
        tilesPerCol = Math.floor( config.imageheight / config.tileheight );
        tilesNum = tilesPerRow * tilesPerCol;
        if( config.tilesnum !== undefined ) {
            tilesNum = Math.min( tilesNum, config.tilesnum );
        }

        // When processing tiles, go left to right, then top to bottom...
        mapPropsCustomTile = config.tileproperties;
        propsCustomSheet = config.properties;
        tileIdCurr = config.firstgid;
        tileIndex = 0;
        texCurrY = 0;
        for( indexY = 0; indexY < tilesPerCol; indexY++ )
        {
            texCurrX = 0;

            if( tileIndex >= tilesNum )
                break;

            for( indexX = 0; indexX < tilesPerRow; indexX++ )
            {
                if( tileIndex >= tilesNum )
                    break;

                propsCustomTile = null;
                if( mapPropsCustomTile != null ) {
                    if( mapPropsCustomTile.hasOwnProperty(tileIndex) ) {
                        propsCustomTile = mapPropsCustomTile[tileIndex];
                    }
                }

                this.tiles[ tileIdCurr ] = new Kinetic.TileInfo( imageRes, texCurrX, texCurrY, config.tilewidth, config.tileheight, propsCustomSheet, propsCustomTile );

                // If the tile has a specific name, recognize the tile by its name...
                if( propsCustomTile != null && propsCustomTile.name != null )
                    this.tiles[ propsCustomTile.name ] = this.tiles[ tileIdCurr ];

                tileIdCurr++;

                texCurrX += config.tilewidth;
                tileIndex++;
            }

            texCurrY += config.tileheight;
        }
    },

    /*
     * Adds a tile atlas to the tile set
     * @param {Object} config
     *
     * @config {Number}         firstgid            Tile ID start
     * @config {String|Image}   image               Image or image URL to use
     * @config {Object[]}       tilespec            Array of tile specifications
     * @config {Object}         [properties]        Tile sheet properties
     * @config {Object}         [tileproperties]    Tile properties map with the key being each tile's index
     *
     * @tilespec        {String} [name]             The tile's name. Use this to specify a custom name that can be used
     *                                              for retrieval
     * @tilespec        {Number} x                  The tile's top-left x-coordinate
     * @tilespec        {Number} y                  The tile's top-left y-coordinate
     * @tilespec        {Number} width              The tile's width
     * @tilespec        {Number} height             The tile's height
     */
    addTileAtlas: function( config )
    {
        var imageRes,
            mapPropsCustomTile,
            propsCustomSheet,
            tilesNum,
            tileIdCurr,
            tileSpecCurr,
            propsCustomTile,
            tileIndex;

        // Add the texture to the list (if applicable)...
        if( config.image instanceof Image ) {
            imageRes = config.image;
        } else {
            imageRes = new Image();
            imageRes.src = config.image;
        }

        this.images.push( imageRes );

        // When processing tiles, go left to right, then top to bottom...
        mapPropsCustomTile = config.tileproperties;
        propsCustomSheet = config.properties;
        tilesNum = config.tilespec.length;
        tileIdCurr = config.firstgid;
        for( tileIndex = 0; tileIndex < tilesNum; tileIndex++ ) {

            propsCustomTile = null;
            if( mapPropsCustomTile != null ) {
                if( mapPropsCustomTile.hasOwnProperty(tileIndex) ) {
                    propsCustomTile = mapPropsCustomTile[tileIndex];
                }
            }

            tileSpecCurr = config.tilespec[ tileIndex ];
            this.tiles[ tileIdCurr ] = new Kinetic.TileInfo( imageRes, tileSpecCurr.x, tileSpecCurr.y, tileSpecCurr.width, tileSpecCurr.height, propsCustomSheet, propsCustomTile );
            this.tileWidthMax = Math.max( this.tileWidthMax, tileSpecCurr.width );
            this.tileHeightMax = Math.max( this.tileHeightMax, tileSpecCurr.height );

            // If the tile has a specific name, recognize the tile by its name...
            if( tileSpecCurr.name != null )
                this.tiles[ tileSpecCurr.name ] = this.tiles[ tileIdCurr ];

            tileIdCurr++;
        }
    },

    /*
     * Returns the requested tile info
     * @param {Number|String} tileId
     * @returns {Kinetic.TileInfo}  The requested tile. null otherwise
     */
    getTile: function( tileId ) {
        if( !this.tiles.hasOwnProperty(tileId) )
            return( null );

        return( this.tiles[ tileId ] );
    },

    /*
     * Returns the list of images
     * @returns {Image[]}
     */
    getImages: function() {
        return( this.images );
    },

    /*
     * Returns the maximum tile size
     * @returns {Object}  The maximum tile size {x, y}
     */
    getTileSizeMax: function() {
        return { x: this.tileWidthMax, y: this.tileHeightMax };
    },

    /*
     * Returns true if the passed in configuration is a tile sheet configuration
     *
     * @param   {Object}    config
     * @returns {Boolean}
     */
    isTileSheetConfig: function( config ) {
        return( config.tilewidth != null && config.tileheight != null );
    }
};
