# KineticJs Extended Version History

## Development
### New Features:
- New update loop functionality that any system can tie into: Kinetic.GlobalObject::addTicked
- Replaced Eric Rowell's transition system with a new flexible animation system
  - To animate shapes, use Kinetic.Shape.animate(). Multiple calls to animate() will queue the animations in
    succession.
  - The system supports cross-shape animation through Kinetic.AnimateQueue
- Added a library of easing functions: Kinetic.Easing
- Kinetic.TileSet
  - Added support for tilesets/spritesheets
    - Tileset support is compatible with [Tiled map editor](http://www.mapeditor.org/) tilesets
    - Tiles may be named and its name used in lookups (Kinetic.TileSet::getTile())
  - Added support for tile atlases
- Kinetic.Grid
  - Added a grid container shape. The grid container supports grid layers for drawing shapes in a grid. See
    Kinetic.TileSetGrid for an example which uses Kinetic.Grid and Kinetic.TileSetGridLayer
- Kinetic.GridLayer
  - Base class for Kinetic.Grid compatible grid layers.
- Kinetic.TileSetGridLayer
  - Kinetic.Grid compatible layer supporting tile set rendering.
- Kinetic.TileSetGrid
  - Added a tile set grid renderer. The configuration has been tested with
    [Tiled map editor](http://www.mapeditor.org/) tile layers
  - Increased drawing robustness against bad/missing image data
- Kinetic.Image
  - Modified to accept Kinetic.TileInfo as a valid image specifier
  - Increased drawing robustness against bad/missing image data
- Kinetic.Layer now fires off a 'resize' event whenever the layer size is modified
  The callback function specification is cbFunc( width:Number, height:Number ):void

### Bug fixes
- Hardened Kinetic.Layer and Kinetic.Group against adding children w/ existing parents
- Fixed touch event handlings for clicks and double clicks
- Fixed crash when a mouse-event listening shape under the mouse pointer is removed


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

