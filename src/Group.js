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
    this.className = "Group";

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
        this._add(child);
    },
    /**
     * remove a child node from the group
     * @param {Kinetic.Node} child
     */
    remove: function(child) {
        this._remove(child);
    },
    /**
     * draw children
     */
    _draw: function() {
        if(this.visible) {
            this._drawChildren();
        }
    }
};

// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Node);