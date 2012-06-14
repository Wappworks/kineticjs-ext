///////////////////////////////////////////////////////////////////////
//  Group
///////////////////////////////////////////////////////////////////////

/**
 * Group constructor.  Groups are used to contain shapes or other groups.
 * @constructor
 * @augments Kinetic.Container
 * @augments Kinetic.Node
 * @param {Object} config
 */
Kinetic.Group = function(config) {
    this.className = 'Group';

    // call super constructors
    Kinetic.Container.apply(this, []);
    Kinetic.Node.apply(this, [config]);
};
/*
 * Group methods
 */
Kinetic.Group.prototype = {
    /**
     * add node to group
     * @param {Kinetic.Node} child
     */
    add: function(child) {
        var childParent = child.getParent();
        if( childParent != null )
        {
            if( childParent === this )
                return;

            childParent.remove(child);
        }

        this._add(child);
    },
    /**
     * remove a child node from the group
     * @param {Kinetic.Node} child
     */
    remove: function(child) {
        var childStage = child.getStage();
        if( childStage.mouseoutShape == child )
            childStage.mouseoutShape = undefined;

        this._remove(child);
    },
    /**
     * draw children
     */
    _draw: function() {
        if(this.visible) {
            this._drawChildren();
        }
    },
    /**
     * return the untransformed node bounds
     * @returns {Kinetic.BoundsRect}
     */
    _getNodeBoundsUntransformed: function()
    {
        var children = this.getChildren(),
            childrenNum = children.length,
            childIndex,
            childCurr,
            boundsUntransformed;

        if( childrenNum == 0 ) {
            return( new Kinetic.BoundsRect(0, 0, 0 , 0) );
        }

        boundsUntransformed = children[0].getBoundsLocal();
        for( childIndex = 1; childIndex < childrenNum; childIndex++ ) {
            childCurr = children[childIndex];
            if( !childCurr.isVisible() )
                continue;
            boundsUntransformed.encloseRect( childCurr.getBoundsLocal() );
        }

        return( boundsUntransformed );
    }
};

// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Node);
