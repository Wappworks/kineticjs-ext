# KineticJs Extended Version History

## Development
### New Features:
- Kinetic.TileSet
  - Added support for tilesets/spritesheets
    - Tileset support is compatible with [Tiled map editor](http://www.mapeditor.org/) tilesets
    - Tiles may be named and its name used in lookups (Kinetic.TileSet::getTile())
  - Added support for tile atlases
- Kinetic.TileMap
  - Added support for tilemap shapes. Tilemap shapes are compatible with
    [Tiled map editor](http://www.mapeditor.org/) tile layers
  - Increased drawing robustness against bad/missing image data
- Kinetic.Image
  - Modified to accept Kinetic.TileInfo as a valid image specifier
  - Increased drawing robustness against bad/missing image data
- Kinetic.Layer now fires off a 'resize' event whenever the layer size is modified [cbFunc( width:Number, height:Number ):void]

### Bug fixes
- Hardened Kinetic.Layer and Kinetic.Group against adding children w/ existing [arents
- Fixed touch event handlings for clicks and double clicks


## v3.8.2.2
### New Features:
- Added the ability to mark node for redrawing which triggers an automatic draw
- Added the ability to extend/override the default draw sort order behavior to all Kinetic.Containers
  (Kinetic.Container::setDrawSortFunction())
- Added a Layer with simple shape culling functionality for large world rendering (Kinetic.LayerCullSimple)
- Added the ability to limit the stage view bounds by specifying a world bounds
  (Kinetic.Stage::setViewLimitsByWorldBounds())
- Added ability to override default node drag behavior
- Added bound box class (Kinetic.BoundsRect)
- Added the ability to get any node's bounding box (Kinetic.Node::GetBoundsLocal())
- Kinetic.Node::setCenterOffset() function changes the registration of the draw call instead of just changing the
  scalar/rotation operation center point
- Added the ability to set the center offset by specifying the node's horizontal and/or vertical alignment
  (Kinetic.Node::setCenterOffsetByAlign())
- Integrated Yusuf Sasak's library modifications to allow overriding the default shape detection functionality
- Integrated Eric Rowell's transition support
- Integrated Eric Rowell's drag functionality changes

## v3.8.2.1
Branched from Eric Rowell's KineticJs library (v3.8.2)

### New Features
- Added matrix transform class
- Added functionality to retrieve a node's transform

